# TypeSmart Browser Extension

Write better, faster, everywhere. Transform your writing in Gmail, LinkedIn, Twitter, and any text field with AI.

## Features

- ✨ **AI-Powered Rewriting** - Transform your text with one click
- 🎯 **Works Everywhere** - Gmail, LinkedIn, Twitter, Facebook, and any website
- 🖱️ **Right-Click Menu** - "TypeSmart this" context menu
- 🎨 **5 Tones** - Professional, Friendly, Assertive, Apologetic, Enthusiastic
- 🚀 **Fast & Private** - Your text is processed securely

## Installation

### Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "TypeSmart"
3. Click "Add to Chrome"

### Firefox Add-ons (Coming Soon)
1. Visit Firefox Add-ons
2. Search for "TypeSmart"
3. Click "Add to Firefox"

### Manual Installation (Developer Mode)

#### Chrome
1. Download the latest release from GitHub
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `dist/chrome` folder

#### Firefox
1. Download the latest release from GitHub
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` from `dist/firefox` folder

## Setup

1. Install the extension
2. Click the TypeSmart icon in your browser toolbar
3. Click "Set Up Extension"
4. Enter your TypeSmart API key (from your dashboard)
5. Save settings

## How to Use

### Method 1: TypeSmart Button
1. Click on any text field (Gmail, LinkedIn, etc.)
2. Look for the purple "TypeSmart" button
3. Click it to open the AI panel
4. Choose your tone and click "Generate"
5. Insert the result or try again

### Method 2: Right-Click
1. Select text in any text field
2. Right-click and choose "✨ TypeSmart this"
3. The AI panel opens automatically

### Method 3: Keyboard Shortcut
- Press `Ctrl+Shift+T` (Windows/Linux) or `Cmd+Shift+T` (Mac)
- Opens TypeSmart on the active text field

## Supported Sites

- ✅ Gmail
- ✅ LinkedIn
- ✅ Twitter / X
- ✅ Facebook
- ✅ Instagram
- ✅ Any website with text fields

## Development

```bash
# Install dependencies
npm install

# Build for Chrome
npm run build:chrome

# Build for Firefox
npm run build:firefox

# Watch mode (auto-rebuild)
npm run dev
```

## File Structure

```
extension/
├── manifest.json          # Extension manifest
├── src/
│   ├── content/
│   │   ├── content.js    # Main content script
│   │   └── content.css   # Styles for UI
│   └── background/
│       └── background.js # Background service worker
├── public/
│   ├── popup.html        # Extension popup
│   ├── popup.js          # Popup logic
│   ├── options.html      # Settings page
│   └── options.js        # Settings logic
├── build.js              # Build script
└── README.md             # This file
```

## Privacy

- Your API key is stored locally in your browser
- Text is only sent to TypeSmart servers when you click "Generate"
- We never store or log your generated content

## Support

- Website: https://www.typesmart.io
- Help: https://www.typesmart.io/help
- Email: support@typesmart.io

## License

MIT License - See LICENSE file for details
