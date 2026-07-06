import React from "react";
import { FileText, Award, Layers } from "lucide-react";
import Section from "../../../components/Section";
import Metric from "../../../components/Metric";
import { DocumentSummary } from "../utils/sourceReportResolver";

interface SummarySectionProps {
  documents?: DocumentSummary[];
  confidenceScore?: number;
  overallSummary?: string;
}

export default function SummarySection({
  documents,
  confidenceScore,
  overallSummary,
}: SummarySectionProps) {
  const hasDocuments = documents && documents.length > 0;
  const totalChunks = documents?.reduce((acc, doc) => acc + (doc.chunk_count || 0), 0) || 0;

  return (
    <Section title="Document Analysis Summary" icon={<FileText size={12} className="text-cyan-400" />}>
      <div className="space-y-4">
        {/* Scanned files list */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Parsed Source Materials</span>
          {hasDocuments ? (
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 border border-white/[0.04] bg-white/[0.005] p-3 rounded-xl">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.02] last:border-0">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileText size={12} className="text-slate-400 shrink-0" />
                    <span className="text-slate-200 truncate font-sans" title={doc.filename}>{doc.filename}</span>
                  </div>
                  {doc.chunk_count !== undefined && (
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{doc.chunk_count} Chunks</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-3 rounded-xl">
              No scanned documents found.
            </div>
          )}
        </div>

        {/* Overall Analysis Statement */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">AI Analysis Insights</span>
          {overallSummary ? (
            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-white/[0.01] border border-white/[0.04] p-3.5 rounded-xl">
              {overallSummary}
            </p>
          ) : (
            <div className="text-slate-500 italic text-xs border border-dashed border-white/5 bg-white/[0.005] p-3.5 rounded-xl">
              No summary analysis statement recorded.
            </div>
          )}
        </div>

        {/* Stats metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {totalChunks > 0 && (
            <Metric
              label="Total Text Chunks"
              value={`${totalChunks} parts`}
              icon={<Layers size={12} className="text-indigo-400" />}
            />
          )}
          {confidenceScore !== undefined && (
            <Metric
              label="Analysis Confidence"
              value={`${Math.round(confidenceScore * 100)}%`}
              icon={<Award size={12} className="text-purple-400" />}
            />
          )}
        </div>
      </div>
    </Section>
  );
}
