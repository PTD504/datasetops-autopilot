export default function PipelineSection() {
  return (
    <section 
      id="pipeline" 
      className="border-y border-white/[0.04] py-28 relative z-10 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #030014 0%, #080924 50%, #030014 100%)' }}
    >
      {/* Centered spotlight glow behind pipeline cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 block">System Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            The Agent Workflow Pipeline
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            A comprehensive workflow that guides datasets through semantic parsing, planning, QA pairs construction, verification, and package compilation.
          </p>
        </div>

        {/* Horizontal Roadmap Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
          
          {/* Step 1: Upload */}
          <div className="flex flex-col items-center text-center p-5 border border-white/[0.04] bg-[#0b0c16]/30 hover:border-indigo-500/20 transition-all duration-300 rounded-2xl relative shadow-lg">
            <div className="w-12 h-12 rounded-full bg-slate-800/40 text-slate-200 border border-slate-700/60 flex items-center justify-center font-bold text-sm mb-4 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              01
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Upload</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Raw markdown & text knowledge base ingestion</p>
          </div>

          {/* Step 2: Planner */}
          <div className="flex flex-col items-center text-center p-5 border border-indigo-500/20 bg-indigo-950/5 hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.05)] transition-all duration-300 rounded-2xl relative shadow-lg">
            <div className="w-12 h-12 rounded-full bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm mb-4 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              02
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Planner</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Agent blueprint definition & user approval</p>
          </div>

          {/* Step 3: Source */}
          <div className="flex flex-col items-center text-center p-5 border border-white/[0.04] bg-[#0b0c16]/30 hover:border-indigo-500/20 transition-all duration-300 rounded-2xl relative shadow-lg">
            <div className="w-12 h-12 rounded-full bg-slate-800/40 text-slate-200 border border-slate-700/60 flex items-center justify-center font-bold text-sm mb-4 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              03
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Source Scan</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Core fact extraction & vector chunk scanning</p>
          </div>

          {/* Step 4: Generator */}
          <div className="flex flex-col items-center text-center p-5 border border-indigo-500/20 bg-indigo-950/5 hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.05)] transition-all duration-300 rounded-2xl relative shadow-lg">
            <div className="w-12 h-12 rounded-full bg-indigo-950/40 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm mb-4 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              04
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Generator</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Ground-truth QA generation based on blueprints</p>
          </div>

          {/* Step 5: Evaluator */}
          <div className="flex flex-col items-center text-center p-5 border border-white/[0.04] bg-[#0b0c16]/30 hover:border-indigo-500/20 transition-all duration-300 rounded-2xl relative shadow-lg">
            <div className="w-12 h-12 rounded-full bg-slate-800/40 text-slate-200 border border-slate-700/60 flex items-center justify-center font-bold text-sm mb-4 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              05
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Evaluator</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Self-repair loop audits & alignment reviews</p>
          </div>

          {/* Step 6: Export */}
          <div className="flex flex-col items-center text-center p-5 border border-emerald-500/20 bg-emerald-950/5 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.05)] transition-all duration-300 rounded-2xl relative shadow-lg">
            <div className="w-12 h-12 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm mb-4 font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              06
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Export</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Bundled production artifacts ZIP compiled</p>
          </div>

        </div>

      </div>
    </section>
  )
}
