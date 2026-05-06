# Bill-Generator

A .NET 10 console application that generates PDF receipts for an Indian street-food restaurant. Supports **predefined templates**, **custom user-defined templates**, and **AI-assisted item selection & template creation**.

---

## Features

| Feature | Description |
|---------|-------------|
| **4 built-in templates** | Classic · Modern · Minimal · Elegant |
| **Custom templates** | Create interactively or by cloning a built-in; stored as JSON |
| **AI item selection** | Describe an order in plain English → GPT picks items & quantities |
| **AI template generation** | Describe a visual style → GPT generates a full `BillTemplate` JSON |
| **Batch generation** | Generate bills for any date range (skips non-business days) |
| **Single bill** | Interactive wizard – choose template, date, time, cashier, items |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/keshavsingh3197/Bill-Generator.git
cd Bill-Generator/BillGenerator

# 2. (Optional) Enable AI features
export OPENAI_API_KEY=sk-...

# 3. Run
dotnet run
```

The interactive menu guides you through all features.

---

## Templates

### Built-in templates

| Name | Style |
|------|-------|
| **Classic** | Original mono-spaced look, `─` dividers |
| **Modern** | Wider page, `=` double dividers, tagline |
| **Minimal** | Compact, no subtotal/cash lines |
| **Elegant** | Boxed header, `*` dividers, phone + tagline |

### Custom templates

Custom templates are stored as JSON files inside `CustomTemplates/` (next to the executable). You can:

1. **Create manually** via the Template Manager menu.
2. **Clone a built-in** and edit the resulting JSON file.
3. **AI-generate** by describing the desired style in natural language (requires `OPENAI_API_KEY`).

---

## AI Features (requires `OPENAI_API_KEY`)

| Option | What it does |
|--------|-------------|
| **Menu 4 – AI item suggestion** | Describe what a customer ordered; the AI selects items from the catalogue and assigns realistic quantities. |
| **Menu 5 – AI template generation** | Describe a receipt style; the AI generates a full `BillTemplate` JSON and saves it as a custom template. |

---

## Project Structure

```
BillGenerator/
├── Program.cs                    # Interactive CLI / main entry point
├── Models/
│   ├── Item.cs                   # Menu item with name, qty, price
│   ├── BillData.cs               # Per-bill data (items, date, cashier, path)
│   └── BillTemplate.cs           # Visual template definition
├── Services/
│   ├── PdfGenerator.cs           # Renders BillData + BillTemplate → PDF
│   ├── TemplateManager.cs        # Load / save / delete templates
│   ├── ItemCatalogue.cs          # Menu items & deterministic helpers
│   └── AiService.cs              # OpenAI integration
└── Templates/
    └── PredefinedTemplates.cs    # Classic, Modern, Minimal, Elegant
```

---

## Fonts

The PDF generator auto-detects bundled **NotoSansMono** fonts (Regular + Bold). If not found, it falls back to the built-in Courier font. To use NotoSansMono, place the `.ttf` files at:

```
Fonts/noto-sans-mono/static/NotoSansMono/NotoSansMono-Regular.ttf
Fonts/noto-sans-mono/static/NotoSansMono/NotoSansMono-Bold.ttf
```

Download from [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+Mono).
