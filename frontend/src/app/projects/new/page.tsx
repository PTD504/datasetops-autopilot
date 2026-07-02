"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  AlertCircle, 
  ArrowLeft, 
  UploadCloud, 
  Play, 
  Loader2, 
  FileText, 
  Brain, 
  FolderOpen, 
  Terminal, 
  Sparkles 
} from "lucide-react"

export default function NewProject() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [request, setRequest] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const res = await fetch(`${apiUrl}/api/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          benchmark_request: request
        }),
      })
      if (!res.ok) throw new Error("Failed to create project")
      const data = await res.json()

      if (files.length === 0) {
        throw new Error("Upload at least one source document before starting.")
      }

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        const uploadRes = await fetch(`${apiUrl}/api/projects/${data.id}/documents`, {
          method: "POST",
          body: formData,
        })
        if (!uploadRes.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
      }

      const startRes = await fetch(`${apiUrl}/api/projects/${data.id}/start`, {
        method: "POST"
      })
      if (!startRes.ok) {
        const error = await startRes.json().catch(() => null)
        throw new Error(error?.detail || "Failed to start workflow")
      }

      router.push(`/projects/${data.id}`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Error creating project")
    } finally {
      setLoading(false)
    }
  }

  return (
    // Rich, multi-layered background spanning the entire viewport
    <div 
      className="relative w-full min-h-screen text-slate-100 overflow-hidden font-sans flex flex-col py-8 px-6 sm:px-8"
      style={{ background: 'linear-gradient(180deg, #090b20 0%, #030114 50%, #010006 100%)' }}
    >
      {styleTag}

      {/* Grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1123_1px,transparent_1px),linear-gradient(to_bottom,#0f1123_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* Enhanced overlapping gradient blobs spreading down the page */}
      <div className="absolute top-[-10%] left-[10%] w-[800px] h-[450px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[20%] w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[35%] right-[-100px] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[5%] w-[600px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[10%] w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Floating 3D glass panels */}
      <div className="absolute top-[18%] right-[8%] w-[100px] h-[100px] rounded-3xl bg-white/[0.01] border border-white/[0.04] backdrop-blur-[20px] rotate-12 animate-float pointer-events-none shadow-2xl"></div>
      <div className="absolute bottom-[20%] left-[4%] w-[80px] h-[80px] rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/[0.03] backdrop-blur-[15px] -rotate-12 animate-float-delayed pointer-events-none shadow-2xl"></div>

      {/* Spotlight glow centering */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Workspace container */}
      <div className="container mx-auto max-w-6xl w-full flex-1 flex flex-col justify-center gap-6 relative z-10">
        
        {/* Top Header Section */}
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors group cursor-pointer">
            <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                Configure Autopilot Workspace
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-normal leading-relaxed">
                Set up your RAG benchmark generation session. Autopilot&apos;s team of 5 AI agents will coordinate autonomously to map, generate, and evaluate your dataset.
              </p>
            </div>
            <div className="self-start md:self-auto flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider">CONSOLE READY</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 text-xs flex items-start gap-3 animate-pulse">
            <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold">Execution Failed</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Configurations Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          {/* Three-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            
            {/* Panel 1 — Project Name */}
            <div className="relative border border-white/[0.08] bg-[#0c0d21]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.06)] hover:border-indigo-500/30 hover:shadow-[0_12px_40px_rgba(99,102,241,0.18)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col p-6 h-full min-h-[390px] overflow-hidden group">
              
              {/* Left glowing edge highlight */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 to-purple-600 rounded-l-2xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Panel Header */}
              <div className="flex items-center gap-2.5 mb-4 border-b border-white/[0.06] pb-3 shrink-0">
                <div className="w-8.5 h-8.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <FolderOpen size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">Project Name</h3>
                  <p className="text-[10px] text-slate-500">Benchmark workspace label</p>
                </div>
              </div>

              {/* Panel Content */}
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
                    Define Project Identifier
                  </label>
                  <input 
                    id="name" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Acme Corp Docs Benchmark" 
                    className="w-full bg-[#0c0d1e]/50 hover:bg-[#0c0d1e]/80 focus:bg-[#080915] border border-white/10 hover:border-white/30 focus:border-indigo-400 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300"
                  />
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Give your benchmark project a descriptive name. This identifier is embedded in exported metadata, JSONL payloads, and evaluation reports for easy trace audits.
                </p>
              </div>

            </div>

            {/* Panel 2 — Source Documents */}
            <div className="relative border border-white/[0.08] bg-[#0c0d21]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.06)] hover:border-indigo-500/30 hover:shadow-[0_12px_40px_rgba(99,102,241,0.18)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col p-6 h-full min-h-[390px] overflow-hidden group">
              
              {/* Left glowing edge highlight */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 to-purple-600 rounded-l-2xl opacity-80 group-hover:opacity-100 transition-opacity"></div>

              {/* Panel Header */}
              <div className="flex items-center gap-2.5 mb-4 border-b border-white/[0.06] pb-3 shrink-0">
                <div className="w-8.5 h-8.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <UploadCloud size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">Source Documents</h3>
                  <p className="text-[10px] text-slate-500">Semantic vector ingestion</p>
                </div>
              </div>

              {/* Panel Content */}
              <div className="space-y-4 flex-1 flex flex-col justify-between min-h-0">
                <div className="relative border border-dashed border-white/15 hover:border-indigo-500/40 bg-[#0c0d1e]/20 hover:bg-[#0c0d22]/40 rounded-xl p-3.5 text-center cursor-pointer transition-all duration-300 group/drop">
                  <UploadCloud size={24} className="text-slate-400 group-hover/drop:text-indigo-400 transition-colors mx-auto mb-1 group-hover/drop:scale-110 transform duration-300" />
                  <div className="text-xs text-slate-300 font-semibold mb-0.5">
                    Drag files or <span className="text-indigo-400 underline">browse</span>
                  </div>
                  <div className="text-[9px] text-slate-500 leading-none">
                    .txt, .md, .markdown (max 10MB total)
                  </div>
                  
                  <input
                    id="files"
                    type="file"
                    multiple
                    required
                    accept=".txt,.md,.markdown,text/plain,text/markdown"
                    onChange={e => setFiles(Array.from(e.target.files || []))}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </div>
                
                {/* Uploaded files summary */}
                {files.length > 0 ? (
                  <div className="flex-1 flex flex-col min-h-0 mt-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-bold flex items-center gap-1 mb-1.5">
                      <FolderOpen size={10} className="text-indigo-400 animate-pulse" /> Staged Documents ({files.length})
                    </span>
                    <div className="space-y-1.5 overflow-y-auto max-h-[85px] pr-1 flex-1 scrollbar-none">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/[0.01] border border-white/[0.04] px-2.5 py-1 rounded-lg text-[10px] leading-tight">
                          <FileText size={10} className="text-indigo-400 shrink-0" />
                          <span className="truncate text-slate-300 font-medium font-sans flex-1">{file.name}</span>
                          <span className="text-[9px] text-slate-500 font-mono shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs flex-1 flex flex-col justify-center border border-white/[0.02] bg-white/[0.005] rounded-xl p-3 min-h-[85px] leading-relaxed">
                    Staged files viewer. Staged documents form the local semantic facts engine.
                  </div>
                )}
              </div>

            </div>

            {/* Panel 3 — Benchmark Request */}
            <div className="relative border border-white/[0.08] bg-[#0c0d21]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.06)] hover:border-indigo-500/30 hover:shadow-[0_12px_40px_rgba(99,102,241,0.18)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col p-6 h-full min-h-[390px] overflow-hidden group">
              
              {/* Left glowing edge highlight */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 to-purple-600 rounded-l-2xl opacity-80 group-hover:opacity-100 transition-opacity"></div>

              {/* Panel Header */}
              <div className="flex items-center gap-2.5 mb-4 border-b border-white/[0.06] pb-3 shrink-0">
                <div className="w-8.5 h-8.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Brain size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">Benchmark Request</h3>
                  <p className="text-[10px] text-slate-500">Autopilot agent prompt</p>
                </div>
              </div>

              {/* Panel Content */}
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <label htmlFor="request" className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block flex items-center justify-between">
                    <span>Instruct Generation Agents</span>
                    <span className="text-[9px] font-mono text-indigo-400 flex items-center gap-0.5">
                      <Sparkles size={8} /> prompts active
                    </span>
                  </label>
                  <textarea
                    id="request"
                    required
                    className="w-full bg-[#0c0d1e]/50 hover:bg-[#0c0d1e]/80 focus:bg-[#080915] border border-white/10 hover:border-white/30 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 h-[110px] resize-none"
                    value={request}
                    onChange={e => setRequest(e.target.value)}
                    placeholder="e.g. Generate 20 technical questions focusing on troubleshooting procedures and API usage. Target an intermediate developer audience."
                  />
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Describe requirements like volume, concepts, and difficulty. Agents will map this blueprint to search vector facts and compile QA pairs.
                </p>
              </div>

            </div>

          </div>

          {/* Submit Row Actions Panel */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full max-w-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold h-14 rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.25)] hover:shadow-[0_0_35px_rgba(99,102,241,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/20 hover:border-indigo-400/40 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed transform"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-white" size={18} />
                  <span>Starting Autopilot Workflow...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>Start Autopilot Workflow</span>
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-mono uppercase tracking-wider">
              <Terminal size={10} />
              <span>Initiates 5 Autonomous Agents</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  )
}

// Inline styles for floating panel keyframes
const styleTag = (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(12deg); }
      50% { transform: translateY(-12px) rotate(14deg); }
    }
    @keyframes float-delayed {
      0%, 100% { transform: translateY(0px) rotate(-12deg); }
      50% { transform: translateY(12px) rotate(-10deg); }
    }
    .animate-float {
      animation: float 8s ease-in-out infinite;
    }
    .animate-float-delayed {
      animation: float-delayed 10s ease-in-out infinite;
    }
  `}} />
)
