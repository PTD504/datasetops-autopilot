export interface NodeLayoutPosition {
  x: number; // percentage width (0-100)
  y: number; // percentage height (0-100)
}

export interface GraphEdgeConfig {
  id: string;
  source: string; // node ID
  target: string; // node ID
  label: string; // e.g. "Semantic Chunks", "Vector Index"
  isCurved?: boolean; // true for the repair loop
  isReverse?: boolean; // true for evaluator -> generator
  artifactType?: string; // Mapped to backend artifacts
}

export const GRAPH_LAYOUT: Record<string, NodeLayoutPosition> = {
  preprocessing: { x: 8, y: 25 },
  source_understanding: { x: 24, y: 65 },
  intake_planner: { x: 40, y: 25 },
  generator: { x: 58, y: 48 },
  evaluator: { x: 76, y: 48 },
  exporter: { x: 90, y: 25 }
};

export const GRAPH_EDGES: GraphEdgeConfig[] = [
  {
    id: "prep_to_source",
    source: "preprocessing",
    target: "source_understanding",
    label: "Vector Index",
    artifactType: "VectorIndexReference"
  },
  {
    id: "source_to_planner",
    source: "source_understanding",
    target: "intake_planner",
    label: "Source Report",
    artifactType: "source_understanding_report"
  },
  {
    id: "planner_to_generator",
    source: "intake_planner",
    target: "generator",
    label: "Approved Plan",
    artifactType: "approved_benchmark_plan"
  },
  {
    id: "generator_to_evaluator",
    source: "generator",
    target: "evaluator",
    label: "Benchmark Samples",
    artifactType: "generated_samples"
  },
  {
    id: "evaluator_to_generator_repair",
    source: "evaluator",
    target: "generator",
    label: "Repair Instruction",
    isCurved: true,
    isReverse: true,
    artifactType: "RepairInstruction"
  },
  {
    id: "evaluator_to_exporter",
    source: "evaluator",
    target: "exporter",
    label: "Validated Samples",
    artifactType: "evaluation_report"
  }
];
