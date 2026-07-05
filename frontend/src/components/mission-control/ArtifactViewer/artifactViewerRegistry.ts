import React from "react";
import DataProcessingViewer from "./viewers/DataProcessingViewer";
import SourceUnderstandingViewer from "./viewers/SourceUnderstandingViewer";
import IntakePlannerViewer from "./viewers/IntakePlannerViewer";
import GeneratorViewer from "./viewers/GeneratorViewer/GeneratorViewer";
import EvaluatorViewer from "./viewers/EvaluatorViewer/EvaluatorViewer";
import ExportViewer from "./viewers/ExportViewer";

const REGISTRY: Record<string, React.ComponentType<any>> = {
  preprocessing: DataProcessingViewer,
  source_understanding: SourceUnderstandingViewer,
  intake_planner: IntakePlannerViewer,
  generator: GeneratorViewer,
  evaluator: EvaluatorViewer,
  exporter: ExportViewer,
};

/**
 * Returns the registered artifact viewer component for a given node ID.
 */
export function getViewerComponent(nodeId: string): React.ComponentType<any> | null {
  return REGISTRY[nodeId] || null;
}
