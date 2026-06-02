"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ExportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Export Ready</CardTitle>
          <CardDescription>Your RAG benchmark dataset is compiled and ready for download.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
           <div className="p-6 bg-muted rounded-lg">
             <h3 className="text-xl font-semibold mb-2">export.zip</h3>
             <p className="text-sm text-muted-foreground mb-4">
               Contains rag_eval.jsonl, answer_key.jsonl, dataset_card.md, and quality_report.md
             </p>
             <Button size="lg" onClick={() => alert("Downloading export.zip...")}>
               Download ZIP Package
             </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
