"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SampleData {
  id: string;
  category: string;
  difficulty: string;
  sample_type: string;
  question: string;
  expected_answer: string;
  status: string;
  overall_score?: number | null;
  decision?: string | null;
  faithfulness_score?: number | null;
  answer_relevance_score?: number | null;
  hallucination_risk_score?: number | null;
  issues?: string[];
}

export default function SamplesReview() {
  const params = useParams()
  const id = params.id as string
  const [samples, setSamples] = useState<SampleData[]>([])

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PASS':
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">{status}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">{status}</Badge>;
      case 'NEEDS_REPAIR':
      case 'REPAIRING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">{status}</Badge>;
      case 'HUMAN_REVIEW':
      case 'PENDING':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/${id}/samples`)
      .then(r => r.json())
      .then(setSamples)
      .catch(console.error)
  }, [id])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 pb-6 border-b">
          <CardTitle className="text-2xl">Human-in-the-Loop Workbench</CardTitle>
          <CardDescription className="text-base mt-2">
            Review the generated evaluation samples. The autonomous agent has already applied self-reflection and repair loops where necessary.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[140px]">Status / Eval</TableHead>
                  <TableHead className="w-[180px]">Category / Type</TableHead>
                  <TableHead className="w-[100px]">Difficulty</TableHead>
                  <TableHead className="min-w-[200px]">Question</TableHead>
                  <TableHead className="min-w-[200px]">Expected Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((s) => (
                  <TableRow key={s.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium align-top">
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(s.status)}
                        {s.overall_score != null && (
                          <div className="text-xs text-muted-foreground mt-1 bg-muted/20 p-2 rounded w-full">
                            <div className="font-semibold mb-1">Metrics:</div>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              <span title="Faithfulness: whether the answer is supported by evidence">Faith: {s.faithfulness_score}</span>
                              <span title="Answer relevance: whether the answer directly answers the question">Rel: {s.answer_relevance_score}</span>
                              <span title="Hallucination risk: risk of unsupported claims">Halluc: {s.hallucination_risk_score}</span>
                              <span className="font-bold">Score: {(s.overall_score * 100).toFixed(0)}%</span>
                            </div>
                            <div className="mt-1 font-semibold text-[10px] uppercase opacity-70 border-t pt-1 border-muted-foreground/20">
                              Decision: {s.decision}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm align-top">
                      <div className="font-medium mb-1">{s.category}</div>
                      <Badge variant="outline" className="text-[10px] bg-muted/50 font-normal cursor-help"
                        title={
                          s.sample_type === 'single_hop' ? 'single_hop — answerable from one evidence chunk' :
                          s.sample_type === 'multi_hop' ? 'multi_hop — requires combining multiple evidence chunks' :
                          s.sample_type === 'unanswerable' ? 'unanswerable — intentionally checks if a RAG system refuses unsupported questions' :
                          s.sample_type === 'edge_case' ? 'edge_case — tests policy boundaries or ambiguous cases' :
                          'unknown sample type'
                        }>
                        {s.sample_type || 'single_hop'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm align-top">
                      <Badge variant="outline" className="font-normal text-xs">{s.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="text-sm align-top">
                      <div className="max-w-[250px]">{s.question}</div>
                    </TableCell>
                    <TableCell className="text-sm align-top">
                      <div className="max-w-[250px]">{s.expected_answer}</div>
                      {(s.status === 'HUMAN_REVIEW' || s.status === 'REJECTED') && s.issues && s.issues.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-red-800 text-xs shadow-sm">
                          <div className="font-bold mb-1 uppercase tracking-wider text-[10px]">Evaluator Notes / Issues:</div>
                          <ul className="list-disc pl-4 space-y-1">
                            {s.issues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                         <Button size="sm" variant="outline" className="opacity-50" disabled title="Coming soon">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {samples.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p>No samples generated or processing yet. Check back soon.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
