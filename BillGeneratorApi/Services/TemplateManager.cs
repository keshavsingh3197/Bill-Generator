using System.Text.Json;
using BillGeneratorApi.Models;
using BillGeneratorApi.Templates;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace BillGeneratorApi.Services;

/// <summary>
/// Manages predefined and custom templates – persists custom ones as JSON files
/// inside the <c>CustomTemplates</c> folder next to the executable.
/// </summary>
public class TemplateManager
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly string _customDir;
    private readonly IMongoCollection<TemplateRecord>? _templateCollection;

    public TemplateManager(string? customTemplatesDirectory = null)
    {
        _customDir = customTemplatesDirectory
            ?? Path.Combine(AppContext.BaseDirectory, "CustomTemplates");
        Directory.CreateDirectory(_customDir);

        string? mongoConnectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
        if (!string.IsNullOrWhiteSpace(mongoConnectionString))
        {
            try
            {
                string dbName = Environment.GetEnvironmentVariable("MONGODB_DATABASE") ?? "BillGenerator";
                string collectionName = Environment.GetEnvironmentVariable("MONGODB_TEMPLATES_COLLECTION") ?? "templates";

                var mongoClient = new MongoClient(mongoConnectionString);
                var database = mongoClient.GetDatabase(dbName);
                _templateCollection = database.GetCollection<TemplateRecord>(collectionName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[warn] MongoDB init failed, falling back to file storage: {ex.Message}");
            }
        }
    }

    // ── Predefined ────────────────────────────────────────────────────────────

    public IReadOnlyList<BillTemplate> GetPredefined() => PredefinedTemplates.All;

    // ── Custom ────────────────────────────────────────────────────────────────

    public List<BillTemplate> GetCustom()
    {
        if (_templateCollection is not null)
        {
            var docs = _templateCollection.Find(_ => true).ToList();
            return docs.Select(ToTemplate).ToList();
        }

        var result = new List<BillTemplate>();
        foreach (string file in Directory.GetFiles(_customDir, "*.json"))
        {
            try
            {
                string json = File.ReadAllText(file);
                var t = JsonSerializer.Deserialize<BillTemplate>(json, JsonOpts);
                if (t is not null)
                {
                    t.IsBuiltIn = false;
                    result.Add(t);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[warn] Could not load template {file}: {ex.Message}");
            }
        }
        return result;
    }

    /// <summary>Returns all templates (predefined first, then custom).</summary>
    public List<BillTemplate> GetAll()
    {
        var list = new List<BillTemplate>(GetPredefined());
        list.AddRange(GetCustom());
        return list;
    }

    // ── Save / Delete ─────────────────────────────────────────────────────────

    /// <summary>Saves a custom template to disk. Overwrites if same name exists.</summary>
    public void Save(BillTemplate template)
    {
        if (template.IsBuiltIn)
            throw new InvalidOperationException("Cannot overwrite a built-in template.");

        if (_templateCollection is not null)
        {
            var doc = TemplateRecord.FromTemplate(template);
            var filter = Builders<TemplateRecord>.Filter.Eq(t => t.NameKey, doc.NameKey);
            _templateCollection.ReplaceOne(filter, doc, new ReplaceOptions { IsUpsert = true });
            return;
        }

        string path = TemplatePath(template.Name);
        if (!IsPathInsideCustomDir(path))
            throw new InvalidOperationException("Template name results in an invalid file path.");

        File.WriteAllText(path, JsonSerializer.Serialize(template, JsonOpts));
    }

    /// <summary>Exports a built-in template to disk as a starting point for customisation.</summary>
    public BillTemplate ExportAsCustom(BillTemplate source, string newName)
    {
        var copy = Clone(source);
        copy.Name = newName;
        copy.IsBuiltIn = false;
        Save(copy);
        return copy;
    }

    public bool Delete(string name)
    {
        if (_templateCollection is not null)
        {
            string key = NormalizeName(name);
            var filter = Builders<TemplateRecord>.Filter.Eq(t => t.NameKey, key);
            return _templateCollection.DeleteOne(filter).DeletedCount > 0;
        }

        string path = TemplatePath(name);
        // Verify the resolved path is still within the custom templates directory
        // to prevent path traversal.
        if (!IsPathInsideCustomDir(path)) return false;
        if (!File.Exists(path)) return false;
        File.Delete(path);
        return true;
    }

    // ── Lookup ────────────────────────────────────────────────────────────────

    public BillTemplate? Find(string name) =>
        GetAll().FirstOrDefault(t =>
            string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase));

    // ── Helpers ───────────────────────────────────────────────────────────────

    private string TemplatePath(string name) =>
        Path.Combine(_customDir, $"{SanitizeName(name)}.json");

    /// <summary>
    /// Ensures the resolved path is physically inside _customDir to prevent
    /// path-traversal attacks where an attacker supplies e.g. "../../etc/passwd".
    /// </summary>
    private bool IsPathInsideCustomDir(string path)
    {
        string fullPath = Path.GetFullPath(path);
        string fullDir  = Path.GetFullPath(_customDir) + Path.DirectorySeparatorChar;
        return fullPath.StartsWith(fullDir, StringComparison.OrdinalIgnoreCase);
    }

    private static string SanitizeName(string name) =>
        string.Concat(name.Split(Path.GetInvalidFileNameChars()));

    private static string NormalizeName(string name) =>
        SanitizeName(name).Trim().ToLowerInvariant();

    private static BillTemplate Clone(BillTemplate t) =>
        JsonSerializer.Deserialize<BillTemplate>(
            JsonSerializer.Serialize(t, JsonOpts), JsonOpts)!;

    private static BillTemplate ToTemplate(TemplateRecord record)
    {
        var t = record.Template;
        t.IsBuiltIn = false;
        return t;
    }

    private sealed class TemplateRecord
    {
        [BsonId] public ObjectId Id { get; set; }
        [BsonElement("nameKey")] public string NameKey { get; set; } = string.Empty;
        [BsonElement("template")] public BillTemplate Template { get; set; } = new();

        public static TemplateRecord FromTemplate(BillTemplate t)
        {
            var copy = Clone(t);
            copy.IsBuiltIn = false;
            return new TemplateRecord
            {
                NameKey = NormalizeName(copy.Name),
                Template = copy
            };
        }
    }
}
