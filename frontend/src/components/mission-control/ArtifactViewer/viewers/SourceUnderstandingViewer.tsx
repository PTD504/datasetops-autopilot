import React from "react";
import Section from "../components/Section";

export default function SourceUnderstandingViewer() {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Source Understanding Reports">
        <div className="space-y-3">
          <p className="text-slate-400">
            This workspace displays the Category Coverage Report and highlights warnings about document parsing constraints.
          </p>
          <div className="border border-white/5 bg-white/[0.01] p-3.5 rounded-xl font-mono text-[11px] text-slate-500 space-y-1">
            <div className="text-violet-400"># Source Understanding Agent</div>
            <div>[Scan] Categorical density completed.</div>
            <div>[Alert] Low context density found for: upgrade subscription policies.</div>
            <div>[Confidence] 88% overall evidence density rating.</div>
          </div>
        </div>
      </Section>
    </div>
  );
}
