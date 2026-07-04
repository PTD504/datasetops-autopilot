import React from "react";
import Section from "../components/Section";

export default function ExportViewer() {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Export Package Summary">
        <div className="space-y-3">
          <p className="text-slate-400">
            This workspace displays compiled JSONL and Markdown evaluation datasets stored inside the downloadable zip package.
          </p>
          <div className="border border-white/5 bg-white/[0.01] p-3.5 rounded-xl font-mono text-[11px] text-slate-500 space-y-1">
            <div className="text-emerald-400"># Export Packager Agent</div>
            <div>[Compiled] datasetops-export.zip (284 KB)</div>
            <div>[Includes] rag_eval.jsonl, dataset_card.md, license.txt</div>
            <div>[OSS Storage] Package pushed to local/Alibaba OSS storage container.</div>
          </div>
        </div>
      </Section>
    </div>
  );
}
