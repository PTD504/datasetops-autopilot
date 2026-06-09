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

function SampleMetrics({ sample }: { sample: SampleData }) {
  if (sample.overall_score == null) return null

  return (
    <div className="mt-2 w-full rounded-md border border-border/60 bg-muted/30 p-2 text-xs text-muted-foreground">
      <div className="mb-1 font-semibold text-foreground">Metrics</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        <span title="Faithfulness: whether the answer is supported by evidence">Faith: {sample.faithfulness_score}</span>
        <span title="Answer relevance: whether the answer directly answers the question">Rel: {sample.answer_relevance_score}</span>
        <span title="Hallucination risk: risk of unsupported claims">Halluc: {sample.hallucination_risk_score}</span>
        <span className="font-bold text-foreground">Score: {(sample.overall_score * 100).toFixed(0)}%</span>
      </div>
      <div className="mt-2 border-t border-border/60 pt-1 text-[10px] font-semibold uppercase">
        Decision: {sample.decision}
      </div>
    </div>
  )
}

function EvaluationIssues({ sample }: { sample: SampleData }) {
  if (
    !["HUMAN_REVIEW", "REJECTED"].includes(sample.status) ||
    !sample.issues?.length
  ) {
    return null
  }

  return (
    <div className="mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-800">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider">Evaluator Notes / Issues</div>
      <ul className="list-disc space-y-1 pl-4">
        {sample.issues.map((issue, index) => (
          <li key={`${sample.id}-issue-${index}`}>{issue}</li>
        ))}
      </ul>
    </div>
  )
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
    <div className="container mx-auto max-w-[1600px] px-4 py-8">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 pb-6 border-b">
          <CardTitle className="text-2xl">Human-in-the-Loop Workbench</CardTitle>
          <CardDescription className="text-base mt-2">
            Review the generated evaluation samples. The autonomous agent has already applied self-reflection and repair loops where necessary.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="hidden overflow-hidden rounded-md border lg:block">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[16%]" />
                <col className="w-[8%]" />
                <col className="w-[25%]" />
                <col className="w-[29%]" />
                <col className="w-[8%]" />
              </colgroup>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Status / Eval</TableHead>
                  <TableHead>Category / Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Expected Answer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((s) => (
                  <TableRow key={s.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-normal align-top font-medium">
                      <div className="flex min-w-0 flex-col items-start gap-1">
                        {getStatusBadge(s.status)}
                        <SampleMetrics sample={s} />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal align-top text-sm">
                      <div className="mb-2 min-w-0 break-words font-medium">{s.category}</div>
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
                    <TableCell className="whitespace-normal align-top text-sm">
                      <Badge variant="outline" className="font-normal text-xs">{s.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal align-top text-sm">
                      <div className="min-w-0 whitespace-pre-wrap break-words leading-6">{s.question}</div>
                    </TableCell>
                    <TableCell className="whitespace-normal align-top text-sm">
                      <div className="min-w-0 whitespace-pre-wrap break-words leading-6">{s.expected_answer}</div>
                      <EvaluationIssues sample={s} />
                    </TableCell>
                    <TableCell className="whitespace-normal align-top text-right">
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

          <div className="space-y-4 lg:hidden">
            {samples.map(sample => (
              <div key={sample.id} className="rounded-md border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                  <div className="min-w-0 space-y-2">
                    {getStatusBadge(sample.status)}
                    <div className="break-words font-medium">{sample.category}</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="font-normal">{sample.sample_type || "single_hop"}</Badge>
                      <Badge variant="outline" className="font-normal">{sample.difficulty}</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled title="Coming soon">Edit</Button>
                </div>

                <div className="grid gap-4 py-4 md:grid-cols-2">
                  <section className="min-w-0">
                    <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Question</h3>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{sample.question}</p>
                  </section>
                  <section className="min-w-0">
                    <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Expected Answer</h3>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{sample.expected_answer}</p>
                    <EvaluationIssues sample={sample} />
                  </section>
                </div>

                <SampleMetrics sample={sample} />
              </div>
            ))}
            {samples.length === 0 && (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-md border text-center text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <p>No samples generated or processing yet. Check back soon.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
