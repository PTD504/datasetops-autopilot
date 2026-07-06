import React from "react";
import { Activity, Clock, AlertTriangle } from "lucide-react";
import Section from "../../../components/Section";
import Metric from "../../../components/Metric";
import Badge from "../../../components/Badge";

interface SummarySectionProps {
  status: "idle" | "running" | "completed" | "failed";
  chunkingLatency?: number;
  embeddingLatency?: number;
  warnings?: string[];
}

export default function SummarySection({
  status,
  chunkingLatency,
  embeddingLatency,
  warnings,
}: SummarySectionProps) {
  const totalDurationMs = (chunkingLatency || 0) + (embeddingLatency || 0);
  const totalDurationSec = totalDurationMs > 0 ? (totalDurationMs / 1000).toFixed(2) : undefined;

  const getStatusBadge = () => {
    switch (status) {
      case "completed": return <Badge label="Completed" variant="success" />;
      case "running": return <Badge label="Processing" variant="secondary" />; // purple
      case "failed": return <Badge label="Failed" variant="error" />;
      default: return <Badge label="Pending" variant="default" />; // indigo
    }
  };

  return (
    <Section title="Preprocessing Workspace Status" icon={<Activity size={12} className="text-cyan-400" />}>
      <div className="space-y-4">
        {/* Status Line */}
        <div className="flex items-center justify-between bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
          <span className="text-xs font-medium text-slate-300">Overall Status</span>
          {getStatusBadge()}
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Metric
            label="Total Preparation Time"
            value={totalDurationSec ? `${totalDurationSec}s` : "Not Available"}
            icon={<Clock size={12} className="text-indigo-400" />}
          />
        </div>

        {/* Preprocessing Warnings/Logs */}
        {warnings && warnings.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Workspace Observations</span>
            <div className="space-y-2 bg-amber-500/[0.01] border border-amber-500/10 p-3 rounded-xl">
              {warnings.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-sans">{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
