"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cpu, ExternalLink, ArrowRight } from "lucide-react"

// Import modularized components
import HeroWorkflowIllustration from "@/components/HeroWorkflowIllustration"
import OverviewSection from "./_components/OverviewSection"
import PipelineSection from "./_components/PipelineSection"
import WhyRAGSection from "./_components/WhyRAGSection"
import TechStackSection from "./_components/TechStackSection"

export default function Home() {
  const [scrolled, setScrolled] = useState(false)

  // Track page scroll to add borders/backgrounds to top header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    // Scoped landing page container with radiating deep navy gradient and grid overlay
    <div 
      className="relative w-full min-h-screen text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 animate-fade-in duration-300"
      style={{ background: 'radial-gradient(circle at 50% 0%, #0d0f28 0%, #030014 45%, #010006 100%)' }}
    >
      
      {/* Modern fine grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1123_1px,transparent_1px),linear-gradient(to_bottom,#0f1123_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* Decorative ambient glowing blobs */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      {/* 3D Floating Decorative Glassmorphic Panels */}
      <div className="absolute top-[12%] left-[-60px] w-[140px] h-[140px] rounded-3xl bg-white/[0.01] border border-white/[0.04] backdrop-blur-[20px] rotate-6 animate-float opacity-75 pointer-events-none shadow-2xl"></div>

      {/* Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
        scrolled 
          ? "border-b border-white/15 bg-[#05041a]/95 backdrop-blur-lg py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]" 
          : "border-b border-white/8 bg-[#030014]/60 backdrop-blur-md py-4.5"
      }`}>
        <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102_241,0.5)] group-hover:shadow-[0_0_25px_rgba(99,102_241,0.7)] group-hover:scale-105 transition-all duration-300">
              <Cpu size={18} className="text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-slate-200 transition-colors">DatasetOps <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Autopilot</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
            <a href="#overview" className="hover:text-white transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-500 hover:after:w-full after:transition-all after:duration-300">Overview</a>
            <a href="#pipeline" className="hover:text-white transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-500 hover:after:w-full after:transition-all after:duration-300">Pipeline</a>
            <a href="#features" className="hover:text-white transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-500 hover:after:w-full after:transition-all after:duration-300">Features</a>
            <a href="https://github.com/PTD504/datasetops-autopilot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">GitHub <ExternalLink size={10} /></a>
          </nav>

          <Link href="/projects/new">
            <span className="btn-premium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2 px-4.5 rounded-xl border border-indigo-400/20 transition-all duration-300 cursor-pointer shadow-[0_2px_15px_rgba(99,102,241,0.35)] active:scale-95 flex items-center gap-1.5">
              Launch Console <ArrowRight size={12} />
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-32 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Hero Columns (col-span-7) */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-[10px] font-bold tracking-wider uppercase animate-pulse-glow mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Autonomous Multi-Agent Workflow
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
                  Automated RAG <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Evaluation Benchmarks</span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                  DatasetOps Autopilot automatically creates RAG evaluation benchmarks using specialized AI agents. Transition from manual scripting to autonomous test generation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/projects/new" className="w-full sm:w-auto">
                  <span className="w-full btn-premium bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm h-13 px-7 rounded-xl shadow-[0_4px_25px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_35px_rgba(99,102,241,0.6)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/30 active:scale-95">
                    Create Benchmark <ArrowRight size={16} />
                  </span>
                </Link>
                <a href="#overview" className="w-full sm:w-auto btn-premium bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white font-bold text-sm h-13 px-7 rounded-xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 shadow-md">
                  Explore Architecture
                </a>
              </div>

              {/* Symmetrical stats section under Hero */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.05] max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-extrabold text-white">100%</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Automated Workflow</div>
                </div>
                <div className="border-x border-white/[0.06] px-4">
                  <div className="text-2xl font-extrabold text-indigo-400">&ge; 0.85</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Faithfulness Pass</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-purple-400">&le; 0.25</div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Hallucination Risk</div>
                </div>
              </div>
            </div>

            {/* Right Hero Columns: Simulation UI (col-span-5) */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroWorkflowIllustration />
            </div>

          </div>
        </div>
      </section>

      {/* Extract Component Sections */}
      <OverviewSection />
      <PipelineSection />
      <WhyRAGSection />
      <TechStackSection />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#040212] py-7 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <Cpu size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">DatasetOps Autopilot</span>
          </div>

          <p className="text-xs text-slate-600 font-sans font-medium text-center md:text-right">
            &copy; 2026 DatasetOps Autopilot. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}
