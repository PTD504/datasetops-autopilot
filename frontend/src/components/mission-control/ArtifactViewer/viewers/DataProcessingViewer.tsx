import React, { useMemo } from "react";
import { TraceItem } from "../../types";
import { resolvePreprocessing } from "./DataProcessingViewer/utils/preprocessingResolver";
import SummarySection from "./DataProcessingViewer/components/SummarySection";
import DocumentsSection from "./DataProcessingViewer/components/DocumentsSection";
import ChunkingSection from "./DataProcessingViewer/components/ChunkingSection";
import EmbeddingSection from "./DataProcessingViewer/components/EmbeddingSection";

interface DataProcessingViewerProps {
  projectId: string;
  workflowStatus: string;
  traces: TraceItem[];
}

function DataProcessingViewer({
  projectId,
  workflowStatus,
  traces,
}: DataProcessingViewerProps) {
  // Extract and resolve preprocessing data from traces
  const prepData = useMemo(() => resolvePreprocessing(traces, workflowStatus), [traces, workflowStatus]);

  // Check if preprocessing is currently active
  const isProcessing = useMemo(() => {
    return workflowStatus === "CHUNKING" || workflowStatus === "EMBEDDING" || prepData.status === "running";
  }, [workflowStatus, prepData.status]);

  // Renders empty/loading state if data is not yet resolved
  if (prepData.docs.length === 0) {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 animate-spin"></div>
          </div>
          <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
            Preparing Source Documents...
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
        <p className="text-xs text-slate-500 italic">
          No preprocessing logs are currently available for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 select-none text-left">
      {/* Overview subtitle description */}
      <div className="border-b border-white/[0.04] pb-4">
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          This workspace displays the pipeline metrics for document parsing, segmentation, and vector embedding generation.
        </p>
      </div>

      {/* Main 2-column Preprocessing Workspace layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Left Column: Preprocessing Status & Documents */}
        <div className="flex flex-col gap-5">
          <SummarySection 
            status={prepData.status}
            chunkingLatency={prepData.chunkingLatency}
            embeddingLatency={prepData.embeddingLatency}
            warnings={prepData.warnings}
            collapsible={true}
            defaultExpanded={true}
          />
          <DocumentsSection 
            documents={prepData.docs}
            collapsible={true}
            defaultExpanded={true}
          />
        </div>

        {/* Right Column: Chunking & Embeddings Configuration */}
        <div className="flex flex-col gap-5">
          <ChunkingSection 
            totalChunks={prepData.totalChunks}
            chunkingLatency={prepData.chunkingLatency}
            chunkSize={prepData.chunkSize}
            chunkOverlap={prepData.chunkOverlap}
            collapsible={true}
            defaultExpanded={true}
          />
          <EmbeddingSection 
            model={prepData.embeddingModel}
            mode={prepData.embeddingMode}
            embeddingLatency={prepData.embeddingLatency}
            totalChunks={prepData.totalChunks}
            collapsible={true}
            defaultExpanded={true}
          />
        </div>
      </div>
    </div>
  );
}

// React.memo with custom comparison to avoid polling rerenders
const arePropsEqual = (prevProps: DataProcessingViewerProps, nextProps: DataProcessingViewerProps) => {
  if (prevProps.projectId !== nextProps.projectId) return false;
  if (prevProps.workflowStatus !== nextProps.workflowStatus) return false;

  const prevPrep = resolvePreprocessing(prevProps.traces, prevProps.workflowStatus);
  const nextPrep = resolvePreprocessing(nextProps.traces, nextProps.workflowStatus);
  return JSON.stringify(prevPrep) === JSON.stringify(nextPrep);
};

export default React.memo(DataProcessingViewer, arePropsEqual);

