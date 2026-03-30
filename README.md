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

### 3. Add your API key

Create a `.env` file in the root:
```env
GEMINI_API_KEY=your_google_gemini_api_key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here
```

Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Run it
```bash
npm run dev
```

Then open `http://localhost:5173`

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