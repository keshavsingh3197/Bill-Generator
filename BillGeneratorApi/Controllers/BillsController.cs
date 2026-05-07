using BillGeneratorApi.Models;
using BillGeneratorApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BillGeneratorApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BillsController : ControllerBase
{
    private readonly PdfGenerator _pdfGen;
    private readonly TemplateManager _templateManager;

    public BillsController(PdfGenerator pdfGen, TemplateManager templateManager)
    {
        _pdfGen = pdfGen;
        _templateManager = templateManager;
    }

    /// <summary>
    /// POST /api/bills/generate
    /// Body: GenerateBillRequest
    /// Returns: PDF file bytes.
    /// </summary>
    [HttpPost("generate")]
    public IActionResult Generate([FromBody] GenerateBillRequest req)
    {
        var template = _templateManager.Find(req.TemplateName)
            ?? _templateManager.GetAll().First();

        // Resolve items: use provided items, or auto-build for date
        var items = req.Items?.Count > 0
            ? req.Items
            : ItemCatalogue.BuildForDate(req.BillDate);

        var pdfBytes = GeneratePdfBytes(items, req.BillDate, req.BillTime, req.CashierName ?? "", template);

        string fileName = $"Receipt_{req.BillDate:yyyyMMdd}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }

    /// <summary>
    /// POST /api/bills/generate-range
    /// Returns one PDF result per day in the range.
    /// </summary>
    [HttpPost("generate-range")]
    public IActionResult GenerateRange([FromBody] GenerateRangeRequest req)
    {
        var template = _templateManager.Find(req.TemplateName)
            ?? _templateManager.GetAll().First();

        var results = new List<BillRangeResult>();

        for (DateTime d = req.StartDate; d <= req.EndDate; d = d.AddDays(1))
        {
            var items = ItemCatalogue.BuildForDate(d);
            var billTime = ItemCatalogue.EveningTimeForDate(d);
            var pdfBytes = GeneratePdfBytes(items, d, billTime, "", template);

            results.Add(new BillRangeResult(
                Date: d.ToString("yyyy-MM-dd"),
                FileName: $"Receipt_{d:yyyyMMdd}.pdf",
                PdfBase64: Convert.ToBase64String(pdfBytes),
                Total: items.Sum(i => i.Amount)
            ));
        }

        return Ok(results);
    }

    // ── Internal helper ───────────────────────────────────────────────────────

    private byte[] GeneratePdfBytes(
        List<Item> items,
        DateTime date,
        TimeOnly time,
        string cashier,
        BillTemplate template)
    {
        string tmpPath = Path.Combine(Path.GetTempPath(), $"bill_{Guid.NewGuid()}.pdf");
        try
        {
            var data = new BillData
            {
                Items       = items,
                BillDate    = date,
                BillTime    = time,
                CashierName = cashier,
                OutputPath  = tmpPath
            };

            _pdfGen.Generate(data, template);
            return System.IO.File.ReadAllBytes(tmpPath);
        }
        finally
        {
            if (System.IO.File.Exists(tmpPath))
                System.IO.File.Delete(tmpPath);
        }
    }
}

// ── Request / Response DTOs ───────────────────────────────────────────────────

public class GenerateBillRequest
{
    public string TemplateName { get; set; } = "Classic";
    public List<Item>? Items { get; set; }
    public DateTime BillDate { get; set; } = DateTime.Today;
    public TimeOnly BillTime { get; set; } = TimeOnly.FromDateTime(DateTime.Now);
    public string? CashierName { get; set; }
}

public class GenerateRangeRequest
{
    public string TemplateName { get; set; } = "Classic";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public record BillRangeResult(string Date, string FileName, string PdfBase64, double Total);
