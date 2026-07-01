import React, { useState } from 'react';
import { 
  Activity, 
  HelpCircle, 
  Cpu, 
  Clock,
  CheckCircle,
  X
} from 'lucide-react';
import { Simulator } from './components/Simulator';
import { GisSpaceGrid } from './components/GisSpaceGrid';

export default function App() {
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'info'>('success');

  const triggerToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col justify-between" id="app-root">
      
      {/* HEADER BAR */}
      <header className="bg-slate-900/50 backdrop-blur-md text-white border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-sm flex items-center justify-center font-bold text-slate-950 font-display">
              FF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight font-display">Fill in the Frames <span className="text-sky-400 font-light ml-2">| Satellite Temporal Upsampling</span></h1>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Enhancing Temporal Resolution of Satellite Imagery using AI/ML Optical Flow (RIFE)</p>
            </div>
          </div>

          {/* Quick Stats / Environment info */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {/* UTC Clock Simulation */}
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-slate-300 font-bold">UTC CLOCK: 12:48 PM</span>
            </div>

            <div className="hidden lg:flex flex-col text-right">
              <span className="text-slate-500 font-bold text-[10px] uppercase">DEVELOPMENT ENVIRONMENT</span>
              <span className="text-emerald-400 font-bold">● ONLINE / READY</span>
            </div>
          </div>

        </div>
      </header>

      {/* SUB-HEADER / WORKSPACE INFO BAR */}
      <div className="bg-slate-950 border-b border-slate-850 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between sm:items-center gap-3">

          <div className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-sky-500 text-slate-950 shadow shadow-sky-500/20 self-start">
            <Activity className="w-3.5 h-3.5" />
            SIMULATION WORKSPACE
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span>MODEL:</span>
            <strong className="text-sky-400">RIFE-IFNet v4.6 (Pretrained + Geo Fine-tuned)</strong>
          </div>

        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 w-full flex-1 space-y-6">
        
        {/* STANDALONE CLOUD SIMULATOR & METRICS SANDBOX */}
        <div className="space-y-6 animate-fadeIn">

          <div className="bg-slate-900/50 border border-slate-850 rounded-2xl p-5 relative overflow-hidden text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mb-1 font-display">
              <Cpu className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '10s' }} />
              Real-Time Intermediate Flow Estimation (RIFE) Science Lab
            </h3>
            <p className="text-slate-400 font-sans leading-normal">
              This workspace demonstrates how RIFE functions over satellite grids in isolation. Change interpolation parameters on the fly, toggle standard storm front bands vs cyclonic rotation loops, and export the resulting telemetry dataset as NetCDF/CSV. Use this sandbox to show judges the extreme performance gap of the proposal.
            </p>
          </div>

          <Simulator 
            onExportSuccess={() => triggerToast("Simulated NetCDF4 meteorological dataset exported successfully!")} 
          />

        </div>

        {/* GEOSPATIAL GIS MAP OVERLAY & MULTISPECTRAL SPACE GRID SECTION */}
        <GisSpaceGrid />

        {/* ADDITIONAL GEOSPATIAL SCIENCE INSIGHTS & EXPLANATORY SECTION (PART 1 & PART 6 GROUNDING) */}
        <section className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-slate-100 font-display">RIFE Scientific Basis & Core Differentiation FAQ</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs leading-relaxed">
            
            <div className="space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1 font-display">
                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
                What is the "Intermediate Flow" concept?
              </h4>
              <p className="text-slate-400 font-sans">
                Traditional optical flow models (Lucas-Kanade or FlowNet) calculate displacement vectors strictly between two existing images. To synthesize an intermediate frame, you have to cut the flow vectors in half and warp pixels linearly. RIFE skips this hack by using <strong>IFNet</strong> to directly predict flow coordinates pointing back to Frame A and B from the <em>target intermediate timestamp</em>, handling non-linear acceleration perfectly.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1 font-display">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                Why don't we just use traditional AI Video Interpolation?
              </h4>
              <p className="text-slate-400 font-sans">
                Consumer slow-motion video apps are fine-tuned on millions of natural video clips containing rigid, linear motion boundaries (like cars, pedestrians, and streetscapes). Satellites capture swirling gas vapors, high-altitude winds, temperature differentials, and parallax distortion. Our pipeline is specifically fine-tuned on geostationary projections to preserve actual cloud dynamics.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1 font-display">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                How are validation scores (PSNR/SSIM) maintained?
              </h4>
              <p className="text-slate-400 font-sans">
                We implement a background validation loop. Because GOES-19 or Himawari-9 capture at 10-minute frequencies while older satellites (INSAT-3DS) capture at 30-minute intervals, we train the model to upscale 30-minute images to 10-minutes and validate synthetic output directly against real ground-truth frames. A target <strong>PSNR {'>'} 30dB</strong> and <strong>SSIM {'>'} 0.85</strong> ensures high meteorological accuracy.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-500 border-t border-slate-800 px-6 py-4 text-center text-[11px] font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>FILL IN THE FRAMES — WEATHER SATELLITE TEMPORAL RESOLUTION ADVANCEMENT</span>
          <span>OPERATIONAL METEOROLOGY AI PIPELINE PROPOSAL PROTOTYPE</span>
        </div>
      </footer>

      {/* NOTIFICATION TOAST SYSTEM */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-slate-800 rounded-xl p-3 shadow-2xl flex items-center gap-2.5 animate-slideIn">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-medium">{toastMessage}</span>
          <button 
            onClick={() => setShowToast(false)}
            className="text-slate-500 hover:text-slate-300 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}