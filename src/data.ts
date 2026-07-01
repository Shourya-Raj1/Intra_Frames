import { SectorConfig } from "./types";

export const SECTORS: SectorConfig[] = [
  {
    id: "wildfire",
    name: "Wildfire Management",
    icon: "Flame",
    primaryColor: "#ef4444", // red-500
    description: "Predict rapid wildfire spread, locate secondary spots, and plan evacuation routes on an hourly cadence instead of waiting for daily satellite passes.",
    demoTitle: "Boreal Forest Wildfire Expansion (Dry Winds)",
    frameA: {
      title: "Frame 0 (00:00 - Initial Detection)",
      description: "Daily polar pass captures isolated active flame core (radius 25m) and smoke plume heading north-east.",
      elements: [
        { id: "core", x: 140, y: 260, r: 24, color: "#f97316", label: "Active Burn Core" },
        { id: "spot1", x: 190, y: 180, r: 10, color: "#ef4444", label: "Smoldering Canopy" },
        { id: "plume", x: 260, y: 130, r: 40, color: "rgba(148, 163, 184, 0.4)", label: "Low Density Smoke" },
        { id: "unburned", x: 380, y: 320, r: 15, color: "#22c55e", label: "Vulnerable Fir Stand" }
      ]
    },
    frameB: {
      title: "Frame 1 (24:00 - Next Polar Pass)",
      description: "24 hours later. The burn core expanded drastically, the spot fire merged, and a secondary burn front ignited 150m away.",
      elements: [
        { id: "core", x: 200, y: 220, r: 55, color: "#f97316", label: "Consolidated Burn Front" },
        { id: "spot1", x: 210, y: 190, r: 45, color: "#ef4444", label: "Merged Crown Fire" },
        { id: "plume", x: 340, y: 90, r: 70, color: "rgba(71, 85, 105, 0.6)", label: "Heavy Carbon Plume" },
        { id: "unburned", x: 380, y: 320, r: 4, color: "#b45309", label: "Incinerated Canopy" }
      ]
    }
  },
  {
    id: "agriculture",
    name: "Precision Agriculture",
    icon: "Sprout",
    primaryColor: "#10b981", // emerald-500
    description: "Track hourly micro-evapotranspiration and rapid mechanical harvesting progress to optimize supply chain timing and grain drying logistics.",
    demoTitle: "Harvester Progress & Crop Dry-down",
    frameA: {
      title: "Frame 0 (Day 1 - Pre-Harvest)",
      description: "Pre-harvest golden wheat pivot field with uniform healthy vegetative signature.",
      elements: [
        { id: "field-nw", x: 150, y: 150, r: 40, color: "#eab308", label: "Uncut Golden Wheat" },
        { id: "field-se", x: 300, y: 280, r: 45, color: "#eab308", label: "High Yield Crop Segment" },
        { id: "harvester", x: 100, y: 280, r: 14, color: "#3b82f6", label: "Combine Harvester A" },
        { id: "truck", x: 70, y: 320, r: 8, color: "#64748b", label: "Grain Transport Truck" }
      ]
    },
    frameB: {
      title: "Frame 1 (Day 2 - Post-Harvest)",
      description: "Next polar pass. 70% of the Northwest pivot field has been harvested and tilled, showing brown chaff signatures.",
      elements: [
        { id: "field-nw", x: 150, y: 150, r: 40, color: "#78350f", label: "Harvested Chaff & Stubble" },
        { id: "field-se", x: 300, y: 280, r: 20, color: "#eab308", label: "Uncut Margin (Late Harvest)" },
        { id: "harvester", x: 340, y: 150, r: 14, color: "#3b82f6", label: "Combine Harvester A" },
        { id: "truck", x: 380, y: 120, r: 8, color: "#64748b", label: "Grain Transport Truck" }
      ]
    }
  },
  {
    id: "flooding",
    name: "Disaster Inundation",
    icon: "Waves",
    primaryColor: "#3b82f6", // blue-500
    description: "Monitor flood wave velocity and residential inundation boundaries in real-time, enabling rescue teams to deploy resources before daily passes confirm damage.",
    demoTitle: "Shattered River Levee Flooding",
    frameA: {
      title: "Frame 0 (02:00 - High River Water)",
      description: "River flowing at high capacity. Levee holds, housing subdivision remains dry.",
      elements: [
        { id: "river-main", x: 100, y: 200, r: 35, color: "#1d4ed8", label: "Active River Channel" },
        { id: "subdivision", x: 280, y: 180, r: 30, color: "#10b981", label: "Residential Zone A" },
        { id: "subdivision-b", x: 340, y: 290, r: 25, color: "#10b981", label: "Residential Zone B" },
        { id: "levee", x: 190, y: 230, r: 8, color: "#94a3b8", label: "Critical Levee Wall" }
      ]
    },
    frameB: {
      title: "Frame 1 (26:00 - Widespread Inundation)",
      description: "Levee compromised. Major flash flood inundation across 45% of Residential Zone A and B.",
      elements: [
        { id: "river-main", x: 100, y: 200, r: 60, color: "#1d4ed8", label: "River Breach Source" },
        { id: "subdivision", x: 280, y: 180, r: 30, color: "#1e3a8a", label: "Inundated Suburbs (Zone A)" },
        { id: "subdivision-b", x: 340, y: 290, r: 25, color: "#60a5fa", label: "Water Margin Expansion (Zone B)" },
        { id: "levee", x: 190, y: 230, r: 20, color: "#1d4ed8", label: "Washed Out Breach Gap" }
      ]
    }
  },
  {
    id: "maritime",
    name: "Maritime Intelligence",
    icon: "Ship",
    primaryColor: "#06b6d4", // cyan-500
    description: "Track ship speeds, wake directions, and illegal off-dock transshipments. Solve the daily pass avoidance strategies of dark vessel networks.",
    demoTitle: "Choke Point Cargo Logistics & Wake Vectoring",
    frameA: {
      title: "Frame 0 (08:00 - Channel Entry)",
      description: "Three bulk cargo vessels entering the shipping lane moving at 16 knots.",
      elements: [
        { id: "ship1", x: 100, y: 120, r: 10, color: "#f43f5e", label: "Vessel 'Aries' (LPG)" },
        { id: "ship2", x: 120, y: 280, r: 12, color: "#ec4899", label: "Vessel 'Neptune' (Bulk)" },
        { id: "ship3", x: 80, y: 200, r: 9, color: "#a855f7", label: "Vessel 'Solis' (Container)" },
        { id: "buoy", x: 250, y: 200, r: 5, color: "#eab308", label: "Navigational Buoy" }
      ]
    },
    frameB: {
      title: "Frame 1 (16:00 - Channel Midpoint)",
      description: "Next polar pass. Vessels have progressed down the channel; Solis has overtaken Neptune.",
      elements: [
        { id: "ship1", x: 320, y: 150, r: 10, color: "#f43f5e", label: "Vessel 'Aries' (LPG)" },
        { id: "ship2", x: 260, y: 300, r: 12, color: "#ec4899", label: "Vessel 'Neptune' (Bulk)" },
        { id: "ship3", x: 310, y: 240, r: 9, color: "#a855f7", label: "Vessel 'Solis' (Container)" },
        { id: "buoy", x: 250, y: 200, r: 5, color: "#eab308", label: "Navigational Buoy" }
      ]
    }
  },
  {
    id: "urban",
    name: "Urban Emissions & Traffic",
    icon: "Building2",
    primaryColor: "#f59e0b", // amber-500
    description: "Analyze hourly rush-hour traffic build-up and urban heat dome creation. Bridge the gap between low-res stationary thermal sensors and daily high-res imagery.",
    demoTitle: "Metropolitan Grid Diurnal Traffic Congestion",
    frameA: {
      title: "Frame 0 (07:00 - Morning Rush Peak)",
      description: "Morning commute beginning. Primary congestion point at the highway intersection interchange.",
      elements: [
        { id: "interchange", x: 160, y: 160, r: 35, color: "#ef4444", label: "Interchange Congestion Core" },
        { id: "highway-east", x: 320, y: 160, r: 12, color: "#eab308", label: "Inbound Highway Flow" },
        { id: "business-district", x: 280, y: 280, r: 24, color: "#64748b", label: "Commercial Center (Dormant)" },
        { id: "commuter-lot", x: 90, y: 260, r: 18, color: "#22c55e", label: "Suburban Transit Hub" }
      ]
    },
    frameB: {
      title: "Frame 1 (19:00 - Evening Rush Peak)",
      description: "Evening rush hour. Traffic shifts to outward highway margins; Business district emitting massive heat signatures.",
      elements: [
        { id: "interchange", x: 160, y: 160, r: 15, color: "#eab308", label: "Interchange Congestion Core" },
        { id: "highway-east", x: 380, y: 180, r: 35, color: "#ef4444", label: "Outbound Highway Flow" },
        { id: "business-district", x: 280, y: 280, r: 42, color: "#f97316", label: "Urban Heat Island Dome" },
        { id: "commuter-lot", x: 90, y: 260, r: 6, color: "#e2e8f0", label: "Transit Hub (Cleared)" }
      ]
    }
  }
];

export const SLIDES = [
  {
    id: 1,
    title: "OrbitSync AI",
    subtitle: "Virtual Geostationary Earth Intelligence via Neural Temporal Frame Interpolation",
    bullets: [
      "The Space Economics Conundrum: High spatial resolution requires low-Earth polar orbits (LEO), which limits target revisit frequency to once per day or week.",
      "The Spatial vs. Temporal Trade-off: Geostationary orbits (GEO) provide continuous surveillance but are physically limited to extremely low resolution.",
      "Our Breakthrough: OrbitSync AI synthesizes high-frequency hourly observations by interpolating polar LEO passes using advanced deep learning-based optical warping."
    ],
    graphicType: "hero",
    speakerNotes: "Welcome, investors and partners. Today, we're discussing one of the most persistent bottlenecks in satellite earth observation: the trade-off between spatial and temporal resolution. High resolution requires low-Earth polar orbits, limiting revisit rates. Geostationary orbits give us frequency but sacrifice resolution. OrbitSync solves this using Neural Frame Interpolation, creating a 'virtual geostationary constellation' purely in software."
  },
  {
    id: 2,
    title: "The Temporal Void",
    subtitle: "The Costly Consequences of the 24-Hour Blind Spot",
    bullets: [
      "Critical gaps: Wildfires propagate at up to 10 km/h, flood levels peak in hours, and naval vessels travel up to 500 nautical miles in a single day.",
      "Hardware scaling is economically unfeasible: Launching a LEO constellation to achieve physical hourly revisit would require over 120 satellites, costing upwards of $650M.",
      "The software opportunity: Over 98% of Earth's ground pixels undergo continuous, physically predictable motion. We can compute and warp this movement."
    ],
    graphicType: "problem-viz",
    speakerNotes: "Let's look at the financial and operational reality of the temporal void. Disasters don't wait 24 hours for the next satellite pass. Wildfires sweep across forests, floods swallow cities, and maritime dark fleets evade detection between passes. Building hardware constellations to achieve physical hourly revisits is capital-prohibitive. This is a classic software-defined physical-warping opportunity."
  },
  {
    id: 3,
    title: "How RIFE Works",
    subtitle: "Real-time Intermediate Flow Estimation for Geospatial Imagery",
    bullets: [
      "Dual-Frame Flow Estimation: RIFE takes Frame 0 (Pass 1) and Frame 1 (Pass 2) to calculate dense pixel-level motion vectors (optical flow).",
      "Symmetric Bilateral Motion Warping: Instead of simple linear fading, RIFE projects intermediate coordinates dynamically, respecting physical continuity.",
      "Structural Refinement Network: A deep neural encoder refines shadows, structural margins, and high-frequency noise, creating crisp, synthesized virtual frames."
    ],
    graphicType: "flow-network",
    speakerNotes: "Unlike standard video frame interpolation, geospatial interpolation must adhere to strict physical realities. We utilize a highly customized RIFE model—Real-time Intermediate Flow Estimation—optimized for structural rigidity, lighting variance, and atmospheric effects. Our network computes dense bilateral motion vectors, symmetrically warping pixels along physical trajectories and refining structures through a deep structural neural network."
  },
  {
    id: 4,
    title: "Interactive RIFE Sandbox",
    subtitle: "Real-time Optical Flow & Pixel-level Intermediate Synthesis",
    bullets: [
      "Live Optical Flow Field: Toggle vectors to see estimated velocity and direction fields computed at pixel coordinates.",
      "Interactive Temporal Scrubber: Scroll or slide the timeline from Pass 0.00 to Pass 1.00 to view synthesized virtual frames at any minute.",
      "Sector-Specific Presets: Switch between Wildfires, Farming, Flood Emergency, Maritime Shipping, and Urban Commuter grids."
    ],
    graphicType: "simulator",
    speakerNotes: "This sandbox illustrates the physical warping in real-time. Feel free to toggle the motion vectors and slide the scrubber. Watch how individual elements—like expanding fire frontiers, floodwaters pushing into grid subdivisions, or ships traveling downstream—are dynamically tracked. This proves that deep learning optical flow yields highly accurate, physically realistic hourly observation."
  },
  {
    id: 5,
    title: "Commercialization & ROI",
    subtitle: "Transforming Geospatial Analytics from CAPEX to OPEX",
    bullets: [
      "SaaS Subscription Architecture: Deliver hourly synthetic high-res layers through standard GIS APIs (WMTS, STAC) at a premium tier.",
      "Massive Capital Savings: Replaces a $650M hardware deployment with a scalable cloud-native compute framework costing less than $1.5M annually.",
      "Immediate Addressable Markets: Premium intelligence for Defence & Security, Agriculture Commodities, Catastrophe Reinsurance, and Wildfire Fighting."
    ],
    graphicType: "business-roi",
    speakerNotes: "The economics are incredibly compelling. By shifting the temporal problem from hardware constellations to cloud-native compute, we slash the cost of high-frequency earth intelligence by 99%. Our platform operates on a high-margin B2B SaaS subscription model, plugging directly into existing GIS workflows. This expands the total addressable market to commercial customers who could never afford bespoke hardware orbits."
  },
  {
    id: 6,
    title: "Custom Pitch Deck & PPTX Builder",
    subtitle: "AI Co-Pilot Slide Customization and Native PPTX Export",
    bullets: [
      "AI-Powered Industry Customization: Choose your core industry vertical to dynamically customize slides, diagrams, and business calculations.",
      "Real-time Generative Speaker Notes: Generate customized talking points and investor pitch angles with server-side Gemini 3.5 Flash.",
      "One-click Native PPTX Generation: Export your polished, tailored deck directly into a high-fidelity PowerPoint file with structural layouts."
    ],
    graphicType: "customizer",
    speakerNotes: "Our PPTX builder allows you to instantly customize this pitch for specific buyer personas. Select a sector, let our Gemini co-pilot draft custom-tailored speaker notes and sales hooks, and download a native, professional PowerPoint presentation with a single click. This makes our pitch deck a living sales and strategy tool."
  }
];
