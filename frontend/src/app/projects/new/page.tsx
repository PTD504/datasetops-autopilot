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
  Sparkles,
  Trash2,
  CheckCircle2,
  Cpu,
  Layers,
  FileCode,
  ArrowRight,
  RefreshCw,
  Eye,
  Check,
  Search,
  Scale,
  Download
} from "lucide-react"

export default function NewProject() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [request, setRequest] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false)

  const PROMPT_TEMPLATES = [
    {
      name: "Factual Q&A",
      text: "Generate 20 factual single-hop questions directly grounded in the documentation, targeting installation, basic configuration, and core API query parameter specifications."
    },
    {
      name: "Multi-Hop Reasoning",
      text: "Generate 15 multi-hop questions requiring synthesis across multiple sections, such as connecting user authentication scopes with database query permissions."
    },
    {
      name: "Unanswerable Questions",
      text: "Generate 10 unanswerable questions where the topic is relevant but the specific information is missing from the docs. Ensure agents explain why they cannot be answered."
    },
    {
      name: "Edge Cases & Errors",
      text: "Generate 15 diagnostic questions focused on API edge cases, invalid token responses, rate limiting behaviors, and recovery procedures."
    }
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (idxToRemove: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== idxToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const apiUrl = ""
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
    // Rich, radial background spanning the entire viewport
    <div 
      className="relative w-full min-h-screen text-slate-100 overflow-hidden font-sans flex flex-col py-8 px-6 sm:px-8 selection:bg-indigo-500/30 selection:text-indigo-200"
      style={{ background: 'radial-gradient(circle at 50% 0%, #0d0f28 0%, #030014 45%, #010006 100%)' }}
    >
      {styleTag}

      {/* Grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1123_1px,transparent_1px),linear-gradient(to_bottom,#0f1123_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none"></div>

      {/* Ambient glowing blobs spreading down the page */}
      <div className="absolute top-[-10%] left-[10%] w-[800px] h-[450px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[20%] w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[35%] right-[-100px] w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[5%] w-[600px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Floating 3D glass panels */}
      <div className="absolute top-[18%] right-[8%] w-[100px] h-[100px] rounded-3xl bg-white/[0.01] border border-white/[0.04] backdrop-blur-[20px] rotate-12 animate-float pointer-events-none shadow-2xl"></div>
      <div className="absolute bottom-[20%] left-[4%] w-[80px] h-[80px] rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/[0.03] backdrop-blur-[15px] -rotate-12 animate-float-delayed pointer-events-none shadow-2xl"></div>

      {/* Spotlight glow centering */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Workspace container */}
      <div className="container mx-auto max-w-6xl w-full flex-1 flex flex-col justify-center gap-6 relative z-10 animate-fade-in">
        
        {/* Top Header Section */}
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors group cursor-pointer">
            <ArrowLeft size={12} className="transform group-hover:-translate-x-0.5 transition-transform" /> Back to Home
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 w-full pb-4 border-b border-white/[0.05]">
            <div className="space-y-2 max-w-xl">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                Configure Autopilot Workspace
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                Set up your RAG benchmark generation session. Autopilot&apos;s team of specialized AI agents will coordinate autonomously to map, generate, and evaluate your dataset.
              </p>
            </div>
            
            {/* Staggered/Zigzag Agent Status Indicators Grid */}
            <div className="shrink-0 max-w-sm w-full lg:w-auto bg-white/[0.01] border border-white/[0.05] rounded-xl p-3 shadow-inner">
              <div className="flex items-center justify-between gap-6 mb-1.5 border-b border-white/[0.04] pb-1">
                <span className="text-[8px] font-mono text-slate-500 font-bold uppercase tracking-widest">Active Agent Pipeline</span>
                <span className="text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Ready</span>
              </div>
               <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-[9px] text-slate-300">
                {[
                  { name: "SourceUnderstandingAgent", col: 1 },
                  { name: "IntakePlannerAgent", col: 2 },
                  { name: "BenchmarkGeneratorAgent", col: 1 },
                  { name: "QualityEvaluatorAgent", col: 2 },
                  { name: "ExporterAgent", col: 1 }
                ].map((agent, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-1.5 font-medium hover:text-white transition-colors duration-200 ${
                      agent.col === 2 ? "pl-2" : ""
                    }`}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    {agent.name}
                  </div>
                ))}
              </div>
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
        <form onSubmit={handleSubmit} className="w-full space-y-8">
          
          {/* Asymmetric Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column (col-span-5) — Project Name & Source Documents */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Panel 1 — Project Name */}
              <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between relative group overflow-hidden">
                {/* Glowing edge indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  {/* Panel Header */}
                  <div className="flex items-center gap-2.5 mb-4 border-b border-white/[0.06] pb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                      <FolderOpen size={15} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">Project Name</h3>
                      <p className="text-[9px] text-slate-500">Benchmark workspace label</p>
                    </div>
                  </div>

                  {/* Panel Content */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                      Define Project Identifier
                    </label>
                    <input 
                      id="name" 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="e.g. Acme Corp Docs Benchmark" 
                      className="w-full bg-[#070817]/65 hover:bg-[#070817]/95 focus:bg-[#04040f] border border-white/10 hover:border-white/20 focus:border-indigo-400 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 shadow-inner transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.04]">
                  <p className="text-[10px] text-slate-500 leading-relaxed font-normal">
                    Give your project a descriptive identifier. Stored in exported metadata and quality reports for trace audits.
                  </p>
                </div>
              </div>

              {/* Panel 2 — Source Documents */}
              <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between flex-1 relative group overflow-hidden">
                {/* Glowing edge indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo-500 to-purple-600 opacity-70 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex-1 flex flex-col min-h-0">
                  {/* Panel Header */}
                  <div className="flex items-center gap-2.5 mb-4 border-b border-white/[0.06] pb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                      <UploadCloud size={15} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">Source Documents</h3>
                      <p className="text-[9px] text-slate-500">Semantic vector ingestion</p>
                    </div>
                  </div>

                  {/* Drag and Drop Container */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-300 group/drop flex flex-col items-center justify-center ${
                      isDragging 
                        ? "border-indigo-400 bg-indigo-950/20 scale-[0.99] shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                        : "border-white/10 hover:border-indigo-500/40 bg-[#070817]/40 hover:bg-[#070817]/65"
                    }`}
                  >
                    <UploadCloud 
                      size={26} 
                      className={`mx-auto mb-2 transition-all duration-300 ${
                        isDragging ? "text-indigo-400 scale-110 animate-bounce" : "text-slate-400 group-hover/drop:text-indigo-400 group-hover/drop:scale-105"
                      }`} 
                    />
                    <div className="text-xs text-slate-300 font-semibold mb-0.5">
                      {isDragging ? "Drop your documents here" : "Drag files or browse"}
                    </div>
                    <div className="text-[9px] text-slate-500 leading-normal max-w-[200px] mx-auto">
                      Supports .txt, .md, .markdown, .pdf (max 10MB total)
                    </div>
                    
                    <input
                      id="files"
                      type="file"
                      multiple
                      accept=".txt,.md,.markdown,.pdf,text/plain,text/markdown,application/pdf"
                      onChange={handleBrowse}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  
                  {/* Uploaded files list */}
                  {files.length > 0 ? (
                    <div className="flex-1 flex flex-col min-h-0 mt-4 animate-fade-in">
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono font-bold flex items-center gap-1.5 mb-2 pb-1 border-b border-white/[0.04]">
                        <FolderOpen size={10} className="text-indigo-400" /> Staged Documents ({files.length})
                      </span>
                      <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-1 flex-1 scrollbar-none">
                        {files.map((file, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between gap-2 bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.04] px-3 py-1.5 rounded-lg text-[10px] leading-tight transition-colors group/file"
                          >
                            <div className="flex items-center gap-2 truncate min-w-0">
                              <FileText size={12} className="text-indigo-400 shrink-0" />
                              <span className="truncate text-slate-300 font-medium font-sans">{file.name}</span>
                              <span className="text-[8px] text-slate-500 font-mono shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded flex items-center gap-0.5">
                                <Check size={8} /> 100%
                              </span>
                              <button 
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-0.5 rounded cursor-pointer"
                                title="Remove file"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 text-[11px] flex-1 flex flex-col justify-center border border-white/[0.02] bg-white/[0.005] rounded-xl p-3 min-h-[100px] mt-4 leading-relaxed font-normal">
                      No documents staged yet. Upload source documents to build the local semantic grounding engine.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (col-span-7) — Benchmark Request (Primary Focus) */}
            <div className="lg:col-span-7">
              <div className="glass-panel glass-panel-hover rounded-2xl p-6 h-full flex flex-col justify-between relative group overflow-hidden border-indigo-500/20 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(99,102,241,0.06)] hover:border-indigo-400/40 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9),0_0_50px_rgba(99,102,241,0.12)]">
                {/* Glowing edge highlight for primary card */}
                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-indigo-500 via-indigo-400 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shadow-inner">
                        <Brain size={18} className="animate-gentle-float" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">Benchmark Request</h3>
                          <span className="text-[8px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">PRIMARY INPUT</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Instruct generation agents with natural prompts</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-indigo-400 flex items-center gap-1.5">
                      <Sparkles size={10} className="text-indigo-400" /> prompts active
                    </span>
                  </div>

                  {/* Input Label and Textarea */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label htmlFor="request" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Instruct Generation Agents
                    </label>
                    <textarea
                      id="request"
                      required
                      value={request}
                      onChange={e => setRequest(e.target.value)}
                      placeholder="e.g. Generate 20 technical questions focusing on troubleshooting procedures and API usage. Target an intermediate developer audience."
                      className="w-full flex-1 min-h-[220px] bg-[#070817]/65 hover:bg-[#070817]/95 focus:bg-[#04040f] border border-white/10 hover:border-white/20 focus:border-indigo-400 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 shadow-inner transition-all duration-300 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Quick Select Prompts */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">
                      Select Prompt Blueprint Template
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PROMPT_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRequest(tmpl.text)}
                          className="text-left text-[10px] bg-white/[0.01] hover:bg-indigo-500/10 border border-white/[0.04] hover:border-indigo-500/30 p-2.5 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex flex-col gap-1 group/btn"
                        >
                          <span className="font-bold text-slate-300 group-hover/btn:text-white transition-colors flex items-center gap-1">
                            <Sparkles size={8} className="text-indigo-400 group-hover/btn:scale-110 transition-transform" />
                            {tmpl.name}
                          </span>
                          <span className="text-[9px] text-slate-500 line-clamp-1 group-hover/btn:text-slate-400 transition-colors">
                            {tmpl.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.04]">
                  <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
                    Describe requirements like volume, concepts, and difficulty. Agents will map this blueprint to search vector facts and compile QA pairs.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Workflow Preview Timeline */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            {/* Ambient glow in pipeline */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[80px] bg-indigo-500/[0.02] rounded-full blur-[40px] pointer-events-none"></div>

            <div className="space-y-6">
              {/* Header */}
              <div className="text-center max-w-xl mx-auto space-y-1">
                <span className="text-[10px] font-bold font-mono tracking-widest text-indigo-400 uppercase">
                  Workflow Execution Pipeline
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  Autopilot Execution Lifecycle
                </h4>
                <p className="text-xs text-slate-500 max-w-xl mx-auto font-normal leading-relaxed">
                  The sequence of autonomous stages executed from raw document ingestion to the finished benchmark bundle. The QualityEvaluatorAgent audits samples and routes feedback back to the Generator for iterative refinement.
                </p>
              </div>

              {/* Timeline Horizontal Layout */}
              <div className="relative pt-4 pb-2">
                
                {/* Horizontal connection line */}
                <div className="hidden md:block absolute top-[28px] left-[6%] right-[6%] h-[2px] bg-gradient-to-r from-indigo-500/10 via-indigo-400/25 to-purple-500/10 pointer-events-none z-0"></div>

                <div className="grid grid-cols-2 md:grid-cols-7 gap-y-6 gap-x-4 relative z-10">
                  
                  {/* Step 1: Uploaded Docs */}
                  <div className="flex flex-col items-center text-center space-y-2 group/step">
                    <div className="w-10 h-10 rounded-xl bg-[#070817] border border-white/10 group-hover/step:border-indigo-500/40 flex items-center justify-center shadow-inner group-hover/step:scale-105 group-hover/step:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
                      <FolderOpen size={16} className="text-slate-400 group-hover/step:text-indigo-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold font-mono text-slate-500 uppercase">Ingestion</div>
                      <div className="text-[10px] font-extrabold text-white">Uploaded Docs</div>
                    </div>
                  </div>

                  {/* Step 2: Source Scanner */}
                  <div className="flex flex-col items-center text-center space-y-2 group/step">
                    <div className="w-10 h-10 rounded-xl bg-[#070817] border border-white/10 group-hover/step:border-indigo-500/40 flex items-center justify-center shadow-inner group-hover/step:scale-105 group-hover/step:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
                      <Search size={16} className="text-slate-400 group-hover/step:text-indigo-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold font-mono text-slate-500 uppercase">Understanding</div>
                      <div className="text-[10px] font-extrabold text-white">Source Scanner</div>
                    </div>
                  </div>

                  {/* Step 3: Intake Planner */}
                  <div className="flex flex-col items-center text-center space-y-2 group/step">
                    <div className="w-10 h-10 rounded-xl bg-[#070817] border border-white/10 group-hover/step:border-indigo-500/40 flex items-center justify-center shadow-inner group-hover/step:scale-105 group-hover/step:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
                      <Brain size={16} className="text-slate-400 group-hover/step:text-indigo-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold font-mono text-slate-500 uppercase">Planning</div>
                      <div className="text-[10px] font-extrabold text-white">Intake Planner</div>
                    </div>
                  </div>

                  {/* Step 4: Plan Approved */}
                  <div className="flex flex-col items-center text-center space-y-2 group/step">
                    <div className="w-10 h-10 rounded-xl bg-[#070817] border border-white/10 group-hover/step:border-indigo-500/40 flex items-center justify-center shadow-inner group-hover/step:scale-105 group-hover/step:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
                      <CheckCircle2 size={16} className="text-slate-400 group-hover/step:text-indigo-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold font-mono text-slate-500 uppercase">Human Gate</div>
                      <div className="text-[10px] font-extrabold text-white">Plan Approved</div>
                    </div>
                  </div>

                  {/* Step 5: Generator */}
                  <div className="flex flex-col items-center text-center space-y-2 group/step">
                    <div className="w-10 h-10 rounded-xl bg-[#070817] border border-indigo-500/30 group-hover/step:border-indigo-400 flex items-center justify-center shadow-inner group-hover/step:scale-105 group-hover/step:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-300">
                      <Sparkles size={16} className="text-indigo-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold font-mono text-indigo-400 uppercase">Synthesis</div>
                      <div className="text-[10px] font-extrabold text-white">Generator</div>
                    </div>
                  </div>

                  {/* Step 6: Evaluator / Repair */}
                  <div className="flex flex-col items-center text-center space-y-2 group/step relative">
                    {/* Visual box border for loop cycle covering Step 5 and 6 */}
                    <div className="hidden md:block absolute top-[-14px] bottom-[-20px] left-[-115%] right-[-10%] border border-dashed border-indigo-500/40 bg-indigo-500/[0.02] rounded-2xl z-10 pointer-events-none">
                      <div className="absolute top-[-9px] left-1/2 -translate-x-1/2 text-[7px] font-mono uppercase tracking-widest text-indigo-400 font-bold bg-[#0a0b22] px-2 py-0.5 rounded-full border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                        Repair Loop ↺
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#070817] border border-indigo-500/30 group-hover/step:border-indigo-400 flex items-center justify-center shadow-inner group-hover/step:scale-105 group-hover/step:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-300 relative z-10">
                      <Scale size={16} className="text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-0.5 relative z-10">
                      <div className="text-[9px] font-bold font-mono text-indigo-400 uppercase">Quality Audit</div>
                      <div className="text-[10px] font-extrabold text-white">Evaluator / Critic</div>
                    </div>
                  </div>

                  {/* Step 7: Exporter */}
                  <div className="flex flex-col items-center text-center space-y-2 group/step">
                    <div className="w-10 h-10 rounded-xl bg-[#070817] border border-white/10 group-hover/step:border-indigo-500/40 flex items-center justify-center shadow-inner group-hover/step:scale-105 group-hover/step:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all duration-300">
                      <Download size={16} className="text-slate-400 group-hover/step:text-indigo-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold font-mono text-slate-500 uppercase">Exports</div>
                      <div className="text-[10px] font-extrabold text-white">Exporter</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Submit Row Actions Panel */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full max-w-md bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[size:200%_auto] hover:bg-right disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold h-14 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/20 hover:border-indigo-400/40 flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed transform"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-white" size={18} />
                  <span>Starting Autopilot Workflow...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" className="text-white" />
                  <span>Start Autopilot Workflow</span>
                </>
              )}
            </button>
            
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-mono uppercase tracking-widest">
                <Terminal size={10} />
                <span>Initiates 5 Autonomous Agents</span>
              </div>
              <p className="text-[10px] text-slate-500 font-normal max-w-sm mx-auto">
                Launches the agent team to parse documentation, draft the category scope, generate candidate samples, evaluation metrics, and run self-repair loops.
              </p>
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
    .animate-spin-slow {
      animation: spin 8s linear infinite;
    }
  `}} />
)
