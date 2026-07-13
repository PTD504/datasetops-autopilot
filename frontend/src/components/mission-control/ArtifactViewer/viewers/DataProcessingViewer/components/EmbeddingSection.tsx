import React, { useMemo } from "react";
import { Cpu, ShieldCheck, Clock } from "lucide-react";
import Section from "../../../components/Section";
import Metric from "../../../components/Metric";

interface EmbeddingSectionProps {
  model?: string;
  mode?: string;
  embeddingLatency?: number;
  totalChunks?: number;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

function EmbeddingSection({
  model,
  mode,
  embeddingLatency,
  totalChunks,
  collapsible = false,
  defaultExpanded = true,
}: EmbeddingSectionProps) {
  // Memoize duration calculation
  const durationSec = useMemo(() => {
    return embeddingLatency ? (embeddingLatency / 1000).toFixed(2) : undefined;
  }, [embeddingLatency]);

  // Memoize service mode check
  const isMock = useMemo(() => {
    return mode?.toLowerCase() === "mock";
  }, [mode]);

  return (
    <Section 
      title="Vector Embedding & Indexing" 
      icon={<Cpu size={12} className="text-cyan-400" />}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
    >
      <div className="space-y-4">
        {/* Core telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Metric
            label="Embedding Model"
            value={model || "Not Logged"}
            icon={<Cpu size={12} className="text-indigo-400" />}
          />
          <Metric
            label="Indexing Duration"
            value={durationSec ? `${durationSec}s` : "Not Available"}
            icon={<Clock size={12} className="text-purple-400" />}
          />
        </div>

        {/* Indexing Configuration */}
        <div className="space-y-2 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Indexing Configuration</span>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] uppercase">Service Mode</span>
              <span className={`font-medium ${isMock ? "text-amber-400" : "text-emerald-400"}`}>
                {mode ? mode.toUpperCase() : "Not Logged"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] uppercase">Index Status</span>
              <span className="text-slate-300 font-medium">
                {totalChunks !== undefined && totalChunks > 0 ? "Indexed" : "Pending"}
              </span>
            </div>
          </div>
          {isMock && (
            <p className="text-[10px] text-amber-500/80 italic pt-1 leading-normal font-sans">
              Pipeline running in mock mode: Local unit vector hashes were assigned seeding chunk IDs.
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

// React.memo with basic prop comparison
export default React.memo(EmbeddingSection, (prev, next) => {
  return (
    prev.model === next.model &&
    prev.mode === next.mode &&
    prev.embeddingLatency === next.embeddingLatency &&
    prev.totalChunks === next.totalChunks &&
    prev.collapsible === next.collapsible &&
    prev.defaultExpanded === next.defaultExpanded
  );
});

