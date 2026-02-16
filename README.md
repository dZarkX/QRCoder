# QR Generator (MD3) – Chrome Extension

> **Production-ready Manifest V3 Chrome Extension** that generates customizable QR codes from the active tab, custom input, or context menu. Built with TypeScript, Material Design 3, and modern tooling.

## ✨ Features

### 🎯 Sources
- **Active tab URL** – one-click button in popup
- **Custom text/URL** – manual input
- **Context menu** – right-click to generate QR from:
  - Current page
  - Any link
  - Any image

### 🎨 Customization
- **Colors**
  - Foreground / Background
  - Eye inner / Eye outer
  - Transparent background toggle
- **Shape**
  - Square / Rounded / Dots
- **Gradient** (optional)
  - Linear / Radial with rotation
- **Logo**
  - Upload image
  - Size, padding, border radius controls
- **Frame** (optional)
  - Thickness and color
- **Size presets**
  - 128×128 / 256×256 / 512×512 / 1024×1024 / Custom

### 📦 Export / Download
- **PNG** / **SVG** / **JPEG** / **WEBP**
- **Copy to clipboard** (PNG)

### 🎛️ UI/UX
- **Material Design 3** components and theming
- **Light / Dark mode** support
- **Modern typography** (system fonts + JetBrains Mono for code)
- **Elevated panels**, shadows, accent colors
- **Responsive layout**

### ⚙️ Tech Stack
- **Manifest V3** (service worker, content script, context menus)
- **TypeScript** (strict mode, typed Chrome APIs)
- **Vite** (multi-entry build, stable output names)
- **Material Web** (`@material/web` MD3 components)
- **QR engine**: `qr-code-styling` (logo support, SVG/canvas export)
- **Persistence**: `chrome.storage.local`

## 🚀 Installation

### From Chrome Web Store (future)
> Coming soon.

### Manual Install (dev)
1. **Clone** this repository
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Build**
   ```bash
   npm run build
   ```
4. **Load in Chrome**
   - Open `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `dist/` folder

## 📂 Project Structure

```
├─ public/
│  └─ manifest.json            # MV3 manifest
├─ src/
│  ├─ background/              # Service worker
│  ├─ content/                 # Content script
│  ├─ popup/                   # Popup UI (HTML/TS/CSS)
│  ├─ options/                 # Options page (HTML/TS/CSS)
│  ├─ services/                # Core logic
│  │  ├─ storage.ts
│  │  ├─ defaults.ts
│  │  └─ qr-generator.ts
│  ├─ types/                   # TypeScript types
│  └─ utils/
├─ assets/fonts/               # JetBrains Mono (OFL)
├─ dist/                       # Build output (loadable extension)
└─ MEMORY.MD                   # Project brain / changelog
```

## 🛠️ Development

### Scripts
- `npm run dev` – start Vite dev server (watch mode)
- `npm run build` – production build to `dist/`
- `npm run typecheck` – TypeScript type checking

### Build Pipeline
- **Multi-entry Vite**: popup, options, background, content
- **Stable filenames** for MV3 (`background.js`, `content.js`)
- **Asset flattening**: HTML files emitted to `dist/` root
- **CSS custom properties** for consistent theming

### Design System
- Shared CSS variables for colors, shadows, spacing
- MD3 component theming via CSS custom properties
- Light/dark mode with `light-dark()`
- JetBrains Mono for monospace text (optional)

## 🧩 Architecture

### Core Modules
- **QRGenerator** – wrapper around `qr-code-styling`
- **Storage** – typed `chrome.storage.local` helpers
- **Defaults** – default customization settings
- **Types** – comprehensive TypeScript definitions

### Message Flow
1. **Context menu** → stores `pendingContext` → opens popup
2. **Popup** consumes `pendingContext` → auto-generates QR
3. **Settings** persisted to `chrome.storage.local`
4. **Export** uses `qr-code-styling` download/canvas APIs

## 📜 License

This project uses **JetBrains Mono** under the [SIL Open Font License 1.1](assets/fonts/OFL.txt).

---

> 📌 **MEMORY.MD** serves as the project brain, tracking version history, completed features, known issues, and architecture decisions. It is updated on every iteration.
