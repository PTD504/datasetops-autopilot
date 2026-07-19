import Link from "next/link"
import { ChevronRight, ShieldCheck, CheckCircle2, Terminal } from "lucide-react"

export default function WhyRAGSection() {
  return (
    <section id="features" className="py-32 relative z-10 border-y border-white/10 bg-[#07051a]/70 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.3)]">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Description & Scorecard Column */}
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 block">
                Industry Standard
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Why Automated RAG <br /> Evaluation Matters
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
                Modern LLM systems depend on precise semantic retrieval. Without high-quality, ground-truth benchmarks, measuring drift, precision, and alignment is impossible.
              </p>
            </div>

            {/* Scorecard Widget */}
            <div className="glass-panel rounded-2xl p-5 bg-black/40 space-y-4 shadow-inner max-w-md mx-auto lg:mx-0 select-none">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Evaluation Targets</span>
                <span className="text-indigo-400 text-[10px] font-bold font-mono">Codebase Validation</span>
              </div>
              
              <div className="space-y-3 font-sans text-xs">
                {/* Metric 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-300">
                    <span>Faithfulness Score (Groundedness)</span>
                    <span className="text-emerald-400 font-bold">&ge; 0.85</span>
                  </div>
                  <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-300">
                    <span>Answer Relevance Score</span>
                    <span className="text-emerald-400 font-bold">&ge; 0.75</span>
                  </div>
                  <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-300">
                    <span>Hallucination Risk Score</span>
                    <span className="text-purple-400 font-bold">&le; 0.25</span>
                  </div>
                  <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-300">
                    <span>Overall Score</span>
                    <span className="text-emerald-400 font-bold">&ge; 0.80</span>
                  </div>
                  <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/projects/new">
                <span className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold text-sm cursor-pointer group transition duration-200">
                  Start Building A Benchmark <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>

          {/* Right Visual Artifacts Column (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Artifact 1: Verified QA Pair Card */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden bg-gradient-to-b from-[#0e0f22]/50 to-[#0b0c16]/30 shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Verified QA Sample</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  <CheckCircle2 size={8} /> Grounded
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Chunk Context */}
                <div className="space-y-1.5 bg-white/[0.01] border border-white/[0.04] rounded-xl p-3 shadow-inner">
                  <span className="text-[9px] font-bold text-slate-500 font-mono uppercase">Source Context (cluster_config.md)</span>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    "...Auto-scaling thresholds are managed by the orchestrator daemon. The system scales up nodes automatically when average CPU utilization remains above 80% for a continuous period of 5 minutes."
                  </p>
                </div>

                {/* Question & Answer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 font-mono uppercase">Generated Question</span>
                    <p className="text-white font-bold leading-normal font-sans">
                      Under what utilization threshold and duration will the orchestrator daemon scale up nodes?
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase">Audited Answer Key</span>
                    <p className="text-slate-300 leading-normal font-sans">
                      Nodes scale up when average CPU utilization stays above 80% for 5 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Artifact 2: JSON Export Preview */}
            <div className="glass-panel rounded-2xl p-5 bg-[#05060f]/80 relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-slate-500" />
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">rag_eval.jsonl</span>
                </div>
                <span className="text-[8px] text-slate-600 font-mono">UTF-8 / JSON</span>
              </div>

              <pre className="text-[9.5px] text-slate-400 leading-relaxed font-mono overflow-x-auto whitespace-pre select-none max-h-[220px] p-3 bg-black/50 rounded-xl shadow-inner border border-white/[0.05] scrollbar-hide">
                <code className="text-indigo-300 font-mono">
                  {`{"id": "3dac4f21-77ae-49fb-8d3a-9429cec1e26f", "sample_type": "single_hop", "question": "Under what utilization threshold and duration will the orchestrator daemon scale up nodes?", "source_chunk_ids": ["chunk_658cdfea-1944-40f6-b610-1c6a7e582504"], "evidence": [{"chunk_id": "chunk_658cdfea-1944-40f6-b610-1c6a7e582504", "text": "...Auto-scaling thresholds are managed by the orchestrator daemon. The system scales up nodes automatically when average CPU utilization remains above 80% for a continuous period of 5 minutes."}]}
{"id": "8fa3c11d-2831-4be6-a192-1c6a7e582504", "sample_type": "multi_hop", "question": "How do you configure authentication key rotations for cluster daemons?", "source_chunk_ids": ["chunk_c85598f2-c20c-4816-9119-6d3d5e54c6f4", "chunk_658cdfea-1944-40f6-b610-1c6a7e582504"], "evidence": [{"chunk_id": "chunk_c85598f2-c20c-4816-9119-6d3d5e54c6f4", "text": "Authentication secrets are defined under /etc/cluster/daemon.conf."}, {"chunk_id": "chunk_658cdfea-1944-40f6-b610-1c6a7e582504", "text": "Run daemon-reload with SIGHUP to trigger safe key rotation."}]}
{"id": "b91f1a23-45c1-4822-a9b0-9831a293c12a", "sample_type": "unanswerable", "question": "What is the maximum number of external nodes allowed in a hybrid multi-cloud configuration?", "source_chunk_ids": ["chunk_a7b4582f-e1c2-482d-8812-7d2d3e582504"], "evidence": [{"chunk_id": "chunk_a7b4582f-e1c2-482d-8812-7d2d3e582504", "text": "Hybrid cluster limits are described in cloud-provider manuals, not local configs."}]}`}
                </code>
              </pre>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
