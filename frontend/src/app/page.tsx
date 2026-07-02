"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cpu, ExternalLink, ArrowRight } from "lucide-react"

// Import modularized components
import HeroWorkflowIllustration from "@/components/HeroWorkflowIllustration"
import OverviewSection from "./_components/OverviewSection"
import PipelineSection from "./_components/PipelineSection"
import WhyRAGSection from "./_components/WhyRAGSection"

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
      <header className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        scrolled 
          ? "border-b border-white/[0.05] bg-[#030014]/75 backdrop-blur-md py-4" 
          : "bg-transparent py-6"
      }`}>
        <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all">
              <Cpu size={16} className="text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white group-hover:text-slate-200 transition-colors">DatasetOps Autopilot</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#overview" className="hover:text-white transition-colors cursor-pointer">Overview</a>
            <a href="#pipeline" className="hover:text-white transition-colors cursor-pointer">Pipeline</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Docs <ExternalLink size={10} /></a>
          </nav>

          <Link href="/projects/new">
            <span className="bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer shadow-lg active:scale-95">
              Launch Console
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-28 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Columns (col-span-7) */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Automated RAG <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Evaluation Benchmarks</span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                  An autonomous multi-agent workflow that converts raw source documents into validated, production-ready RAG evaluation datasets. Stop writing evaluation test cases manually.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/projects/new">
                  <span className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm h-12 px-6 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/20 active:scale-98">
                    Create Benchmark <ArrowRight size={14} />
                  </span>
                </Link>
                <a href="#overview" className="w-full sm:w-auto bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white font-semibold text-sm h-12 px-6 rounded-xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-98">
                  Explore Architecture
                </a>
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

      {/* Footer */}
      <footer className="border-t border-white/[0.04] bg-[#02000f] py-12 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
              <Cpu size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">DatasetOps Autopilot</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs text-slate-500">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#pipeline" className="hover:text-white transition-colors">Pipeline</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">Docs <ExternalLink size={10} /></a>
          </div>

          <p className="text-xs text-slate-600 font-sans font-medium text-center md:text-right">
            &copy; 2026 DatasetOps Autopilot. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}
