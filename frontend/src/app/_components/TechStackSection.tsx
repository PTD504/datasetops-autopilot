import { Cpu, Layers, Database, Code, Compass, Shield } from "lucide-react"

export default function TechStackSection() {
  const capabilities = [
    {
      icon: Compass,
      title: "Intelligent Source Analysis",
      desc: "Ingests raw markdown, PDF, or text files, running semantic scans to build topic concept maps, identify chunk density, and evaluate category coverage.",
      whyItMatters: "Ensures evaluation is grounded in actual document coverage rather than random guesses.",
      benefit: "Creates a structured profile of your knowledge base, preventing uneven test distribution.",
      tag: "Source Scanner"
    },
    {
      icon: Layers,
      title: "Human-in-the-Loop Planning",
      desc: "Generates an interactive benchmark blueprint outlining topic coverage, difficulty distributions, and sample counts, requiring human review before running.",
      whyItMatters: "Gives developers complete control over the evaluation scope before spinning up expensive model generation calls.",
      benefit: "Prevents API waste and guarantees the generated test suite aligns with project requirements.",
      tag: "Planner Agent"
    },
    {
      icon: Cpu,
      title: "Autonomous Generation",
      desc: "Spins up parallel agents that draft custom single-hop, multi-hop, unanswerable, and edge-case question-answer pairs.",
      whyItMatters: "Replaces slow, error-prone manual scripting of test suites with high-speed autonomous generation.",
      benefit: "Delivers diverse, production-grade test cases covering all potential query pathways.",
      tag: "Generator Agent"
    },
    {
      icon: Shield,
      title: "Quality Evaluation & Repair",
      desc: "Audits every generated sample against strict metrics (Faithfulness, Relevance, Hallucination Risk) and auto-repairs failed entries.",
      whyItMatters: "Guarantees zero-hallucination ground truth data without requiring human review for every line.",
      benefit: "Maintains high benchmark integrity by recursively fixing incorrect references.",
      tag: "Evaluator Agent"
    },
    {
      icon: Database,
      title: "Rich Artifact Viewer",
      desc: "Provides a clean visual interface to inspect evaluation logs, agent traces, and individual question metrics.",
      whyItMatters: "Allows transparent debugging of agent decision-making and quality auditing steps.",
      benefit: "Allows deep-diving into individual test cases before committing to production export.",
      tag: "Mission Control"
    },
    {
      icon: Code,
      title: "Production Benchmark Export",
      desc: "Compiles verified samples into structured test packages including datasets, answer keys, and quality reports.",
      whyItMatters: "Saves hours of formatting and wrangling, producing plug-and-play evaluation files.",
      benefit: "Delivers standard .jsonl and .md formats compatible with any RAG testing framework.",
      tag: "Exporter Agent"
    }
  ]

  return (
    <section className="py-32 relative z-10 border-t border-white/10">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 block">
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Product Capabilities
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
            Explore the core features designed to automate and guarantee RAG evaluation dataset quality.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, idx) => {
            const Icon = item.icon
            return (
              <div 
                key={idx} 
                className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden h-[330px]"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] group-hover:bg-indigo-500/[0.02] rounded-full blur-xl transition duration-300"></div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-slate-400 group-hover:text-white transition duration-300 shadow-sm">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-bold text-white leading-tight">{item.title}</h3>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>

                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] text-slate-500 font-sans">
                      <strong className="text-slate-400 font-semibold">Why it matters:</strong> {item.whyItMatters}
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans">
                      <strong className="text-slate-400 font-semibold">Benefit:</strong> {item.benefit}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/[0.04] pt-3.5 flex items-center justify-between mt-auto">
                  <span className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider">System Component</span>
                  <span className="text-[9px] font-bold font-mono text-indigo-400">{item.tag}</span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
