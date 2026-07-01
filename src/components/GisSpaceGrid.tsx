import React, { useState, useEffect, useRef } from "react";
import { 
  Map, 
  Globe, 
  Compass, 
  Radio, 
  Layers, 
  Cpu, 
  Eye, 
  Gauge, 
  Zap, 
  Target, 
  Crosshair, 
  TrendingUp, 
  BarChart2, 
  Terminal,
  Activity,
  ArrowRight,
  Sparkles,
  Info,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface SpectralBand {
  id: string;
  name: string;
  wavelength: string;
  resolution: string;
  colorName: string;
  themeColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
  physicalMeaning: string;
  upsamplingFactor: string;
  ssimImprovement: string;
}

export function GisSpaceGrid() {
  // Tabs or Mode Selection inside GIS section
  const [activeTab, setActiveTab] = useState<"gis-map" | "spectral-grid" | "3d-globe">("gis-map");
  
  // 3D Globe View States
  const [globeRotation, setGlobeRotation] = useState<number>(145);
  const [isGlobeAutoRotate, setIsGlobeAutoRotate] = useState<boolean>(true);
  const [globeTilt, setGlobeTilt] = useState<number>(23.5); // Earth axial tilt!
  const [showSatelliteOrbit, setShowSatelliteOrbit] = useState<boolean>(true);
  
  // Selected Spectral Band state
  const [selectedBand, setSelectedBand] = useState<string>("band-13");

  // GIS Click Map Coordinates & Probe State
  const [probeCoords, setProbeCoords] = useState<{ lat: number; lon: number; x: number; y: number }>({
    lat: 34.69,
    lon: 135.50,
    x: 230,
    y: 110
  });
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeData, setProbeData] = useState({
    brightnessTemp: "219.6 K (-53.5°C)",
    estimatedAltitude: "11,850 meters",
    cloudOpticalDepth: "42.8 τ",
    windSpeed: "48.2 knots (NE)",
    relativeHumidity: "84.2%",
    rifeConfidence: "98.8%"
  });

  // Satellite Tracking & Orbit states
  const [orbitProgress, setOrbitProgress] = useState<number>(15);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(true);
  const [scanSwathActive, setScanSwathActive] = useState<boolean>(true);
  const [activeTelemetryLog, setActiveTelemetryLog] = useState<string[]>([
    "GEO-Constellation Link: Stable",
    "GOES-18 / Himawari-9 Telemetry synced",
    "Waiting for GIS Map user-probe coordinate click...",
  ]);

  // Command input console
  const [consoleCommand, setConsoleCommand] = useState<string>("");

  // Sub-pixel comparator magnifying zoom factor
  const [zoomFactor, setZoomFactor] = useState<number>(4);

  // Spectral Bands Specification Data
  const SPECTRAL_BANDS: SpectralBand[] = [
    {
      id: "band-2",
      name: "Band 02 (Visible - Red)",
      wavelength: "0.64 µm",
      resolution: "0.5 km (High Spatial)",
      colorName: "Monochrome Silver",
      themeColor: "#94a3b8",
      textColor: "text-slate-300",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/20",
      description: "Captures reflected solar radiation. Crucial for pinpointing fine-scale atmospheric shear, cloud boundaries, and severe storm updrafts.",
      physicalMeaning: "Reflected Solar Albedo & Structural Cloud Formations",
      upsamplingFactor: "12x",
      ssimImprovement: "+0.11"
    },
    {
      id: "band-8",
      name: "Band 08 (Mid-Level Water Vapor)",
      wavelength: "6.2 µm",
      resolution: "2.0 km (Medium Spatial)",
      colorName: "Deep Nebula Indigo",
      themeColor: "#818cf8",
      textColor: "text-indigo-300",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      description: "Tracks mid-to-upper tropospheric moisture profiles. Vital for mapping high-altitude jet streams, rotational vorticity, and atmospheric rivers.",
      physicalMeaning: "Tropospheric Vapor Transport & Streamlines",
      upsamplingFactor: "24x",
      ssimImprovement: "+0.14"
    },
    {
      id: "band-13",
      name: "Band 13 (Clean Infrared)",
      wavelength: "10.3 µm",
      resolution: "2.0 km (Standard Thermal)",
      colorName: "Thermal Inferno Orange",
      themeColor: "#f97316",
      textColor: "text-orange-300",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      description: "Measures thermal radiance directly emitted from the earth and clouds. Constant day/night tracking of cloud-top brightness temperatures.",
      physicalMeaning: "Cloud-top Temperature & Convective Lift Potential",
      upsamplingFactor: "18x",
      ssimImprovement: "+0.16"
    },
    {
      id: "band-15",
      name: "Band 15 (Dirty Infrared - Ash/Moisture)",
      wavelength: "12.3 µm",
      resolution: "2.0 km (Thermal Dual)",
      colorName: "Atmospheric Emerald",
      themeColor: "#10b981",
      textColor: "text-emerald-300",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      description: "Sensitive to dual-wavelength thermal absorption. Used to segment volcanic sulfur plumes, ash particulates, and boundary-layer moisture.",
      physicalMeaning: "Volcanic Ash Aerosols & Lower-tropospheric Moisture",
      upsamplingFactor: "18x",
      ssimImprovement: "+0.13"
    }
  ];

  const currentBandObj = SPECTRAL_BANDS.find((b) => b.id === selectedBand) || SPECTRAL_BANDS[2];

  // Auto Orbit line progression loop
  useEffect(() => {
    let interval: any;
    if (isAutoOrbit) {
      interval = setInterval(() => {
        setOrbitProgress((prev) => {
          let next = prev + 0.5;
          if (next > 90) next = 10;
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isAutoOrbit]);

  // Auto Rotate 3D Globe loop
  useEffect(() => {
    let interval: any;
    if (activeTab === "3d-globe" && isGlobeAutoRotate) {
      interval = setInterval(() => {
        setGlobeRotation((prev) => (prev + 0.6) % 360);
      }, 30);
    }
    return () => clearInterval(interval);
  }, [activeTab, isGlobeAutoRotate]);

  // Dynamic cloud color and SVG content based on the chosen spectral band
  const getSpectralCloudColors = (bandId: string) => {
    switch (bandId) {
      case "band-2": // visible red (silver grayscale)
        return {
          fill1: "rgba(226, 232, 240, 0.45)",
          stroke1: "#cbd5e1",
          fill2: "rgba(203, 213, 225, 0.5)",
          stroke2: "#94a3b8",
          ambientFilter: "saturate-50 contrast-125"
        };
      case "band-8": // water vapor (indigo-purple)
        return {
          fill1: "rgba(99, 102, 241, 0.3)",
          stroke1: "#818cf8",
          fill2: "rgba(168, 85, 247, 0.25)",
          stroke2: "#c084fc",
          ambientFilter: "hue-rotate-[240deg]"
        };
      case "band-15": // dirty ir (emerald-green)
        return {
          fill1: "rgba(16, 185, 129, 0.3)",
          stroke1: "#34d399",
          fill2: "rgba(5, 150, 105, 0.25)",
          stroke2: "#059669",
          ambientFilter: "hue-rotate-[110deg]"
        };
      case "band-13": // clean ir (thermal orange-red)
      default:
        return {
          fill1: "rgba(249, 115, 22, 0.35)",
          stroke1: "#fb923c",
          fill2: "rgba(239, 68, 68, 0.3)",
          stroke2: "#f87171",
          ambientFilter: "hue-rotate-0"
        };
    }
  };

  const spectralStyles = getSpectralCloudColors(selectedBand);

  // Handle GIS map mouse click to position the Probe
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert coordinate pixels to standard Latitude/Longitude
    // Map is width 500, height 300
    // X goes from 120°E (x=0) to 150°E (x=500)
    // Y goes from 45°N (y=0) to 15°N (y=300)
    const lon = parseFloat((120 + (x / 500) * 30).toFixed(2));
    const lat = parseFloat((45 - (y / 300) * 30).toFixed(2));

    setProbeCoords({ lat, lon, x, y });
    setIsProbing(true);

    // Compute localized atmospheric parameters based on proximity to the map features
    const distToCenter = Math.sqrt((x - 250) ** 2 + (y - 150) ** 2);
    
    let tempK = 285.4 - (y * 0.15); // cooler further north
    let altitude = 3200 + (y * 15);
    let optDepth = 1.2 + (y * 0.08);
    let speed = 12.4 + (x * 0.08);

    // If close to severe storm core center
    if (distToCenter < 120) {
      tempK = 212.4 + (distToCenter * 0.4);
      altitude = 12800 - (distToCenter * 40);
      optDepth = 58.6 - (distToCenter * 0.3);
      speed = 68.4 - (distToCenter * 0.15);
    }

    const confScore = Math.min(99.9, Math.max(92.4, 99.4 - (distToCenter * 0.02) + (Math.random() * 0.4)));

    // Sync state
    setProbeData({
      brightnessTemp: `${tempK.toFixed(1)} K (${(tempK - 273.15).toFixed(1)}°C)`,
      estimatedAltitude: `${Math.round(altitude).toLocaleString()} meters`,
      cloudOpticalDepth: `${optDepth.toFixed(1)} τ`,
      windSpeed: `${speed.toFixed(1)} knots (${y > 150 ? "SW" : "NE"})`,
      relativeHumidity: `${Math.min(100, Math.round(98 - distToCenter * 0.25))}%`,
      rifeConfidence: `${confScore.toFixed(2)}%`
    });

    // Add telemetry log entry
    setActiveTelemetryLog((prev) => [
      `Lock-on target updated: Latitude ${lat}°N, Longitude ${lon}°E`,
      `Local Brightness Temp: ${tempK.toFixed(1)}K, Cloud Altitude: ${Math.round(altitude)}m`,
      ...prev.slice(0, 4)
    ]);

    setTimeout(() => {
      setIsProbing(false);
    }, 450);
  };

  // Run custom GIS telemetry command via console
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleCommand.trim()) return;

    const cmd = consoleCommand.trim().toLowerCase();
    let reply = "";

    if (cmd.startsWith("scan")) {
      reply = `Triggering immediate full-spectral scanning orbit pass. Resolving spatial constraints.`;
      setScanSwathActive(true);
    } else if (cmd.startsWith("lock") || cmd.includes("coord")) {
      reply = `Locking coordinates at current target: ${probeCoords.lat}°N, ${probeCoords.lon}°E. Refinement active.`;
    } else if (cmd === "clear") {
      reply = "Telemetry logs cleared.";
      setActiveTelemetryLog([]);
      setConsoleCommand("");
      return;
    } else if (cmd.includes("rife") || cmd.includes("upsample")) {
      reply = "Initiating bilateral RIFE-IFNet fine-grained sub-pixel alignment over coordinates.";
    } else {
      reply = `Command recognized: "${cmd}". Re-routing packet via GOES satellite uplink.`;
    }

    setActiveTelemetryLog((prev) => [
      `> ${consoleCommand}`,
      `SYSTEM: ${reply}`,
      ...prev.slice(0, 4)
    ]);
    setConsoleCommand("");
  };

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl" id="gis-space-grid-section">
      
      {/* HEADER RAIL */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20">
              <Globe className="w-4 h-4 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-display">
              GIS Coordinate Probe &amp; Space Spectral Grid Visualizer
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze the physical fluid dynamics of downscaled grids. Click the map to sample sub-pixel metrics.
          </p>
        </div>

        {/* Tab Selection buttons */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1 flex-wrap">
          <button
            id="btn-gis-orbit"
            onClick={() => setActiveTab("gis-map")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "gis-map"
                ? "bg-sky-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            GIS Orbit Projection
          </button>
          <button
            id="btn-space-grid"
            onClick={() => setActiveTab("spectral-grid")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "spectral-grid"
                ? "bg-sky-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Space Spectral Grid
          </button>
          <button
            id="btn-3d-globe"
            onClick={() => setActiveTab("3d-globe")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "3d-globe"
                ? "bg-sky-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            3D Globe Projection
          </button>
        </div>
      </div>

      {/* DUAL WORKSPACE LAYOUT */}
      <div className="p-6">
        
        {activeTab === "gis-map" ? (
          
          /* =================== TAB 1: GIS ORBIT PROJECTION MAP =================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* GIS SVG Canvas (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex justify-between items-center bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                  Himawari-9 Pacific Projection (20°N - 50°N)
                </span>
                <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Click Map to Probe
                </span>
              </div>

              {/* Main SVG Map */}
              <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                
                {/* Simulated Geographic SVG Map of East Asia & Typhoon Region */}
                <svg 
                  viewBox="0 0 500 300" 
                  className="w-full h-auto select-none cursor-crosshair relative z-10"
                  onClick={handleMapClick}
                >
                  
                  {/* Grid Lines - Lat/Lon */}
                  {Array.from({ length: 6 }).map((_, i) => {
                    const x = i * 100;
                    const lonVal = 120 + i * 6;
                    return (
                      <g key={`lon-${i}`} className="opacity-25 font-mono">
                        <line x1={x} y1={0} x2={x} y2={300} stroke="#475569" strokeWidth="0.5" strokeDasharray="4 4" />
                        <text x={x + 3} y={292} fill="#64748b" fontSize="8" className="select-none">{lonVal}°E</text>
                      </g>
                    );
                  })}
                  {Array.from({ length: 4 }).map((_, i) => {
                    const y = i * 100;
                    const latVal = 45 - i * 10;
                    return (
                      <g key={`lat-${i}`} className="opacity-25 font-mono">
                        <line x1={0} y1={y} x2={500} y2={y} stroke="#475569" strokeWidth="0.5" strokeDasharray="4 4" />
                        <text x={4} y={y - 4} fill="#64748b" fontSize="8" className="select-none">{latVal}°N</text>
                      </g>
                    );
                  })}

                  {/* Stylized Coastal Outlines (Japan, Korea, Eastern China, Pacific Islands) */}
                  <path 
                    d="M 50,50 Q 80,70 110,85 T 140,110 T 170,160 Q 150,190 120,220 T 90,260 L 50,280 Q 40,290 20,290" 
                    fill="none" 
                    stroke="#1e293b" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    className="opacity-40"
                  />
                  <path 
                    d="M 50,50 Q 80,70 110,85 T 140,110 T 170,160 Q 150,190 120,220 T 90,260 L 50,280 Q 40,290 20,290" 
                    fill="none" 
                    stroke="#334155" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />

                  {/* Korea Peninsula */}
                  <path 
                    d="M 120,40 Q 140,60 145,85 L 140,110 L 125,120 Q 115,90 112,65 Z" 
                    fill="#1e293b" 
                    stroke="#475569" 
                    strokeWidth="1.5" 
                    className="opacity-70"
                  />

                  {/* Japan Archipelago Arc */}
                  <path 
                    d="M 210,130 C 240,110 270,115 310,135 C 340,150 370,180 400,220 Q 420,250 450,280 M 360,110 Q 380,105 410,100 M 170,160 Q 180,175 195,190" 
                    fill="none" 
                    stroke="#334155" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                  />

                  {/* Active Cloud Cover Swirl (Visual Representation of Cyclone Event overlay on GIS) */}
                  <g className="opacity-30 mix-blend-screen" style={{ filter: spectralStyles.ambientFilter }}>
                    {/* Vortex spiral bands */}
                    <circle cx="280" cy="180" r="85" fill="none" stroke="#64748b" strokeWidth="12" strokeDasharray="140 80" className="animate-spin" style={{ transformOrigin: "280px 180px", animationDuration: "35s" }} />
                    <circle cx="280" cy="180" r="55" fill="none" stroke="#475569" strokeWidth="18" strokeDasharray="90 50" className="animate-spin" style={{ transformOrigin: "280px 180px", animationDuration: "20s" }} />
                    <circle cx="280" cy="180" r="30" fill="rgba(148, 163, 184, 0.4)" />
                  </g>

                  {/* Orbit Track Arc line */}
                  <path 
                    d="M 10,240 Q 180,120 480,40" 
                    fill="none" 
                    stroke="#0284c7" 
                    strokeWidth="1.5" 
                    strokeDasharray="5 5" 
                    className="opacity-65"
                  />

                  {/* Scanner Swath Scan Beam Indicator */}
                  {scanSwathActive && (
                    <g className="opacity-15 pointer-events-none">
                      <path
                        d={`M ${orbitProgress * 5 - 40},0 L ${orbitProgress * 5 + 40},0 L ${orbitProgress * 5 + 120},300 L ${orbitProgress * 5 - 120},300 Z`}
                        fill="url(#scanningSwathGradient)"
                      />
                    </g>
                  )}

                  {/* Satellite representation along the Orbit track */}
                  <g transform={`translate(${orbitProgress * 5}, ${180 - (orbitProgress / 90) * 120})`} className="cursor-pointer">
                    {/* Pulsing coverage radius ring */}
                    <circle cx="0" cy="0" r="30" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" className="animate-ping" />
                    {/* Inner core dot */}
                    <circle cx="0" cy="0" r="5" fill="#38bdf8" />
                    <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                    {/* Flag text */}
                    <text x="8" y="4" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace" className="bg-slate-950">
                      HIMAWARI-9 [ORBIT]
                    </text>
                  </g>

                  {/* Current Active GIS Target Probe Pin pointer */}
                  <g transform={`translate(${probeCoords.x}, ${probeCoords.y})`}>
                    <circle cx="0" cy="0" r="14" fill="none" stroke="#f43f5e" strokeWidth="1.5" className={isProbing ? "animate-ping" : "animate-pulse"} />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#f43f5e" strokeWidth="1.5" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="#f43f5e" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="3" fill="#f43f5e" />
                  </g>

                  {/* Color definitions for the SVG gradients */}
                  <defs>
                    <linearGradient id="scanningSwathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                      <stop offset="50%" stopColor="#0ea5e9" stopOpacity="1" />
                      <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                </svg>

                {/* Grid Dot Overlay */}
                <div className="absolute inset-0 satellite-grid pointer-events-none opacity-15" />
                
                {/* Floating Map Labels */}
                <div className="absolute top-10 left-36 text-[8px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
                  KOR PENINSULA
                </div>
                <div className="absolute top-36 right-20 text-[8px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
                  WEST PACIFIC TRENCH
                </div>
                <div className="absolute top-20 right-40 text-[8px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
                  HONSHU ARCH
                </div>
              </div>

              {/* Console commands logs underneath map */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[10px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-500 uppercase font-bold border-b border-slate-900 pb-1">
                  <Terminal className="w-3 h-3 text-sky-400" />
                  GIS Real-time Telemetry Monitor
                </div>
                <div className="space-y-1 text-slate-400">
                  {activeTelemetryLog.map((log, lIdx) => (
                    <div key={`log-${lIdx}`} className="truncate">
                      <span className="text-slate-600">[{12 - lIdx}:00]</span> {log}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleCommandSubmit} className="flex gap-2 pt-1 border-t border-slate-900 mt-2">
                  <span className="text-sky-500 font-bold">&gt;</span>
                  <input
                    type="text"
                    value={consoleCommand}
                    onChange={(e) => setConsoleCommand(e.target.value)}
                    placeholder="Enter telemetric command (e.g. scan, lock, rife)..."
                    className="bg-transparent text-slate-200 text-[10px] w-full focus:outline-none"
                  />
                </form>
              </div>
            </div>

            {/* GIS Real-time Spectro-Probe Statistics (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-5 space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                      Meteorological Spectro-Probe
                    </span>
                  </div>
                  <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono font-bold">
                    ACTIVE TARGET
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  
                  {/* Location Coordinate Coordinates Readout */}
                  <div className="flex justify-between items-center p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-500 text-[10px] uppercase">Gis Coordinates:</span>
                    <strong className="text-rose-400">
                      {probeCoords.lat}° N, {probeCoords.lon}° E
                    </strong>
                  </div>

                  {/* Probe Variables List */}
                  <div className="space-y-2 pt-2 text-[11px]">
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Cloud Brightness Temp (Ch 13):</span>
                      <strong className="text-slate-200">{probeData.brightnessTemp}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Estimated Cloud Top Altitude:</span>
                      <strong className="text-slate-200">{probeData.estimatedAltitude}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Optical Vapor Thickness (Ch 08):</span>
                      <strong className="text-slate-200">{probeData.cloudOpticalDepth}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Calculated Vector Wind Speed:</span>
                      <strong className="text-slate-200">{probeData.windSpeed}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1.5">
                      <span className="text-slate-500">Target Relative Humidity:</span>
                      <strong className="text-slate-200">{probeData.relativeHumidity}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">RIFE Frame-Sync Confidence:</span>
                      <strong className="text-emerald-400 font-bold">{probeData.rifeConfidence}</strong>
                    </div>
                  </div>

                </div>

                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-[10px] leading-relaxed text-slate-400">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold uppercase text-[9px] mb-1">
                    <Info className="w-3 h-3" />
                    How this aligns with the RIFE Model
                  </div>
                  By probing coordinates directly over the Pacific storm fronts, the AI model retrieves continuous brightness temperature gradients. Standard linear interpolation fails to model atmospheric rotation, whereas our **Bilateral Optical Warping** aligns the gas vapors correctly over complex coastlines.
                </div>
              </div>

              {/* Quick Science Feature Cards */}
              <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <strong className="text-slate-200 font-bold block mb-0.5">Geospatial Projection Correction</strong>
                  <p className="text-slate-500 font-sans text-[11px] leading-normal">
                    Calculated flow fields undergo ellipsoid earth mapping to avoid parallax distortion over mountainous regions.
                  </p>
                </div>
              </div>

              {/* Orbit Command Toggles */}
              <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex flex-col gap-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Orbit Swath Controls
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAutoOrbit(!isAutoOrbit)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${
                      isAutoOrbit 
                        ? "bg-sky-500 text-slate-950" 
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {isAutoOrbit ? "Auto Orbit Running" : "Hold Orbit Position"}
                  </button>
                  <button
                    onClick={() => setScanSwathActive(!scanSwathActive)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${
                      scanSwathActive 
                        ? "bg-sky-500 text-slate-950" 
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {scanSwathActive ? "Scanner Active" : "Scanner Off"}
                  </button>
                </div>
              </div>

            </div>

          </div>

        ) : activeTab === "spectral-grid" ? (
          
          /* =================== TAB 2: SPACE SPECTRAL GRID MATRIX =================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* Spectral Matrix (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                Select Satellite Band (GOES-R Advanced Baseline Imager)
              </span>

              <div className="flex flex-col gap-2.5">
                {SPECTRAL_BANDS.map((band) => {
                  const isSelected = selectedBand === band.id;
                  return (
                    <button
                      key={band.id}
                      onClick={() => {
                        setSelectedBand(band.id);
                        setActiveTelemetryLog((prev) => [
                          `Switched spectral channel to ${band.name}`,
                          `Wavelength is calibrated at ${band.wavelength}`,
                          ...prev.slice(0, 4)
                        ]);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? `bg-slate-950/60 ${band.borderColor} shadow-lg shadow-sky-500/[0.01]`
                          : "bg-slate-900 border-slate-850 hover:bg-slate-950/20"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className={`text-xs font-mono font-bold ${isSelected ? band.textColor : "text-slate-300"}`}>
                          {band.name}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">{band.wavelength}</span>
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Res: {band.resolution}</span>
                        <span className={isSelected ? band.textColor : "text-sky-400"}>
                          Upscale rate: {band.upsamplingFactor}
                        </span>
                      </div>

                      {isSelected && (
                        <p className="text-[10px] text-slate-400 font-sans leading-normal pt-1.5 border-t border-slate-900 mt-1">
                          {band.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Spectral Cloud Render (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                Channel Output View — {currentBandObj.wavelength} Wavelength
              </span>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-between aspect-square w-full">
                
                {/* SVG representing visual signature for this specific band */}
                <div className="relative w-full aspect-square bg-slate-950 border border-slate-850/60 rounded-lg overflow-hidden flex items-center justify-center">
                  
                  <svg viewBox="0 0 200 200" className="w-full h-full select-none">
                    {/* Concentric rings represent atmosphere pressure lines */}
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#111827" strokeWidth="1" />
                    <circle cx="100" cy="100" r="50" fill="none" stroke="#111827" strokeWidth="1" />
                    
                    {/* Multi-spectral cloud bodies rendered with distinct colors/filters */}
                    <g style={{ filter: spectralStyles.ambientFilter }}>
                      <circle cx="90" cy="90" r="35" fill={spectralStyles.fill1} stroke={spectralStyles.stroke1} strokeWidth="1" />
                      <circle cx="120" cy="110" r="28" fill={spectralStyles.fill2} stroke={spectralStyles.stroke2} strokeWidth="1.2" />
                      <circle cx="70" cy="120" r="22" fill={spectralStyles.fill1} stroke={spectralStyles.stroke1} strokeWidth="0.8" />
                    </g>

                    {/* Spectral alignment markers */}
                    <line x1="100" y1="10" x2="100" y2="190" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="10" y1="100" x2="190" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  </svg>

                  <div className="absolute inset-0 satellite-grid pointer-events-none opacity-20" />

                  {/* Metadata labels */}
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/90 border border-slate-800 rounded px-1.5 py-0.5 text-[8px] font-mono text-slate-400">
                    SENS PROFILE: {currentBandObj.colorName}
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 border border-slate-800 rounded px-1.5 py-0.5 text-[8px] font-mono text-emerald-400 font-bold">
                    SSIM DELTA: {currentBandObj.ssimImprovement}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 w-full mt-2 flex justify-between">
                  <span>Physical Tracker:</span>
                  <span className="text-slate-300 font-bold">{currentBandObj.physicalMeaning}</span>
                </div>

              </div>
            </div>

            {/* Sub-Pixel Resolution Comparator (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
                Atmospheric Sub-Pixel Zoom Comparison
              </span>

              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
                
                <div className="text-xs text-slate-400 leading-normal">
                  Micro-vortex analysis proves that RIFE maintains structural cloud borders that normal upsamplers smear into a blurry haze.
                </div>

                {/* Grid layout showing side-by-side microscopic comparison */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Left: Bilinear blurry upsampling */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded text-center">
                      Traditional Bilinear
                    </span>
                    <div className="aspect-square w-full rounded border border-slate-850 bg-slate-950 overflow-hidden relative flex items-center justify-center">
                      
                      {/* Grid representation with blurry pixels */}
                      <div className="w-full h-full p-2 grid grid-cols-4 grid-rows-4 gap-1 opacity-85">
                        <div className="bg-slate-700/60 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-700/75 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-600/70 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-800/80 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-700/85 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-500/60 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-500/50 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-700/90 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-800/90 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-600/60 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-400/50 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-700/80 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-800/95 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-800/70 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-800/80 rounded Blur" style={{ filter: "blur(6px)" }} />
                        <div className="bg-slate-800/90 rounded Blur" style={{ filter: "blur(6px)" }} />
                      </div>

                      <div className="absolute bottom-1 right-1 text-[7px] font-mono text-red-400 bg-slate-950/90 px-1 rounded">
                        Blurred
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-center text-slate-500">
                      PSNR: 26.2dB (Artifacts present)
                    </span>
                  </div>

                  {/* Right: RIFE Neural Warping */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-center">
                      RIFE Bilateral Warping
                    </span>
                    <div className="aspect-square w-full rounded border border-slate-800 bg-slate-950 overflow-hidden relative flex items-center justify-center">
                      
                      {/* Grid representation with sharp boundaries */}
                      <div className="w-full h-full p-2 grid grid-cols-4 grid-rows-4 gap-1 opacity-90">
                        <div className="bg-sky-500/70 rounded shadow-inner" />
                        <div className="bg-sky-500/80 rounded" />
                        <div className="bg-sky-400/60 rounded" />
                        <div className="bg-slate-800/80 rounded" />
                        <div className="bg-sky-500/90 rounded" />
                        <div className="bg-white/80 rounded shadow" />
                        <div className="bg-white/70 rounded shadow" />
                        <div className="bg-sky-500/90 rounded" />
                        <div className="bg-slate-800/90 rounded" />
                        <div className="bg-sky-400/70 rounded" />
                        <div className="bg-sky-300/60 rounded" />
                        <div className="bg-sky-500/80 rounded" />
                        <div className="bg-slate-800/95 rounded" />
                        <div className="bg-slate-800/70 rounded" />
                        <div className="bg-slate-850/80 rounded" />
                        <div className="bg-slate-900/90 rounded" />
                      </div>

                      <div className="absolute bottom-1 right-1 text-[7px] font-mono text-emerald-400 bg-slate-950/90 px-1 rounded">
                        Crisp Filaments
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-center text-slate-500">
                      PSNR: 34.8dB (Sub-pixel precise)
                    </span>
                  </div>

                </div>

                <div className="space-y-2 pt-2 border-t border-slate-850">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Target Spectral Upsampling:</span>
                    <span className="text-emerald-400 font-bold">{currentBandObj.upsamplingFactor}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Validation Score Gain:</span>
                    <span className="text-emerald-400 font-bold">SSIM Delta {currentBandObj.ssimImprovement}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        ) : (
          
          /* =================== TAB 3: INTERACTIVE 3D GLOBE =================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            
            {/* Left Column: Interactive 3D Globe Visualizer (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  3D Orthographic Space Projection • Himawari/GOES Track
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  REAL-TIME SIMULATION
                </span>
              </div>

              {/* Globe Canvas Container */}
              <div className="relative bg-slate-950 rounded-xl aspect-[4/3] w-full overflow-hidden border border-slate-850 flex items-center justify-center">
                {/* Space Stars Grid Underlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none satellite-grid" />

                {/* Simulated Star Constellations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                  <div className="absolute w-1 h-1 bg-white rounded-full top-[12%] left-[25%] opacity-30 animate-pulse" />
                  <div className="absolute w-0.5 h-0.5 bg-sky-300 rounded-full top-[45%] left-[8%] opacity-50" />
                  <div className="absolute w-1 h-1 bg-white rounded-full top-[75%] left-[18%] opacity-20 animate-pulse" style={{ animationDuration: "3s" }} />
                  <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[23%] left-[82%] opacity-45" />
                  <div className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full top-[58%] left-[74%] opacity-20 animate-pulse" style={{ animationDuration: "4s" }} />
                  <div className="absolute w-0.5 h-0.5 bg-white rounded-full top-[88%] left-[60%] opacity-60" />
                </div>

                <svg viewBox="0 0 400 300" className="w-full h-full select-none">
                  <defs>
                    {/* Deep Space / Ocean Spherical Shading Gradient */}
                    <radialGradient id="ocean-grad" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#0f172a" />
                      <stop offset="50%" stopColor="#090d1f" />
                      <stop offset="100%" stopColor="#020308" />
                    </radialGradient>

                    {/* Spherical atmosphere outer glow */}
                    <radialGradient id="atmosphere-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="85%" stopColor="#0ea5e9" stopOpacity="0" />
                      <stop offset="97%" stopColor="#0ea5e9" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                    </radialGradient>

                    {/* Laser Scanning Swath Gradient */}
                    <linearGradient id="orbit-laser-beam" x1="50%" y1="0%" x2="50%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                      <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                    </linearGradient>

                    {/* Clip path for landmass clipping to create perfect orthographic sphere */}
                    <clipPath id="globe-sphere-clip">
                      <circle cx="200" cy="150" r="90" />
                    </clipPath>
                  </defs>

                  {/* 1. Outer Atmospheric Edge Glow Ring */}
                  <circle cx="200" cy="150" r="94" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.25" className="animate-pulse" />

                  {/* 2. Earth Sphere Base (Ocean Fill) */}
                  <circle cx="200" cy="150" r="90" fill="url(#ocean-grad)" stroke="#1e293b" strokeWidth="1.5" />

                  {/* 3. CLIPPED LANDMASSES & GRID LINES */}
                  <g clipPath="url(#globe-sphere-clip)">
                    {/* Static Latitude Lines (Parallels) */}
                    <ellipse cx="200" cy="150" rx="90" ry="1" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 2" />
                    <ellipse cx="200" cy="110" rx="81" ry="14" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
                    <ellipse cx="200" cy="80" rx="58" ry="10" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
                    <ellipse cx="200" cy="190" rx="81" ry="14" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
                    <ellipse cx="200" cy="220" rx="58" ry="10" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />

                    {/* Rotating Longitude Meridians */}
                    {[0, 30, 60, 90, 120, 150].map((longOffset, idx) => {
                      const mAngle = (globeRotation + longOffset) % 180;
                      const mRad = (mAngle * Math.PI) / 180;
                      const mRx = 90 * Math.cos(mRad);
                      return (
                        <ellipse 
                          key={idx}
                          cx="200" 
                          cy="150" 
                          rx={Math.max(0.2, Math.abs(mRx))} 
                          ry="90" 
                          fill="none" 
                          stroke="#1e293b" 
                          strokeWidth="0.6" 
                          opacity={0.3}
                        />
                      );
                    })}

                    {/* Moving Continents (Infinite scrolling copies clipped to sphere shape) */}
                    {[
                      // Continent 1: Large Northern Landmass (Eurasia/Asia)
                      { d: "M 120,90 Q 150,70 190,95 T 230,130 T 210,165 T 170,160 T 130,130 Z", shift: 0, fill: "#0369a1", stroke: "#0ea5e9" },
                      // Continent 2: Southern Complex (Africa/Australia/Islands)
                      { d: "M 150,150 Q 190,130 220,160 T 230,220 T 190,230 T 150,190 Z", shift: 120, fill: "#0284c7", stroke: "#0ea5e9" },
                      // Continent 3: Far Polar/Greenland Ring
                      { d: "M 140,65 Q 170,50 200,68 T 170,95 Z", shift: 240, fill: "#0369a1", stroke: "#38bdf8" }
                    ].flatMap((cont, cIdx) => {
                      // We draw 3 horizontal duplicates spaced by 360px to represent seamless infinite sphere rotation
                      const scrollA = (((globeRotation + cont.shift) % 360) - 180);
                      return [-360, 0, 360].map((dupOffset, dIdx) => (
                        <path 
                          key={`${cIdx}-${dIdx}`}
                          d={cont.d}
                          fill={cont.fill}
                          fillOpacity="0.25"
                          stroke={cont.stroke}
                          strokeWidth="1.2"
                          strokeOpacity="0.4"
                          transform={`translate(${scrollA + dupOffset}, 0)`}
                          className="transition-transform duration-75"
                        />
                      ));
                    })}

                    {/* Equator Guide indicator */}
                    <line x1="110" y1="150" x2="290" y2="150" stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.15" />
                  </g>

                  {/* 4. Atmosphere Shading Sphere overlay (Creates perfect volumetric 3D ball appearance) */}
                  <circle cx="200" cy="150" r="90" fill="url(#atmosphere-glow)" className="pointer-events-none" />

                  {/* 5. Tilted Orbital Path (GOES-R Standard Geostationary Plane) */}
                  {showSatelliteOrbit && (
                    <>
                      {/* Orbital Ellipse path, rotated by the user dynamic Axial Tilt */}
                      <ellipse 
                        cx="200" 
                        cy="150" 
                        rx="145" 
                        ry="42" 
                        fill="none" 
                        stroke="rgba(14, 165, 233, 0.2)" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                        transform={`rotate(${-globeTilt} 200 150)`}
                      />

                      {/* Active Scanner Swath Laser Cone (Only active if satellite is in front loop) */}
                      {(() => {
                        const satAngle = (orbitProgress * 4) % 360;
                        const satRad = (satAngle * Math.PI) / 180;
                        const localSatX = 145 * Math.cos(satRad);
                        const localSatY = 42 * Math.sin(satRad);
                        
                        const tiltRad = (-globeTilt * Math.PI) / 180;
                        const cosR = Math.cos(tiltRad);
                        const sinR = Math.sin(tiltRad);
                        
                        const satX = 200 + (localSatX * cosR - localSatY * sinR);
                        const satY = 150 + (localSatX * sinR + localSatY * cosR);
                        const isFront = satAngle > 0 && satAngle < 180;

                        return (
                          <g>
                            {/* Scanning beam */}
                            {isFront && (
                              <polygon 
                                points={`${satX},${satY} 175,145 225,155`} 
                                fill="url(#orbit-laser-beam)" 
                                opacity="0.35" 
                                className="pointer-events-none"
                              />
                            )}

                            {/* Satellite Outer Signal Ring */}
                            <circle cx={satX} cy={satY} r="7" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" className="animate-ping" />
                            
                            {/* Satellite Solid core dot */}
                            <circle cx={satX} cy={satY} r="3" fill="#10b981" stroke="#065f46" strokeWidth="1" />

                            {/* Floating Satellite HUD Tag */}
                            <text x={satX + 8} y={satY - 6} fill="#10b981" fontSize="7" fontFamily="monospace" fontWeight="bold">
                              H9-GEO
                            </text>
                          </g>
                        );
                      })()}
                    </>
                  )}
                </svg>

                {/* Satellite Subpoint Latitude / Longitude Badge */}
                <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 rounded px-2.5 py-1 text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 z-20 pointer-events-none">
                  <Compass className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
                  GEO Center: {((globeRotation + 180) % 360).toFixed(1)}°E, 0.00°N
                </div>

                <div className="absolute top-3 right-3 bg-slate-950/90 border border-slate-800 rounded px-2.5 py-1 text-[9px] font-mono text-sky-400 z-20 pointer-events-none">
                  Axial Tilt: {globeTilt.toFixed(1)}°
                </div>
              </div>

              {/* Description explanation */}
              <p className="text-[10px] text-slate-500 font-mono leading-normal">
                Himawari-9 / GOES-18 orthographic geostationary perspective tracking. Longitude meridians are projected using standard sphere angular equations (90 * Cos(rad)) mapping physical atmospheric rotational drift seamlessly.
              </p>
            </div>

            {/* Right Column: Control Parameters & Earth Projection Switcher (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              
              {/* SECTION: EARTH PROJECTION SWITCHER */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-bold block mb-3 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Earth Projection System
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option 1: GIS Map */}
                  <button
                    onClick={() => {
                      setActiveTab("gis-map");
                      setActiveTelemetryLog((prev) => [
                        "Switched projection structure to GIS planar Map",
                        "Equirectangular scaling active over Pacific sector",
                        ...prev.slice(0, 4)
                      ]);
                    }}
                    className={`text-left p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                      activeTab === "gis-map"
                        ? "bg-sky-500/10 border-sky-500 text-sky-300"
                        : "bg-slate-900/60 border-slate-850 hover:bg-slate-950/40 text-slate-400"
                    }`}
                  >
                    <div className="p-1.5 rounded bg-slate-950">
                      <Map className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold font-mono">Planar GIS Map</div>
                      <div className="text-[9px] text-slate-500 font-mono">2D Equirectangular regional probe scan</div>
                    </div>
                  </button>

                  {/* Option 2: Space Grid */}
                  <button
                    onClick={() => {
                      setActiveTab("spectral-grid");
                      setActiveTelemetryLog((prev) => [
                        "Switched projection structure to Space Spectral Grid",
                        "Displaying Fourier discrete upscaled cells",
                        ...prev.slice(0, 4)
                      ]);
                    }}
                    className={`text-left p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                      activeTab === "spectral-grid"
                        ? "bg-sky-500/10 border-sky-500 text-sky-300"
                        : "bg-slate-900/60 border-slate-850 hover:bg-slate-950/40 text-slate-400"
                    }`}
                  >
                    <div className="p-1.5 rounded bg-slate-950">
                      <Layers className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold font-mono">Space Spectral Grid</div>
                      <div className="text-[9px] text-slate-500 font-mono">Multi-band neural tensor upsampling grid</div>
                    </div>
                  </button>

                  {/* Option 3: 3D Globe */}
                  <button
                    onClick={() => setActiveTab("3d-globe")}
                    className={`text-left p-2.5 rounded-lg border transition-all flex items-center gap-3 ${
                      activeTab === "3d-globe"
                        ? "bg-sky-500/10 border-sky-500 text-sky-300"
                        : "bg-slate-900/60 border-slate-850 hover:bg-slate-950/40 text-slate-400"
                    }`}
                  >
                    <div className="p-1.5 rounded bg-slate-950">
                      <Globe className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold font-mono">3D Orthographic Globe</div>
                      <div className="text-[9px] text-slate-500 font-mono">Volumetric rotating sphere model</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3D GLOBE CONTROLS */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col gap-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  3D Projection Controls
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsGlobeAutoRotate(!isGlobeAutoRotate)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isGlobeAutoRotate 
                        ? "bg-emerald-500 text-slate-950" 
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {isGlobeAutoRotate ? (
                      <>
                        <Pause className="w-3 h-3" /> Auto Rotation Active
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Auto Rotation Paused
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setGlobeRotation(145);
                      setGlobeTilt(23.5);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded border border-slate-700 transition-all"
                    title="Reset Projection parameters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Axial Tilt adjustor */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Axial Tilt Correction:</span>
                    <span className="text-sky-400">{globeTilt.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    step="0.5"
                    value={globeTilt}
                    onChange={(e) => setGlobeTilt(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Satellite toggle */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400">Track Orbit Path:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showSatelliteOrbit} 
                      onChange={(e) => setShowSatelliteOrbit(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-7 h-4 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:bg-sky-400 peer-checked:bg-sky-950" />
                  </label>
                </div>
              </div>

              {/* TELEMETRY READOUT CARD */}
              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
                  GOES Satellite Link telemetry
                </span>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                  <div className="p-2 bg-slate-950 rounded border border-slate-900">
                    <div className="text-slate-500 text-[8px] uppercase">Orbit Category</div>
                    <div className="text-sky-300 font-bold">GEO (Geostationary)</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-900">
                    <div className="text-slate-500 text-[8px] uppercase">Velocity</div>
                    <div className="text-sky-300 font-bold">3.07 km/s</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-900">
                    <div className="text-slate-500 text-[8px] uppercase">Frequency Band</div>
                    <div className="text-emerald-400 font-bold">K-band Uplink</div>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-900">
                    <div className="text-slate-500 text-[8px] uppercase">Sensing Payload</div>
                    <div className="text-emerald-400 font-bold">16-channel ABI</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
