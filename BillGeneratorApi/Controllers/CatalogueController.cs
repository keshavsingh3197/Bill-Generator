using BillGeneratorApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BillGeneratorApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CatalogueController : ControllerBase
{
    /// <summary>GET /api/catalogue – all menu items.</summary>
    [HttpGet]
    public IActionResult GetAll() => Ok(ItemCatalogue.All);

    /// <summary>GET /api/catalogue/snacks</summary>
    [HttpGet("snacks")]
    public IActionResult GetSnacks() => Ok(ItemCatalogue.Snacks);

    /// <summary>GET /api/catalogue/maincourse</summary>
    [HttpGet("maincourse")]
    public IActionResult GetMainCourse() => Ok(ItemCatalogue.MainCourse);
}
