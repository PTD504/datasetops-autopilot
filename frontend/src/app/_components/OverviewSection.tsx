import { FolderOpen, Brain, Sparkles, Download } from "lucide-react"

export default function OverviewSection() {
  return (
    <section 
      id="overview" 
      className="py-28 relative z-10"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 block">Value Proposition</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Autonomous Benchmark Generation
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto font-normal">
            Autopilot coordinates specialized agents to scan files, design blueprints, build grounded questions, and repair bugs without manual scripting.
          </p>
        </div>

        {/* 4-Card Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Upload */}
          <div className="border border-white/5 bg-[#0b0c16]/30 hover:border-indigo-500/30 hover:bg-[#0c0d22]/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] rounded-2xl p-6 flex flex-col gap-4 transition duration-300 relative group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <FolderOpen size={18} />
            </div>
            <h3 className="text-base font-bold text-white">1. Upload Documents</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Upload your raw knowledge base files (.txt, .md). Autopilot automatically parses, organizes, and splits them into clean semantic chunks.
            </p>
          </div>

          {/* Card 2: Planner */}
          <div className="border border-white/5 bg-[#0b0c16]/30 hover:border-indigo-500/30 hover:bg-[#0c0d22]/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] rounded-2xl p-6 flex flex-col gap-4 transition duration-300 relative group">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Brain size={18} />
            </div>
            <h3 className="text-base font-bold text-white">2. Multi-Agent Planning</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              An orchestrator agent drafts an evaluation blueprint. You can inspect the plan, specify question types, difficulty levels, and approve it before generation.
            </p>
          </div>

          {/* Card 3: Generate */}
          <div className="border border-white/5 bg-[#0b0c16]/30 hover:border-indigo-500/30 hover:bg-[#0c0d22]/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] rounded-2xl p-6 flex flex-col gap-4 transition duration-300 relative group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Sparkles size={18} />
            </div>
            <h3 className="text-base font-bold text-white">3. Generate & Audit</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              The generator constructs QA pairs grounded in source context. The evaluator audits outputs to verify correctness and repair hallucinations.
            </p>
          </div>

          {/* Card 4: Export */}
          <div className="border border-white/5 bg-[#0b0c16]/30 hover:border-indigo-500/30 hover:bg-[#0c0d22]/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] rounded-2xl p-6 flex flex-col gap-4 transition duration-300 relative group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Download size={18} />
            </div>
            <h3 className="text-base font-bold text-white">4. Production Export</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Review sample metrics (HITL) and download a single distributable zip package containing standardized JSONL datasets and quality reports.
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}
