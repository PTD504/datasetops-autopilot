import React from "react";
import Section from "../components/Section";

export default function IntakePlannerViewer() {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Benchmark Evaluation Plan">
        <div className="space-y-3">
          <p className="text-slate-400">
            This workspace displays the benchmark target sample size, topic distribution splits, and evaluation criteria rules.
          </p>
          <div className="border border-white/5 bg-white/[0.01] p-3.5 rounded-xl font-mono text-[11px] text-slate-500 space-y-1">
            <div className="text-cyan-400"># Intake Planner Agent</div>
            <div>[Plan] target_sample_size: 30 QA pairs</div>
            <div>[Split] easy: 10, medium: 10, hard: 10</div>
            <div>[Categories] Refunds, Cancellations, Subscriptions</div>
          </div>
        </div>
      </Section>
    </div>
  );
}
