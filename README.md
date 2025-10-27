# Tab Insights 🧠

> **Make sense of text selections anywhere** - A powerful Chrome extension that brings AI capabilities to any text you select on the web.

## ✨ Features

Tab Insights transforms how you interact with web content by providing instant AI-powered assistance for any selected text:

- **✏️ Grammar & Rewriting** - Improve your text with AI-powered grammar checks and rewriting suggestions
- **🌍 Translation** - Instantly translate selected text to any language
- **📝 Summarization** - Get concise summaries of long-form content
- **💬 Ask Questions** - Get answers and insights about any selected text

## 🚀 Quick Start

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/tab-insights-ai.git
   cd tab-insights-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Navigate to `chrome://extensions` in your browser
   - Enable `Developer mode` (toggle in top right)
   - Click `Load unpacked` 
   - Select the `/build` folder from this project

### Development

Run the development server with hot reloading:

```bash
npm run dev
```

The extension will automatically rebuild on changes. You'll only need to refresh if you modify background scripts or content scripts.

## 🎯 Usage

1. **Select any text** on a webpage
2. **Press `Ctrl+Shift+S`** (or `Cmd+Shift+S` on Mac) or click the extension icon
3. **Choose your action**: Grammar, Translate, Summarize, or Ask
4. **Get instant AI-powered results**

## 🛠️ Built With

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Motion (Framer Motion)** - Smooth animations
- **Zustand** - State management
- **Webpack 5** - Build configuration
- **Chrome Extension Manifest V3** - Latest extension platform

## 📁 Project Structure

```
tab-insights-ai/
├── src/
│   ├── components/     # React UI components
│   ├── handlers/       # AI action handlers
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # Zustand state management
│   ├── services/       # Chrome AI integration
│   └── utils/          # Utility functions
├── background/         # Extension background service worker
├── icons/              # Extension icons
└── manifest.json       # Chrome extension manifest
```

## 🤖 AI Integration

This extension leverages Chrome's built-in AI capabilities to provide fast, private, and contextual assistance with text selections. All processing is handled securely through Chrome's AI infrastructure.

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Create production build
- `npm run assemble` - Build and create extension.zip for publishing
- `npm run test` - Run the test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🏗️ Architecture

The extension uses a modular architecture with:
- **Content Script** - Injects UI into web pages
- **Background Service Worker** - Handles extension lifecycle and communication
- **React Components** - Reusable UI with smooth animations
- **AI Handlers** - Modular action handlers for different AI operations
- **State Management** - Zustand for global state (layout, language, etc.)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ during Google Chrome Built-in AI Challenge 2025**
