# QR Forge

A Tauri-based desktop QR code generator with React + TypeScript frontend.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run tauri dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run tauri build
```

## Project Structure

```
qr-forge/
├── src/                    # React frontend
│   ├── components/         # UI components by feature
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state stores
│   ├── lib/                # Utility functions
│   ├── types/              # TypeScript definitions
│   └── styles/             # CSS/Tailwind
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands/       # Tauri IPC commands
│   │   └── db/             # SQLite database
│   └── Cargo.toml
└── CLAUDE.md               # This file
```

## Validation Checklist

After making changes, validate using this checklist:

### Core Functionality
- [ ] `npm run tauri dev` starts without errors
- [ ] QR code renders in preview when content is entered
- [ ] Changing content updates preview in real-time
- [ ] Style changes (colors, dot style) reflect immediately

### Export
- [ ] PNG download saves valid image file
- [ ] SVG export produces scalable vector
- [ ] Clipboard copy works (paste into another app)

### QR Validation
- [ ] "Validate QR" button triggers validation
- [ ] Pass state shows green checkmark
- [ ] Large logo + low EC level triggers warn/fail

### Input Types
- [ ] URL: Scan opens browser
- [ ] WiFi: Scan prompts WiFi connection
- [ ] vCard: Scan creates contact
- [ ] Phone: Scan offers to call
- [ ] Email: Scan opens mail compose

### Scanner
- [ ] Dropping QR image decodes content
- [ ] Clipboard paste (Cmd+V) decodes
- [ ] "Re-generate" loads content into Generator

### History & Templates
- [ ] Generated QRs appear in History
- [ ] Clicking history item loads it
- [ ] Saving template preserves all style settings
- [ ] Loading template applies all styles

### Batch
- [ ] CSV drop parses rows correctly
- [ ] Generate creates ZIP with all QRs
- [ ] Failed validations show in status column

## Common Issues

### "Command not found" errors
Ensure Rust toolchain is installed:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Tauri dev server won't start
Check that Xcode Command Line Tools are installed (macOS):
```bash
xcode-select --install
```

### QR code not rendering
1. Check browser console for errors
2. Verify qr-code-styling is imported correctly
3. Ensure canvas element has non-zero dimensions

### Validation always fails
1. Check that rqrr crate is added to Cargo.toml
2. Ensure image is rendered at sufficient resolution (min 256px)
3. Verify the QR content matches exactly (no trailing whitespace)

## Testing Strategy

### Manual Testing
Use the validation checklist above after each change.

### Automated Testing (when added)
```bash
# Frontend tests
npm test

# Rust tests
cd src-tauri && cargo test
```

## Feature Flags

None currently. All features are enabled.

## Dependencies

### Frontend
- `qr-code-styling` - QR code generation with styling
- `jsqr` - QR code decoding
- `zustand` - State management
- `@radix-ui/*` - UI primitives
- `react-colorful` - Color picker

### Backend (Rust)
- `tauri` - Desktop app framework
- `rqrr` - QR code decoding for validation
- `image` - Image processing
- `rusqlite` - SQLite database
- `csv` - CSV parsing for batch
