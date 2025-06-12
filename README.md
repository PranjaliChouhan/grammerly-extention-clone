# Grammar Extension

A Grammarly-like browser extension clone built with TypeScript and Tailwind CSS that provides AI-powered grammar checking functionality.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google
- 📝 **Real-time Grammar Checking** - Checks grammar as you type
- 🎯 **Text Selection Grammar Check** - Check grammar for selected text
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS
- ⚙️ **User Preferences** - Customizable settings based on writing purpose
- 🔧 **Your Own API** - Connect to your custom grammar checking API

## Project Structure

```
grammar-extension/
├── src/
│   ├── background/
│   │   └── background.ts          # Background service worker
│   ├── content/
│   │   └── content.ts             # Content script for web pages
│   ├── popup/
│   │   ├── popup.html             # Extension popup UI
│   │   └── popup.ts               # Popup logic and authentication
│   ├── styles/
│   │   ├── input.css              # Tailwind CSS input
│   │   └── output.css             # Generated CSS output
│   └── types/
│       └── chrome.d.ts            # Chrome extension type definitions
├── dist/                          # Built extension files
├── manifest.json                  # Extension manifest
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── webpack.config.js              # Webpack build configuration
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add your Chrome extension ID to authorized origins
6. Update `manifest.json` with your client ID:

```json
{
  "oauth2": {
    "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
    "scopes": ["openid", "email", "profile"]
  }
}
```

### 3. Configure Your API Endpoint

Update the API endpoint in `src/background/background.ts`:

```typescript
const response = await fetch('https://your-api-endpoint.com/grammar-check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({ text })
});
```

### 4. Build the Extension

```bash
# Build Tailwind CSS
npm run build:tailwind

# Build TypeScript and bundle
npm run build
```

### 5. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder from your project

## Development

### Watch Mode for Development

```bash
# Watch Tailwind CSS changes
npm run build:tailwind

# In another terminal, watch TypeScript changes
npm run dev
```

### Scripts

- `npm run build` - Build for production
- `npm run dev` - Build for development with watch mode
- `npm run build:tailwind` - Build Tailwind CSS

## Usage

### First Time Setup

1. Click the extension icon in Chrome toolbar
2. Click "Continue with Google" to authenticate
3. Complete the onboarding process by selecting your writing purpose

### Grammar Checking

The extension automatically provides grammar checking in two ways:

1. **Real-time checking** - As you type in text fields, the extension will check grammar
2. **Selection checking** - Select text on any webpage and use the floating grammar check button

### UI Components

- **Login Page** - Google OAuth authentication
- **Onboarding Page** - User preference collection (Work, School, Other projects)
- **Grammar Suggestions** - Popup showing grammar corrections

## API Integration

The extension is designed to work with your custom grammar checking API. The expected API format:

### Request
```json
{
  "text": "Your text to check for grammar"
}
```

### Response
```json
{
  "success": true,
  "result": {
    "suggestions": [
      {
        "text": "Suggested correction",
        "type": "grammar",
        "confidence": 0.95
      }
    ]
  }
}
```

## Customization

### Styling

The extension uses Tailwind CSS with custom Grammarly-inspired colors:

- Primary Green: `#15C39A`
- Dark Green: `#0A8967`
- Light Green: `#E8F5F2`

You can customize these in `tailwind.config.js`.

### Adding New Features

1. **New Onboarding Steps** - Add more steps in `popup.html` and handle them in `popup.ts`
2. **Additional Grammar Rules** - Extend the API integration in `background.ts`
3. **UI Enhancements** - Modify the content script in `content.ts`

## Browser Support

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the extension
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Next Steps

After setting up the basic login and onboarding:

1. **Add More Onboarding Steps** - Implement the remaining 3 steps
2. **Enhanced Grammar Checking** - Improve the grammar suggestion UI
3. **User Dashboard** - Add a settings/dashboard page
4. **Advanced Features** - Add writing goals, statistics, etc.

## Troubleshooting

### Common Issues

1. **OAuth not working** - Ensure your Google Client ID is correctly configured
2. **Extension not loading** - Check the Chrome Developer Tools console for errors
3. **Build fails** - Ensure all dependencies are installed with `npm install`

### Debug Mode

Enable debug logging by opening Chrome Developer Tools in the extension popup or background page. 