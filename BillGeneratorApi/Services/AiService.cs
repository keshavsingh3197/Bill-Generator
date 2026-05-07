using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.ClientModel;
using BillGeneratorApi.Models;
using OpenAI;
using OpenAI.Chat;

namespace BillGeneratorApi.Services;

/// <summary>
/// Uses a Chat Completions API to:
/// <list type="bullet">
///   <item>Suggest menu items from a natural-language description.</item>
///   <item>Generate a custom <see cref="BillTemplate"/> from a style description.</item>
/// </list>
/// Supported providers (checked in priority order):
/// <list type="bullet">
///   <item><c>GEMINI_API_KEY</c> – Google Gemini (free tier, gemini-2.0-flash via OpenAI-compat endpoint)</item>
///   <item><c>OPENAI_API_KEY</c> – OpenAI gpt-4o-mini</item>
/// </list>
/// </summary>
public class AiService
{
    private readonly ChatClient? _client;
    private readonly string? _provider;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public bool IsAvailable => _client is not null;
    public string? Provider => _provider;

    public AiService()
    {
        // 1. Try Gemini first – free tier, no credit card required
        string? geminiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (!string.IsNullOrWhiteSpace(geminiKey))
        {
            var options = new OpenAIClientOptions
            {
                Endpoint = new Uri("https://generativelanguage.googleapis.com/v1beta/openai/")
            };
            var geminiClient = new OpenAIClient(new ApiKeyCredential(geminiKey), options);
            _client = geminiClient.GetChatClient("gemini-2.0-flash");
            _provider = "Gemini";
            Console.WriteLine("[AI] Using Google Gemini (gemini-2.0-flash).");
            return;
        }

        // 2. Fall back to OpenAI
        string? openAiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (!string.IsNullOrWhiteSpace(openAiKey))
        {
            var openAi = new OpenAIClient(openAiKey);
            _client = openAi.GetChatClient("gpt-4o-mini");
            _provider = "OpenAI";
            Console.WriteLine("[AI] Using OpenAI (gpt-4o-mini).");
        }
    }

    // ── Item selection ────────────────────────────────────────────────────────

    /// <summary>
    /// Asks GPT to pick relevant items from <paramref name="catalogue"/> based on
    /// the user's free-text <paramref name="userRequest"/>.
    /// Returns items with quantities assigned; falls back to a random selection
    /// if the API is unavailable.
    /// </summary>
    public async Task<List<Item>> SuggestItemsAsync(
        string userRequest, IEnumerable<Item> catalogue)
    {
        int? requestedItemCount = TryExtractRequestedItemCount(userRequest);

        if (_client is null)
        {
            Console.WriteLine("[AI] No API key – using random item selection.");
            return FallbackRandomItems(catalogue, requestedItemCount);
        }

        var catalogueList = catalogue.ToList();
        string catalogueJson = JsonSerializer.Serialize(
            catalogueList.Select(i => new { i.Name, i.Price }), JsonOpts);

        string countInstruction = requestedItemCount is int count
            ? $"select exactly {count} unique items and assign realistic quantities (1-5 each)."
            : "select 6-10 unique items and assign realistic quantities (1-5 each).";

        string systemPrompt = """
            You are a helpful assistant for an Indian street-food restaurant billing system.
            Given a JSON catalogue of menu items (name + price) and a user request,
            """ + countInstruction + """
            Return ONLY a valid JSON array in this exact shape, no explanation:
            [{"name":"<item name>","quantity":<int>,"price":<double>}, ...]
            The item names MUST match exactly from the catalogue.
            Do not repeat the same item name.
            """;

        string userMessage = $"Catalogue:\n{catalogueJson}\n\nRequest: {userRequest}";

        try
        {
            ChatCompletion completion = await _client.CompleteChatAsync(
            [
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userMessage)
            ]);

            string raw = completion.Content[0].Text.Trim();
            // Strip optional markdown fences
            raw = StripCodeFences(raw);

            var selected = JsonSerializer.Deserialize<List<AiItemDto>>(raw, JsonOpts)
                           ?? new List<AiItemDto>();

            var result = new List<Item>();
            foreach (var dto in selected)
            {
                var match = catalogueList.FirstOrDefault(c =>
                    string.Equals(c.Name, dto.Name, StringComparison.OrdinalIgnoreCase));
                if (match is not null)
                    result.Add(new Item(match.Name, Math.Max(1, dto.Quantity), match.Price));
            }

            result = EnforceRequestedItemCount(result, catalogueList, requestedItemCount);

            if (result.Count > 0)
                return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AI] Item suggestion error: {ex.Message}");
        }

        return FallbackRandomItems(catalogue, requestedItemCount);
    }

    // ── Template generation ───────────────────────────────────────────────────

    /// <summary>
    /// Asks GPT to create a <see cref="BillTemplate"/> based on a style description.
    /// Falls back to the Classic template on error.
    /// </summary>
    public async Task<BillTemplate> GenerateTemplateAsync(string styleDescription,
                                                           string templateName)
    {
        if (_client is null)
        {
            Console.WriteLine("[AI] No API key – returning Classic template as base.");
            return Templates.PredefinedTemplates.Classic;
        }

        string systemPrompt = $"""
            You are a design assistant for a receipt PDF generator.
            Given a style description, produce a JSON object matching this C# class
            (use camelCase keys). Return ONLY valid JSON, no markdown, no explanation.

            Fields you may set:
            name (string), description (string), shopName (string), shopAddress (string),
            shopPhone (string), shopTagline (string),
            pageWidth (float 280-600), pageHeight (float 700-1400),
            baseFontSize (float 9-13), headerFontSize (float 12-18),
            subHeaderFontSize (float 10-15), footerFontSize (float 8-12),
            lineWidth (int 30-60), lineChar (single char),
            colQtyWidth (int 3-6), colNameWidth (int 15-25),
            colPriceWidth (int 6-10), colAmountWidth (int 8-13),
            currencySymbol (string), cultureName (string),
            thankYouMessage (string), showThankYouMessage (bool),
            dateFormat (string), receiptLeftPadding (float 30-80),
            dividerStyle ("single"|"double"|"star"),
            headerStyle ("plain"|"boxed"),
            showSubtotal (bool), showCashLine (bool),
            showRemainingBalance (bool), showCashier (bool),
            showPhone (bool), showTagline (bool),
            marginTop (float), marginRight (float),
            marginBottom (float), marginLeft (float).

            Always set name = "{templateName}".
            Always set isBuiltIn = false.
            """;

        try
        {
            ChatCompletion completion = await _client.CompleteChatAsync(
            [
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(styleDescription)
            ]);

            string raw = StripCodeFences(completion.Content[0].Text.Trim());
            var template = JsonSerializer.Deserialize<BillTemplate>(raw, JsonOpts);
            if (template is not null)
            {
                template.Name = templateName;
                template.IsBuiltIn = false;
                return template;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AI] Template generation error: {ex.Message}");
        }

        // Fallback: classic with the new name
        var fallback = Templates.PredefinedTemplates.Classic;
        fallback.Name = templateName;
        fallback.IsBuiltIn = false;
        return fallback;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static List<Item> FallbackRandomItems(IEnumerable<Item> catalogue, int? requestedItemCount = null)
    {
        var list = catalogue.ToList();
        if (list.Count == 0)
            return new List<Item>();

        var rng = new Random();
        int take = Math.Clamp(requestedItemCount ?? 7, 1, list.Count);

        return list.OrderBy(_ => rng.Next())
                   .Take(take)
                   .Select(i => new Item(i.Name, rng.Next(1, 4), i.Price))
                   .ToList();
    }

    private static List<Item> EnforceRequestedItemCount(
        List<Item> items,
        IReadOnlyCollection<Item> catalogue,
        int? requestedItemCount)
    {
        if (requestedItemCount is null || requestedItemCount <= 0)
            return DeduplicateByName(items);

        int target = Math.Min(requestedItemCount.Value, catalogue.Count);
        var deduped = DeduplicateByName(items);

        if (deduped.Count > target)
            return deduped.Take(target).ToList();

        if (deduped.Count == target)
            return deduped;

        var rng = new Random();
        var existingNames = deduped.Select(i => i.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var extras = catalogue
            .Where(i => !existingNames.Contains(i.Name))
            .OrderBy(_ => rng.Next())
            .Take(target - deduped.Count)
            .Select(i => new Item(i.Name, rng.Next(1, 4), i.Price));

        deduped.AddRange(extras);
        return deduped;
    }

    private static List<Item> DeduplicateByName(IEnumerable<Item> items) =>
        items.GroupBy(i => i.Name, StringComparer.OrdinalIgnoreCase)
             .Select(g =>
             {
                 var first = g.First();
                 return new Item(first.Name, g.Sum(x => Math.Max(1, x.Quantity)), first.Price);
             })
             .ToList();

    private static int? TryExtractRequestedItemCount(string userRequest)
    {
        if (string.IsNullOrWhiteSpace(userRequest))
            return null;

        var digitMatch = Regex.Match(userRequest, @"\b([1-9]|10)\b");
        if (digitMatch.Success && int.TryParse(digitMatch.Groups[1].Value, out int parsed))
            return parsed;

        var words = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["one"] = 1, ["two"] = 2, ["three"] = 3, ["four"] = 4, ["five"] = 5,
            ["six"] = 6, ["seven"] = 7, ["eight"] = 8, ["nine"] = 9, ["ten"] = 10
        };

        foreach (var kv in words)
        {
            if (Regex.IsMatch(userRequest, $@"\b{kv.Key}\b", RegexOptions.IgnoreCase))
                return kv.Value;
        }

        return null;
    }

    private static string StripCodeFences(string text)
    {
        if (text.StartsWith("```"))
        {
            int first = text.IndexOf('\n');
            int last = text.LastIndexOf("```");
            if (first >= 0 && last > first)
                return text[(first + 1)..last].Trim();
        }
        return text;
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    private sealed class AiItemDto
    {
        [JsonPropertyName("name")] public string Name { get; set; } = string.Empty;
        [JsonPropertyName("quantity")] public int Quantity { get; set; }
        [JsonPropertyName("price")] public double Price { get; set; }
    }
}
