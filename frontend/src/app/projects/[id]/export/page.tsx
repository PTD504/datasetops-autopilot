"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DownloadCloud, FileJson, FileText, CheckCircle2 } from "lucide-react"

export default function ExportPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="shadow-xl border-primary/20 overflow-hidden">
        <div className="bg-primary/5 h-2 w-full absolute top-0 left-0"></div>
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Export Ready</CardTitle>
          <CardDescription className="text-lg mt-2">
            The autonomous workflow has completed successfully. Your production-ready RAG benchmark dataset is compiled and ready for deployment.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-10">
           <div className="bg-secondary/20 border border-secondary rounded-xl p-8 shadow-inner">
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
