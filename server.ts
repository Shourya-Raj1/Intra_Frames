import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      console.warn("GEMINI_API_KEY is missing or is a placeholder. Using fallback engine.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Fallback generation helper for offline or unconfigured API key states
function generateMockResponse(prompt: string, sector: string): string {
  const lowercasePrompt = prompt.toLowerCase();
  
  if (lowercasePrompt.includes("speaker notes") || lowercasePrompt.includes("talking points")) {
    const slideName = prompt.match(/slide \d+/i)?.[0] || "this slide";
    return `### Speaker Notes & Talking Points (${slideName.toUpperCase()}) - Optimized for ${sector.toUpperCase()}

1. **Core Insight**: State clearly that high-frequency observation is no longer a luxury of geostationary orbits. By using temporal frame interpolation, we synthesize hourly intervals from polar-orbiting daily passes.
2. **Key Metric**: Emphasize how this upscaling slashes latency from 24 hours to under 60 minutes, multiplying analytical utility by 24x without raising new satellite payloads.
3. **Operational Context**: For ${sector}, this means we capture transient phenomena—like early-stage wildfire hotspots, moisture variance in crops, maritime cargo departures, or flood propagation—that previously occurred entirely in the dark.
4. **Interactive Demo Prompt**: Encourage the audience to engage with the RIFE optical flow simulator. Point out how the motion vector heatmaps visually trace physical changes on the ground, proving the physical realism of deep-learning warping.
5. **Next Steps**: Conclude by outlining the massive cost savings: building this virtual orbit costs a fraction of deploying a 24-satellite constellation, transforming capital expenditure (CapEx) into highly efficient, high-margin software-as-a-service (SaaS) operational expenditure.`;
  }
  
  return `### Custom Industry Report: Satellite Frame Interpolation for ${sector}

*Generative intelligence response placeholder (configure your GEMINI_API_KEY in Settings > Secrets to unlock live deep-learning synthesis).*

1. **Market Need**: The ${sector} industry is constrained by the "Temporal Gap." Space systems capture high-resolution imagery at low frequencies. We bridge this with neural optical flow.
2. **Technological Advantage**: RIFE (Real-time Intermediate Flow Estimation) calculates pixel-level displacement between consecutive passes (Frame 0 and Frame 1). It produces a continuous temporal field of intermediate imagery.
3. **ROI Statement**: Implementing neural temporal upscaling increases observation density by 2400% (daily to hourly passes) at less than 1% of the cost of launching and operating a new hardware constellation.`;
}

// API endpoint for Gemini content generation
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, systemInstruction, sector = "general" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback mode
      const fallbackText = generateMockResponse(prompt, sector);
      return res.json({ text: fallbackText, isMock: true });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    res.json({ text: response.text, isMock: false });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    // Graceful fallback on API error
    const fallbackText = generateMockResponse(req.body.prompt || "", req.body.sector || "general");
    res.json({ text: fallbackText, isMock: true, error: error.message });
  }
});

// Configure Vite or Static Asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
