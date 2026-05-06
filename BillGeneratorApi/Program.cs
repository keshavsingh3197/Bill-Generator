using BillGeneratorApi.Services;
using BillGeneratorApi.Templates;

var builder = WebApplication.CreateBuilder(args);

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddSingleton<TemplateManager>();
builder.Services.AddSingleton<PdfGenerator>();
builder.Services.AddSingleton<AiService>();

// ── CORS – allow Angular dev server and GitHub Pages ─────────────────────────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Angular", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:4200",             // ng serve
                "https://keshavsingh3197.github.io", // GitHub Pages
                "https://bill.keshavsingh.in"        // custom domain
            )
            .AllowAnyHeader()
            .AllowAnyMethod();

        // Also allow any explicitly configured origins
        if (allowedOrigins.Length > 0)
            policy.WithOrigins(allowedOrigins);
    });
});

var app = builder.Build();

app.UseCors("Angular");
app.UseAuthorization();
app.MapControllers();

app.Run();
