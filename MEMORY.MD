# MEMORY

## Project Overview
Chrome Extension (Manifest V3) that generates customizable QR codes from:
- Active tab URL
- Custom user input (text, URL, image URL, uploaded image)
- Context menu actions (page/link/image)

UI uses Material Design 3.

!For Design details - see SKILL.md!

## Current Version
0.1.4

## Version History
- 0.1.0
  - Project scaffold initialized (Vite + TypeScript)
  - MV3 manifest created
  - Placeholder architecture and build pipeline started
  - Added @types/chrome, @types/node for TS support
  - Added qr-code-styling vendor d.ts shim
  - Fixed Vite alias @ -> src resolution
  - Fixed Vite HTML asset output: flatten to dist root (popup.html, options.html)
  - Build pipeline now produces loadable extension (dist/ ready for chrome://extensions)
  - **UI/UX overhaul**: improved typography (system font stack), better contrast, modern color palette, shadows, MD3 component theming, consistent spacing, elevated panels, accent colors, better readability in both light/dark modes.
  - **JetBrains Mono font**: integrated via @font-face (OFL), CSS variable --font-mono, bundled in build.
  - **README.md**: comprehensive project documentation, features, installation, development, architecture.
  - **Full QR customization UI**: colors (fg/bg/eye inner/eye outer), transparent bg toggle, shape (square/rounded/dots), gradient (linear, rotation), logo upload (size/padding/radius), size presets (128/256/512/1024/custom), frame (thickness/color). Live updates on any change.
  - **Export formats**: PNG, SVG, JPEG, WEBP; clipboard copy (PNG).
  - **MD3 components**: replaced unsupported segmented-button with md-outlined-select; added select theming.
  - **Bug fixes / UX**:
    - Popup layout: fixed invalid closing tag causing layout break.
    - Settings merge: deep-merge customization settings to avoid losing nested data (e.g., logo image).
    - Minimalist popup: customization panel is collapsible (`details/summary`) and export buttons wrap.
    - Right-click download: right-click QR preview downloads PNG; Shift+right-click downloads SVG.
    - Color pickers: switched to native `<input type="color">` for reliable visibility.
    - Font: JetBrains Mono is now the primary font for popup + options UI.
    - Font in MD components: set Material Web typography tokens so buttons/inputs/selects consistently use JetBrains Mono.
    - Popup layout: increased width, made top input panel more compact, moved download actions next to QR preview for better visibility.
    - Popup stability: prevent layout overflow by making popup scroll internally.
    - Quick size selector: added size presets 256/512/1024/custom next to QR preview (synced with Customize size settings).

## Completed Features
- Project scaffolding: `package.json`, `tsconfig.json`, `vite.config.ts`
- MV3 `manifest.json` added
- MEMORY file created
- Build pipeline: Vite multi-entry, stable JS names, flattened HTML output
- Extension loads in Chrome (dist/ ready)
- Popup UI (MD3) with:
  - Use active tab URL
  - Custom text/URL input
  - Live QR preview (qr-code-styling)
  - Export PNG/SVG/JPEG/WEBP
  - Copy PNG to clipboard
  - **Improved visual design**: modern typography, better contrast, shadows, accent colors, consistent spacing, elevated panels, responsive light/dark theme.
  - **Full customization panel**: colors, shape, gradient, logo upload, size presets, frame; live update on any change.
- Options page (MD3) with:
  - Default colors, transparent bg toggle, default size
  - **Improved visual design**: same design system as popup, better readability, component theming.
- Context menu integration:
  - Items: page/link/image
  - Stores pendingContext in chrome.storage.local
  - Popup consumes pendingContext and auto-generates
- Storage abstraction and defaults module
- TypeScript strict mode, typed Chrome APIs, typed QR settings
- **Design System**: shared CSS variables for colors, shadows, spacing; MD3 component theming for buttons, inputs, switches, selects.
- **JetBrains Mono**: integrated via @font-face, bundled in dist/assets/, CSS variable --font-mono.
- **README.md**: detailed project documentation, features, installation, development, architecture, license.

## In-Progress Features
- Presets and history
- EPS export (optional)

## Known Issues
- None blocking extension loading.

## Problems Encountered
- npm peer dependency conflict: vite-plugin-static-copy required Vite ^5, we used Vite ^6. Solution: removed vite-plugin-static-copy; Vite copies public/ automatically.
- Rollup could not resolve @/* imports. Solution: added resolve.alias in vite.config.ts.
- Chrome failed to load extension: HTML files were under dist/src/ instead of dist/. Solution: switched Vite HTML inputs to root-level entrypoints so build emits dist/popup.html and dist/options.html.
- **UI readability**: initial colors and fonts lacked contrast and modern feel. Solution: comprehensive design system overhaul with better typography, colors, shadows, and MD3 theming.
- **Missing MD3 segmented-button**: not available in @material/web. Solution: replaced with md-outlined-select for shape and size preset; added select theming.

## Solutions Applied
- Use Vite multi-entry build with stable output filenames for MV3 (`background.js`, `content.js`).
- Added @types/chrome and @types/node for full TS support.
- Added minimal qr-code-styling.d.ts to avoid missing types.
- Vite build now emits HTML to dist root via root entrypoints (no manual copy required).
- **Design System**: introduced CSS custom properties for consistent colors, shadows, spacing; applied MD3 component theming; improved font stack and contrast.
- **JetBrains Mono**: @font-face declarations, CSS variable, bundled via Vite assets.
- **Customization UI**: live updates on any control change; file upload for logo; persisted settings.
- **Export formats**: extended to JPEG and WEBP; unified download handler.

## User Preferences and Feedback
- Must use Material Design 3 for all UI.
- Must keep modular architecture under `/src`.
- Versioning: big feature iterations bump MINOR by +0.1 (e.g. 0.1.0 -> 0.2.0), bugfix-only releases bump PATCH by +0.0.1 (e.g. 0.2.0 -> 0.2.1).

## Architecture Decisions
- **Build tool**: Vite, multi-entry output.
- **UI**: `@material/web` (Material 3 web components).
- **Persistence**: `chrome.storage.local`.
- **QR engine**: planned `qr-code-styling`.

## File Structure Explanation
- `/public`
  - `manifest.json` (copied as-is to `dist/`)
- `/src`
  - `background/` (service worker)
  - `content/` (content script)
  - `popup/` (popup UI)
  - `options/` (options page)
  - `services/`, `utils/`, `types/` (core modules)
