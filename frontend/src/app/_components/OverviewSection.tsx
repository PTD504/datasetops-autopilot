import { FolderOpen, Brain, Sparkles, Download, CheckCircle2, FileText, UserCheck, RefreshCw } from "lucide-react"

export default function OverviewSection() {
  return (
    <section 
      id="overview" 
      className="py-32 relative z-10 border-y border-white/10 bg-[#07051a]/70 backdrop-blur-md shadow-[0_0_50px_rgba(0,0,0,0.3)]"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 block">
            Core Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            How Autopilot Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
            Autopilot coordinates specialized agents to analyze documents, blueprint evaluation scopes, generate QA datasets, and audit/repair errors with human-in-the-loop control.
          </p>
        </div>

        {/* Unified 4-Step Interactive Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
          
          {/* Decorative Connecting Line between steps (desktop only) */}
          <div className="hidden lg:block absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-indigo-500/10 via-purple-500/15 to-emerald-500/10 pointer-events-none z-0"></div>
          
          {/* Step 1: Upload & Source Analysis */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-5 relative z-10 group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <FolderOpen size={20} />
              </div>
              <span className="text-[10px] font-bold font-mono text-indigo-400/80 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">PHASE 01</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Source Discovery</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Upload raw markdown, PDF, or text files. The <span className="text-slate-300 font-semibold font-mono">Source Understander</span> runs hierarchical scans to build semantic topic categories and extract grounding facts.
              </p>
            </div>

            {/* Visual Asset: Micro File List */}
            <div className="mt-auto bg-black/40 border border-white/[0.04] rounded-xl p-3.5 space-y-2 font-mono text-[9px] text-slate-400 select-none shadow-inner">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Ingested Chunks</span>
                <span className="text-indigo-400 font-bold">142 total</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <FileText size={10} className="text-slate-500" />
                <span className="truncate">knowledge_base_v2.md</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <FileText size={10} className="text-slate-500" />
                <span className="truncate">api_reference.txt</span>
              </div>
              <div className="w-full bg-indigo-950/20 border border-indigo-500/20 rounded-md p-1.5 text-center text-indigo-300 font-semibold text-[8px] uppercase tracking-wider mt-1.5">
                Source Map Built
              </div>
            </div>
          </div>

          {/* Step 2: Planning & Approval Gate */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-5 relative z-10 group border-emerald-500/20 bg-emerald-950/5">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <Brain size={20} />
              </div>
              <span className="text-[10px] font-bold font-mono text-emerald-400/80 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">PHASE 02</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">Interactive Planning <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span></h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                The <span className="text-slate-300 font-semibold font-mono">Intake Planner</span> compiles slot allocations. <strong className="text-emerald-400">Human Plan Approval</strong> is required to validate the category targets and token budgets before generation starts.
              </p>
            </div>

            {/* Visual Asset: Blueprint Dashboard with Approval Highlight */}
            <div className="mt-auto bg-black/40 border border-emerald-500/20 rounded-xl p-3.5 space-y-2 font-mono text-[9px] text-slate-400 select-none shadow-inner">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Plan Details</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5"><UserCheck size={9} /> Approved</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[8.5px]">
                  <span>Troubleshooting slots:</span>
                  <span className="font-bold text-white">20 (50%)</span>
                </div>
                <div className="flex justify-between text-[8.5px]">
                  <span>Conceptual slots:</span>
                  <span className="font-bold text-white">10 (25%)</span>
                </div>
                <div className="flex justify-between text-[8.5px]">
                  <span>API Integration slots:</span>
                  <span className="font-bold text-white">10 (25%)</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[8px] text-emerald-300 font-bold justify-center pt-1.5 border-t border-emerald-500/20">
                <CheckCircle2 size={9} />
                <span>40 SLOTS CONFIRMED</span>
              </div>
            </div>
          </div>

          {/* Step 3: Synthesis & Evaluation */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-5 relative z-10 group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <Sparkles size={20} />
              </div>
              <span className="text-[10px] font-bold font-mono text-blue-400/80 bg-blue-500/5 px-2 py-0.5 rounded-full border border-blue-500/10">PHASE 03</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Synthesis & Audit</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                The <span className="text-slate-300 font-semibold font-mono">Generator</span> drafts single/multi-hop QAs. The <span className="text-slate-300 font-semibold font-mono">Quality Evaluator</span> audits every sample against Faithfulness, Relevance, and Hallucination Risk metrics.
              </p>
            </div>

            {/* Visual Asset: QA Sandbox */}
            <div className="mt-auto bg-black/40 border border-white/[0.04] rounded-xl p-3 font-mono text-[8px] text-slate-400 select-none shadow-inner space-y-1.5">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-1">
                <span className="text-[7.5px] uppercase tracking-wider text-slate-500 font-bold">QA Auditor</span>
                <span className="flex items-center gap-0.5 text-emerald-400 font-bold"><CheckCircle2 size={8} /> GROUNDED</span>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500 font-bold text-[7px] uppercase">Q:</div>
                <div className="text-slate-200 line-clamp-1">How is the token authentication configured?</div>
                <div className="text-slate-500 font-bold text-[7px] uppercase">A:</div>
                <div className="text-slate-300 line-clamp-1 font-sans">Using the --auth-token flag inside the command.</div>
              </div>
            </div>
          </div>

          {/* Step 4: Self-Repair & Export Package */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col gap-5 relative z-10 group border-red-500/20 bg-red-950/[0.02]">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-red-600/10 text-red-400 border border-red-500/10 flex items-center justify-center group-hover:scale-110 transition duration-300">
                <RefreshCw size={20} />
              </div>
              <span className="text-[10px] font-bold font-mono text-red-400/80 bg-red-500/5 px-2 py-0.5 rounded-full border border-red-500/10">PHASE 04</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">Repair & Export <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span></h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                If audits fail, a bounded <strong className="text-red-400">Generator ↔ Evaluator Repair Loop</strong> automatically retries failing samples. The <span className="text-slate-300 font-semibold font-mono">Exporter</span> packages all verified files.
              </p>
            </div>

            {/* Visual Asset: Zip Export Card with Repair Loop Info */}
            <div className="mt-auto bg-black/40 border border-white/[0.04] rounded-xl p-3.5 space-y-2 font-mono text-[9px] text-slate-400 select-none shadow-inner">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Package Export</span>
                <span className="text-emerald-400 font-bold">Ready</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[8px]">
                  <span>rag_eval.jsonl</span>
                  <span className="text-slate-400">Data</span>
                </div>
                <div className="flex justify-between text-[8px]">
                  <span>answer_key.jsonl</span>
                  <span className="text-slate-400">Keys</span>
                </div>
                <div className="flex justify-between text-[8px]">
                  <span>quality_report.md</span>
                  <span className="text-slate-400">Audit</span>
                </div>
              </div>
              <div className="w-full bg-emerald-950/20 border border-emerald-500/20 rounded-md py-1 px-1.5 flex items-center justify-center gap-1 text-emerald-300 font-bold text-[8.5px] uppercase tracking-wider cursor-pointer hover:bg-emerald-950/30 transition">
                <Download size={9} />
                <span>Download export.zip</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
