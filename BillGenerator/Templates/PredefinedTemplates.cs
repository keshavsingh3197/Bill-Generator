using BillGenerator.Models;

namespace BillGenerator.Templates;

/// <summary>
/// Built-in receipt templates bundled with the application.
/// </summary>
public static class PredefinedTemplates
{
    // ── 1. Classic ────────────────────────────────────────────────────────────
    public static BillTemplate Classic => new()
    {
        Name = "Classic",
        Description = "Traditional mono-spaced receipt – the original look.",
        IsBuiltIn = true,
        ShopName = "Bunty Di Hatti",
        ShopAddress = "Jaipur-Bikaner Bypass, Sikar",
        PageWidth = 400,
        PageHeight = 1000,
        BaseFontSize = 11,
        HeaderFontSize = 14,
        SubHeaderFontSize = 12,
        LineWidth = 42,
        LineChar = '-',
        DividerStyle = "single",
        HeaderStyle = "plain",
        CurrencySymbol = "₹",
        CultureName = "en-IN",
        ThankYouMessage = "Thank You, Visit Again!",
        ShowThankYouMessage = true,
        ShowSubtotal = true,
        ShowCashLine = true,
        ShowRemainingBalance = true,
        ShowCashier = true,
        ShowPhone = false,
        ShowTagline = false,
        ReceiptLeftPadding = 55,
        MarginTop = 0,
        MarginRight = 10,
        MarginBottom = 10,
        MarginLeft = 0,
        ColQtyWidth = 4,
        ColNameWidth = 20,
        ColPriceWidth = 8,
        ColAmountWidth = 10
    };

    // ── 2. Modern ─────────────────────────────────────────────────────────────
    public static BillTemplate Modern => new()
    {
        Name = "Modern",
        Description = "Clean wide layout with double-line dividers.",
        IsBuiltIn = true,
        ShopName = "Bunty Di Hatti",
        ShopAddress = "Jaipur-Bikaner Bypass, Sikar",
        ShopTagline = "Fresh Food, Delivered with Love ❤",
        PageWidth = 450,
        PageHeight = 1100,
        BaseFontSize = 11,
        HeaderFontSize = 15,
        SubHeaderFontSize = 12,
        LineWidth = 48,
        LineChar = '=',
        DividerStyle = "double",
        HeaderStyle = "plain",
        CurrencySymbol = "₹",
        CultureName = "en-IN",
        ThankYouMessage = "★  Thank You! Come back soon  ★",
        ShowThankYouMessage = true,
        ShowSubtotal = true,
        ShowCashLine = true,
        ShowRemainingBalance = true,
        ShowCashier = true,
        ShowPhone = false,
        ShowTagline = true,
        ReceiptLeftPadding = 60,
        MarginTop = 5,
        MarginRight = 12,
        MarginBottom = 12,
        MarginLeft = 5,
        ColQtyWidth = 4,
        ColNameWidth = 22,
        ColPriceWidth = 9,
        ColAmountWidth = 11
    };

    // ── 3. Minimal ────────────────────────────────────────────────────────────
    public static BillTemplate Minimal => new()
    {
        Name = "Minimal",
        Description = "Compact, no-frills receipt for quick printing.",
        IsBuiltIn = true,
        ShopName = "Bunty Di Hatti",
        ShopAddress = "Sikar",
        PageWidth = 350,
        PageHeight = 900,
        BaseFontSize = 10,
        HeaderFontSize = 13,
        SubHeaderFontSize = 11,
        LineWidth = 38,
        LineChar = '.',
        DividerStyle = "single",
        HeaderStyle = "plain",
        CurrencySymbol = "₹",
        CultureName = "en-IN",
        ThankYouMessage = "Thank You!",
        ShowThankYouMessage = true,
        ShowSubtotal = false,
        ShowCashLine = false,
        ShowRemainingBalance = false,
        ShowCashier = false,
        ShowPhone = false,
        ShowTagline = false,
        ReceiptLeftPadding = 45,
        MarginTop = 0,
        MarginRight = 8,
        MarginBottom = 8,
        MarginLeft = 0,
        ColQtyWidth = 3,
        ColNameWidth = 19,
        ColPriceWidth = 8,
        ColAmountWidth = 9
    };

    // ── 4. Elegant ────────────────────────────────────────────────────────────
    public static BillTemplate Elegant => new()
    {
        Name = "Elegant",
        Description = "Wider page with star-style dividers and tagline.",
        IsBuiltIn = true,
        ShopName = "Bunty Di Hatti",
        ShopAddress = "Jaipur-Bikaner Bypass, Sikar",
        ShopPhone = "+91-98765-43210",
        ShopTagline = "\"Where Every Bite Tells a Story\"",
        PageWidth = 480,
        PageHeight = 1100,
        BaseFontSize = 11,
        HeaderFontSize = 16,
        SubHeaderFontSize = 13,
        LineWidth = 50,
        LineChar = '*',
        DividerStyle = "star",
        HeaderStyle = "boxed",
        CurrencySymbol = "₹",
        CultureName = "en-IN",
        ThankYouMessage = "✦  Thank You for Your Visit  ✦",
        ShowThankYouMessage = true,
        ShowSubtotal = true,
        ShowCashLine = true,
        ShowRemainingBalance = true,
        ShowCashier = true,
        ShowPhone = true,
        ShowTagline = true,
        ReceiptLeftPadding = 65,
        MarginTop = 5,
        MarginRight = 15,
        MarginBottom = 15,
        MarginLeft = 5,
        ColQtyWidth = 5,
        ColNameWidth = 22,
        ColPriceWidth = 9,
        ColAmountWidth = 12
    };

    // ── Registry ──────────────────────────────────────────────────────────────
    public static IReadOnlyList<BillTemplate> All =>
        new[] { Classic, Modern, Minimal, Elegant };
}
