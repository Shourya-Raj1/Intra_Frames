#🛰️Intra_Frames — Satellite Frame Interpolation Simulator

An interactive meteorological simulator that shows how AI can "fill in the gaps" between satellite images. Polar-orbiting satellites usually capture a location only once a day — this project uses **RIFE (Real-time Intermediate Flow Estimation)**-style bilateral optical flow warping to synthesize the missing hourly frames in between, essentially boosting temporal resolution without needing more satellites.

It's built as a **Google AI Studio** app: a React frontend + a small Express/Vite backend that talks to the **Gemini API** to generate contextual insights (speaker notes, industry reports, ROI breakdowns) based on the sector you pick (agriculture, disaster response, maritime, etc.). If no Gemini API key is configured, it gracefully falls back to pre-written mock responses so the app still works offline.

## ✨ What it does

- Simulates enhancing satellite temporal resolution using optical-flow-based frame interpolation (RIFE technique).
- Visualizes motion vector heatmaps to show how the AI tracks physical changes on the ground between two frames.
- Generates sector-specific AI commentary (via Gemini) — e.g. how this helps with wildfire detection, crop monitoring, flood tracking, etc.
- Can export findings/slides using `pptxgenjs`.
- Works even without an API key, using a built-in fallback/mock response engine.

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TailwindCSS, Framer Motion, lucide-react |
| Backend | Express + `tsx` (dev), bundled with `esbuild` for production |
| AI | Google Gemini API (`@google/genai`) |
| Export | `pptxgenjs` (PowerPoint generation) |
| Language | TypeScript |

## 📁 Project Structure

```
Intra_Frames/
├── src/                  # React frontend source
├── assets/               # Static assets
├── server.ts             # Express server + Gemini API proxy endpoint
├── index.html            # App entry point
├── metadata.json         # AI Studio app metadata (name, description, capabilities)
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Sample environment variables
└── package.json
```

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Shourya-Raj1/Intra_Frames.git
cd Intra_Frames
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env` and add your Gemini API key:
```bash
cp .env.example .env
```
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
> Note: If you skip this step, the app still runs fine — it just uses fallback mock responses instead of live Gemini output.

### 4. Run in development
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
npm start
```

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the dev server (Vite + Express via `tsx`) |
| `npm run build` | Builds the frontend and bundles the server |
| `npm start` | Runs the production build |
| `npm run lint` | Type-checks the project with `tsc --noEmit` |
| `npm run clean` | Removes build artifacts |

## 🤖 How the AI part works

The Express server exposes a single endpoint, `POST /api/gemini/generate`, which:
1. Takes a `prompt`, optional `systemInstruction`, and a `sector`.
2. If a valid `GEMINI_API_KEY` is set, calls the Gemini API and returns the generated text.
3. If no key is set (or the API call fails), it returns a realistic pre-written fallback response instead — so the demo never breaks.

---

*Generated from the [google-gemini/aistudio-repository-template](https://github.com/google-gemini/aistudio-repository-template).*
