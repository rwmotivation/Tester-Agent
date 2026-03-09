# 🧪 QA-Agent

> AI-powered testing assistant for web and mobile apps — generate test plans, analyze bugs, and track test runs in seconds.

![QA-Agent Screenshot](https://placehold.co/900x500/080e08/00ff41?text=QA-AGENT+%E2%80%94+AI+Testing+Assistant&font=monospace)

---

## ✨ Features

- **🧪 Instant Test Plans** — paste a URL or describe your app to get a full, structured test plan
- **🐛 Bug Analysis** — describe a bug and get severity, root cause, steps to reproduce, and fix suggestions
- **✅ Test Tracker** — check off tests as you run them with a live progress bar
- **📱 Mobile + Web** — covers iOS, Android, React Native, Flutter, and web apps
- **⚡ Quick Actions** — one-click test templates for Login, Checkout, Mobile UI, and Accessibility
- **🪶 Lightweight** — single React component, no backend, no database

---

## 🚀 Get Started in 2 Minutes

### 1. Clone the repo

```bash
git clone https://github.com/rwmotivation/qa-agent.git
cd qa-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

```bash
cp .env.example .env
```

Open `.env` and add your Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> Get a free API key at [console.anthropic.com](https://console.anthropic.com)

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — that's it! 🎉

---

## 💬 How to Use

Type anything in the chat box. Here are some examples:

| What you type | What you get |
|---|---|
| `test https://myapp.com` | Full test plan for that site |
| `generate tests for a login page` | Auth-focused test cases |
| `test a React Native shopping app` | Mobile test plan |
| `the checkout button crashes on Android` | Bug report + fix suggestions |
| `accessibility tests for my dashboard` | WCAG test cases |

### Quick Action Buttons

Click the shortcut buttons at the bottom to instantly generate test plans for:
- 🔐 **Login Flow** — authentication, session, error states
- 🛒 **Checkout** — cart, payments, order confirmation
- 📱 **Mobile UI** — tap targets, gestures, responsiveness
- ♿ **Accessibility** — WCAG, screen readers, keyboard nav

### Tests Tab

Once a test plan is generated, switch to the **Tests** tab to:
- Browse test cases organized by category
- Check off tests as you run them
- Track progress with the completion bar
- Click **"Report Failures"** to get AI bug analysis

---

## 📁 Project Structure

```
qa-agent/
├── src/
│   ├── App.jsx        # Main application component
│   └── main.jsx       # React entry point
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
├── package.json
├── .env.example       # Copy to .env and add your API key
└── .gitignore
```

---

## 🏗️ Build for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy to any static host:

- **Vercel**: `vercel deploy`
- **Netlify**: drag & drop the `dist/` folder
- **GitHub Pages**: push `dist/` to `gh-pages` branch

> ⚠️ When deploying, set `VITE_ANTHROPIC_API_KEY` as an environment variable in your hosting dashboard — never hardcode it.

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Anthropic API | AI brain (Claude Sonnet) |
| IBM Plex Mono | Font |

No extra libraries. No backend. No database. Just React + Vite + Claude.

---

## 🔒 Security Notes

- Your API key is stored in `.env` which is **git-ignored** — it will never be committed
- The `.env.example` file is safe to commit (it has no real key)
- For production deployments, always use environment variables from your hosting provider, not a bundled `.env` file

---

## 🤝 Contributing

Pull requests are welcome! Some ideas for contributions:

- [ ] Export test plans as CSV / PDF
- [ ] Save test sessions to localStorage
- [ ] Dark/light theme toggle
- [ ] Support for multiple concurrent test plans
- [ ] Playwright/Cypress test code generation

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ by Rahul Williams and </p>
