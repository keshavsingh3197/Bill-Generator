# Bill Generator

A full-stack bill receipt generator for an Indian street-food restaurant.

| Layer | Technology | Deployment |
|-------|-----------|------------|
| Frontend | Angular 19 + Angular Material | GitHub Pages |
| Android app | Capacitor 6 (wraps Angular) | Google Play Store (CI/CD) |
| Backend | ASP.NET Core 10 Web API | Render.com (Docker) |
| PDF engine | iText7 | (bundled) |
| AI | Google Gemini (free) / OpenAI gpt-4o-mini | (optional) |

---

## Live

| | URL |
|--|-----|
| Frontend | `https://keshavsingh3197.github.io/Bill-Generator/` |
| API | `https://bill-generator-api.onrender.com` |

---

## Architecture

```
Bill-Generator/
├── BillGenerator/          ← Original CLI console app
├── BillGeneratorApi/       ← ASP.NET Core Web API (REST backend)
│   ├── Controllers/        ← Templates, Bills, Catalogue, AI
│   ├── Models/             ← Shared models
│   ├── Services/           ← PDF, Template, AI, Catalogue services
│   ├── Dockerfile          ← Container image for Render
│   └── Program.cs          ← CORS + DI setup
├── bill-generator-ui/      ← Angular 19 frontend
│   └── src/app/
│       ├── pages/          ← Home, Generate, Templates, AI Assistant
│       ├── services/       ← ApiService (HTTP client)
│       └── models/         ← TypeScript interfaces
├── render.yaml             ← Render.com deployment config
└── .github/workflows/
    ├── deploy-frontend.yml  ← CI/CD → GitHub Pages
    ├── build-api.yml        ← CI: build + Docker test
    └── deploy-android.yml   ← CI/CD → Google Play Store (internal track)
```

---

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/templates` | List all templates |
| GET | `/api/templates/{name}` | Get one template |
| POST | `/api/templates` | Create custom template |
| DELETE | `/api/templates/{name}` | Delete custom template |
| POST | `/api/templates/{name}/clone` | Clone a template |
| GET | `/api/catalogue` | Full menu catalogue |
| POST | `/api/bills/generate` | Generate PDF (returns file) |
| POST | `/api/bills/generate-range` | Generate one bill for every day in a date range |
| GET | `/api/ai/status` | AI availability |
| POST | `/api/ai/suggest-items` | AI item suggestion |
| POST | `/api/ai/generate-template` | AI template creation |

---

## Features

### 4 Built-in Templates

| Name | Style |
|------|-------|
| **Classic** | Original mono-spaced, `-` dividers |
| **Modern** | `=` double dividers, tagline |
| **Minimal** | Compact, no extra sections |
| **Elegant** | Boxed header, `*` dividers |

### Custom Templates
Create, clone, and edit templates from the UI. Full control over shop info, page size, fonts, dividers, and which sections to show.

### AI Features (requires `GEMINI_API_KEY` or `OPENAI_API_KEY`)
- **Item Suggestion**: describe an order → AI picks items and quantities
- **Template Generation**: describe a style → AI creates a full template

> **Tip – Free AI:** Get a free Google Gemini API key (no credit card) at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and set `GEMINI_API_KEY` on the backend. OpenAI (`OPENAI_API_KEY`) is also supported as a fallback.

---

## Local Development

### Backend
```bash
cd BillGeneratorApi
dotnet run
# API available at http://localhost:5000
```

### Frontend
```bash
cd bill-generator-ui
npm install
ng serve
# App available at http://localhost:4200
```

### AI Features
```bash
# Option 1: Google Gemini (free – recommended)
export GEMINI_API_KEY=AIza...   # Get free key at https://aistudio.google.com/apikey

# Option 2: OpenAI (paid)
export OPENAI_API_KEY=sk-...    # before running the backend
```

### MongoDB (optional, for dynamic custom templates)
```bash
export MONGODB_CONNECTION_STRING="mongodb+srv://..."
export MONGODB_DATABASE="BillGenerator"
export MONGODB_TEMPLATES_COLLECTION="templates"
```

---

## Deployment

### Frontend → GitHub Pages

The GitHub Actions workflow `.github/workflows/deploy-frontend.yml` automatically builds and deploys the Angular app to GitHub Pages on every push to `main`.

Enable GitHub Pages in the repository settings:
- Source: **GitHub Actions**

### Backend → Render.com

1. Create a free account at [render.com](https://render.com)
2. Connect the repository
3. Create a new **Web Service** using the `render.yaml` configuration
4. Set optional environment variables in the Render dashboard:
   - `GEMINI_API_KEY` for AI features (free – get at [aistudio.google.com/apikey](https://aistudio.google.com/apikey))
   - `OPENAI_API_KEY` as an alternative AI provider (paid)
   - `MONGODB_CONNECTION_STRING` and `MONGODB_DATABASE` for MongoDB-backed custom templates
5. After deployment, copy the Render service URL and update `bill-generator-ui/src/environments/environment.prod.ts`

### Android → Google Play Store

The workflow `.github/workflows/deploy-android.yml` builds a signed Android App Bundle (`.aab`) via [Capacitor](https://capacitorjs.com/) and publishes it to the **internal track** of the Google Play Console on every push to `main`/`master`.

#### One-time setup

**1. Register the app on Google Play Console**
- Create a new app with package name `com.billgenerator.app` (must match `appId` in `bill-generator-ui/capacitor.config.ts`)
- Complete the store listing, content rating, and pricing before the first upload

**2. Create a release keystore** (keep this file safe – you need the same key for all future releases)
```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias my-key-alias \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

**3. Encode the keystore as base64**
```bash
# Linux
base64 -w 0 release.keystore

# macOS
base64 -i release.keystore | tr -d '\n'
```

**4. Create a Play Store service account**
1. Google Play Console → **Setup → API access**
2. Link to (or create) a Google Cloud project
3. Click **Create new service account** → follow the Google Cloud Console link
4. Grant the service account the **Release manager** role in Play Console
5. Download the JSON key for the service account

**5. Add GitHub Secrets** (Settings → Secrets and variables → Actions):

| Secret name | Value |
|---|---|
| `KEYSTORE_BASE64` | Base64 string from step 3 |
| `KEYSTORE_PASSWORD` | Keystore password chosen in step 2 |
| `KEY_ALIAS` | Key alias chosen in step 2 (e.g. `my-key-alias`) |
| `KEY_PASSWORD` | Key password chosen in step 2 |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Full JSON content from the service-account key file (step 4) |

Once the secrets are in place, push any change to `main`/`master` (or trigger the workflow manually via **Actions → Deploy Android to Google Play → Run workflow**) to publish a new internal-track release.

---

## CLI App

The original console application is preserved in `BillGenerator/`:
```bash
cd BillGenerator
dotnet run
```


A .NET 10 console application that generates PDF receipts for an Indian street-food restaurant. Supports **predefined templates**, **custom user-defined templates**, and **AI-assisted item selection & template creation**.

---

## Features

| Feature | Description |
|---------|-------------|
| **4 built-in templates** | Classic · Modern · Minimal · Elegant |
| **Custom templates** | Create interactively or by cloning a built-in; stored as JSON |
| **AI item selection** | Describe an order in plain English → GPT picks items & quantities |
| **AI template generation** | Describe a visual style → GPT generates a full `BillTemplate` JSON |
| **Batch generation** | Generate bills for all days in any date range |
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

Custom templates are stored in MongoDB when `MONGODB_CONNECTION_STRING` is set. If MongoDB is not configured, they fall back to JSON files in `CustomTemplates/` (next to the executable). You can:

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

The PDF generator prefers **NotoSansMono** (for proper ₹ rendering). It auto-detects:
- bundled project fonts, or
- Linux system Noto fonts (installed in the Docker image), or
- a custom path from `NOTO_SANS_MONO_DIR`.

If none are available, it falls back to Courier.

You can override the auto-detected font location with:
```bash
export NOTO_SANS_MONO_DIR="/path/to/font/folder"
```

To bundle NotoSansMono manually, place the `.ttf` files at:

```
Fonts/noto-sans-mono/static/NotoSansMono/NotoSansMono-Regular.ttf
Fonts/noto-sans-mono/static/NotoSansMono/NotoSansMono-Bold.ttf
```

Download from [Google Fonts](https://fonts.google.com/noto/specimen/Noto+Sans+Mono).
