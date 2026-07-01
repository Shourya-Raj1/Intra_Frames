import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Grid, Eye, TrendingUp, Zap, RotateCcw, Info, Settings } from "lucide-react";
import { SectorConfig, SimulatorState } from "../types";
import { SECTORS } from "../data";

interface RIFESimulatorProps {
  selectedSector: SectorConfig;
  onSectorChange?: (sector: SectorConfig) => void;
}

export default function RIFESimulator({ selectedSector, onSectorChange }: RIFESimulatorProps) {
  const [state, setState] = useState<SimulatorState>({
    time: 0.5,
    isInterpolating: false,
    showVectors: true,
    showGrid: true,
    showFlowHeatmap: false,
    interpolationSpeed: 50,
  });

  const animationRef = useRef<number | null>(null);

  // Handle Play/Pause Auto-Scrubbing
  useEffect(() => {
    if (state.isInterpolating) {
      const step = () => {
        setState((prev) => {
          let nextTime = prev.time + 0.01;
          if (nextTime > 1.0) {
            nextTime = 0; // Loop back
          }
          return { ...prev, time: parseFloat(nextTime.toFixed(2)) };
        });
        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isInterpolating]);

  // Interpolated Elements calculation based on bilinear warping
  const getInterpolatedElements = () => {
    const elementsA = selectedSector.frameA.elements;
    const elementsB = selectedSector.frameB.elements;

    return elementsA.map((elA) => {
      const elB = elementsB.find((b) => b.id === elA.id) || elA;
      const t = state.time;

      // Linear interpolation of coordinates and radii
      const x = elA.x + t * (elB.x - elA.x);
      const y = elA.y + t * (elB.y - elA.y);
      const r = elA.r + t * (elB.r - elA.r);

      // Compute motion vector
      const dx = elB.x - elA.x;
      const dy = elB.y - elA.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);

      return {
        ...elA,
        x,
        y,
        r,
        dx,
        dy,
        velocity,
        label: elA.label,
      };
    });
  };

  const interpolatedElements = getInterpolatedElements();

  // Helper to color flow vectors by magnitude (heatmap overlay)
  const getFlowColor = (velocity: number) => {
    if (velocity < 15) return "#38bdf8"; // sky-400
    if (velocity < 40) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col h-full" id="rife-simulator-container">
      {/* Simulation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-4 gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            Neural Flow Engine v2.4
          </span>
          <h3 className="text-lg font-semibold font-display text-slate-100 mt-1">{selectedSector.demoTitle}</h3>
        </div>

        {/* Sector Selector Preset Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono hidden md:inline">Target Profile:</span>
          <select
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            value={selectedSector.id}
            onChange={(e) => {
              if (onSectorChange) {
                const sec = SECTORS.find((s) => s.id === e.target.value);
                if (sec) onSectorChange(sec);
              }
            }}
          >
            {SECTORS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Simulator Visualizer Canvas */}
      <div className="relative bg-slate-950 rounded-lg aspect-video w-full overflow-hidden border border-slate-800/80 flex items-center justify-center">
        {/* Render Grid overlay */}
        {state.showGrid && (
          <div className="absolute inset-0 satellite-grid pointer-events-none opacity-20" />
        )}

        {/* Dynamic heatmap background according to estimated flow */}
        {state.showFlowHeatmap && (
          <div className="absolute inset-0 bg-radial-[circle_at_center,var(--tw-gradient-stops)] from-rose-950/20 via-slate-950 to-slate-950 pointer-events-none transition-all duration-300" />
        )}

        {/* Frame boundary tags */}
        <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 z-10">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          {selectedSector.frameA.title}
        </div>

        <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 z-10">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          {selectedSector.frameB.title}
        </div>

        <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700 rounded px-3 py-1 text-xs font-mono font-bold text-cyan-400 z-10">
          Synthesized Pass (t = {state.time.toFixed(2)})
        </div>

        {/* SVG Drawing Canvas */}
        <svg
          viewBox="0 0 500 380"
          className="w-full h-full text-slate-500"
          id="simulation-svg-stage"
        >
          {/* Render Flow Velocity Grid Arrows (vector field map) when requested */}
          {state.showVectors &&
            Array.from({ length: 6 }).map((_, i) =>
              Array.from({ length: 5 }).map((_, j) => {
                const gx = 50 + i * 80;
                const gy = 50 + j * 70;

                // Simple simulated vector field warping towards B
                const t = state.time;
                const vectorAngle = selectedSector.id === "wildfire" ? -0.4 : 0.5;
                const speedMult = selectedSector.id === "wildfire" ? 12 : 18;
                const arrowLength = speedMult * (1.2 - t * 0.4);

                const ax = gx + Math.cos(vectorAngle) * arrowLength;
                const ay = gy + Math.sin(vectorAngle) * arrowLength;

                return (
                  <g key={`grid-vec-${i}-${j}`} className="opacity-20 hover:opacity-50 transition-opacity">
                    <line
                      x1={gx}
                      y1={gy}
                      x2={ax}
                      y2={ay}
                      stroke={selectedSector.primaryColor}
                      strokeWidth="1"
                      markerEnd="url(#arrow)"
                    />
                    <circle cx={gx} cy={gy} r="1.5" fill="#475569" />
                  </g>
                );
              })
            )}

          {/* SVG Marker Definitions */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={selectedSector.primaryColor} />
            </marker>
            <marker
              id="flow-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 10 5 L 0 8 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Render Flow vector lines between actual elements */}
          {state.showVectors &&
            interpolatedElements.map((el) => {
              const elA = selectedSector.frameA.elements.find((a) => a.id === el.id);
              const elB = selectedSector.frameB.elements.find((b) => b.id === el.id);
              if (!elA || !elB) return null;

              // Render intermediate tracking flow line
              return (
                <g key={`flow-line-${el.id}`}>
                  <line
                    x1={elA.x}
                    y1={elA.y}
                    x2={elB.x}
                    y2={elB.y}
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="opacity-40"
                  />
                  {/* Motion arrow */}
                  <line
                    x1={el.x}
                    y1={el.y}
                    x2={el.x + el.dx * 0.3}
                    y2={el.y + el.dy * 0.3}
                    stroke={getFlowColor(el.velocity)}
                    strokeWidth="2.5"
                    markerEnd="url(#flow-arrow)"
                    className="flow-line-active"
                  />
                </g>
              );
            })}

          {/* Render Actual Interpolated Elements */}
          {interpolatedElements.map((el) => (
            <g key={el.id} className="cursor-pointer group">
              {/* Halos showing original A and B bounds */}
              <circle
                cx={selectedSector.frameA.elements.find((a) => a.id === el.id)?.x}
                cy={selectedSector.frameA.elements.find((a) => a.id === el.id)?.y}
                r={selectedSector.frameA.elements.find((a) => a.id === el.id)?.r}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="opacity-40"
              />
              <circle
                cx={selectedSector.frameB.elements.find((b) => b.id === el.id)?.x}
                cy={selectedSector.frameB.elements.find((b) => b.id === el.id)?.y}
                r={selectedSector.frameB.elements.find((b) => b.id === el.id)?.r}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="opacity-40"
              />

              {/* Dynamic Interpolated Bubble */}
              <circle
                cx={el.x}
                cy={el.y}
                r={Math.max(el.r, 3)}
                fill={el.color}
                fillOpacity="0.45"
                stroke={el.color}
                strokeWidth="2"
                className="transition-all duration-75 group-hover:fill-opacity-70"
              />

              {/* Little core dot */}
              <circle cx={el.x} cy={el.y} r="3" fill="#ffffff" />

              {/* Element name tooltip overlay */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <rect
                  x={el.x - 70}
                  y={el.y - el.r - 26}
                  width="140"
                  height="18"
                  rx="3"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x={el.x}
                  y={el.y - el.r - 14}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {el.label}
                </text>
              </g>
            </g>
          ))}
        </svg>
      </div>

      {/* Simulator Controls & Timeline Scrub */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Timeline Slider with markings */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
            <span>Pass 0.00 (0h)</span>
            <span className="text-cyan-400 font-bold">t = {state.time.toFixed(2)}</span>
            <span>Pass 1.00 (24h)</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              value={state.time}
              onChange={(e) => {
                setState((prev) => ({
                  ...prev,
                  time: parseFloat(e.target.value),
                  isInterpolating: false, // pause on manual scrub
                }));
              }}
            />
          </div>
        </div>

        {/* Operational buttons */}
        <div className="flex flex-wrap justify-between items-center gap-4 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setState((prev) => ({ ...prev, isInterpolating: !prev.isInterpolating }))}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-200 ${
                state.isInterpolating
                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-cyan-500 hover:bg-cyan-600 text-slate-950"
              }`}
            >
              {state.isInterpolating ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" /> Pause Warp
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Auto Interpolate
                </>
              )}
            </button>

            <button
              onClick={() => setState((prev) => ({ ...prev, time: 0, isInterpolating: false }))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title="Reset Timeline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle buttons for metadata */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setState((prev) => ({ ...prev, showVectors: !prev.showVectors }))}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all ${
                state.showVectors
                  ? "bg-slate-800 border-slate-700 text-cyan-400"
                  : "bg-transparent border-slate-800 text-slate-500"
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Vectors
            </button>

            <button
              onClick={() => setState((prev) => ({ ...prev, showGrid: !prev.showGrid }))}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all ${
                state.showGrid
                  ? "bg-slate-800 border-slate-700 text-cyan-400"
                  : "bg-transparent border-slate-800 text-slate-500"
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Grid
            </button>

            <button
              onClick={() => setState((prev) => ({ ...prev, showFlowHeatmap: !prev.showFlowHeatmap }))}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all ${
                state.showFlowHeatmap
                  ? "bg-slate-800 border-slate-700 text-cyan-400"
                  : "bg-transparent border-slate-800 text-slate-500"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* RIFE telemetry logging readout */}
      <div className="mt-4 bg-slate-950 rounded-lg p-3.5 border border-slate-800/80 font-mono text-[11px] text-slate-400 flex flex-col gap-1.5">
        <div className="text-[10px] text-slate-500 flex items-center justify-between uppercase tracking-wider pb-1 border-b border-slate-900">
          <span>Active RIFE Interpolation Telemetry</span>
          <span className="text-cyan-500 font-semibold animate-pulse">Online</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            Displacement Field:{" "}
            <span className="text-slate-200">
              {interpolatedElements.reduce((acc, x) => acc + x.velocity, 0) > 0 ? "Bilateral Flow Vectors calculated" : "Static State"}
            </span>
          </div>
          <div>
            Loss Parameter:{" "}
            <span className="text-slate-200">
              L_warp = 0.0024 (structural matching)
            </span>
          </div>
          <div>
            Virtual Hour:{" "}
            <span className="text-cyan-400 font-semibold">
              {(state.time * 24).toFixed(1)}h UTC after Initial Pass
            </span>
          </div>
          <div>
            Pixel Density Upscale:{" "}
            <span className="text-emerald-400 font-bold">
              24.0x (Hourly Upsampling)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
