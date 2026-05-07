using BillGeneratorApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BillGeneratorApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly AiService _ai;
    private readonly TemplateManager _templateManager;

    public AiController(AiService ai, TemplateManager templateManager)
    {
        _ai = ai;
        _templateManager = templateManager;
    }

    /// <summary>
    /// POST /api/ai/suggest-items
    /// Body: { "request": "a party of 4 with snacks and curries" }
    /// Returns: list of suggested items.
    /// </summary>
    [HttpPost("suggest-items")]
    public async Task<IActionResult> SuggestItems([FromBody] AiItemRequest req)
    {
        var items = await _ai.SuggestItemsAsync(req.Request, ItemCatalogue.All);
        return Ok(items);
    }

    /// <summary>
    /// POST /api/ai/generate-template
    /// Body: { "name": "...", "styleDescription": "..." }
    /// Returns: the saved BillTemplate.
    /// </summary>
    [HttpPost("generate-template")]
    public async Task<IActionResult> GenerateTemplate([FromBody] AiTemplateRequest req)
    {
        var template = await _ai.GenerateTemplateAsync(req.StyleDescription, req.Name);
        template.IsBuiltIn = false;
        _templateManager.Save(template);
        return Ok(template);
    }

    /// <summary>GET /api/ai/status – reports whether the AI is available and which provider is active.</summary>
    [HttpGet("status")]
    public IActionResult Status() => Ok(new { available = _ai.IsAvailable, provider = _ai.Provider });
}

public record AiItemRequest(string Request);
public record AiTemplateRequest(string Name, string StyleDescription);
