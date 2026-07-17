"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MissionControlProvider } from "@/components/mission-control/store/useMissionControlStore"
import MissionControlDashboard from "./mission-control/_components/MissionControlDashboard"
import { 
  TraceItem, 
  AgentArtifact, 
  RawTraceItem, 
  UsageSummary,
  WorkflowStatus
} from "@/components/mission-control/types"

export default function ProjectStatus() {
  const params = useParams()
  const id = params.id as string
  const [status, setStatus] = useState("LOADING")
  const [usage, setUsage] = useState<UsageSummary | null>(null)
  const [traces, setTraces] = useState<RawTraceItem[]>([])
  const [combinedTrace, setCombinedTrace] = useState<TraceItem[]>([])
  const [artifacts, setArtifacts] = useState<AgentArtifact[]>([])
  const [traceLoading, setTraceLoading] = useState(true)
  const [traceError, setTraceError] = useState(false)
  const [clockDrift, setClockDrift] = useState(0)

  const terminalStates = ["DONE", "FAILED", "CANCELLED", "EXPORT_READY"]
  const isFinished = terminalStates.includes(status)

  const fetchStatus = useCallback(async () => {
    try {
      const apiUrl = ""
      const [res, usageRes, tracesRes, traceRes, artRes] = await Promise.all([
        fetch(`${apiUrl}/api/projects/${id}/status`, { cache: "no-store" }),
        fetch(`${apiUrl}/api/projects/${id}/usage`, { cache: "no-store" }),
        fetch(`${apiUrl}/api/projects/${id}/traces`, { cache: "no-store" }),
        fetch(`${apiUrl}/api/projects/${id}/trace`, { cache: "no-store" }),
        fetch(`${apiUrl}/api/projects/${id}/artifacts`, { cache: "no-store" }),
      ])

      let nextStatus = "LOADING"
      let nextUsage = null
      let nextTraces: RawTraceItem[] = []
      let nextCombinedTrace: TraceItem[] = []
      let nextArtifacts: AgentArtifact[] = []
      let hasTraceError = false

      if (res.ok) {
        const serverTimeHeader = res.headers.get("Date")
        if (serverTimeHeader) {
          const serverTime = new Date(serverTimeHeader).getTime()
          const clientTime = Date.now()
          setClockDrift(prev => prev === 0 ? (serverTime - clientTime) : prev)
        }
        const data = await res.json()
        nextStatus = data.workflow_state
      }

      if (usageRes.ok) {
        nextUsage = await usageRes.json()
      }

      if (tracesRes.ok) {
        nextTraces = await tracesRes.json()
      }

      if (traceRes.ok) {
        nextCombinedTrace = await traceRes.json()
        hasTraceError = false
      } else {
        hasTraceError = true
      }

      if (artRes.ok) {
        nextArtifacts = await artRes.json()
      }

      setStatus(nextStatus)
      setUsage(nextUsage)
      setTraces(nextTraces)
      setCombinedTrace(nextCombinedTrace)
      setArtifacts(nextArtifacts)
      setTraceError(hasTraceError)
      setTraceLoading(false)
    } catch (e) {
      console.error(e)
      setTraceError(true)
      setTraceLoading(false)
    }
  }, [id])

  useEffect(() => {
    let stopped = false
    const poll = async () => {
      if (!stopped) {
        await fetchStatus()
      }
    }

    poll()
    if (isFinished) {
      return () => {
        stopped = true
      }
    }

    const interval = setInterval(poll, 3000)
    return () => {
      stopped = true
      clearInterval(interval)
    }
  }, [fetchStatus, isFinished])

  const handleStop = async () => {
    try {
      const apiUrl = ""
      await fetch(`${apiUrl}/api/projects/${id}/stop`, { method: "POST" })
      fetchStatus()
    } catch (e) {
      console.error("Failed to stop workflow", e)
    }
  }

  const handleResume = async () => {
    const apiUrl = ""
    const res = await fetch(`${apiUrl}/api/projects/${id}/resume`, { method: "POST" })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to resume workflow");
    }
    fetchStatus()
  }

  return (
    <div 
      className="relative w-full min-h-screen text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200"
      style={{ background: 'radial-gradient(circle at 50% 0%, #0d0f28 0%, #030014 45%, #010006 100%)' }}
    >
      {/* Modern fine grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f1123_1px,transparent_1px),linear-gradient(to_bottom,#0f1123_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* Decorative ambient glowing blobs */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[650px] h-[650px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[10%] w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      {/* Main dashboard content area */}
      <main className="container mx-auto px-6 py-6 max-w-7xl relative z-10 flex flex-col min-h-[calc(100vh-73px)]">
        <MissionControlProvider initialProjectId={id}>
          <MissionControlDashboard
            projectId={id}
            workflowStatus={status as WorkflowStatus}
            traces={combinedTrace}
            artifacts={artifacts}
            rawTraces={traces}
            usage={usage}
            loading={traceLoading}
            error={traceError}
            onStopWorkflow={handleStop}
            onResumeWorkflow={handleResume}
            clockDrift={clockDrift}
          />
        </MissionControlProvider>
      </main>
    </div>
  )
}
