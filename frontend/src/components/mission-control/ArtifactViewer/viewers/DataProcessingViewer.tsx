import React from "react";
import Section from "../components/Section";

export default function DataProcessingViewer() {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Data Processing Artifacts">
        <div className="space-y-3">
          <p className="text-slate-400">
            This workspace displays parsed textual database chunks and pgvector coordinates mapping categories to vector spaces.
          </p>
          <div className="border border-white/5 bg-white/[0.01] p-3.5 rounded-xl font-mono text-[11px] text-slate-500 space-y-1">
            <div className="text-purple-400"># Data Processing Stage</div>
            <div>[Parsed] document_collection: refund_policy.md</div>
            <div>[Chunked] semantic_paragraphs: 124 chunks</div>
            <div>[Embedded] dimensions: 1536 (pgvector index)</div>
          </div>
        </div>
      </Section>
    </div>
  );
}
