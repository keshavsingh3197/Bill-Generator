using System.Globalization;
using BillGenerator.Models;
using iText.IO.Font;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using SysPath = System.IO.Path;

namespace BillGenerator.Services;

/// <summary>
/// Renders a <see cref="BillData"/> to a PDF file using the style defined in a
/// <see cref="BillTemplate"/>.
/// </summary>
public class PdfGenerator
{
    // Resolved once per instance so we don't scan the disk on every call.
    private readonly string? _regularFontPath;
    private readonly string? _boldFontPath;

    public PdfGenerator()
    {
        // Try to find the bundled NotoSansMono fonts (optional – falls back to Courier).
        string baseDir = AppContext.BaseDirectory;

        // Walk up a few levels to find the Fonts directory (works for both
        // "dotnet run" and published executables).
        for (int up = 0; up <= 5; up++)
        {
            string candidate = SysPath.GetFullPath(
                SysPath.Combine(baseDir, string.Concat(Enumerable.Repeat("../", up)),
                    "Fonts", "noto-sans-mono", "static", "NotoSansMono"));

            string rPath = SysPath.Combine(candidate, "NotoSansMono-Regular.ttf");
            string bPath = SysPath.Combine(candidate, "NotoSansMono-Bold.ttf");

            if (File.Exists(rPath) && File.Exists(bPath))
            {
                _regularFontPath = rPath;
                _boldFontPath = bPath;
                break;
            }
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public void Generate(BillData data, BillTemplate template)
    {
        string dir = SysPath.GetDirectoryName(data.OutputPath)!;
        if (!string.IsNullOrEmpty(dir))
            Directory.CreateDirectory(dir);

        var culture = new CultureInfo(template.CultureName);

        using var writer = new PdfWriter(data.OutputPath);
        using var pdf = new PdfDocument(writer);

        var pageSize = new PageSize(template.PageWidth, template.PageHeight);
        using var doc = new Document(pdf, pageSize);
        doc.SetMargins(template.MarginTop, template.MarginRight,
                       template.MarginBottom, template.MarginLeft);
        doc.SetTextAlignment(TextAlignment.CENTER);

        // Fonts
        PdfFont regular = CreateFont(false);
        PdfFont bold = CreateFont(true);

        doc.SetFont(regular).SetFontSize(template.BaseFontSize);

        // ── Header ────────────────────────────────────────────────────────────
        RenderHeader(doc, template, bold);

        // ── Column headings ───────────────────────────────────────────────────
        doc.Add(new Paragraph(FormatRow("QTY", "Item", "Price", "Amount", template))
            .SetFont(bold));
        doc.Add(new Paragraph(Line(template)));

        // ── Items ─────────────────────────────────────────────────────────────
        double total = 0;
        foreach (var item in data.Items)
        {
            double amt = item.Amount;
            total += amt;

            doc.Add(new Paragraph(
                FormatRow(
                    item.Quantity.ToString(),
                    item.Name,
                    FormatCurrency(item.Price, template, culture),
                    FormatCurrency(amt, template, culture),
                    template)));
        }

        doc.Add(new Paragraph(Line(template)));

        // ── Totals ────────────────────────────────────────────────────────────
        if (template.ShowSubtotal)
        {
            doc.Add(new Paragraph(
                FormatTotal("Net Subtotal", total, template, culture))
                .SetFont(bold));
            doc.Add(new Paragraph(Line(template)));
        }

        doc.Add(new Paragraph(
            FormatTotal("Total to Pay", total, template, culture))
            .SetFont(bold));

        // ── Payment section ───────────────────────────────────────────────────
        if (template.ShowCashLine || template.ShowRemainingBalance)
        {
            doc.Add(new Paragraph(Line(template)));

            if (template.ShowCashLine)
            {
                doc.Add(new Paragraph("Received")
                    .SetTextAlignment(TextAlignment.LEFT)
                    .SetPaddingLeft(template.ReceiptLeftPadding));
                doc.Add(new Paragraph(
                    FormatTotal("CASH", total, template, culture))
                    .SetFont(bold));
            }

            if (template.ShowRemainingBalance)
            {
                doc.Add(new Paragraph("Remaining Balance: 0.00")
                    .SetTextAlignment(TextAlignment.LEFT)
                    .SetPaddingLeft(template.ReceiptLeftPadding));
            }
        }

        // ── Date / cashier ────────────────────────────────────────────────────
        doc.Add(new Paragraph(Line(template)));

        doc.Add(new Paragraph(
            $"{data.BillDate.ToString(template.DateFormat, culture)}   {FormatTime(data.BillTime, culture)}")
            .SetTextAlignment(TextAlignment.LEFT)
            .SetPaddingLeft(template.ReceiptLeftPadding));

        if (template.ShowCashier)
        {
            string cashier = string.IsNullOrWhiteSpace(data.CashierName)
                ? "Cashier:"
                : $"Cashier: {data.CashierName}";
            doc.Add(new Paragraph(cashier)
                .SetTextAlignment(TextAlignment.LEFT)
                .SetPaddingLeft(template.ReceiptLeftPadding));
        }

        // ── Footer ────────────────────────────────────────────────────────────
        if (template.ShowThankYouMessage && !string.IsNullOrWhiteSpace(template.ThankYouMessage))
        {
            doc.Add(new Paragraph(
                Center("\n" + template.ThankYouMessage, template.LineWidth)));
        }
    }

    // ── Header rendering ─────────────────────────────────────────────────────

    private static void RenderHeader(Document doc, BillTemplate t, PdfFont bold)
    {
        if (t.HeaderStyle == "boxed")
        {
            doc.Add(new Paragraph(new string('*', t.LineWidth)));
        }

        doc.Add(new Paragraph(t.ShopName)
            .SetFont(bold)
            .SetFontSize(t.HeaderFontSize)
            .SetTextAlignment(TextAlignment.CENTER));

        if (!string.IsNullOrWhiteSpace(t.ShopAddress))
        {
            doc.Add(new Paragraph(t.ShopAddress)
                .SetFont(bold)
                .SetFontSize(t.SubHeaderFontSize)
                .SetTextAlignment(TextAlignment.CENTER));
        }

        if (t.ShowPhone && !string.IsNullOrWhiteSpace(t.ShopPhone))
        {
            doc.Add(new Paragraph($"Ph: {t.ShopPhone}")
                .SetFontSize(t.SubHeaderFontSize)
                .SetTextAlignment(TextAlignment.CENTER));
        }

        if (t.ShowTagline && !string.IsNullOrWhiteSpace(t.ShopTagline))
        {
            doc.Add(new Paragraph(t.ShopTagline)
                .SetFontSize(t.FooterFontSize)
                .SetTextAlignment(TextAlignment.CENTER));
        }

        if (t.HeaderStyle == "boxed")
        {
            doc.Add(new Paragraph(new string('*', t.LineWidth)));
        }
    }

    // ── Formatting helpers ────────────────────────────────────────────────────

    private static string FormatRow(string qty, string name, string price,
                                    string amount, BillTemplate t) =>
        $"{qty.PadRight(t.ColQtyWidth)}" +
        $"{name.PadRight(t.ColNameWidth)}" +
        $"{price.PadLeft(t.ColPriceWidth)}" +
        $"{amount.PadLeft(t.ColAmountWidth)}";

    private static string FormatTotal(string label, double value,
                                      BillTemplate t, CultureInfo culture)
    {
        int labelWidth = t.ColQtyWidth + t.ColNameWidth + t.ColPriceWidth;
        int valueWidth = t.ColAmountWidth + 2;
        return $"{label.PadRight(labelWidth)}{FormatCurrency(value, t, culture).PadLeft(valueWidth)}";
    }

    private static string FormatCurrency(double value, BillTemplate t, CultureInfo culture) =>
        $"{t.CurrencySymbol} {value.ToString("N2", culture)}";

    private static string Line(BillTemplate t) =>
        new string(t.LineChar, t.LineWidth);

    private static string Center(string text, int width)
    {
        int padding = (width - text.Length) / 2;
        return new string(' ', Math.Max(0, padding)) + text;
    }

    private static string FormatTime(TimeOnly time, CultureInfo culture) =>
        time.ToString("hh:mm tt", culture)
            .Replace("AM", "A.M.", StringComparison.OrdinalIgnoreCase)
            .Replace("PM", "P.M.", StringComparison.OrdinalIgnoreCase);

    // ── Font helpers ──────────────────────────────────────────────────────────

    private PdfFont CreateFont(bool bold)
    {
        string? path = bold ? _boldFontPath : _regularFontPath;
        if (path is not null)
        {
            try
            {
                return PdfFontFactory.CreateFont(path, PdfEncodings.IDENTITY_H);
            }
            catch { /* fall through */ }
        }

        // Fallback: built-in Courier / Courier-Bold
        return PdfFontFactory.CreateFont(
            bold ? iText.IO.Font.Constants.StandardFonts.COURIER_BOLD
                 : iText.IO.Font.Constants.StandardFonts.COURIER);
    }
}
