import React, { useState } from "react";
import pptxgen from "pptxgenjs";
import { Sparkles, Download, RefreshCw, Send, CheckCircle2, ChevronRight, HelpCircle, FileDown, BookOpen } from "lucide-react";
import { SectorConfig } from "../types";
import { SECTORS, SLIDES } from "../data";

interface PPTXCustomizerProps {
  selectedSector: SectorConfig;
  onSectorChange: (sector: SectorConfig) => void;
  customSpeakerNotes: Record<number, string>;
  onNotesGenerated: (notes: Record<number, string>) => void;
}

export default function PPTXCustomizer({
  selectedSector,
  onSectorChange,
  customSpeakerNotes,
  onNotesGenerated,
}: PPTXCustomizerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [customGoal, setCustomGoal] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"copilot" | "notes">("copilot");

  // Call server-side Gemini endpoint to re-synthesize entire deck speaker notes tailored to sector & goal
  const handleAiRetarget = async () => {
    setLoading(true);
    setSuccessMessage("");
    
    try {
      const generatedNotes: Record<number, string> = {};
      
      // We will loop through the slides and request custom notes or run a single batch request
      // To optimize latency and credits, we can send a single well-structured prompt to Gemini 3.5 Flash 
      // requesting notes for all 6 slides, structured as a clean JSON object, then parse it!
      const prompt = `You are a world-class venture capitalist and B2B SaaS pitch expert specializing in Earth Observation.
Retarget our satellite upscaling start-up pitch deck for the ${selectedSector.name} sector.
The customer's specific operational context is: "${customGoal || "Optimizing hourly operations and commercial deployment"}".

For each of the following 6 slides, write high-conversion, highly persuasive venture capital speaker notes (bullet points, around 100-150 words per slide):
Slide 1: OrbitSync AI Title - Dynamic continuous hourly earth surveillance.
Slide 2: The Temporal Void - Problem of daily orbits and physical gaps.
Slide 3: RIFE Deep Learning Tech - Motion vectors, symmetric bilateral warping.
Slide 4: Interactive Flow Simulator - Telemetry, validation, heatmaps.
Slide 5: Business ROI - Subscriptions, replacement of $650M constellation.
Slide 6: PPTX Deck Customizer - Living sales tool & native export.

Format your response as a strict, clean JSON object so we can parse it in TypeScript.
The JSON must have keys "1", "2", "3", "4", "5", "6", where each key corresponds to the slide ID, and the value is a string containing the speaker notes.
Do NOT wrap the JSON inside markdown blocks or any conversational intro/outro. Output ONLY the raw JSON string starting with { and ending with }.`;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: "You are a specialized B2B slide builder. Output raw JSON mapping slide numbers (1-6) to customized speaker notes.",
          sector: selectedSector.id
        })
      });

      const data = await response.json();
      
      if (data.text) {
        let cleanText = data.text.trim();
        // Remove markdown wrapper if present
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.substring(7);
        }
        if (cleanText.endsWith("```")) {
          cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        try {
          const parsed = JSON.parse(cleanText);
          onNotesGenerated(parsed);
          setSuccessMessage(`AI Co-pilot successfully retargeted the pitch deck for ${selectedSector.name}!`);
        } catch (jsonErr) {
          console.error("JSON parsing error on AI response, using robust extraction helper:", jsonErr);
          // High-reliability regex extractor if JSON formatting had anomalies
          const extracted: Record<number, string> = {};
          for (let i = 1; i <= 6; i++) {
            const regex = new RegExp(`"${i}"\\s*:\\s*"([^"]+)"`, "g");
            const match = regex.exec(cleanText);
            if (match && match[1]) {
              extracted[i] = match[1].replace(/\\n/g, "\n");
            } else {
              extracted[i] = SLIDES.find(s => s.id === i)?.speakerNotes || "";
            }
          }
          onNotesGenerated(extracted);
          setSuccessMessage(`AI Co-pilot updated notes for ${selectedSector.name} (robust extraction fallback).`);
        }
      }
    } catch (error) {
      console.error("Failed to retarget deck:", error);
      setSuccessMessage("Connection issue. Switched to high-fidelity sector-tailored preset offline notes.");
      // Standard sector fallbacks
      const fallbackNotes: Record<number, string> = {};
      SLIDES.forEach((slide) => {
        fallbackNotes[slide.id] = `[PRESET NOTE FOR ${selectedSector.name.toUpperCase()}]
1. Focus heavily on how hourly LEO passes change the economics of ${selectedSector.name}.
2. Problem is the massive gap in data under traditional constellation passes.
3. RIFE estimates pixel-level movement, crucial for tracking dynamic occurrences in this industry.
4. Run the interactive simulation to convince stakeholders of model validation.`;
      });
      onNotesGenerated(fallbackNotes);
    } finally {
      setLoading(false);
    }
  };

  // Programmatic Native PowerPoint (.pptx) Generator using pptxgenjs
  const generateNativePptx = () => {
    try {
      const pptx = new pptxgen();
      
      // Set presentation properties
      pptx.layout = "LAYOUT_169";
      pptx.title = `OrbitSync AI - ${selectedSector.name} Pitch Deck`;
      pptx.subject = "Neural Satellite Temporal upscaling";
      
      // Design tokens
      const primaryHex = "0EA5E9"; // Cyan
      const textDarkHex = "0F172A"; // Slate-900
      const textLightHex = "64748B"; // Slate-500
      const bgSlateHex = "0F172A"; // Slate dark back
      
      // Slide 1: Title (Dark Background Theme)
      const slide1 = pptx.addSlide();
      slide1.background = { fill: bgSlateHex };
      
      slide1.addText("ORBITSYNC AI", {
        x: 0.8,
        y: 2.0,
        fontSize: 16,
        bold: true,
        color: "0EA5E9",
        fontFace: "Arial"
      });
      
      slide1.addText("Continuous Earth Observation\nvia Neural Frame Interpolation", {
        x: 0.8,
        y: 2.4,
        fontSize: 38,
        bold: true,
        color: "FFFFFF",
        fontFace: "Arial"
      });

      slide1.addText(`Tailored Pitch Target: ${selectedSector.name.toUpperCase()} SECTOR`, {
        x: 0.8,
        y: 4.4,
        fontSize: 14,
        italic: true,
        color: "94A3B8",
        fontFace: "Courier New"
      });
      
      slide1.addNotes(customSpeakerNotes[1] || SLIDES[0].speakerNotes);

      // Slide 2 - 6: Clean White Technical Layout
      SLIDES.slice(1).forEach((slideData) => {
        const slide = pptx.addSlide();
        slide.background = { fill: "F8FAFC" }; // clean soft white
        
        // Slide Title Group
        slide.addText(slideData.title.toUpperCase(), {
          x: 0.6,
          y: 0.4,
          fontSize: 14,
          bold: true,
          color: primaryHex,
          fontFace: "Arial"
        });

        slide.addText(slideData.subtitle, {
          x: 0.6,
          y: 0.7,
          fontSize: 22,
          bold: true,
          color: textDarkHex,
          fontFace: "Arial"
        });

        // Split Layout: Bullets on left (60% width), graphic representation placeholder on right (40%)
        let bulletText = slideData.bullets.map((b) => {
          return { text: b, options: { bullet: true, color: textDarkHex, fontSize: 13, lineSpacing: 22 } };
        });

        slide.addText(bulletText, {
          x: 0.6,
          y: 1.6,
          w: 7.2,
          h: 4.5,
          fontFace: "Arial"
        });

        // Right hand diagnostic placeholder card
        slide.addText(`ORBITSYNC TELEMETRY VIZ\n\nDiagram: [${slideData.graphicType.toUpperCase()}]\nTargeting: ${selectedSector.name}\nContinuous validation schema active.\n\nDownload accompanying interactive web build to engage simulation sandbox live.`, {
          x: 8.2,
          y: 1.6,
          w: 4.5,
          h: 4.2,
          fill: { color: "0F172A" },
          color: "94A3B8",
          fontFace: "Courier New",
          fontSize: 11,
          valign: "top",
          align: "left"
        });

        // Add corresponding customized speaker notes
        slide.addNotes(customSpeakerNotes[slideData.id] || slideData.speakerNotes);
      });

      // Write PPTX file and trigger browser download
      pptx.writeFile({ fileName: `OrbitSync_AI_Pitch_Deck_${selectedSector.id}.pptx` });
      setSuccessMessage("Native PowerPoint (.pptx) file generated and downloaded successfully!");
    } catch (err: any) {
      console.error("PPTX Generation Error:", err);
      alert(`PowerPoint generation failed: ${err.message || err}`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col h-full" id="pptx-customizer-dashboard">
      {/* Tab Navigation header */}
      <div className="flex border-b border-slate-800 pb-3 mb-5 justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("copilot")}
            className={`text-xs font-mono font-bold pb-2 transition-all relative ${
              activeTab === "copilot" ? "text-cyan-400" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {activeTab === "copilot" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
            AI Co-Pilot Controls
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`text-xs font-mono font-bold pb-2 transition-all relative ${
              activeTab === "notes" ? "text-cyan-400" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {activeTab === "notes" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
            Active Speaker Notes
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">Native PPTX builder enabled</span>
      </div>

      {/* Tab Contents: AI Copilot controls */}
      {activeTab === "copilot" && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Venture Pitch Customizer
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                OrbitSync AI bridges the satellite temporal void. Choose an industry vertical below to dynamically tailor all metrics, slide content patterns, and simulator parameters.
              </p>
            </div>

            {/* Industrial Target Profile Picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-slate-400">Target Industry Vertical:</label>
              <div className="grid grid-cols-2 gap-2">
                {SECTORS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => onSectorChange(sec)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      selectedSector.id === sec.id
                        ? "bg-slate-800 border-cyan-500/50 text-slate-100"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-semibold">{sec.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            {/* AI Pitch Focus text area input */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-slate-400">Custom Pitch Angle / Audience Context:</label>
                <span className="text-[9px] font-mono text-slate-500">Optional</span>
              </div>
              <textarea
                placeholder="e.g. Focus on disaster reinsurance, wildfire tracking in British Columbia, or military supply-line defense..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[70px] placeholder:text-slate-600"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
              />
            </div>
          </div>

          {/* Trigger button group */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-2">
            <button
              onClick={handleAiRetarget}
              disabled={loading}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-700 text-cyan-400 py-2.5 px-4 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing custom notes...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Retarget Pitch with Gemini 3.5
                </>
              )}
            </button>

            <button
              onClick={generateNativePptx}
              className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-slate-950 py-2.5 px-4 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <FileDown className="w-4 h-4" /> Download Native PowerPoint (.pptx)
            </button>
          </div>
        </div>
      )}

      {/* Tab Contents: Live Speaker notes */}
      {activeTab === "notes" && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 overflow-y-auto max-h-[320px] pr-1">
            <div className="flex flex-col gap-4">
              {SLIDES.map((slide) => (
                <div key={`notes-list-${slide.id}`} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <span>Slide {slide.id}: {slide.title}</span>
                    <span className="text-cyan-500 font-bold">Speaker Note</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                    {customSpeakerNotes[slide.id] || slide.speakerNotes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={generateNativePptx}
              className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-slate-950 py-2.5 px-4 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <FileDown className="w-4 h-4" /> Export Native PPTX with these Notes
            </button>
          </div>
        </div>
      )}

      {/* Confirmation & feedback lines */}
      {successMessage && (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-400 flex items-start gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
