export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  bullets: string[];
  graphicType: "hero" | "problem-viz" | "simulator" | "flow-network" | "business-roi" | "customizer";
  speakerNotes?: string;
}

export type SectorType = "wildfire" | "agriculture" | "flooding" | "maritime" | "urban";

export interface SectorConfig {
  id: SectorType;
  name: string;
  icon: string;
  primaryColor: string; // e.g., 'rose', 'emerald', etc.
  description: string;
  demoTitle: string;
  frameA: {
    title: string;
    description: string;
    elements: Array<{ id: string; x: number; y: number; r: number; color: string; label: string }>;
  };
  frameB: {
    title: string;
    description: string;
    elements: Array<{ id: string; x: number; y: number; r: number; color: string; label: string }>;
  };
}

export interface SimulatorState {
  time: number; // 0.0 to 1.0
  isInterpolating: boolean;
  showVectors: boolean;
  showGrid: boolean;
  showFlowHeatmap: boolean;
  interpolationSpeed: number; // ms per step
}
