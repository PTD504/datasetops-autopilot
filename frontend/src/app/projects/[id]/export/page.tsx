"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DownloadCloud, FileJson, FileText, CheckCircle2, Clock } from "lucide-react"

interface ExportSummary {
  export_ready: boolean
  approved_sample_count: number
  total_sample_count: number
  sample_type_distribution: Record<string, number>
  status_distribution: Record<string, number>
  average_metrics: {
    overall: number
    faithfulness: number
    hallucination_risk: number
  }
}

export default function ExportPage() {
  const params = useParams()
  const id = params.id as string
  const [summary, setSummary] = useState<ExportSummary | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/${id}/export/summary`)
      .then(r => r.json())
      .then(setSummary)
      .catch(console.error)
  }, [id])
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="shadow-xl border-primary/20 overflow-hidden">
        <div className="bg-primary/5 h-2 w-full absolute top-0 left-0"></div>
        <CardHeader className="text-center pt-10 pb-6">
          {summary?.export_ready ? (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Export Ready</CardTitle>
              <CardDescription className="text-lg mt-2">
                The autonomous workflow has completed successfully. Your production-ready RAG benchmark dataset is compiled and ready for deployment.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Clock className="w-8 h-8" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Export Processing</CardTitle>
              <CardDescription className="text-lg mt-2">
                The autonomous workflow is currently running or pending human review. Exports will be available once the final dataset is compiled.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-10">
           {summary && summary.export_ready && (
             <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Approved</div>
                  <div className="text-2xl font-bold text-blue-700">{summary.approved_sample_count} <span className="text-base font-normal text-muted-foreground">/ {summary.total_sample_count}</span></div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Overall Score</div>
                  <div className="text-2xl font-bold text-green-700">{(summary.average_metrics.overall * 100).toFixed(0)}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Faithfulness</div>
                  <div className="text-2xl font-bold text-indigo-700">{(summary.average_metrics.faithfulness * 100).toFixed(0)}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Hallucination Risk</div>
                  <div className="text-2xl font-bold text-purple-700">{(summary.average_metrics.hallucination_risk * 100).toFixed(0)}%</div>
                </div>
             </div>
           )}

           <div className={`bg-secondary/20 border border-secondary rounded-xl p-8 shadow-inner ${!summary?.export_ready ? 'opacity-50 pointer-events-none' : ''}`}>
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <DownloadCloud className="w-6 h-6 text-primary" />
               export.zip Contents
             </h3>

             <ul className="space-y-4 mb-8">
               <li className="flex items-start gap-4 p-3 bg-background rounded-lg border shadow-sm transition-all hover:shadow-md">
                 <FileJson className="w-6 h-6 text-blue-500 mt-0.5 shrink-0" />
                 <div>
                   <div className="font-mono font-semibold">rag_eval.jsonl</div>
                   <div className="text-sm text-muted-foreground">The generated questions and their corresponding source contexts for retrieval evaluation.</div>
                 </div>
               </li>
               <li className="flex items-start gap-4 p-3 bg-background rounded-lg border shadow-sm transition-all hover:shadow-md">
                 <FileJson className="w-6 h-6 text-purple-500 mt-0.5 shrink-0" />
                 <div>
                   <div className="font-mono font-semibold">answer_key.jsonl</div>
                   <div className="text-sm text-muted-foreground">Ground-truth expected answers for LLM-as-a-judge generation evaluation.</div>
                 </div>
               </li>
               <li className="flex items-start gap-4 p-3 bg-background rounded-lg border shadow-sm transition-all hover:shadow-md">
                 <FileText className="w-6 h-6 text-orange-500 mt-0.5 shrink-0" />
                 <div>
                   <div className="font-mono font-semibold">dataset_card.md</div>
                   <div className="text-sm text-muted-foreground">Documentation detailing the benchmark methodology, parameters, and limitations.</div>
                 </div>
               </li>
               <li className="flex items-start gap-4 p-3 bg-background rounded-lg border shadow-sm transition-all hover:shadow-md">
                 <FileText className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
                 <div>
                   <div className="font-mono font-semibold">quality_report.md</div>
                   <div className="text-sm text-muted-foreground">Agent self-reflection metrics, quality scores, and repair loop statistics.</div>
                 </div>
               </li>
             </ul>

             <div className="text-center">
               <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" onClick={() => alert("Downloading export.zip...")}>
                 Download Complete Package
               </Button>
               <p className="text-xs text-muted-foreground mt-4">
                 Note: In the hackathon demo environment, downloads may be simulated depending on OSS configuration.
               </p>
             </div>
           </div>

           <div className="text-center text-sm text-muted-foreground">
             <p>This dataset can be directly ingested into standard evaluation frameworks.</p>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
