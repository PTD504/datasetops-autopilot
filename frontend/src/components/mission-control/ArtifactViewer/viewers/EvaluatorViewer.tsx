import React from "react";
import Section from "../components/Section";

export default function EvaluatorViewer() {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Quality Evaluation Reports">
        <div className="space-y-3">
          <p className="text-slate-400">
            This workspace displays RAG quality metric reports (faithfulness, answer relevance, context recall) and the repair loops checklist.
          </p>
          <div className="border border-white/5 bg-white/[0.01] p-3.5 rounded-xl font-mono text-[11px] text-slate-500 space-y-1">
            <div className="text-rose-400"># Quality Evaluator Agent</div>
            <div>[Evaluated] 30 QA samples processed.</div>
            <div>[Scores] avg_faithfulness: 0.92, avg_relevance: 0.89</div>
            <div>[Negotiation] 2 repair loop retries successfully resolved.</div>
          </div>
        </div>
      </Section>
    </div>
  );
}
