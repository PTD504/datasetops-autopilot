import { Brain, Search, Sparkles, Scale, Download, RefreshCw, ArrowRight } from "lucide-react"

export default function PipelineSection() {
  const agents = [
    {
      id: "AGENT_01",
      name: "SourceUnderstanding",
      icon: Search,
      color: "from-purple-500/20 to-purple-600/5",
      borderColor: "group-hover:border-purple-500/30",
      glowColor: "rgba(168,85,247,0.15)",
      role: "Document Ingestion & Categorization",
      details: "Performs hierarchical text chunking and extracts topics, category distributions, and semantic relationships to map the source context.",
      inputs: ["Raw Documents (MD/PDF/TXT)"],
      outputs: ["Source Coverage Report"]
    },
    {
      id: "AGENT_02",
      name: "IntakePlanner",
      icon: Brain,
      color: "from-indigo-500/20 to-indigo-600/5",
      borderColor: "group-hover:border-indigo-500/30",
      glowColor: "rgba(99,102,241,0.15)",
      role: "Benchmark Blueprinting",
      details: "Defines slots covering target topics, splits counts by difficulty (easy, medium, hard), and maps target reasoning pathways.",
      inputs: ["Source Coverage Report", "User Requirements"],
      outputs: ["Benchmark Plan (Awaiting Approval)"]
    },
    {
      id: "AGENT_03",
      name: "Generator",
      icon: Sparkles,
      color: "from-blue-500/20 to-blue-600/5",
      borderColor: "group-hover:border-blue-500/30",
      glowColor: "rgba(59,130,246,0.15)",
      role: "Grounded QA Synthesis",
      details: "Synthesizes diverse RAG question-answer pairs (single-hop, multi-hop, unanswerable, edge case) grounded strictly in evidence context.",
      inputs: ["Approved Benchmark Plan", "Source Context Chunks"],
      outputs: ["Candidate QA Pairs"]
    },
    {
      id: "AGENT_04",
      name: "QualityEvaluator",
      icon: Scale,
      color: "from-amber-500/20 to-amber-600/5",
      borderColor: "group-hover:border-amber-500/30",
      glowColor: "rgba(245,158,11,0.15)",
      role: "Faithfulness & Grounding Audit",
      details: "Evaluates candidate pairs against strict criteria: Faithfulness (>=0.85), Answer Relevance (>=0.75), and Hallucination Risk (<=0.25). Manages collaborative self-repair loops.",
      inputs: ["Candidate QA Pairs", "Source Context Chunks"],
      outputs: ["Evaluation Audit Report"]
    },
    {
      id: "AGENT_05",
      name: "Exporter",
      icon: Download,
      color: "from-emerald-500/20 to-emerald-600/5",
      borderColor: "group-hover:border-emerald-500/30",
      glowColor: "rgba(16,185,129,0.15)",
      role: "Benchmark Package Compiler",
      details: "Assembles passed QA pairs, answer keys, quality sheets, and markdown cards into a clean, downloadable production export.",
      inputs: ["Verified QA Pairs"],
      outputs: ["ZIP Package (JSONL & MD)"]
    }
  ]

  return (
    <section 
      id="pipeline" 
      className="border-y border-white/10 py-32 relative z-10 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #030014 0%, #06051c 50%, #030014 100%)' }}
    >
      {/* Centered spotlight glow behind pipeline cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 block">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Multi-Agent Collaboration
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Instead of linear scripts, DatasetOps Autopilot runs specialized agents that collaborate dynamically to build, audit, and repair.
          </p>
        </div>

        {/* Visual Collaboration Map */}
        <div className="mb-20 glass-panel rounded-2xl p-8 relative overflow-hidden bg-black/30 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-30"></div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-3 relative z-10 font-sans">
            
            {/* Step 1: Upload Documents */}
            <div className="flex flex-col items-center text-center w-32">
              <div className="w-12 h-12 rounded-2xl bg-slate-600/10 border border-slate-500/20 flex items-center justify-center text-slate-400">
                <Search size={20} />
              </div>
              <span className="text-[8px] font-mono text-slate-500 font-bold mt-2">INGESTION</span>
              <span className="text-[10px] font-bold text-white mt-1">Uploaded Docs</span>
            </div>

            <ArrowRight className="hidden lg:block text-slate-700" size={14} />

            {/* Step 2: Source Scanner */}
            <div className="flex flex-col items-center text-center w-32">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Search size={20} />
              </div>
              <span className="text-[8px] font-mono text-purple-400 font-bold mt-2">UNDERSTANDING</span>
              <span className="text-[10px] font-bold text-slate-300 mt-1">Source Scanner</span>
              <span className="text-[8px] text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-full mt-1">Coverage Report</span>
            </div>

            <ArrowRight className="hidden lg:block text-slate-700" size={14} />

            {/* Step 3: Planner */}
            <div className="flex flex-col items-center text-center w-32">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Brain size={20} />
              </div>
              <span className="text-[8px] font-mono text-indigo-400 font-bold mt-2">PLANNING</span>
              <span className="text-[10px] font-bold text-slate-300 mt-1">Intake Planner</span>
              <span className="text-[8px] text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-full mt-1">Benchmark Plan</span>
            </div>

            <ArrowRight className="hidden lg:block text-slate-700" size={14} />

            {/* Step 4: Human Approval (Highlighted Gate) */}
            <div className="flex flex-col items-center text-center w-32 border border-emerald-500/30 bg-emerald-950/20 rounded-2xl p-2.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Scale size={16} className="text-emerald-400" />
              </div>
              <span className="text-[8px] font-mono text-emerald-400 font-bold mt-1.5">HUMAN GATE</span>
              <span className="text-[10px] font-extrabold text-emerald-400 mt-0.5">Plan Approved</span>
            </div>

            <ArrowRight className="hidden lg:block text-slate-700" size={14} />

            {/* Step 5: Generator */}
            <div className="flex flex-col items-center text-center w-32">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Sparkles size={20} />
              </div>
              <span className="text-[8px] font-mono text-blue-400 font-bold mt-2">SYNTHESIS</span>
              <span className="text-[10px] font-bold text-slate-300 mt-1">Generator</span>
              <span className="text-[8px] text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-full mt-1">Candidate QA</span>
            </div>

            {/* Repair Loop visual arrows */}
            <div className="flex flex-col items-center gap-0.5 font-sans">
              <ArrowRight className="hidden lg:block text-red-400" size={14} />
              <div className="hidden lg:flex items-center gap-1 text-[7px] font-bold text-red-400 bg-red-950/80 border border-red-500/30 px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse">
                <RefreshCw size={7} className="animate-spin" />
                <span>REPAIR LOOP</span>
              </div>
              <ArrowRight className="hidden lg:block text-red-400 rotate-180" size={14} />
            </div>

            {/* Step 6: Evaluator & Repair */}
            <div className="flex flex-col items-center text-center w-32 border border-red-500/20 bg-red-950/5 rounded-2xl p-2.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Scale size={20} />
              </div>
              <span className="text-[8px] font-mono text-amber-400 font-bold mt-2">QUALITY AUDIT</span>
              <span className="text-[10px] font-bold text-slate-300 mt-1">Evaluator / Critic</span>
              <span className="text-[8px] text-slate-400 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-full mt-1">Verified QA</span>
            </div>

            <ArrowRight className="hidden lg:block text-slate-700" size={14} />

            {/* Step 7: Export */}
            <div className="flex flex-col items-center text-center w-32">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Download size={20} />
              </div>
              <span className="text-[8px] font-mono text-emerald-400 font-bold mt-2">EXPORTS</span>
              <span className="text-[10px] font-bold text-white mt-1">Exporter</span>
              <span className="text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full mt-1 font-bold">export.zip</span>
            </div>

          </div>
        </div>

        {/* Detailed Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {agents.map((agent, idx) => {
            const Icon = agent.icon
            return (
              <div 
                key={idx} 
                className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden h-[330px]"
                style={{ 
                  boxShadow: `inset 0 1px 1px rgba(255, 255, 255, 0.03), 0 10px 30px -10px rgba(0, 0, 0, 0.6)`
                }}
              >
                {/* Micro Ambient Glow inside the card */}
                <div 
                  className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[35px] opacity-10 group-hover:opacity-20 transition duration-300 pointer-events-none"
                  style={{ backgroundColor: agent.glowColor }}
                ></div>

                {/* Card Top: ID and Status */}
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 text-sans">
                  <span className="text-[9px] font-bold font-mono text-slate-500">{agent.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 font-sans">Online</span>
                  </div>
                </div>

                {/* Card Core Content */}
                <div className="space-y-3 mt-4 flex-grow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-slate-300 group-hover:text-white transition duration-300">
                      <Icon size={16} />
                    </div>
                    <h4 className="text-xs lg:text-[13px] font-bold text-white leading-tight font-mono">{agent.name}</h4>
                  </div>
                  
                  <div className="space-y-1.5 font-sans">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{agent.role}</div>
                    <p className="text-[10px] text-slate-500 leading-normal font-normal">
                      {agent.details}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Inputs / Outputs */}
                <div className="border-t border-white/[0.04] pt-3 space-y-1.5 font-mono text-[8px]">
                  <div className="flex justify-between text-slate-500">
                    <span>INPUT:</span>
                    <span className="text-slate-300 font-bold truncate max-w-[130px] text-right">{agent.inputs.join(", ")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>OUTPUT:</span>
                    <span className="text-indigo-400 font-bold truncate max-w-[130px] text-right">{agent.outputs.join(", ")}</span>
                  </div>
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
