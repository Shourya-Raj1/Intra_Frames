import React, { useState } from "react";
import { Server, Space, Layers, Cpu, Database, ChevronRight, DollarSign, ArrowRight, ShieldAlert, Clock, Sparkles } from "lucide-react";
import { SectorConfig } from "../types";

interface GraphicProps {
  type: string;
  selectedSector: SectorConfig;
}

export default function SlideGraphics({ type, selectedSector }: GraphicProps) {
  switch (type) {
    case "hero":
      return <HeroGraphic selectedSector={selectedSector} />;
    case "problem-viz":
      return <ProblemGraphic selectedSector={selectedSector} />;
    case "flow-network":
      return <FlowNetworkGraphic selectedSector={selectedSector} />;
    case "business-roi":
      return <BusinessRoiGraphic />;
    default:
      return (
        <div className="bg-slate-950/60 rounded-xl p-6 border border-slate-800 flex items-center justify-center h-full aspect-video">
          <p className="text-sm font-mono text-slate-500">Diagram context: {type}</p>
        </div>
      );
  }
}

/* ================= Slide 1: Title Hero Orbit Sync Diagram ================= */
function HeroGraphic({ selectedSector }: { selectedSector: SectorConfig }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col justify-between h-full relative overflow-hidden aspect-video">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-1">Surveillance Optimization Scheme</span>
        <h4 className="text-md font-semibold text-slate-100 font-display">Virtual Geostationary Synthesis</h4>
      </div>

      {/* Orbit Visualization Stage */}
      <div className="relative flex-1 flex items-center justify-center my-4 min-h-[160px]">
        {/* Core Planet Earth */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          <div className="w-20 h-24 absolute rounded-full border border-cyan-500/20 transform rotate-45" />
          <span className="text-xs font-mono font-bold text-cyan-400">Earth</span>
        </div>

        {/* Orbit A (GEO - Static, distant) */}
        <div className="absolute w-56 h-56 rounded-full border border-slate-800/80 border-dashed" />
        <div className="absolute top-[2px] right-[24%] z-20 bg-slate-950 border border-slate-800 rounded-lg p-1.5 shadow-lg text-[9px] font-mono text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          GEO (Low Res, High Latency)
        </div>

        {/* Orbit B (LEO Polar pass - Daily) */}
        <div className="absolute w-40 h-40 rounded-full border border-cyan-500/35 transform -rotate-45" />
        <div className="absolute bottom-[2%] left-[10%] z-20 bg-slate-950 border border-slate-800/80 rounded-lg p-1.5 shadow-lg text-[9px] font-mono text-cyan-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
          LEO Polar Pass (Daily High-Res)
        </div>

        {/* Synced Interpolated Layer (Virtual Constellation) */}
        <div className="absolute w-44 h-44 rounded-full border border-rose-500/30 transform rotate-12 stroke-dash-2 animation-pulse" />
        <div className="absolute top-[28%] left-[2%] z-20 bg-slate-950 border border-rose-500/40 rounded-lg p-1.5 shadow-lg text-[9px] font-mono text-rose-400 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
          OrbitSync Hourly Virtual Layer
        </div>
      </div>

      <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/60 font-mono text-[10px] text-slate-400 flex items-center justify-between">
        <span>Hardware Pass frequency: <strong className="text-cyan-400">1x / 24h</strong></span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span>Virtual upscaled output: <strong className="text-rose-400">24x / 24h (Hourly)</strong></span>
      </div>
    </div>
  );
}

/* ================= Slide 2: Problem "The Temporal Void" Timeline ================= */
function ProblemGraphic({ selectedSector }: { selectedSector: SectorConfig }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col justify-between h-full aspect-video">
      <div>
        <span className="text-xs font-mono text-red-400 uppercase tracking-widest block mb-1">Constellation Coverage Gap</span>
        <h4 className="text-md font-semibold text-slate-100 font-display">The 23-Hour Surveillance Vacuum</h4>
      </div>

      <div className="flex flex-col gap-5 my-4">
        {/* Hardware Timeline */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>Pass 1 (00:00)</span>
            <span className="text-rose-400 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> 23-Hour Blind Spot</span>
            <span>Pass 2 (24:00)</span>
          </div>
          <div className="relative h-6 bg-slate-950 rounded-lg border border-slate-800 flex items-center overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-cyan-500" title="Pass 1 Capture" />
            <div className="flex-1 text-center text-[9px] font-mono text-slate-500 font-semibold tracking-wider">
              No Ground Data Available (Interpolation Void)
            </div>
            <div className="absolute top-0 bottom-0 right-0 w-3 bg-cyan-500" title="Pass 2 Capture" />
          </div>
        </div>

        {/* OrbitSync AI Timeline */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>Pass 1 (00:00)</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 24x Simulated Hours</span>
            <span>Pass 2 (24:00)</span>
          </div>
          <div className="relative h-6 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between px-1 overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-3 bg-cyan-500" />
            
            {/* Hour ticks representing interpolated frames */}
            {Array.from({ length: 11 }).map((_, idx) => (
              <div 
                key={`tick-${idx}`} 
                className="w-1.5 h-3 bg-rose-500/80 rounded-sm hover:bg-rose-400 transition-colors cursor-pointer"
                title={`Interpolated Frame ${(idx + 1) * 2}h`}
              />
            ))}

            <div className="absolute top-0 bottom-0 right-0 w-3 bg-cyan-500" />
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800/60 font-mono text-[10px] text-slate-400 flex flex-col gap-1">
        <span className="text-slate-300 font-semibold uppercase text-[9px] text-red-400">Tactical Vulnerability Example:</span>
        <span>A forest fire can propagate <strong className="text-red-400">over 240 kilometers</strong> completely unobserved between Polar orbits.</span>
      </div>
    </div>
  );
}

/* ================= Slide 3: RIFE Bilateral Optical Warping Pipeline ================= */
function FlowNetworkGraphic({ selectedSector }: { selectedSector: SectorConfig }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col justify-between h-full aspect-video">
      <div>
        <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block mb-1">Optical flow architecture</span>
        <h4 className="text-md font-semibold text-slate-100 font-display">Bilateral RIFE Deep Learning Pipeline</h4>
      </div>

      {/* Network Step Blocks */}
      <div className="grid grid-cols-4 gap-3 my-4 relative">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between items-center text-center gap-1.5">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px] font-bold font-mono text-slate-200">1. Dual Frame Input</span>
          <span className="text-[8px] text-slate-500 font-mono">T0 and T24 ground passes</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between items-center text-center gap-1.5">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] font-bold font-mono text-slate-200">2. Optical Flow Estimator</span>
          <span className="text-[8px] text-slate-500 font-mono">Estimate vector velocities</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between items-center text-center gap-1.5">
          <Server className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] font-bold font-mono text-slate-200">3. Bilateral Warper</span>
          <span className="text-[8px] text-slate-500 font-mono">Dynamic symmetric warping</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between items-center text-center gap-1.5">
          <Database className="w-5 h-5 text-rose-400" />
          <span className="text-[10px] font-bold font-mono text-slate-200">4. Structural Refined Layer</span>
          <span className="text-[8px] text-slate-500 font-mono">De-noised virtual pass</span>
        </div>
      </div>

      <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/60 font-mono text-[10px] text-slate-400 flex items-center justify-between">
        <span>Inference Time: <strong className="text-emerald-400">&lt; 140ms</strong></span>
        <span>Resolution integrity: <strong className="text-emerald-400">99.4% (PSNR 34.2)</strong></span>
      </div>
    </div>
  );
}

/* ================= Slide 5: Business Modeling Calculator ROI ================= */
function BusinessRoiGraphic() {
  const [pricingTier, setPricingTier] = useState<number>(3500); // subscription cost per month
  const [accountsCount, setAccountsCount] = useState<number>(45);

  const annualRevenue = pricingTier * accountsCount * 12;
  const hardwareConstellationCost = 650000000;
  const softwareComputeCost = 1200000; // $1.2M annual cloud compute/engineering

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col justify-between h-full aspect-video">
      <div>
        <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">Constellation Arbitrage Calculator</span>
        <h4 className="text-md font-semibold text-slate-100 font-display">Capital Efficiency Business Modeling</h4>
      </div>

      <div className="grid grid-cols-2 gap-4 my-3">
        {/* Interactive Controls */}
        <div className="flex flex-col gap-3.5 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>SaaS Sub/Month:</span>
              <span className="text-amber-400 font-bold">${pricingTier.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              value={pricingTier}
              onChange={(e) => setPricingTier(parseInt(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Enterprise Accounts:</span>
              <span className="text-amber-400 font-bold">{accountsCount}</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              value={accountsCount}
              onChange={(e) => setAccountsCount(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Live Calculation Outcomes */}
        <div className="flex flex-col justify-between bg-slate-950/90 p-3 rounded-lg border border-slate-800 text-slate-300 font-mono text-[10px]">
          <div>
            Annual SaaS Revenue:
            <div className="text-lg font-bold font-display text-emerald-400 mt-0.5">
              ${annualRevenue.toLocaleString()}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-1.5 mt-1.5">
            Cloud Compute Overhead:
            <div className="text-slate-400 font-semibold">
              ${softwareComputeCost.toLocaleString()} / year
            </div>
          </div>
          <div>
            Operating Margin:
            <span className="text-emerald-400 font-bold ml-1">
              {(((annualRevenue - softwareComputeCost) / annualRevenue) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/60 font-mono text-[10px] text-slate-400 flex items-center justify-between">
        <span>Hardware Constellation CapEx: <strong className="text-red-400">${(hardwareConstellationCost / 1000000).toFixed(0)}M</strong></span>
        <ChevronRight className="w-4 h-4 text-slate-700" />
        <span>OrbitSync Software OpEx: <strong className="text-emerald-400">${(softwareComputeCost / 1000000).toFixed(1)}M</strong></span>
      </div>
    </div>
  );
}
