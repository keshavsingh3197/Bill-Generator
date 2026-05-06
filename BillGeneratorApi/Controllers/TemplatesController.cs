using BillGeneratorApi.Models;
using BillGeneratorApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BillGeneratorApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TemplatesController : ControllerBase
{
    private readonly TemplateManager _manager;

    public TemplatesController(TemplateManager manager) => _manager = manager;

    /// <summary>GET /api/templates – list all templates.</summary>
    [HttpGet]
    public IActionResult GetAll() => Ok(_manager.GetAll());

    /// <summary>GET /api/templates/{name} – get one template.</summary>
    [HttpGet("{name}")]
    public IActionResult Get(string name)
    {
        var t = _manager.Find(name);
        return t is null ? NotFound(new { message = $"Template '{name}' not found." }) : Ok(t);
    }

    /// <summary>POST /api/templates – create or update a custom template.</summary>
    [HttpPost]
    public IActionResult Create([FromBody] BillTemplate template)
    {
        if (template.IsBuiltIn)
            return BadRequest(new { message = "Cannot overwrite a built-in template." });

        _manager.Save(template);
        return CreatedAtAction(nameof(Get), new { name = template.Name }, template);
    }

    /// <summary>DELETE /api/templates/{name} – delete a custom template.</summary>
    [HttpDelete("{name}")]
    public IActionResult Delete(string name)
    {
        bool deleted = _manager.Delete(name);
        return deleted ? NoContent() : NotFound(new { message = $"Template '{name}' not found." });
    }

    /// <summary>POST /api/templates/{name}/clone – clone a built-in into a new custom template.</summary>
    [HttpPost("{name}/clone")]
    public IActionResult Clone(string name, [FromBody] CloneRequest req)
    {
        var source = _manager.Find(name);
        if (source is null)
            return NotFound(new { message = $"Template '{name}' not found." });

        var cloned = _manager.ExportAsCustom(source, req.NewName);
        return CreatedAtAction(nameof(Get), new { name = cloned.Name }, cloned);
    }
}

public record CloneRequest(string NewName);
