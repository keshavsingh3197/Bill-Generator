using System.Globalization;
using BillGenerator.Models;
using BillGenerator.Services;
using BillGenerator.Templates;

// ── Bootstrap ─────────────────────────────────────────────────────────────────
var templateManager = new TemplateManager();
var pdfGenerator    = new PdfGenerator();
var aiService       = new AiService();

Console.WriteLine("╔══════════════════════════════════════════╗");
Console.WriteLine("║         Bill Generator  v2.0             ║");
Console.WriteLine("╚══════════════════════════════════════════╝");
Console.WriteLine();
if (!aiService.IsAvailable)
{
    Console.WriteLine("[info] AI features disabled. Set the OPENAI_API_KEY environment");
    Console.WriteLine("       variable to enable AI-assisted item selection and template");
    Console.WriteLine("       generation.");
    Console.WriteLine();
}

// ── Main menu ─────────────────────────────────────────────────────────────────
bool running = true;
while (running)
{
    Console.WriteLine("──────────────────────────────────────────");
    Console.WriteLine(" 1. Generate bills for a date range");
    Console.WriteLine(" 2. Generate a single bill (interactive)");
    Console.WriteLine(" 3. Manage templates");
    Console.WriteLine(" 4. AI: suggest items for a bill");
    Console.WriteLine(" 5. AI: generate a new template");
    Console.WriteLine(" 0. Exit");
    Console.Write("Select: ");

    switch (Console.ReadLine()?.Trim())
    {
        case "1": await GenerateDateRangeAsync(); break;
        case "2": await GenerateSingleBillAsync(); break;
        case "3": ManageTemplates(); break;
        case "4": await AiSuggestItemsAsync(); break;
        case "5": await AiGenerateTemplateAsync(); break;
        case "0": running = false; break;
        default : Console.WriteLine("[!] Unknown option."); break;
    }
}

Console.WriteLine("Goodbye!");

// ═════════════════════════════════════════════════════════════════════════════
// 1 – Date-range batch generator
// ═════════════════════════════════════════════════════════════════════════════
async Task GenerateDateRangeAsync()
{
    DateTime start = PromptDate("Start date (dd/MM/yyyy) [default: 24/03/2026]: ",
                                new DateTime(2026, 3, 24));
    DateTime end   = PromptDate("End date   (dd/MM/yyyy) [default: 31/03/2026]: ",
                                new DateTime(2026, 3, 31));

    var template = ChooseTemplate();

    string outputDir = PromptString(
        "Output directory [default: Desktop/April_2026_Bills]: ",
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
                     "April_2026_Bills"));

    Directory.CreateDirectory(outputDir);

    // Clean up old receipts in the folder
    foreach (string f in Directory.GetFiles(outputDir, "Receipt_*.pdf"))
        File.Delete(f);

    int count = 0;
    for (DateTime d = start; d <= end; d = d.AddDays(1))
    {
        if (!ItemCatalogue.IsIndianBusinessDay(d)) continue;

        var data = new BillData
        {
            Items      = ItemCatalogue.BuildForDate(d),
            BillDate   = d,
            BillTime   = ItemCatalogue.EveningTimeForDate(d),
            OutputPath = Path.Combine(outputDir, $"Receipt_{d:yyyyMMdd}.pdf")
        };

        pdfGenerator.Generate(data, template);
        count++;
        Console.WriteLine($"  → {Path.GetFileName(data.OutputPath)}");
    }

    Console.WriteLine($"\n[✓] {count} bill(s) created in: {outputDir}");
}

// ═════════════════════════════════════════════════════════════════════════════
// 2 – Single bill (interactive)
// ═════════════════════════════════════════════════════════════════════════════
async Task GenerateSingleBillAsync()
{
    var template = ChooseTemplate();

    DateTime date = PromptDate("Bill date (dd/MM/yyyy) [default: today]: ", DateTime.Today);
    TimeOnly time = PromptTime("Bill time (HH:mm) [default: now]: ",
                               TimeOnly.FromDateTime(DateTime.Now));
    string cashier = PromptString("Cashier name [default: ]: ", "");

    Console.WriteLine("\nHow would you like to add items?");
    Console.WriteLine("  1. Use deterministic items for the date");
    Console.WriteLine("  2. Enter items manually");
    Console.WriteLine("  3. AI – describe what you sold (if AI available)");
    Console.Write("Select [1]: ");
    string itemMode = Console.ReadLine()?.Trim() ?? "1";

    List<Item> items;
    switch (itemMode)
    {
        case "2":
            items = EnterItemsManually();
            break;
        case "3":
            items = await AiPickItemsInteractiveAsync();
            break;
        default:
            items = ItemCatalogue.BuildForDate(date);
            break;
    }

    string outputDir = PromptString(
        "Output directory [default: Desktop/Bills]: ",
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Bills"));
    Directory.CreateDirectory(outputDir);

    string path = Path.Combine(outputDir, $"Receipt_{date:yyyyMMdd}.pdf");

    var data = new BillData
    {
        Items      = items,
        BillDate   = date,
        BillTime   = time,
        CashierName= cashier,
        OutputPath = path
    };

    pdfGenerator.Generate(data, template);
    Console.WriteLine($"\n[✓] Bill saved to: {path}");
}

// ═════════════════════════════════════════════════════════════════════════════
// 3 – Template management
// ═════════════════════════════════════════════════════════════════════════════
void ManageTemplates()
{
    bool back = false;
    while (!back)
    {
        Console.WriteLine("\n── Template Manager ──");
        Console.WriteLine("  1. List all templates");
        Console.WriteLine("  2. View a template");
        Console.WriteLine("  3. Create custom template (manual)");
        Console.WriteLine("  4. Clone built-in as starting point");
        Console.WriteLine("  5. Delete a custom template");
        Console.WriteLine("  0. Back");
        Console.Write("Select: ");

        switch (Console.ReadLine()?.Trim())
        {
            case "1": ListAllTemplates(); break;
            case "2": ViewTemplate(); break;
            case "3": CreateCustomTemplateManually(); break;
            case "4": CloneBuiltIn(); break;
            case "5": DeleteCustomTemplate(); break;
            case "0": back = true; break;
            default : Console.WriteLine("[!] Unknown option."); break;
        }
    }
}

void ListAllTemplates()
{
    var all = templateManager.GetAll();
    Console.WriteLine($"\n{"#",-3} {"Name",-20} {"Built-in",-10} Description");
    Console.WriteLine(new string('-', 70));
    for (int i = 0; i < all.Count; i++)
    {
        var t = all[i];
        Console.WriteLine($"{i + 1,-3} {t.Name,-20} {(t.IsBuiltIn ? "Yes" : "No"),-10} {t.Description}");
    }
}

void ViewTemplate()
{
    ListAllTemplates();
    Console.Write("\nTemplate name to view: ");
    string name = Console.ReadLine()?.Trim() ?? "";
    var t = templateManager.Find(name);
    if (t is null) { Console.WriteLine("[!] Not found."); return; }

    Console.WriteLine($"\n── {t.Name} ──────────────────────────────");
    Console.WriteLine($"  Shop name      : {t.ShopName}");
    Console.WriteLine($"  Address        : {t.ShopAddress}");
    Console.WriteLine($"  Phone          : {t.ShopPhone}");
    Console.WriteLine($"  Tagline        : {t.ShopTagline}");
    Console.WriteLine($"  Page           : {t.PageWidth} × {t.PageHeight} pt");
    Console.WriteLine($"  Font sizes     : base={t.BaseFontSize} header={t.HeaderFontSize}");
    Console.WriteLine($"  Line width     : {t.LineWidth} × '{t.LineChar}' ({t.DividerStyle})");
    Console.WriteLine($"  Header style   : {t.HeaderStyle}");
    Console.WriteLine($"  Show sections  : subtotal={t.ShowSubtotal} cash={t.ShowCashLine} cashier={t.ShowCashier}");
    Console.WriteLine($"  Thank-you      : {t.ThankYouMessage}");
    Console.WriteLine($"  Currency       : {t.CurrencySymbol}  ({t.CultureName})");
}

void CreateCustomTemplateManually()
{
    Console.WriteLine("\n── Create Custom Template ──");
    var t = new BillTemplate { IsBuiltIn = false };

    t.Name         = PromptString("Template name: ", "MyTemplate");
    t.Description  = PromptString("Description:   ", "");
    t.ShopName     = PromptString("Shop name:     ", "My Shop");
    t.ShopAddress  = PromptString("Shop address:  ", "");
    t.ShopPhone    = PromptString("Shop phone:    ", "");
    t.ShopTagline  = PromptString("Tagline:       ", "");

    t.PageWidth    = PromptFloat("Page width (pt) [400]: ", 400);
    t.PageHeight   = PromptFloat("Page height (pt) [1000]: ", 1000);

    t.BaseFontSize      = PromptFloat("Base font size [11]: ", 11);
    t.HeaderFontSize    = PromptFloat("Header font size [14]: ", 14);
    t.SubHeaderFontSize = PromptFloat("Sub-header font size [12]: ", 12);

    t.LineWidth    = PromptInt("Line width (chars) [42]: ", 42);
    t.LineChar     = PromptChar("Line character [-]: ", '-');
    t.DividerStyle = PromptOption("Divider style (single/double/star) [single]: ",
                                  new[] { "single", "double", "star" }, "single");
    t.HeaderStyle  = PromptOption("Header style (plain/boxed) [plain]: ",
                                  new[] { "plain", "boxed" }, "plain");

    t.CurrencySymbol = PromptString("Currency symbol [₹]: ", "₹");

    t.ShowSubtotal         = PromptBool("Show subtotal? [y]: ", true);
    t.ShowCashLine         = PromptBool("Show cash line? [y]: ", true);
    t.ShowRemainingBalance = PromptBool("Show remaining balance? [y]: ", true);
    t.ShowCashier          = PromptBool("Show cashier? [y]: ", true);
    t.ShowPhone            = PromptBool("Show phone? [n]: ", false);
    t.ShowTagline          = PromptBool("Show tagline? [n]: ", false);

    t.ThankYouMessage    = PromptString("Thank-you message: ", "Thank You, Visit Again!");
    t.ShowThankYouMessage= PromptBool("Show thank-you? [y]: ", true);

    templateManager.Save(t);
    Console.WriteLine($"[✓] Template '{t.Name}' saved.");
}

void CloneBuiltIn()
{
    Console.WriteLine("\nBuilt-in templates:");
    var builtIn = templateManager.GetPredefined();
    for (int i = 0; i < builtIn.Count; i++)
        Console.WriteLine($"  {i + 1}. {builtIn[i].Name}");

    Console.Write("Enter name to clone: ");
    string src = Console.ReadLine()?.Trim() ?? "";
    var found = templateManager.Find(src);
    if (found is null) { Console.WriteLine("[!] Not found."); return; }

    string newName = PromptString("New template name: ", src + "_copy");
    templateManager.ExportAsCustom(found, newName);
    Console.WriteLine($"[✓] Cloned as '{newName}'. Edit the JSON file in CustomTemplates/ to customise.");
}

void DeleteCustomTemplate()
{
    var customs = templateManager.GetCustom();
    if (customs.Count == 0) { Console.WriteLine("[!] No custom templates found."); return; }

    Console.WriteLine("\nCustom templates:");
    foreach (var t in customs)
        Console.WriteLine($"  • {t.Name}");

    Console.Write("Enter name to delete: ");
    string name = Console.ReadLine()?.Trim() ?? "";
    if (templateManager.Delete(name))
        Console.WriteLine($"[✓] Deleted '{name}'.");
    else
        Console.WriteLine("[!] Not found or could not delete.");
}

// ═════════════════════════════════════════════════════════════════════════════
// 4 – AI item suggestion
// ═════════════════════════════════════════════════════════════════════════════
async Task AiSuggestItemsAsync()
{
    if (!aiService.IsAvailable)
    {
        Console.WriteLine("[!] AI unavailable. Set OPENAI_API_KEY.");
        return;
    }

    Console.Write("Describe what the customer ordered (e.g. 'a party of 4, vegetarian, some snacks and curries'): ");
    string request = Console.ReadLine() ?? "";

    Console.WriteLine("[AI] Thinking…");
    var items = await aiService.SuggestItemsAsync(request, ItemCatalogue.All);

    Console.WriteLine($"\n[AI] Suggested {items.Count} items:");
    double total = 0;
    foreach (var it in items)
    {
        double amt = it.Amount;
        total += amt;
        Console.WriteLine($"  {it.Quantity,2}x {it.Name,-25} ₹{it.Price:N2} = ₹{amt:N2}");
    }
    Console.WriteLine($"  {"Total:",-30}  ₹{total:N2}");
}

// ═════════════════════════════════════════════════════════════════════════════
// 5 – AI template generator
// ═════════════════════════════════════════════════════════════════════════════
async Task AiGenerateTemplateAsync()
{
    if (!aiService.IsAvailable)
    {
        Console.WriteLine("[!] AI unavailable. Set OPENAI_API_KEY.");
        return;
    }

    string name = PromptString("New template name: ", "AiTemplate");
    Console.Write("Describe the style (e.g. 'wide page, star dividers, elegant look for a fine-dining restaurant in Mumbai'): ");
    string desc = Console.ReadLine() ?? "";

    Console.WriteLine("[AI] Generating template…");
    var template = await aiService.GenerateTemplateAsync(desc, name);
    template.IsBuiltIn = false;
    templateManager.Save(template);

    Console.WriteLine($"\n[✓] Template '{template.Name}' generated and saved.");
    Console.WriteLine($"    Page: {template.PageWidth}×{template.PageHeight}  Line: '{template.LineChar}'×{template.LineWidth}  Divider: {template.DividerStyle}  Header: {template.HeaderStyle}");
    Console.WriteLine($"    Thank-you: {template.ThankYouMessage}");
}

// ═════════════════════════════════════════════════════════════════════════════
// Internal helpers
// ═════════════════════════════════════════════════════════════════════════════

BillTemplate ChooseTemplate()
{
    var all = templateManager.GetAll();

    Console.WriteLine("\nAvailable templates:");
    for (int i = 0; i < all.Count; i++)
        Console.WriteLine($"  {i + 1}. {all[i].Name}{(all[i].IsBuiltIn ? " (built-in)" : "")} – {all[i].Description}");

    Console.Write($"Select template [1=Classic]: ");
    string raw = Console.ReadLine()?.Trim() ?? "1";

    if (int.TryParse(raw, out int idx) && idx >= 1 && idx <= all.Count)
        return all[idx - 1];

    // Try by name
    var byName = templateManager.Find(raw);
    return byName ?? all[0];
}

List<Item> EnterItemsManually()
{
    var items = new List<Item>();
    Console.WriteLine("Enter items (empty name to finish):");
    while (true)
    {
        Console.Write("  Item name [or Enter to finish]: ");
        string name = Console.ReadLine()?.Trim() ?? "";
        if (string.IsNullOrEmpty(name)) break;

        double price = PromptDouble($"  Price of '{name}': ", 0);
        int qty      = PromptInt($"  Quantity: ", 1);

        items.Add(new Item(name, qty, price));
    }
    return items;
}

async Task<List<Item>> AiPickItemsInteractiveAsync()
{
    if (!aiService.IsAvailable)
    {
        Console.WriteLine("[!] AI unavailable, using deterministic items.");
        return ItemCatalogue.BuildForDate(DateTime.Today);
    }

    Console.Write("Describe the order: ");
    string request = Console.ReadLine() ?? "";
    Console.WriteLine("[AI] Thinking…");
    return await aiService.SuggestItemsAsync(request, ItemCatalogue.All);
}

// ── Prompt helpers ────────────────────────────────────────────────────────────

static string PromptString(string prompt, string defaultVal)
{
    Console.Write(prompt);
    string? input = Console.ReadLine()?.Trim();
    return string.IsNullOrEmpty(input) ? defaultVal : input;
}

static DateTime PromptDate(string prompt, DateTime defaultVal)
{
    Console.Write(prompt);
    string? input = Console.ReadLine()?.Trim();
    if (string.IsNullOrEmpty(input)) return defaultVal;
    return DateTime.TryParseExact(input, "dd/MM/yyyy",
        CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt) ? dt : defaultVal;
}

static TimeOnly PromptTime(string prompt, TimeOnly defaultVal)
{
    Console.Write(prompt);
    string? input = Console.ReadLine()?.Trim();
    if (string.IsNullOrEmpty(input)) return defaultVal;
    return TimeOnly.TryParseExact(input, "HH:mm",
        CultureInfo.InvariantCulture, DateTimeStyles.None, out var t) ? t : defaultVal;
}

static float PromptFloat(string prompt, float defaultVal)
{
    Console.Write(prompt);
    string? input = Console.ReadLine()?.Trim();
    return float.TryParse(input, out float v) ? v : defaultVal;
}

static double PromptDouble(string prompt, double defaultVal)
{
    Console.Write(prompt);
    string? input = Console.ReadLine()?.Trim();
    return double.TryParse(input, out double v) ? v : defaultVal;
}

static int PromptInt(string prompt, int defaultVal)
{
    Console.Write(prompt);
    string? input = Console.ReadLine()?.Trim();
    return int.TryParse(input, out int v) ? v : defaultVal;
}

static char PromptChar(string prompt, char defaultVal)
{
    Console.Write(prompt);
    string? input = Console.ReadLine()?.Trim();
    return (input?.Length == 1) ? input[0] : defaultVal;
}

static bool PromptBool(string prompt, bool defaultVal)
{
    Console.Write(prompt);
    string? input = Console.ReadLine()?.Trim().ToLower();
    if (string.IsNullOrEmpty(input)) return defaultVal;
    return input is "y" or "yes" or "true" or "1";
}

static string PromptOption(string prompt, string[] options, string defaultVal)
{
    Console.Write(prompt);
    string? input = Console.ReadLine()?.Trim().ToLower();
    return options.Contains(input) ? input! : defaultVal;
}
