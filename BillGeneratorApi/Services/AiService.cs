using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BillGeneratorApi.Models;
using OpenAI;
using OpenAI.Chat;

namespace BillGeneratorApi.Services;

/// <summary>
/// Uses the OpenAI Chat Completions API to:
/// <list type="bullet">
///   <item>Suggest menu items from a natural-language description.</item>
///   <item>Generate a custom <see cref="BillTemplate"/> from a style description.</item>
/// </list>
/// Set the environment variable <c>OPENAI_API_KEY</c> before using AI features.
/// </summary>
public class AiService
{
    private readonly ChatClient? _client;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public bool IsAvailable => _client is not null;

    public AiService()
    {
        string? apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            var openAi = new OpenAIClient(apiKey);
            _client = openAi.GetChatClient("gpt-4o-mini");
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
        if (_client is null)
        {
            Console.WriteLine("[AI] No API key – using random item selection.");
            return FallbackRandomItems(catalogue);
        }

        var catalogueList = catalogue.ToList();
        string catalogueJson = JsonSerializer.Serialize(
            catalogueList.Select(i => new { i.Name, i.Price }), JsonOpts);

        string systemPrompt = """
            You are a helpful assistant for an Indian street-food restaurant billing system.
            Given a JSON catalogue of menu items (name + price) and a user request,
            select 6-10 items and assign realistic quantities (1-5 each).
            Return ONLY a valid JSON array in this exact shape, no explanation:
            [{"name":"<item name>","quantity":<int>,"price":<double>}, ...]
            The item names MUST match exactly from the catalogue.
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

            if (result.Count > 0)
                return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AI] Item suggestion error: {ex.Message}");
        }

        return FallbackRandomItems(catalogue);
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

    private static List<Item> FallbackRandomItems(IEnumerable<Item> catalogue)
    {
        var list = catalogue.ToList();
        var rng = new Random();
        return list.OrderBy(_ => rng.Next())
                   .Take(7)
                   .Select(i => new Item(i.Name, rng.Next(1, 4), i.Price))
                   .ToList();
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
