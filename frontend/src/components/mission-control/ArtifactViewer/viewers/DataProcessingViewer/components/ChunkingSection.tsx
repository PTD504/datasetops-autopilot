import React, { useMemo } from "react";
import { Layers, Clock, Settings } from "lucide-react";
import Section from "../../../components/Section";
import Metric from "../../../components/Metric";

interface ChunkingSectionProps {
  totalChunks?: number;
  chunkSize?: number;
  chunkOverlap?: number;
  chunkingLatency?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function ChunkingSection({
  totalChunks,
  chunkSize,
  chunkOverlap,
  chunkingLatency,
  collapsible = false,
  defaultExpanded = true,
}: ChunkingSectionProps) {
  // Memoize duration calculation
  const durationSec = useMemo(() => {
    return chunkingLatency !== undefined ? (chunkingLatency / 1000).toFixed(2) : undefined;
  }, [chunkingLatency]);

  return (
    <Section 
      title="Parsing & Chunks Segmentation" 
      icon={<Layers size={12} className="text-cyan-400" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-4">
        {/* Core telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Metric
            label="Total Chunks Created"
            value={totalChunks !== undefined && totalChunks > 0 ? `${totalChunks} Chunks` : "0 Chunks"}
            icon={<Layers size={12} className="text-indigo-400" />}
          />
          <Metric
            label="Segmentation Time"
            value={durationSec ? `${durationSec}s` : "Not Available"}
            icon={<Clock size={12} className="text-amber-400" />}
          />
        </div>

        {/* Chunker configuration parameter card */}
        <div className="space-y-2 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Parser Split Parameters</span>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] uppercase">Chunk Size</span>
              <span className="text-slate-300 font-medium">{chunkSize !== undefined ? `${chunkSize} chars` : "Not Logged"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] uppercase">Chunk Overlap</span>
              <span className="text-slate-300 font-medium">{chunkOverlap !== undefined ? `${chunkOverlap} chars` : "Not Logged"}</span>
            </div>
          </div>
          {(chunkSize === undefined && chunkOverlap === undefined) && (
            <p className="text-[10px] text-slate-500 italic pt-1 leading-normal font-sans">
              Parameter values are not explicitly logged in the pipeline history. Standard values (1,000 size, 100 overlap) were utilized.
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

// React.memo with basic prop comparison
export default React.memo(ChunkingSection, (prev, next) => {
  return (
    prev.totalChunks === next.totalChunks &&
    prev.chunkSize === next.chunkSize &&
    prev.chunkOverlap === next.chunkOverlap &&
    prev.chunkingLatency === next.chunkingLatency &&
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded
  );
});

