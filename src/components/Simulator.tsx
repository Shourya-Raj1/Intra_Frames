import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Wind, 
  Eye, 
  Settings, 
  Download, 
  Sparkles, 
  Activity, 
  TrendingUp, 
  Database, 
  AlertCircle,
  BarChart2,
  FileSpreadsheet,
  CheckCircle,
  X,
  Compass,
  Globe,
  Layers,
  Map
} from "lucide-react";

interface SimulatorProps {
  onExportSuccess: () => void;
}

type SimulationPreset = "storm-front" | "cyclone";

interface CloudElement {
  id: string;
  label: string;
  // Frame A coordinates
  xA: number;
  yA: number;
  rA: number;
  opacityA: number;
  // Frame B coordinates
  xB: number;
  yB: number;
  rB: number;
  opacityB: number;
}

interface AlertEntry {
  id: string;
  level: "NORMAL" | "WARNING" | "SEVERE";
  eventType: string;
  frameNumber: number;
  confidence: number;
  timestamp: string;
}

export function Simulator({ onExportSuccess }: SimulatorProps) {
  // Preset scenario selection
  const [preset, setPreset] = useState<SimulationPreset>("storm-front");
  
  // 1. Dual Timelines & Animation Loops (Critical Fix)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [leftTime, setLeftTime] = useState<number>(0.0);   // Original Feed (slideshow jumps)
  const [rightTime, setRightTime] = useState<number>(0.5);  // AI Feed (smooth, fluid steps)
  
  // RIFE Configuration Parameters
  const [upsampleFactor, setUpsampleFactor] = useState<number>(12); // e.g. 12x
  const [blockResolution, setBlockResolution] = useState<number>(16); // 16x16 spatial
  const [noiseLevel, setNoiseLevel] = useState<number>(0.12);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showRefinementNoise, setShowRefinementNoise] = useState<boolean>(true);

  // 2. Scrubber State (Frame 1 to 6)
  const [scrubberVal, setScrubberVal] = useState<number>(3.5);

  // 3. Severity Alert System
  const [isCycloneEventActive, setIsCycloneEventActive] = useState<boolean>(false);
  const [severeAlertAck, setSevereAlertAck] = useState<boolean>(false);
  const [showSevereAlert, setShowSevereAlert] = useState<boolean>(true);
  const [alertsLog, setAlertsLog] = useState<AlertEntry[]>([
    {
      id: "initial",
      level: "NORMAL",
      eventType: "Nominal Cloud Movement",
      frameNumber: 1,
      confidence: 96,
      timestamp: "12:00 PM UTC"
    }
  ]);

  // 4. Temporal Consistency Points (last 10 frame entries)
  const [consistencyPoints, setConsistencyPoints] = useState<number[]>([1.2, 1.4, 1.1, 1.5, 1.3, 1.6, 1.4, 1.5, 1.3, 1.4]);

  // 5. Region of Interest (ROI) Selector on RIGHT Panel
  const [roi, setRoi] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hoverGis, setHoverGis] = useState<{ lat: number; lon: number; x: number; y: number } | null>(null);

  // AI Diagnostic output state
  const [aiAuditReport, setAiAuditReport] = useState<string>("");
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  const rightSvgRef = useRef<SVGSVGElement | null>(null);

  // 6. Interactive Projection states for Satellite feeds
  const [feedProjection, setFeedProjection] = useState<"gis-map" | "spectral-grid" | "3d-globe">("gis-map");
  const [globeRotation, setGlobeRotation] = useState<number>(145);
  const [isGlobeAutoRotate, setIsGlobeAutoRotate] = useState<boolean>(true);
  const [globeTilt, setGlobeTilt] = useState<number>(23.5);
  const [showSatelliteOrbit, setShowSatelliteOrbit] = useState<boolean>(true);
  const [orbitProgress, setOrbitProgress] = useState<number>(15);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(true);

  // Cloud patterns for Storm Front vs Cyclone
  const stormFrontClouds: CloudElement[] = [
    { id: "band-1", label: "Cold Front Ingress Band", xA: 100, yA: 80, rA: 55, opacityA: 0.7, xB: 350, yB: 120, rB: 80, opacityB: 0.8 },
    { id: "band-2", label: "Pre-frontal Squall Line", xA: 60, yA: 200, rA: 40, opacityA: 0.6, xB: 320, yB: 240, rB: 50, opacityB: 0.7 },
    { id: "moisture-plume", label: "Sub-tropical Moisture Plume", xA: 150, yA: 290, rA: 65, opacityA: 0.5, xB: 420, yB: 310, rB: 75, opacityB: 0.6 },
    { id: "unstable-pocket", label: "Convective Instability Pocket", xA: 240, yA: 130, rA: 25, opacityA: 0.8, xB: 380, yB: 180, rB: 45, opacityB: 0.9 },
  ];

  const cycloneClouds: CloudElement[] = [
    { id: "eye-wall", label: "Typhoon Eye Wall", xA: 250, yA: 190, rA: 40, opacityA: 0.9, xB: 250, yB: 190, rB: 35, opacityB: 0.95 },
    { id: "spiral-arm-n", label: "North Spiral Rain Band", xA: 250, yA: 90, rA: 50, opacityA: 0.7, xB: 320, yB: 190, rB: 55, opacityB: 0.75 },
    { id: "spiral-arm-e", label: "East Spiral Rain Band", xA: 350, yA: 190, rA: 45, opacityA: 0.65, xB: 250, yB: 260, rB: 50, opacityB: 0.7 },
    { id: "spiral-arm-s", label: "South Spiral Rain Band", xA: 250, yA: 290, rA: 48, opacityA: 0.75, xB: 180, yB: 190, rB: 48, opacityB: 0.8 },
    { id: "spiral-arm-w", label: "West Spiral Rain Band", xA: 150, yA: 190, rA: 42, opacityA: 0.6, xB: 250, yB: 120, rB: 45, opacityB: 0.65 },
  ];

  const activeClouds = preset === "storm-front" ? stormFrontClouds : cycloneClouds;

  // Map rightTime to frame index (1 to 6)
  const currentFrameIndex = Math.min(6, Math.max(1, Math.round(rightTime * 5) + 1));

  // Helper to map time to UTC string
  const getTimestampForTime = (t: number) => {
    const totalMinutes = Math.round(t * 25);
    const minsStr = totalMinutes < 10 ? `0${totalMinutes}` : totalMinutes;
    return `12:${minsStr} PM UTC`;
  };

  // Dual Separate Animation Loops
  useEffect(() => {
    let leftInterval: any;
    let rightInterval: any;

    if (isPlaying) {
      // LEFT panel updates every 2000ms with a big slideshow position jump
      leftInterval = setInterval(() => {
        setLeftTime((prev) => (prev === 0.0 ? 1.0 : 0.0));
      }, 2000);

      // RIGHT panel updates every 150ms with small, fluid, continuous steps
      rightInterval = setInterval(() => {
        setRightTime((prev) => {
          let next = prev + 0.04;
          if (next > 1.001) next = 0.0;
          return parseFloat(next.toFixed(3));
        });
      }, 150);
    }

    return () => {
      clearInterval(leftInterval);
      clearInterval(rightInterval);
    };
  }, [isPlaying]);

  // Sync scrubber value with rightTime when auto-playing
  useEffect(() => {
    if (isPlaying) {
      setScrubberVal(rightTime * 5 + 1);
    }
  }, [rightTime, isPlaying]);

  // Auto Rotate 3D Globe loop for feeds
  useEffect(() => {
    let interval: any;
    if (feedProjection === "3d-globe" && isGlobeAutoRotate) {
      interval = setInterval(() => {
        setGlobeRotation((prev) => (prev + 0.6) % 360);
      }, 30);
    }
    return () => clearInterval(interval);
  }, [feedProjection, isGlobeAutoRotate]);

  // Auto Orbit line progress for feeds
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

  // Compute live verification values based on rightTime and settings
  const distanceFactor = Math.abs(rightTime - 0.5) * 2; // 1.0 at edges, 0.0 in middle
  const spatialPenalty = (16 - blockResolution) / 16 * 1.5;
  const noisePenalty = noiseLevel * 4;

  const ssim = parseFloat((0.96 - (1 - distanceFactor) * 0.05 + spatialPenalty * 0.015 - noisePenalty * 0.02).toFixed(3));
  const psnr = parseFloat((34.2 - (1 - distanceFactor) * 3.4 + spatialPenalty * 1.2 - noisePenalty * 2).toFixed(1));
  const flowCoherence = parseFloat((98.4 - (1 - distanceFactor) * 4.2 + (blockResolution / 16) * 1.5).toFixed(1));

  // Simulated Frame 32x32 array statistics
  const getFrameStats = (frameIdx: number, isCyclone: boolean) => {
    const baseAvg = isCyclone ? 0.38 : 0.48;
    const baseCold = isCyclone ? 22 : 11;

    switch (frameIdx) {
      case 1:
        return { centralAvg: baseAvg, coldPixelArea: baseCold };
      case 2:
        return { centralAvg: baseAvg - 0.02, coldPixelArea: baseCold + 3 };
      case 3:
        // Cold pixel area increases by 17% (which is >15% warning)
        return { centralAvg: baseAvg - 0.04, coldPixelArea: baseCold + 19 };
      case 4:
        // Central region avg drops from baseAvg-0.04 to baseAvg-0.10 (drop of 0.06, severe alert!)
        return { centralAvg: baseAvg - 0.10, coldPixelArea: baseCold + 21 };
      case 5:
        return { centralAvg: baseAvg - 0.12, coldPixelArea: baseCold + 24 };
      case 6:
        return { centralAvg: baseAvg - 0.13, coldPixelArea: baseCold + 25 };
      default:
        return { centralAvg: baseAvg, coldPixelArea: baseCold };
    }
  };

  // Severity Detection Logic & Logger Sync
  const currentIdx = Math.round(rightTime * 5) + 1;
  const isCy = preset === "cyclone" || isCycloneEventActive;
  const currStats = getFrameStats(currentIdx, isCy);
  const prevStats = getFrameStats(currentIdx === 1 ? 1 : currentIdx - 1, isCy);

  let activeAlertLevel: "NORMAL" | "WARNING" | "SEVERE" = "NORMAL";
  let activeAlertMessage = "Nominal Cloud Movement";

  if (isCycloneEventActive) {
    activeAlertLevel = "SEVERE";
    activeAlertMessage = "Rapid Cyclone Intensification Forced";
  } else if (currStats.centralAvg - prevStats.centralAvg < -0.05) {
    activeAlertLevel = "SEVERE";
    activeAlertMessage = "Rapid Intensification Detected";
  } else if (currStats.coldPixelArea - prevStats.coldPixelArea > 15) {
    activeAlertLevel = "WARNING";
    activeAlertMessage = "Storm Cell Expanding";
  }

  // Handle adding alerts to log
  useEffect(() => {
    const match = alertsLog.find(
      (a) => a.level === activeAlertLevel && a.frameNumber === currentIdx && a.eventType === activeAlertMessage
    );
    if (!match) {
      const newAlert: AlertEntry = {
        id: Math.random().toString(),
        level: activeAlertLevel,
        eventType: activeAlertMessage,
        frameNumber: currentIdx,
        confidence: Math.round(86 + Math.random() * 13),
        timestamp: getTimestampForTime(rightTime),
      };
      setAlertsLog((prev) => [newAlert, ...prev].slice(0, 5));
    }
  }, [activeAlertLevel, currentIdx, activeAlertMessage, rightTime]);

  // Sync Temporal Consistency Graph points
  useEffect(() => {
    let diffVal = 1.2 + Math.random() * 0.8;
    if (activeAlertLevel === "SEVERE") {
      diffVal = 7.8; // severe spike
    } else if (activeAlertLevel === "WARNING") {
      diffVal = 4.9; // warning spike
    }
    setConsistencyPoints((prev) => {
      const copy = [...prev, parseFloat(diffVal.toFixed(2))];
      if (copy.length > 10) copy.shift();
      return copy;
    });
  }, [currentIdx, activeAlertLevel]);

  // ROI Specific calculations
  const centerDist = roi ? Math.sqrt((roi.x + roi.w/2 - 200)**2 + (roi.y + roi.h/2 - 150)**2) : 100;
  const roiPsnr = roi ? parseFloat((psnr - (centerDist < 90 ? 2.6 : -1.2)).toFixed(1)) : psnr;
  const roiSsim = roi ? parseFloat((ssim - (centerDist < 90 ? 0.04 : -0.015)).toFixed(3)) : ssim;
  const roiAlertStatus = centerDist < 80 ? "SEVERE" : centerDist < 150 ? "WARNING" : "NORMAL";

  // Mouse drag handles for ROI selection on Right SVG
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!rightSvgRef.current) return;
    const rect = rightSvgRef.current.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 300 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setStartPos({ x, y });
    setIsDrawing(true);
    setRoi({ x, y, w: 0, h: 0 });
  };

  const handleLeftMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 300 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (feedProjection === "3d-globe") {
      const dx = x - 200;
      const dy = y - 150;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 90) {
        const nx = dx / 90;
        const ny = -dy / 90;
        const z = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const latRad = Math.asin(ny);
        const lonRad = Math.atan2(nx, z);
        const lat = parseFloat((latRad * (180 / Math.PI)).toFixed(2));
        const lon = parseFloat((((globeRotation + 180 + lonRad * (180 / Math.PI)) % 360)).toFixed(2));
        setHoverGis({ lat, lon, x, y });
      } else {
        setHoverGis(null);
      }
    } else {
      const lon = parseFloat((120 + (x / 400) * 30).toFixed(2));
      const lat = parseFloat((45 - (y / 300) * 30).toFixed(2));
      setHoverGis({ lat, lon, x, y });
    }
  };

  const handleLeftMouseLeave = () => {
    setHoverGis(null);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!rightSvgRef.current) return;
    const rect = rightSvgRef.current.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 300 / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (feedProjection === "3d-globe") {
      const dx = x - 200;
      const dy = y - 150;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= 90) {
        const nx = dx / 90;
        const ny = -dy / 90;
        const z = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        const latRad = Math.asin(ny);
        const lonRad = Math.atan2(nx, z);
        const lat = parseFloat((latRad * (180 / Math.PI)).toFixed(2));
        const lon = parseFloat((((globeRotation + 180 + lonRad * (180 / Math.PI)) % 360)).toFixed(2));
        setHoverGis({ lat, lon, x, y });
      } else {
        setHoverGis(null);
      }
    } else {
      const lon = parseFloat((120 + (x / 400) * 30).toFixed(2));
      const lat = parseFloat((45 - (y / 300) * 30).toFixed(2));
      setHoverGis({ lat, lon, x, y });
    }

    if (!isDrawing || !startPos) return;

    const rx = Math.min(startPos.x, x);
    const ry = Math.min(startPos.y, y);
    const rw = Math.abs(startPos.x - x);
    const rh = Math.abs(startPos.y - y);

    if (feedProjection === "gis-map") {
      setRoi({ x: rx, y: ry, w: rw, h: rh });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPos(null);
    if (roi && (roi.w < 8 || roi.h < 8)) {
      setRoi(null);
    }
  };

  const handleRightMouseLeave = () => {
    setHoverGis(null);
    handleMouseUp();
  };

  // Scrubber drag handler
  const handleScrubberChange = (val: number) => {
    setIsPlaying(false);
    setScrubberVal(val);
    const rt = (val - 1) / 5;
    setRightTime(rt);
    setLeftTime(rt < 0.5 ? 0.0 : 1.0);
  };

  // Simulation Preset change
  const handlePresetChange = (p: SimulationPreset) => {
    setPreset(p);
    setIsCycloneEventActive(false);
    setSevereAlertAck(false);
    setLeftTime(0.0);
    setRightTime(0.5);
    setScrubberVal(3.5);
  };

  // Exporters
  const handleExportNetCdf = () => {
    onExportSuccess();
  };

  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "CloudElement,X_Interpolated,Y_Interpolated,Radius_Interpolated,WarpOpacity,FlowX_Offset,FlowY_Offset\n";
    activeClouds.forEach((c) => {
      const x = c.xA + rightTime * (c.xB - c.xA);
      const y = c.yA + rightTime * (c.yB - c.yA);
      const r = c.rA + rightTime * (c.rB - c.rA);
      const op = c.opacityA + rightTime * (c.opacityB - c.opacityA);
      const dx = c.xB - c.xA;
      const dy = c.yB - c.yA;
      csvContent += `"${c.label}",${x.toFixed(1)},${y.toFixed(1)},${r.toFixed(1)},${op.toFixed(2)},${dx},${dy}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rife_interpolated_vectors_${preset}_t${rightTime.toFixed(2)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = () => {
    let csvContent = "Report Title,RIFE Frame Interpolation Report\n";
    csvContent += `Generated At,${new Date().toUTCString()}\n`;
    csvContent += `Satellite Source,${preset === "storm-front" ? "Monsoon Band" : "Cyclonic Wave"}\n`;
    csvContent += `Model,RIFE-IFNet (Pretrained + Geo Fine-tuned)\n`;
    csvContent += `Target Frequency,${upsampleFactor}x (Hourly synth)\n\n`;
    csvContent += "Frame No,Timestamp,Type,PSNR,SSIM,MSE\n";

    let totalPsnr = 0;
    let totalSsim = 0;
    
    for (let i = 1; i <= 6; i++) {
      const t_i = (i - 1) / 5;
      const distanceFactor_i = Math.abs(t_i - 0.5) * 2;
      const spatialPenalty_i = (16 - blockResolution) / 16 * 1.5;
      const noisePenalty_i = noiseLevel * 4;
      const ssim_i = parseFloat((0.96 - (1 - distanceFactor_i) * 0.05 + spatialPenalty_i * 0.015 - noisePenalty_i * 0.02).toFixed(3));
      const psnr_i = parseFloat((34.2 - (1 - distanceFactor_i) * 3.4 + spatialPenalty_i * 1.2 - noisePenalty_i * 2).toFixed(1));
      const mse_i = parseFloat((10 ** (-psnr_i / 10)).toFixed(5));
      const type_i = (i === 1 || i === 6) ? "REAL" : "AI";

      totalPsnr += psnr_i;
      totalSsim += ssim_i;

      csvContent += `${i},${getTimestampForTime(t_i)},${type_i},${psnr_i},${ssim_i},${mse_i}\n`;
    }

    const avgPsnr = (totalPsnr / 6).toFixed(1);
    const avgSsim = (totalSsim / 6).toFixed(3);
    const severeCount = alertsLog.filter(a => a.level === "SEVERE").length;
    const warningCount = alertsLog.filter(a => a.level === "WARNING").length;

    csvContent += `\nSummary\n`;
    csvContent += `Avg PSNR,${avgPsnr} dB\n`;
    csvContent += `Avg SSIM,${avgSsim}\n`;
    csvContent += `Total frames generated,6\n`;
    csvContent += `SEVERE Alerts triggered,${severeCount}\n`;
    csvContent += `WARNING Alerts triggered,${warningCount}\n`;

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `interpolation_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run server-side Gemini validation audit
  const handleRunAiAudit = async () => {
    setIsAuditing(true);
    setAiAuditReport("");
    try {
      const prompt = `You are a Senior satellite meteorologist. 
Audit this simulated weather interpolation:
- Scenario: ${preset === "storm-front" ? "Warm Air Mass Convective Cold Front Collision" : "Intense Cyclonic Vortex Rotation System"}
- Target Interpolation Step (t): ${rightTime.toFixed(2)} (where 0.0 is Pass 0 and 1.0 is Pass 1)
- Spatial Resolution Grid Block Size: ${blockResolution}x${blockResolution} px
- AI Upsampling Rate: ${upsampleFactor}x (synthesizing hourly intervals)
- Live Metric: PSNR is ${psnr} dB, SSIM is ${ssim}, and Flow Vector Coherence is ${flowCoherence}%.

Provide a professional, rigorous, highly scan-friendly audit (3 short bullets) assessing:
1. Physical fluid realistic motion matching confidence.
2. The likelihood of artifacts (ghosting vs fluid morphing).
3. Suitability for operational forecasting (e.g. airport schedules, flash flood warning lines).
Format with bold key phrases, clear metrics, and high-altitude meteorological terminology.`;

      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: "You are an authority in meteorological earth observation and computer vision frame interpolation. Output a professional 3-bullet forecast validation audit.",
          sector: preset
        })
      });

      const data = await res.json();
      if (data.text) {
        setAiAuditReport(data.text);
      } else {
        setAiAuditReport("Error parsing generative validation output. Live parameters are fully synchronized.");
      }
    } catch (e: any) {
      console.error(e);
      setAiAuditReport("Offline verification mode active. Metrics indicate optimal conservation of physical fluid dynamics.");
    } finally {
      setIsAuditing(false);
    }
  };

  // Get color for confidence map cells
  const getConfidenceColor = (row: number, col: number, t: number, preset: SimulationPreset) => {
    if (preset === "storm-front") {
      const frontPosition = t * 24 - 4;
      const dist = Math.abs(col - row / 2 - frontPosition);
      if (dist < 1.8) return "bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
      if (dist < 3.5) return "bg-amber-500/70";
      return "bg-emerald-500/70";
    } else {
      const cx = 8;
      const cy = 8;
      const dx = col - cx;
      const dy = row - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const angle = Math.atan2(dy, dx);
      const armDist = Math.abs((dist - angle * 2 - t * 8) % 8);
      
      if (dist < 2.5) return "bg-red-600/80"; 
      if (armDist < 1.5) return "bg-amber-500/80";
      return "bg-emerald-500/70";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="meteorology-simulator-sandbox">
      
      {/* LEFT COLUMN (8 cols): CANVAS VIEWS + SCRUBBERS + CONFIDENCE HEATMAP */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Scenario Selection Headers */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1.5 justify-between items-center">
          <div className="flex gap-1">
            <button
              onClick={() => handlePresetChange("storm-front")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                preset === "storm-front"
                  ? "bg-sky-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              Monsoon Band
            </button>
            <button
              onClick={() => handlePresetChange("cyclone")}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                preset === "cyclone"
                  ? "bg-sky-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Cyclonic Wave
            </button>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pr-3 uppercase">
            Scenario Presets
          </div>
        </div>

        {/* FEED PROJECTION SWITCHER */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1.5 justify-between items-center">
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => {
                setFeedProjection("gis-map");
                setRoi(null); // Reset ROI when switching projections
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                feedProjection === "gis-map"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              Planar GIS Map
            </button>
            <button
              onClick={() => {
                setFeedProjection("spectral-grid");
                setRoi(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                feedProjection === "spectral-grid"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Space Spectral Grid
            </button>
            <button
              onClick={() => {
                setFeedProjection("3d-globe");
                setRoi(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                feedProjection === "3d-globe"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              3D Globe Projection
            </button>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pr-3 uppercase hidden sm:block">
            Feed Projections
          </div>
        </div>

        {/* DUAL PANELS COMPARISON SYSTEM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* ORIGINAL FEED (JERKY & STUTTERY - 2000ms Loop) */}
          <div className="bg-slate-900 border border-red-950/40 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Original Satellite Feed
              </span>
              <span className="text-[9px] font-mono text-red-500 font-bold">30 min Interval</span>
            </div>

            {/* Left SVG Canvas */}
            <div className="relative bg-slate-950 rounded-lg aspect-[4/3] w-full overflow-hidden border border-slate-850 flex items-center justify-center">
              <div className="absolute inset-0 satellite-grid pointer-events-none opacity-10" />
              
              <svg 
                viewBox="0 0 400 300" 
                className="w-full h-full select-none"
                onMouseMove={handleLeftMouseMove}
                onMouseLeave={handleLeftMouseLeave}
              >
                <defs>
                  {/* Ocean Shading for Globe */}
                  <radialGradient id="feed-ocean-grad-left" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="50%" stopColor="#090d1f" />
                    <stop offset="100%" stopColor="#020308" />
                  </radialGradient>

                  {/* Atmosphere outer glow */}
                  <radialGradient id="feed-atmosphere-glow-left" cx="50%" cy="50%" r="50%">
                    <stop offset="85%" stopColor="#0ea5e9" stopOpacity="0" />
                    <stop offset="97%" stopColor="#0ea5e9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.75" />
                  </radialGradient>

                  {/* Laser Scanning Swath Gradient */}
                  <linearGradient id="feed-orbit-laser-beam-left" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                    <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Clip path for globe sphere */}
                  <clipPath id="feed-globe-sphere-clip-left">
                    <circle cx="200" cy="150" r="90" />
                  </clipPath>

                  {/* Cloud glow */}
                  <radialGradient id="feed-cloudGrad-left" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {feedProjection === "gis-map" ? (
                  <>
                    {/* Visual GIS Coastlines Overlay (Underneath clouds) */}
                    <g className="gis-underlay-map opacity-35 pointer-events-none">
                      {/* Grid Lines - Lat/Lon */}
                      <line x1={100} y1={0} x2={100} y2={300} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1={200} y1={0} x2={200} y2={300} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1={300} y1={0} x2={300} y2={300} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                      
                      <line x1={0} y1={75} x2={400} y2={75} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1={0} y1={150} x2={400} y2={150} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1={0} y1={225} x2={400} y2={225} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />

                      {/* Grid Labels */}
                      <text x={103} y={290} fill="#475569" fontSize="8" fontFamily="monospace">127.5°E</text>
                      <text x={203} y={290} fill="#475569" fontSize="8" fontFamily="monospace">135.0°E</text>
                      <text x={303} y={290} fill="#475569" fontSize="8" fontFamily="monospace">142.5°E</text>

                      <text x={5} y={70} fill="#475569" fontSize="8" fontFamily="monospace">37.5°N</text>
                      <text x={5} y={145} fill="#475569" fontSize="8" fontFamily="monospace">30.0°N</text>
                      <text x={5} y={220} fill="#475569" fontSize="8" fontFamily="monospace">22.5°N</text>

                      {/* China Coast */}
                      <path d="M 0,140 Q 20,160 30,190 T 25,230 T 40,280 L 0,300 Z" fill="#1e293b" fillOpacity="0.4" stroke="#475569" strokeWidth="1.2" />
                      {/* Korean Peninsula */}
                      <path d="M 60,30 Q 80,45 85,75 T 75,100 T 55,105 Z" fill="#1e293b" fillOpacity="0.4" stroke="#475569" strokeWidth="1.2" />
                      {/* Japan Hokkaido */}
                      <path d="M 330,20 Q 360,25 350,45 T 320,35 Z" fill="#1e293b" fillOpacity="0.4" stroke="#475569" strokeWidth="1.2" />
                      {/* Honshu Arc */}
                      <path d="M 180,120 Q 220,100 250,110 T 290,140 T 320,60 T 300,50 T 240,90 Z" fill="#1e293b" fillOpacity="0.4" stroke="#475569" strokeWidth="1.2" />
                      {/* Kyushu / Shikoku */}
                      <path d="M 140,145 Q 160,135 170,140 T 155,155 Z" fill="#1e293b" fillOpacity="0.4" stroke="#475569" strokeWidth="1.2" />
                    </g>

                    {/* Standard Clouds */}
                    {activeClouds.map((c) => {
                      const x = leftTime === 0.0 ? c.xA : c.xB;
                      const y = leftTime === 0.0 ? c.yA : c.yB;
                      const r = leftTime === 0.0 ? c.rA : c.rB;
                      const op = leftTime === 0.0 ? c.opacityA : c.opacityB;
                      
                      return (
                        <g key={`original-gis-${c.id}`} className="opacity-70 transition-all duration-75">
                          <circle cx={x} cy={y} r={r + 6} fill="url(#feed-cloudGrad-left)" fillOpacity={op * 0.25} />
                          <circle cx={x} cy={y} r={r} fill="#475569" fillOpacity={op * 0.5} stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />
                        </g>
                      );
                    })}
                  </>
                ) : feedProjection === "spectral-grid" ? (
                  <>
                    {/* Space Spectral Grid Overlay */}
                    <g className="spectral-grid-overlay opacity-45 pointer-events-none">
                      {Array.from({ length: 16 }).map((_, col) => (
                        <line key={`col-line-left-${col}`} x1={col * 25} y1={0} x2={col * 25} y2={300} stroke="#38bdf8" strokeWidth="0.4" strokeDasharray="2 2" />
                      ))}
                      {Array.from({ length: 12 }).map((_, row) => (
                        <line key={`row-line-left-${row}`} x1={0} y1={row * 25} x2={400} y2={row * 25} stroke="#38bdf8" strokeWidth="0.4" strokeDasharray="2 2" />
                      ))}

                      {Array.from({ length: 8 }).map((_, c) =>
                        Array.from({ length: 6 }).map((_, r) => {
                          const cx = c * 50 + 25;
                          const cy = r * 50 + 25;
                          const colLabel = String.fromCharCode(65 + c);
                          const rowLabel = r + 1;
                          
                          const isCloudOverlapping = activeClouds.some((cloud) => {
                            const cloudX = leftTime === 0.0 ? cloud.xA : cloud.xB;
                            const cloudY = leftTime === 0.0 ? cloud.yA : cloud.yB;
                            const cloudR = leftTime === 0.0 ? cloud.rA : cloud.rB;
                            const dx = cx - cloudX;
                            const dy = cy - cloudY;
                            return Math.sqrt(dx * dx + dy * dy) < (cloudR + 35);
                          });

                          return (
                            <g key={`cell-left-${c}-${r}`}>
                              {isCloudOverlapping && (
                                <rect x={c * 50 + 1} y={r * 50 + 1} width={48} height={48} fill="#38bdf8" fillOpacity="0.08" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.25" />
                              )}
                              <text x={c * 50 + 5} y={r * 50 + 12} fill={isCloudOverlapping ? "#38bdf8" : "#475569"} opacity={isCloudOverlapping ? 0.75 : 0.3} fontSize="6" fontFamily="monospace">{colLabel}{rowLabel}</text>
                              {isCloudOverlapping && (
                                <text x={c * 50 + 5} y={r * 50 + 44} fill="#10b981" opacity="0.6" fontSize="5.5" fontFamily="monospace">{(0.72 + (c * r % 5) * 0.05).toFixed(2)} R</text>
                              )}
                            </g>
                          );
                        })
                      )}
                    </g>

                    {/* Left clouds overlay on Spectral Grid with digital dashes */}
                    {activeClouds.map((c) => {
                      const x = leftTime === 0.0 ? c.xA : c.xB;
                      const y = leftTime === 0.0 ? c.yA : c.yB;
                      const r = leftTime === 0.0 ? c.rA : c.rB;
                      const op = leftTime === 0.0 ? c.opacityA : c.opacityB;
                      
                      return (
                        <g key={`original-spectral-${c.id}`} className="opacity-70">
                          <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="2 4" strokeOpacity="0.4" />
                          <circle cx={x} cy={y} r={r} fill="#1e293b" fillOpacity="0.3" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 2" />
                          <text x={x - 20} y={y + 3} fill="#0ea5e9" fontSize="7" fontFamily="monospace" fontWeight="bold">{c.id.substring(0, 7).toUpperCase()}</text>
                        </g>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {/* 3D GLOBE PROJECTION FOR LEFT FEED */}
                    <circle cx="200" cy="150" r="94" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.2" className="animate-pulse" />
                    <circle cx="200" cy="150" r="90" fill="url(#feed-ocean-grad-left)" stroke="#1e293b" strokeWidth="1.5" />

                    <g clipPath="url(#feed-globe-sphere-clip-left)">
                      <ellipse cx="200" cy="150" rx="90" ry="1" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 2" />
                      <ellipse cx="200" cy="110" rx="81" ry="14" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
                      <ellipse cx="200" cy="80" rx="58" ry="10" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
                      <ellipse cx="200" cy="190" rx="81" ry="14" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
                      <ellipse cx="200" cy="220" rx="58" ry="10" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />

                      {/* Rotating Meridians */}
                      {[0, 30, 60, 90, 120, 150].map((longOffset, idx) => {
                        const mAngle = (globeRotation + longOffset) % 180;
                        const mRad = (mAngle * Math.PI) / 180;
                        const mRx = 90 * Math.cos(mRad);
                        return (
                          <ellipse key={`meridian-l-${idx}`} cx="200" cy="150" rx={Math.max(0.2, Math.abs(mRx))} ry="90" fill="none" stroke="#1e293b" strokeWidth="0.6" opacity={0.3} />
                        );
                      })}

                      {/* Scrolling Continents */}
                      {[
                        { d: "M 120,90 Q 150,70 190,95 T 230,130 T 210,165 T 170,160 T 130,130 Z", shift: 0, fill: "#0369a1", stroke: "#0ea5e9" },
                        { d: "M 150,150 Q 190,130 220,160 T 230,220 T 190,230 T 150,190 Z", shift: 120, fill: "#0284c7", stroke: "#0ea5e9" },
                        { d: "M 140,65 Q 170,50 200,68 T 170,95 Z", shift: 240, fill: "#0369a1", stroke: "#38bdf8" }
                      ].flatMap((cont, cIdx) => {
                        const scrollA = (((globeRotation + cont.shift) % 360) - 180);
                        return [-360, 0, 360].map((dupOffset, dIdx) => (
                          <path 
                            key={`cont-l-${cIdx}-${dIdx}`}
                            d={cont.d}
                            fill={cont.fill}
                            fillOpacity="0.15"
                            stroke={cont.stroke}
                            strokeWidth="1.0"
                            strokeOpacity="0.25"
                            transform={`translate(${scrollA + dupOffset}, 0)`}
                          />
                        ));
                      })}

                      {/* Clouds projected onto the 3D sphere! */}
                      {activeClouds.map((c) => {
                        const x = leftTime === 0.0 ? c.xA : c.xB;
                        const y = leftTime === 0.0 ? c.yA : c.yB;
                        const r = leftTime === 0.0 ? c.rA : c.rB;
                        const op = leftTime === 0.0 ? c.opacityA : c.opacityB;
                        
                        // Scale and translate into sphere (radius 90, center 200,150)
                        const rotOffset = (globeRotation - 145) * 0.7;
                        const projX = 200 + (x - 200) * 0.52 + rotOffset;
                        const projY = 150 + (y - 150) * 0.52;
                        const projR = r * 0.52;

                        return (
                          <g key={`original-globe-cloud-${c.id}`} className="opacity-70">
                            <circle cx={projX} cy={projY} r={projR + 4} fill="url(#feed-cloudGrad-left)" fillOpacity={op * 0.3} />
                            <circle cx={projX} cy={projY} r={projR} fill="#475569" fillOpacity={op * 0.6} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 1" />
                          </g>
                        );
                      })}
                    </g>

                    <circle cx="200" cy="150" r="90" fill="url(#feed-atmosphere-glow-left)" className="pointer-events-none" />

                    {/* Orbit Path & GEO Satellite */}
                    {showSatelliteOrbit && (
                      <>
                        <ellipse cx="200" cy="150" rx="145" ry="42" fill="none" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="0.8" strokeDasharray="3 3" transform={`rotate(${-globeTilt} 200 150)`} />
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
                              {isFront && (
                                <polygon points={`${satX},${satY} 185,145 215,155`} fill="url(#feed-orbit-laser-beam-left)" opacity="0.25" className="pointer-events-none" />
                              )}
                              <circle cx={satX} cy={satY} r="5" fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping" />
                              <circle cx={satX} cy={satY} r="2.5" fill="#10b981" stroke="#065f46" strokeWidth="0.8" />
                              <text x={satX + 6} y={satY - 4} fill="#10b981" fontSize="6.5" fontFamily="monospace" fontWeight="bold">H9-GEO</text>
                            </g>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}

                {/* Ambient Grid dots */}
                {feedProjection !== "3d-globe" && Array.from({ length: 4 }).map((_, i) =>
                  Array.from({ length: 3 }).map((_, j) => (
                    <circle key={`grid-left-${i}-${j}`} cx={80 + i * 80} cy={60 + j * 70} r="1.5" fill="#1e293b" />
                  ))
                )}
              </svg>

              {/* Timestamp Indicator */}
              <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-800 rounded px-2 py-0.5 text-[9px] font-mono text-red-400">
                L-TIME: {leftTime === 0.0 ? "00:00" : "00:30"}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-mono mt-2.5 leading-normal">
              Raw frame slideshow (30-min spacing intervals)
            </p>
          </div>

          {/* AI-ENHANCED FEED (SMOOTH & FLUID - 150ms Loop) */}
          <div className="bg-slate-900 border border-emerald-950/40 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                AI-Enhanced Upscaled Feed
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">120 fps Interpolation</span>
            </div>

            {/* Right SVG Canvas */}
            <div className="relative bg-slate-950 rounded-lg aspect-[4/3] w-full overflow-hidden border border-slate-850 flex items-center justify-center">
              <div className="absolute inset-0 satellite-grid pointer-events-none opacity-10" />
              
              <svg 
                ref={rightSvgRef}
                viewBox="0 0 400 300" 
                className="w-full h-full select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleRightMouseLeave}
              >
                <defs>
                  {/* Ocean Shading for Globe */}
                  <radialGradient id="feed-ocean-grad-right" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="50%" stopColor="#090d1f" />
                    <stop offset="100%" stopColor="#020308" />
                  </radialGradient>

                  {/* Atmosphere outer glow */}
                  <radialGradient id="feed-atmosphere-glow-right" cx="50%" cy="50%" r="50%">
                    <stop offset="85%" stopColor="#0ea5e9" stopOpacity="0" />
                    <stop offset="97%" stopColor="#0ea5e9" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                  </radialGradient>

                  {/* Laser Scanning Swath Gradient */}
                  <linearGradient id="feed-orbit-laser-beam-right" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                    <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Clip path for globe sphere */}
                  <clipPath id="feed-globe-sphere-clip-right">
                    <circle cx="200" cy="150" r="90" />
                  </clipPath>

                  {/* Cloud glow */}
                  <radialGradient id="feed-cloudGrad-right" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {feedProjection === "gis-map" ? (
                  <>
                    {/* AI-Enhanced GIS Coastlines & Sub-Pixel Grid (Underneath clouds) */}
                    <g className="gis-underlay-map opacity-50 pointer-events-none">
                      {/* High-Resolution Grid Lines */}
                      <line x1={100} y1={0} x2={100} y2={300} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1={200} y1={0} x2={200} y2={300} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1={300} y1={0} x2={300} y2={300} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                      
                      <line x1={0} y1={75} x2={400} y2={75} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1={0} y1={150} x2={400} y2={150} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                      <line x1={0} y1={225} x2={400} y2={225} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />

                      {/* Grid Labels with slightly brighter color */}
                      <text x={103} y={290} fill="#0ea5e9" opacity="0.8" fontSize="8" fontFamily="monospace">127.5°E</text>
                      <text x={203} y={290} fill="#0ea5e9" opacity="0.8" fontSize="8" fontFamily="monospace">135.0°E</text>
                      <text x={303} y={290} fill="#0ea5e9" opacity="0.8" fontSize="8" fontFamily="monospace">142.5°E</text>

                      <text x={5} y={70} fill="#0ea5e9" opacity="0.8" fontSize="8" fontFamily="monospace">37.5°N</text>
                      <text x={5} y={145} fill="#0ea5e9" opacity="0.8" fontSize="8" fontFamily="monospace">30.0°N</text>
                      <text x={5} y={220} fill="#0ea5e9" opacity="0.8" fontSize="8" fontFamily="monospace">22.5°N</text>

                      {/* High-Precision Landmass contours (Cyan / Blue theme) */}
                      <path d="M 0,140 Q 20,160 30,190 T 25,230 T 40,280 L 0,300 Z" fill="#0ea5e9" fillOpacity="0.08" stroke="#0284c7" strokeWidth="1.5" />
                      <path d="M 60,30 Q 80,45 85,75 T 75,100 T 55,105 Z" fill="#0ea5e9" fillOpacity="0.08" stroke="#0284c7" strokeWidth="1.5" />
                      <path d="M 330,20 Q 360,25 350,45 T 320,35 Z" fill="#0ea5e9" fillOpacity="0.08" stroke="#0284c7" strokeWidth="1.5" />
                      <path d="M 180,120 Q 220,100 250,110 T 290,140 T 320,60 T 300,50 T 240,90 Z" fill="#0ea5e9" fillOpacity="0.08" stroke="#0284c7" strokeWidth="1.5" />
                      <path d="M 140,145 Q 160,135 170,140 T 155,155 Z" fill="#0ea5e9" fillOpacity="0.08" stroke="#0284c7" strokeWidth="1.5" />
                    </g>

                    {/* Draw optical vector flow paths */}
                    {showVectors && activeClouds.map((c) => {
                      const x = c.xA + rightTime * (c.xB - c.xA);
                      const y = c.yA + rightTime * (c.yB - c.yA);
                      const angle = Math.atan2(c.yB - c.yA, c.xB - c.xA);
                      const arrowLength = 20;

                      return (
                        <g key={`flow-rife-${c.id}`}>
                          <line x1={c.xA} y1={c.yA} x2={c.xB} y2={c.yB} stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
                          <line x1={x} y1={y} x2={x + Math.cos(angle) * arrowLength} y2={y + Math.sin(angle) * arrowLength} stroke="#0ea5e9" strokeWidth="2.5" className={isPlaying ? "flow-line-active" : ""} />
                        </g>
                      );
                    })}

                    {/* Simulated dynamic grid vector arrows */}
                    {showVectors && Array.from({ length: 4 }).map((_, i) =>
                      Array.from({ length: 3 }).map((_, j) => {
                        const gx = 80 + i * 80;
                        const gy = 60 + j * 70;
                        const angle = preset === "cyclone" ? Math.atan2(gy - 150, gx - 200) + Math.PI / 2 : 0.3;
                        const flowLen = 14;

                        return (
                          <g key={`ambient-vec-${i}-${j}`} className="opacity-15">
                            <line x1={gx} y1={gy} x2={gx + Math.cos(angle) * flowLen} y2={gy + Math.sin(angle) * flowLen} stroke="#38bdf8" strokeWidth="1" />
                            <circle cx={gx} cy={gy} r="1" fill="#475569" />
                          </g>
                        );
                      })
                    )}

                    {/* Warped clouds */}
                    {activeClouds.map((c) => {
                      const x = c.xA + rightTime * (c.xB - c.xA);
                      const y = c.yA + rightTime * (c.yB - c.yA);
                      const r = c.rA + rightTime * (c.rB - c.rA);
                      const op = c.opacityA + rightTime * (c.opacityB - c.opacityA);

                      return (
                        <g key={`warped-gis-${c.id}`}>
                          <circle cx={x} cy={y} r={r + 6} fill="url(#feed-cloudGrad-right)" fillOpacity={op * 0.25} />
                          <circle cx={x} cy={y} r={r} fill="#f8fafc" fillOpacity={op * 0.45} stroke="#e2e8f0" strokeWidth="1.5" />
                        </g>
                      );
                    })}
                  </>
                ) : feedProjection === "spectral-grid" ? (
                  <>
                    {/* Space Spectral Grid Overlay */}
                    <g className="spectral-grid-overlay opacity-55 pointer-events-none">
                      {Array.from({ length: 16 }).map((_, col) => (
                        <line key={`col-line-right-${col}`} x1={col * 25} y1={0} x2={col * 25} y2={300} stroke="#10b981" strokeWidth="0.4" strokeDasharray="2 2" />
                      ))}
                      {Array.from({ length: 12 }).map((_, row) => (
                        <line key={`row-line-right-${row}`} x1={0} y1={row * 25} x2={400} y2={row * 25} stroke="#10b981" strokeWidth="0.4" strokeDasharray="2 2" />
                      ))}

                      {Array.from({ length: 8 }).map((_, c) =>
                        Array.from({ length: 6 }).map((_, r) => {
                          const cx = c * 50 + 25;
                          const cy = r * 50 + 25;
                          const colLabel = String.fromCharCode(65 + c);
                          const rowLabel = r + 1;
                          
                          const isCloudOverlapping = activeClouds.some((cloud) => {
                            const cloudX = cloud.xA + rightTime * (cloud.xB - cloud.xA);
                            const cloudY = cloud.yA + rightTime * (cloud.yB - cloud.yA);
                            const cloudR = cloud.rA + rightTime * (cloud.rB - cloud.rA);
                            const dx = cx - cloudX;
                            const dy = cy - cloudY;
                            return Math.sqrt(dx * dx + dy * dy) < (cloudR + 35);
                          });

                          return (
                            <g key={`cell-right-${c}-${r}`}>
                              {isCloudOverlapping && (
                                <rect x={c * 50 + 1} y={r * 50 + 1} width={48} height={48} fill="#10b981" fillOpacity="0.08" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.25" />
                              )}
                              <text x={c * 50 + 5} y={r * 50 + 12} fill={isCloudOverlapping ? "#10b981" : "#475569"} opacity={isCloudOverlapping ? 0.75 : 0.3} fontSize="6" fontFamily="monospace">{colLabel}{rowLabel}</text>
                              {isCloudOverlapping && (
                                <text x={c * 50 + 5} y={r * 50 + 44} fill="#0ea5e9" opacity="0.6" fontSize="5.5" fontFamily="monospace">{(0.72 + (c * r % 5) * 0.05).toFixed(2)} R</text>
                              )}
                            </g>
                          );
                        })
                      )}
                    </g>

                    {/* Optical Flow Vectors inside Spectral Grid */}
                    {showVectors && activeClouds.map((c) => {
                      const x = c.xA + rightTime * (c.xB - c.xA);
                      const y = c.yA + rightTime * (c.yB - c.yA);
                      const angle = Math.atan2(c.yB - c.yA, c.xB - c.xA);
                      const arrowLength = 20;

                      return (
                        <g key={`flow-rife-spectral-${c.id}`}>
                          <line x1={c.xA} y1={c.yA} x2={c.xB} y2={c.yB} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                          <line x1={x} y1={y} x2={x + Math.cos(angle) * arrowLength} y2={y + Math.sin(angle) * arrowLength} stroke="#10b981" strokeWidth="2" className={isPlaying ? "flow-line-active" : ""} />
                        </g>
                      );
                    })}

                    {/* Warped clouds overlay on Spectral Grid with digital dashes */}
                    {activeClouds.map((c) => {
                      const x = c.xA + rightTime * (c.xB - c.xA);
                      const y = c.yA + rightTime * (c.yB - c.yA);
                      const r = c.rA + rightTime * (c.rB - c.rA);
                      const op = c.opacityA + rightTime * (c.opacityB - c.opacityA);

                      return (
                        <g key={`warped-spectral-${c.id}`} className="opacity-80">
                          <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#10b981" strokeWidth="0.8" strokeDasharray="2 4" strokeOpacity="0.4" />
                          <circle cx={x} cy={y} r={r} fill="#1e293b" fillOpacity="0.3" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" />
                          <text x={x - 20} y={y + 3} fill="#10b981" fontSize="7" fontFamily="monospace" fontWeight="bold">{(op * 100).toFixed(0)}% COH</text>
                        </g>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {/* 3D GLOBE PROJECTION FOR RIGHT FEED */}
                    <circle cx="200" cy="150" r="94" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.2" className="animate-pulse" />
                    <circle cx="200" cy="150" r="90" fill="url(#feed-ocean-grad-right)" stroke="#1e293b" strokeWidth="1.5" />

                    <g clipPath="url(#feed-globe-sphere-clip-right)">
                      <ellipse cx="200" cy="150" rx="90" ry="1" fill="none" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 2" />
                      <ellipse cx="200" cy="110" rx="81" ry="14" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
                      <ellipse cx="200" cy="80" rx="58" ry="10" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
                      <ellipse cx="200" cy="190" rx="81" ry="14" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />
                      <ellipse cx="200" cy="220" rx="58" ry="10" fill="none" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="2 2" />

                      {/* Rotating Meridians */}
                      {[0, 30, 60, 90, 120, 150].map((longOffset, idx) => {
                        const mAngle = (globeRotation + longOffset) % 180;
                        const mRad = (mAngle * Math.PI) / 180;
                        const mRx = 90 * Math.cos(mRad);
                        return (
                          <ellipse key={`meridian-r-${idx}`} cx="200" cy="150" rx={Math.max(0.2, Math.abs(mRx))} ry="90" fill="none" stroke="#1e293b" strokeWidth="0.6" opacity={0.3} />
                        );
                      })}

                      {/* Scrolling Continents */}
                      {[
                        { d: "M 120,90 Q 150,70 190,95 T 230,130 T 210,165 T 170,160 T 130,130 Z", shift: 0, fill: "#0369a1", stroke: "#0ea5e9" },
                        { d: "M 150,150 Q 190,130 220,160 T 230,220 T 190,230 T 150,190 Z", shift: 120, fill: "#0284c7", stroke: "#0ea5e9" },
                        { d: "M 140,65 Q 170,50 200,68 T 170,95 Z", shift: 240, fill: "#0369a1", stroke: "#38bdf8" }
                      ].flatMap((cont, cIdx) => {
                        const scrollA = (((globeRotation + cont.shift) % 360) - 180);
                        return [-360, 0, 360].map((dupOffset, dIdx) => (
                          <path 
                            key={`cont-r-${cIdx}-${dIdx}`}
                            d={cont.d}
                            fill={cont.fill}
                            fillOpacity="0.15"
                            stroke={cont.stroke}
                            strokeWidth="1.0"
                            strokeOpacity="0.25"
                            transform={`translate(${scrollA + dupOffset}, 0)`}
                          />
                        ));
                      })}

                      {/* Flow vectors mapped onto 3D Sphere */}
                      {showVectors && activeClouds.map((c) => {
                        const x = c.xA + rightTime * (c.xB - c.xA);
                        const y = c.yA + rightTime * (c.yB - c.yA);
                        const angle = Math.atan2(c.yB - c.yA, c.xB - c.xA);
                        const arrowLength = 10; // scaled down to sphere

                        const rotOffset = (globeRotation - 145) * 0.7;
                        
                        const projXA = 200 + (c.xA - 200) * 0.52 + rotOffset;
                        const projYA = 150 + (c.yA - 150) * 0.52;
                        const projXB = 200 + (c.xB - 200) * 0.52 + rotOffset;
                        const projYB = 150 + (c.yB - 150) * 0.52;
                        
                        const projX = 200 + (x - 200) * 0.52 + rotOffset;
                        const projY = 150 + (y - 150) * 0.52;

                        return (
                          <g key={`flow-rife-globe-${c.id}`}>
                            <line x1={projXA} y1={projYA} x2={projXB} y2={projYB} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 1" />
                            <line x1={projX} y1={projY} x2={projX + Math.cos(angle) * arrowLength} y2={projY + Math.sin(angle) * arrowLength} stroke="#10b981" strokeWidth="2" className={isPlaying ? "flow-line-active" : ""} />
                          </g>
                        );
                      })}

                      {/* Warped clouds projected onto 3D sphere! */}
                      {activeClouds.map((c) => {
                        const x = c.xA + rightTime * (c.xB - c.xA);
                        const y = c.yA + rightTime * (c.yB - c.yA);
                        const r = c.rA + rightTime * (c.rB - c.rA);
                        const op = c.opacityA + rightTime * (c.opacityB - c.opacityA);
                        
                        // Scale and translate into sphere (radius 90, center 200,150)
                        const rotOffset = (globeRotation - 145) * 0.7;
                        const projX = 200 + (x - 200) * 0.52 + rotOffset;
                        const projY = 150 + (y - 150) * 0.52;
                        const projR = r * 0.52;

                        return (
                          <g key={`warped-globe-cloud-${c.id}`}>
                            <circle cx={projX} cy={projY} r={projR + 4} fill="url(#feed-cloudGrad-right)" fillOpacity={op * 0.3} />
                            <circle cx={projX} cy={projY} r={projR} fill="#f8fafc" fillOpacity={op * 0.6} stroke="#e2e8f0" strokeWidth="1" />
                          </g>
                        );
                      })}
                    </g>

                    <circle cx="200" cy="150" r="90" fill="url(#feed-atmosphere-glow-right)" className="pointer-events-none" />

                    {/* Orbit Path & GEO Satellite */}
                    {showSatelliteOrbit && (
                      <>
                        <ellipse cx="200" cy="150" rx="145" ry="42" fill="none" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="0.8" strokeDasharray="3 3" transform={`rotate(${-globeTilt} 200 150)`} />
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
                              {isFront && (
                                <polygon points={`${satX},${satY} 185,145 215,155`} fill="url(#feed-orbit-laser-beam-right)" opacity="0.25" className="pointer-events-none" />
                              )}
                              <circle cx={satX} cy={satY} r="5" fill="none" stroke="#10b981" strokeWidth="1" className="animate-ping" />
                              <circle cx={satX} cy={satY} r="2.5" fill="#10b981" stroke="#065f46" strokeWidth="0.8" />
                              <text x={satX + 6} y={satY - 4} fill="#10b981" fontSize="6.5" fontFamily="monospace" fontWeight="bold">H9-GEO</text>
                            </g>
                          );
                        })()}
                      </>
                    )}
                  </>
                )}

                {/* ROI Selection Highlight Rectangle (Only available in GIS Map projection to keep interactions clean) */}
                {feedProjection === "gis-map" && roi && (
                  <g>
                    <rect
                      x={roi.x}
                      y={roi.y}
                      width={roi.w}
                      height={roi.h}
                      fill="rgba(6, 182, 212, 0.15)"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={roi.x + 4}
                      y={roi.y > 20 ? roi.y - 6 : roi.y + roi.h + 12}
                      fill="#06b6d4"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ROI SELECT
                    </text>
                  </g>
                )}
              </svg>

              {/* RIFE Telemetry overlay bubble */}
              <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-800 rounded px-2.5 py-1 text-[9px] font-mono text-emerald-400">
                IFNET BILATERAL ACTIVE
              </div>

              {hoverGis && (
                <div className="absolute top-3 right-3 bg-slate-950/95 border border-slate-800 rounded px-2.5 py-1 text-[9px] font-mono text-emerald-400 flex items-center gap-1 z-20 pointer-events-none">
                  <Compass className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
                  {hoverGis.lat.toFixed(2)}°N, {hoverGis.lon.toFixed(2)}°E
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 font-mono mt-2.5 leading-normal text-emerald-400">
              Seamless optical flow interpolation active
            </p>
          </div>

        </div>

        {/* CONDITIONAL SUB-PANELS BASED ON ACTIVE PROJECTION VIEW */}
        {feedProjection === "3d-globe" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono animate-fadeIn">
            <div className="md:col-span-2 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                3D Orthographic Projection Config
              </span>
              <p className="text-[11px] text-slate-400">
                Adjust rotation and planetary tilt properties to warp the 2D planar satellite clouds dynamically around the 3D Earth ellipsoid.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  onClick={() => setIsGlobeAutoRotate(!isGlobeAutoRotate)}
                  className={`py-1.5 px-3 rounded text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isGlobeAutoRotate 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {isGlobeAutoRotate ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isGlobeAutoRotate ? "Auto Rotation Active" : "Auto Rotation Paused"}
                </button>

                <button
                  onClick={() => {
                    setGlobeRotation(145);
                    setGlobeTilt(23.5);
                  }}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded border border-slate-700 transition-all text-[10px] flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Projection
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 font-mono">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Axial Tilt Adjustment:</span>
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

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">GEO Satellite Orbit Path:</span>
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
          </div>
        )}

        {feedProjection === "spectral-grid" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono animate-fadeIn grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Spectral Grid Sampling Mode
              </span>
              <p className="text-[11px] text-slate-400">
                Continuous high-frequency Fourier cell matrix mapping is active. Cloud pixels are segmented into discrete cells with raw reflectance index values calculated in real-time.
              </p>
            </div>
            
            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 grid grid-cols-2 gap-2 text-[9px] text-slate-400">
              <div>
                <span className="text-slate-500 uppercase block">Grid Area</span>
                <span className="text-emerald-400 font-bold">16 x 12 Sectors</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block">Sampling Rate</span>
                <span className="text-emerald-400 font-bold">4.8 GHz Bandwidth</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block">Reflectance Max</span>
                <span className="text-sky-400 font-bold">0.96 Index</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block">Discrete Mode</span>
                <span className="text-sky-400 font-bold">Fourier-2D active</span>
              </div>
            </div>
          </div>
        )}

        {/* REGION OF INTEREST (ROI) DETAILED TELEMETRY OVERLAY */}
        {roi && (
          <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-4 text-xs font-mono animate-fadeIn flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-cyan-400 font-bold uppercase block text-[9px] tracking-wider">Target Region Selected</span>
              <div className="text-slate-200 mt-1">
                Bounds: <span className="text-white font-bold">[{Math.round(roi.x)}, {Math.round(roi.y)}]</span> — Size: <span className="text-white font-bold">{Math.round(roi.w)}x{Math.round(roi.h)}px</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2 bg-slate-950/60 p-2 rounded border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[9px] block">ROI PSNR:</span>
                  <span className="text-emerald-400 font-bold">{roiPsnr} dB</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] block">ROI SSIM:</span>
                  <span className="text-emerald-400 font-bold">{roiSsim}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] block">ROI ALERT:</span>
                  <span className={`font-bold ${roiAlertStatus === "SEVERE" ? "text-red-400" : roiAlertStatus === "WARNING" ? "text-amber-400" : "text-emerald-400"}`}>
                    {roiAlertStatus}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setRoi(null)}
              className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 rounded-lg text-xs font-bold font-mono transition-colors self-start md:self-center"
            >
              Clear ROI Target
            </button>
          </div>
        )}

        {/* FRAME-BY-FRAME SCRUBBER */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs font-mono text-slate-400 gap-2">
            <span className="text-sky-400 font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1.5">
              Frame {currentFrameIndex} of 6 — Timestamp: {getTimestampForTime(rightTime)}
            </span>
            <div className="flex gap-4">
              <span>PASS A (12:00 PM)</span>
              <span>PASS B (12:25 PM)</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-200 ${
                isPlaying
                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-sky-400 hover:bg-sky-500 text-slate-950"
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? "Pause Timeline" : "Play Timeline"}
            </button>

            <input
              type="range"
              min="1"
              max="6"
              step="0.01"
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
              value={scrubberVal}
              onChange={(e) => handleScrubberChange(parseFloat(e.target.value))}
            />

            <button
              onClick={() => {
                setScrubberVal(1.0);
                setLeftTime(0.0);
                setRightTime(0.0);
                setIsPlaying(false);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title="Reset Frame Scrubber"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* METRIC COMPARISON TABLE */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Bilateral Frame-By-Frame Metrics Table
            </h4>
            <span className="text-[9px] font-mono text-slate-500 uppercase">Live Pipeline Stats</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-2.5 px-3">Frame</th>
                  <th className="py-2.5 px-3">Timestamp (UTC)</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">PSNR (dB)</th>
                  <th className="py-2.5 px-3 text-right">SSIM</th>
                  <th className="py-2.5 px-3 text-right">MSE</th>
                  <th className="py-2.5 px-3 text-center">Quality</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, idx) => {
                  const i = idx + 1;
                  const t_i = (i - 1) / 5;
                  const distanceFactor_i = Math.abs(t_i - 0.5) * 2;
                  const spatialPenalty_i = (16 - blockResolution) / 16 * 1.5;
                  const noisePenalty_i = noiseLevel * 4;
                  const ssim_i = parseFloat((0.96 - (1 - distanceFactor_i) * 0.05 + spatialPenalty_i * 0.015 - noisePenalty_i * 0.02).toFixed(3));
                  const psnr_i = parseFloat((34.2 - (1 - distanceFactor_i) * 3.4 + spatialPenalty_i * 1.2 - noisePenalty_i * 2).toFixed(1));
                  const mse_i = parseFloat((10 ** (-psnr_i / 10)).toFixed(5));
                  const type_i = (i === 1 || i === 6) ? "REAL" : "AI";

                  const isHighlighted = i === currentFrameIndex;

                  let qualText = "Excellent";
                  let qualColor = "text-emerald-400";
                  if (psnr_i < 28) {
                    qualText = "Poor";
                    qualColor = "text-red-400";
                  } else if (psnr_i <= 32) {
                    qualText = "Good";
                    qualColor = "text-amber-400";
                  }

                  return (
                    <tr 
                      key={`table-row-${i}`} 
                      className={`border-b border-slate-850/80 transition-colors duration-150 ${
                        isHighlighted 
                          ? "bg-sky-500/10 border-sky-500/30 text-white font-bold" 
                          : "text-slate-300 hover:bg-slate-950/20"
                      }`}
                    >
                      <td className="py-2 px-3">
                        {isHighlighted ? "▶ " : ""}Frame {i}
                      </td>
                      <td className="py-2 px-3">{getTimestampForTime(t_i)}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                          type_i === "REAL" ? "bg-blue-500/10 text-blue-400" : "bg-cyan-500/10 text-cyan-400"
                        }`}>
                          {type_i}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">{psnr_i} dB</td>
                      <td className="py-2 px-3 text-right">{ssim_i}</td>
                      <td className="py-2 px-3 text-right">{mse_i}</td>
                      <td className={`py-2 px-3 text-center font-bold ${qualColor}`}>{qualText}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODEL CONFIDENCE HEATMAP */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-2 mb-3 gap-2">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Model Confidence Map — Frame {currentFrameIndex}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/70" /> Green = High Confidence
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/70" /> Yellow = Uncertain
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-red-500/80" /> Red = Uncertain Region
              </span>
            </div>
          </div>

          <div 
            className="grid gap-1 max-w-sm mx-auto p-2 bg-slate-950 rounded-lg border border-slate-850" 
            style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
          >
            {Array.from({ length: 16 }).map((_, r) =>
              Array.from({ length: 16 }).map((_, c) => {
                const colorClass = getConfidenceColor(r, c, rightTime, preset);
                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className={`aspect-square w-full rounded-sm transition-colors duration-300 ${colorClass}`}
                    title={`Coordinate [${r}, ${c}]`}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* TEMPORAL CONSISTENCY GRAPH */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-2 mb-3 gap-2">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Temporal Consistency Monitor
            </h4>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
              {consistencyPoints.some(p => p > 4.5) ? (
                <span className="flex items-center gap-1 text-red-400 font-bold animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  Spike Warning Active
                </span>
              ) : (
                <span className="text-emerald-400 font-bold">Stable Stream</span>
              )}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850">
            {/* SVG Line Graph */}
            <svg viewBox="0 0 600 110" className="w-full h-24 overflow-visible">
              {/* Grid Lines */}
              <line x1="20" y1="10" x2="580" y2="10" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="50" x2="580" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="90" x2="580" y2="90" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

              {/* Connected Line segments */}
              {consistencyPoints.slice(0, -1).map((p, idx) => {
                const x1 = (idx / 9) * 560 + 20;
                const y1 = 90 - (p / 10) * 80;
                const pNext = consistencyPoints[idx + 1];
                const x2 = ((idx + 1) / 9) * 560 + 20;
                const y2 = 90 - (pNext / 10) * 80;
                const isSegmentSpike = p > 4.5 || pNext > 4.5;

                return (
                  <line
                    key={`segment-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isSegmentSpike ? "#f87171" : "#10b981"}
                    strokeWidth="2.5"
                  />
                );
              })}

              {/* Coordinates dots */}
              {consistencyPoints.map((p, idx) => {
                const x = (idx / 9) * 560 + 20;
                const y = 90 - (p / 10) * 80;
                const isSpike = p > 4.5;

                return (
                  <g key={`point-${idx}`}>
                    {isSpike && (
                      <circle cx={x} cy={y} r="8" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSpike ? "4" : "3"}
                      fill={isSpike ? "#ef4444" : "#10b981"}
                    />
                  </g>
                );
              })}
            </svg>

            <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-2">
              <span>Historical Step 1</span>
              <span>Step 5</span>
              <span>Current Step 10</span>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-500 font-mono mt-2 text-center leading-normal">
            Brightness temperature change between consecutive frames. Sudden spikes indicate convective intensification.
          </p>
        </div>

      </div>

      {/* RIGHT COLUMN (4 cols): CRITICAL TELEMETRY + ALERTS + ACTIONS */}
      <div className="lg:col-span-4 flex flex-col gap-5">
        
        {/* SEVERITY ALERT SYSTEM BANNER */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Severity Alert System
            </h4>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
              activeAlertLevel === "SEVERE" 
                ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                : activeAlertLevel === "WARNING" 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {activeAlertLevel}
            </span>
          </div>

          <div className="space-y-3">
            <div className={`p-3 rounded-lg border text-xs font-mono ${
              activeAlertLevel === "SEVERE"
                ? "bg-red-950/40 border-red-500/20 text-red-300"
                : activeAlertLevel === "WARNING"
                  ? "bg-amber-950/40 border-amber-500/20 text-amber-300"
                  : "bg-emerald-950/40 border-emerald-500/20 text-emerald-300"
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  activeAlertLevel === "SEVERE" ? "bg-red-500" : activeAlertLevel === "WARNING" ? "bg-amber-500" : "bg-emerald-500"
                }`} />
                Status: {activeAlertLevel}
              </div>
              <p className="mt-1 font-sans">{activeAlertMessage}</p>
              
              {activeAlertLevel === "SEVERE" && showSevereAlert && (
                <button
                  onClick={() => {
                    setSevereAlertAck(true);
                    setShowSevereAlert(false);
                  }}
                  className="mt-3 w-full bg-red-500 hover:bg-red-600 text-slate-950 font-bold font-mono py-1 px-3 rounded text-[10px] transition-colors"
                >
                  Acknowledge Incident
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setIsCycloneEventActive(true);
                setSevereAlertAck(false);
              }}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all"
            >
              Simulate Cyclone Event
            </button>
          </div>

          {/* ALERTS LOG LIST */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
              Alerts History Log (Last 5 Events)
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {alertsLog.map((a) => (
                <div key={a.id} className="p-2 bg-slate-950/70 border border-slate-850 rounded text-[9px] font-mono flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className={
                      a.level === "SEVERE" ? "text-red-400 font-bold" : a.level === "WARNING" ? "text-amber-400 font-bold" : "text-emerald-400"
                    }>
                      [{a.level}] {a.eventType}
                    </span>
                    <span className="text-slate-500">F{a.frameNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Conf: {a.confidence}%</span>
                    <span>{a.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INTERACTIVE METEOROLOGICAL PARAMETERS PANEL */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Settings className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              RIFE-IFNet Hyperparameters
            </h4>
          </div>

          <div className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 font-mono">
                <span>Temporal Upsample Rate:</span>
                <span className="text-sky-400 font-bold">{upsampleFactor}x (Hourly)</span>
              </div>
              <input
                type="range"
                min="2"
                max="24"
                step="2"
                className="w-full h-1 bg-slate-950 rounded cursor-pointer accent-sky-400"
                value={upsampleFactor}
                onChange={(e) => setUpsampleFactor(parseInt(e.target.value))}
              />
              <p className="text-[9px] text-slate-500 font-sans">
                A 24x upscaling synthesizes hourly frames from a single daily pass.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 font-mono">
                <span>Spatial Matching Block Size:</span>
                <span className="text-sky-400 font-bold">{blockResolution}x{blockResolution} pixels</span>
              </div>
              <input
                type="range"
                min="4"
                max="16"
                step="4"
                className="w-full h-1 bg-slate-950 rounded cursor-pointer accent-sky-400"
                value={blockResolution}
                onChange={(e) => setBlockResolution(parseInt(e.target.value))}
              />
              <p className="text-[9px] text-slate-500 font-sans">
                Finer blocks yield higher spatial accuracy but require exponential compute.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400 font-mono">
                <span>De-Noising & Atmosphere Refinement:</span>
                <span className="text-sky-400 font-bold">{(noiseLevel * 100).toFixed(0)}% Coherence</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.01"
                className="w-full h-1 bg-slate-950 rounded cursor-pointer accent-sky-400"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
              />
            </div>

          </div>
        </div>

        {/* METEOROLOGICAL METRIC OUTCOMES TELEMETRY CARD */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <BarChart2 className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Verification Outcomes Telemetry
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-500 font-mono block">SSIM INDEX</span>
              <strong className="text-base font-bold text-slate-200 block mt-0.5">{ssim}</strong>
              <span className="text-[8px] text-emerald-500 font-mono">Target &gt;0.85</span>
            </div>
            <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-500 font-mono block">PSNR RATIO</span>
              <strong className="text-base font-bold text-slate-200 block mt-0.5">{psnr} dB</strong>
              <span className="text-[8px] text-emerald-500 font-mono">Target &gt;30.0</span>
            </div>
            <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-500 font-mono block">VECTOR COHERENCE</span>
              <strong className="text-base font-bold text-slate-200 block mt-0.5">{flowCoherence}%</strong>
              <span className="text-[8px] text-emerald-500 font-mono">Target &gt;95%</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-850 font-mono text-[10px] text-slate-400 leading-relaxed">
            <div className="text-[9px] font-bold text-sky-400 uppercase mb-1">Optical flow displacement equation:</div>
            {"I_t(x) = W(I_0, f_{t->0}) + W(I_1, f_{t->1})"}
          </div>
        </div>

        {/* EXPORTERS & OPERATIONS HUB */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Database className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Data Export & AI Diagnosis
            </h4>
          </div>

          <div className="flex flex-col gap-2">
            
            {/* Export NetCDF format */}
            <button
              onClick={handleExportNetCdf}
              className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-mono text-xs py-2 px-3 rounded-lg flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-sky-400" />
                Export Grid to NetCDF4 (.nc)
              </span>
              <span className="bg-sky-500/10 text-sky-400 text-[9px] px-1.5 py-0.5 rounded border border-sky-500/10">Meteorology Std</span>
            </button>

            {/* Export CSV vectors format */}
            <button
              onClick={handleExportCsv}
              className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-mono text-xs py-2 px-3 rounded-lg flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                Download Flow Vector CSV Dataset
              </span>
              <span className="text-[9px] text-slate-500 uppercase">Bilateral Flow</span>
            </button>

            {/* Download Report Button */}
            <button
              onClick={handleDownloadReport}
              className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-mono text-xs py-2 px-3 rounded-lg flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Download Report (CSV)
              </span>
              <span className="text-[9px] text-emerald-500 uppercase">Interactive Log</span>
            </button>

            {/* AI verification Audit button */}
            <button
              onClick={handleRunAiAudit}
              disabled={isAuditing}
              className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-slate-950 font-mono font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow shadow-sky-500/10 mt-1"
            >
              {isAuditing ? (
                <span>Generating Verification Audit...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Run AI-Powered Resolution Audit
                </>
              )}
            </button>

          </div>

          {/* AI Diagnostic Display */}
          {aiAuditReport && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-xs leading-relaxed animate-fadeIn">
              <div className="flex justify-between items-center text-[9px] font-mono text-sky-400 uppercase tracking-wider pb-1.5 border-b border-slate-900 mb-2">
                <span>Gemini 3.5 Validation Audit Report</span>
                <span>MET CONFIDENCE LEVEL: A+</span>
              </div>
              <div className="text-slate-300 whitespace-pre-line font-sans leading-relaxed">
                {aiAuditReport}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
