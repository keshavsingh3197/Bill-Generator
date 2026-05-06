using System.Text.Json.Serialization;

namespace BillGeneratorApi.Models;

/// <summary>
/// Defines the visual appearance and layout of a bill receipt.
/// </summary>
public class BillTemplate
{
    // ── Identity ──────────────────────────────────────────────────────────────
    public string Name { get; set; } = "Default";
    public string Description { get; set; } = string.Empty;
    public bool IsBuiltIn { get; set; } = false;

    // ── Shop info ─────────────────────────────────────────────────────────────
    public string ShopName { get; set; } = "My Shop";
    public string ShopAddress { get; set; } = string.Empty;
    public string ShopPhone { get; set; } = string.Empty;
    public string ShopTagline { get; set; } = string.Empty;

    // ── Page layout ───────────────────────────────────────────────────────────
    public float PageWidth { get; set; } = 400;
    public float PageHeight { get; set; } = 1000;
    public float MarginTop { get; set; } = 0;
    public float MarginRight { get; set; } = 10;
    public float MarginBottom { get; set; } = 10;
    public float MarginLeft { get; set; } = 0;

    // ── Typography ────────────────────────────────────────────────────────────
    public float BaseFontSize { get; set; } = 11;
    public float HeaderFontSize { get; set; } = 14;
    public float SubHeaderFontSize { get; set; } = 12;
    public float FooterFontSize { get; set; } = 10;

    // ── Line / separator ─────────────────────────────────────────────────────
    public int LineWidth { get; set; } = 42;
    public char LineChar { get; set; } = '-';

    // ── Column widths (chars) ────────────────────────────────────────────────
    public int ColQtyWidth { get; set; } = 4;
    public int ColNameWidth { get; set; } = 20;
    public int ColPriceWidth { get; set; } = 8;
    public int ColAmountWidth { get; set; } = 10;

    // ── Currency ─────────────────────────────────────────────────────────────
    public string CurrencySymbol { get; set; } = "₹";
    public string CultureName { get; set; } = "en-IN";

    // ── Footer ────────────────────────────────────────────────────────────────
    public string ThankYouMessage { get; set; } = "Thank You, Visit Again!";
    public bool ShowThankYouMessage { get; set; } = true;
    public string DateFormat { get; set; } = "dd/MM/yyyy";

    // ── Padding / alignment ───────────────────────────────────────────────────
    public float ReceiptLeftPadding { get; set; } = 55;

    // ── Divider style ─────────────────────────────────────────────────────────
    /// <summary>
    /// "single" = one line of LineChar, "double" = two lines, "star" = asterisks
    /// </summary>
    public string DividerStyle { get; set; } = "single";

    // ── Header style ─────────────────────────────────────────────────────────
    /// <summary>
    /// "plain" | "boxed"
    /// </summary>
    public string HeaderStyle { get; set; } = "plain";

    // ── Show / hide sections ─────────────────────────────────────────────────
    public bool ShowSubtotal { get; set; } = true;
    public bool ShowCashLine { get; set; } = true;
    public bool ShowRemainingBalance { get; set; } = true;
    public bool ShowCashier { get; set; } = true;
    public bool ShowPhone { get; set; } = false;
    public bool ShowTagline { get; set; } = false;
}
