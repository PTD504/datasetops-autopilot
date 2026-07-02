import Link from "next/link"
import { ChevronRight, ShieldCheck, Layers, Activity, Database } from "lucide-react"

export default function WhyRAGSection() {
  return (
    <section className="py-28 relative z-10">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Description Column */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <span className="text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 block">Industry Need</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Why Automated RAG Evaluation Matters
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
              Modern LLM systems depend on precise semantic retrieval. Without high-quality, ground-truth benchmarks, measuring drift, precision, and alignment is impossible.
            </p>
            <div className="pt-4">
              <Link href="/projects/new">
                <span className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold text-sm cursor-pointer group">
                  Start Building A Benchmark <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>

          {/* Right Educational Grid (col-span-7) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="p-6 border border-white/5 bg-[#0b0c16]/30 hover:border-indigo-500/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition duration-300 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
              <h4 className="font-bold text-white text-sm">Eliminate Hallucinations</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Track whether your generator generates answers anchored firmly in retrieval context rather than speculative weights.
              </p>
            </div>

            <div className="p-6 border border-white/5 bg-[#0b0c16]/30 hover:border-indigo-500/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition duration-300 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/10 text-purple-400 border border-purple-500/10 flex items-center justify-center">
                <Layers size={16} />
              </div>
              <h4 className="font-bold text-white text-sm">Regression Safeguards</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Continuously evaluate prompt layouts, chunk settings, and model changes against verified static answer keys.
              </p>
            </div>

            <div className="p-6 border border-white/5 bg-[#0b0c16]/30 hover:border-indigo-500/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition duration-300 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/10 flex items-center justify-center">
                <Activity size={16} />
              </div>
              <h4 className="font-bold text-white text-sm">Verify Retrieval Precision</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Ensure the correct documents are returned under semantic pressure, validating chunk alignment and embedding strategies.
              </p>
            </div>

            <div className="p-6 border border-white/5 bg-[#0b0c16]/30 hover:border-indigo-500/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)] transition duration-300 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/10 flex items-center justify-center">
                <Database size={16} />
              </div>
              <h4 className="font-bold text-white text-sm">Multi-Hop Questioning</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Develop reasoning benchmarks requiring synthesis across multiple pages or sources, checking complex retrieval flows.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
