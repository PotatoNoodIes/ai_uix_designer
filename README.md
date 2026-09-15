# UIX AI Agent

**AI-powered UI & UX Design Assistant**

Generate complete UI/UX flows for web and mobile apps using natural language prompts. Screens, layouts, and design systems — built visually in the browser.
---

## 🛠 Tech Stack

- **AI**: Google Gemini via Google AI Studio
- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Canvas / Flow**: React Flow
- **Build Tool**: Vite
- **API**: Bun (`api/`) — holds the Gemini key, enforces quotas
- **Auth**: Clerk
- **Quotas**: Upstash Redis

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/PotatoNoodIes/ai_uix_designer.git
cd ai_uix_designer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your keys

Create a `.env` file in the root (it is gitignored):
```env
# Server-only — never reaches the browser
GEMINI_API_KEY=your_google_gemini_api_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Public — compiled into the bundle by design
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

Get your Gemini key from [Google AI Studio](https://aistudio.google.com/app/apikey).

> **Only `VITE_`-prefixed variables reach the browser.** The Gemini key is used
> exclusively by the API server in `api/`, which proxies generation requests and
> enforces usage limits. Never add a `VITE_` prefix to a secret.

### 4. Run it

The app is two processes — the Vite frontend and the Bun API that holds the keys.
Run both:

```bash
npm run dev      # frontend, http://localhost:3000/uix
npm run dev:api  # API, http://localhost:3001 (requires Bun)
```

Then open `http://localhost:3000/uix`

---

## Example Prompts
```
Create a fintech dashboard with analytics and transaction history
```
```
Design a mobile food delivery app with onboarding and checkout flow
```
```
Generate a SaaS admin panel with role-based access control
```

---

## Author

**PotatoNoodIes**
🐙 [github.com/PotatoNoodIes](https://github.com/PotatoNoodIes)