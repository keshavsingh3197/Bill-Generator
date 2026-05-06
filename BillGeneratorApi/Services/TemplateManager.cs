using System.Text.Json;
using BillGeneratorApi.Models;
using BillGeneratorApi.Templates;

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

    public TemplateManager(string? customTemplatesDirectory = null)
    {
        _customDir = customTemplatesDirectory
            ?? Path.Combine(AppContext.BaseDirectory, "CustomTemplates");
        Directory.CreateDirectory(_customDir);
    }

    // ── Predefined ────────────────────────────────────────────────────────────

    public IReadOnlyList<BillTemplate> GetPredefined() => PredefinedTemplates.All;

    // ── Custom ────────────────────────────────────────────────────────────────

    public List<BillTemplate> GetCustom()
    {
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

        string path = TemplatePath(template.Name);
        File.WriteAllText(path, JsonSerializer.Serialize(template, JsonOpts));
        Console.WriteLine($"Template '{template.Name}' saved → {path}");
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
        string path = TemplatePath(name);
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

    private static string SanitizeName(string name) =>
        string.Concat(name.Split(Path.GetInvalidFileNameChars()));

    private static BillTemplate Clone(BillTemplate t) =>
        JsonSerializer.Deserialize<BillTemplate>(
            JsonSerializer.Serialize(t, JsonOpts), JsonOpts)!;
}
