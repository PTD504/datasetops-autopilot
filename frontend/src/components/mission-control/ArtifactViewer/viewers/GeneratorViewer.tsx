import React from "react";
import Section from "../components/Section";

export default function GeneratorViewer() {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Generated QA Sample Pairs">
        <div className="space-y-3">
          <p className="text-slate-400">
            This workspace displays the list of generated QA question, answer, and reference source context pairs.
          </p>
          <div className="border border-white/5 bg-white/[0.01] p-3.5 rounded-xl font-mono text-[11px] text-slate-500 space-y-1">
            <div className="text-amber-400"># Sample Generator Agent</div>
            <div>[Synthesizing] slot_001: Question, Answer, and Evidence pairs.</div>
            <div>[Evidence Mapping] Chunk 12 matching vector COS distance: 0.89.</div>
            <div>[Total Generated] 30 / 30 QA completed.</div>
          </div>
        </div>
      </Section>
    </div>
  );
}
