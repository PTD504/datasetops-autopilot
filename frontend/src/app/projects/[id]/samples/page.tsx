"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EvidenceItem {
  id: string;
  index: number;
  document_name: string;
  text: string;
  evidence_unavailable: boolean;
}

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
  evidence?: EvidenceItem[];
  evidence_unavailable?: boolean;
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

function EvidencePanel({ sample }: { sample: SampleData }) {
  const isUnavailable = sample.evidence_unavailable || !sample.evidence || sample.evidence.length === 0;

  return (
    <div className="rounded-md border border-border bg-muted/40 p-4 text-sm mt-3 w-full text-left">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <span>Grounding Evidence Snippets</span>
          {isUnavailable && (
            <Badge className="bg-red-100 text-red-800 text-[10px] hover:bg-red-100 border-none">UNAVAILABLE</Badge>
          )}
        </h4>
        <span className="text-[10px] text-muted-foreground uppercase font-mono">
          Sample ID: {sample.id}
        </span>
      </div>

      {isUnavailable ? (
        <p className="text-xs text-muted-foreground italic">
          No source document evidence is available for this sample.
        </p>
      ) : (
        <div className="space-y-4">
          {sample.evidence?.map((item, index) => (
            <div key={`${sample.id}-evidence-${index}`} className="rounded-md border border-border bg-background p-3 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-muted-foreground border-b pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-muted text-foreground px-1.5 py-0.5 rounded font-mono">
                    Snippet #{index + 1}
                  </span>
                  <span className="truncate max-w-[250px] md:max-w-md" title={item.document_name}>
                    📄 {item.document_name}
                  </span>
                </div>
                <div>
                  {item.index !== -1 ? (
                    <span className="font-mono">Chunk Index: {item.index}</span>
                  ) : (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 border-none font-normal">MISSING CHUNK</Badge>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap break-words leading-relaxed text-xs text-foreground font-sans">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SamplesReview() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [samples, setSamples] = useState<SampleData[]>([])
  const apiUrl = "";
  const [expandedSampleIds, setExpandedSampleIds] = useState<Record<string, boolean>>({})
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleApproveAndExport = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const res = await fetch(`${apiUrl}/api/projects/${id}/samples/approve-and-export`, {
        method: "POST"
      })
      if (res.ok) {
        router.push(`/projects/${id}`)
      } else {
        const errData = await res.json()
        setExportError(errData.detail || "Failed to finalize sample review and build export.")
      }
    } catch (e) {
      console.error(e)
      setExportError("Network error: Failed to connect to server.")
    } finally {
      setExporting(false)
    }
  }


  // Edit Modal States
  const [editingSample, setEditingSample] = useState<SampleData | null>(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editAnswer, setEditAnswer] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editDifficulty, setEditDifficulty] = useState("medium")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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

  const fetchSamples = () => {
    fetch(`${apiUrl}/api/projects/${id}/samples`)
      .then(r => r.json())
      .then(setSamples)
      .catch(console.error)
  }

  useEffect(() => {
    fetchSamples()
  }, [id])

  const toggleEvidence = (sampleId: string) => {
    setExpandedSampleIds(prev => ({
      ...prev,
      [sampleId]: !prev[sampleId]
    }))
  }

  const handleApprove = async (sampleId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/projects/${id}/samples/${sampleId}/approve`, {
        method: "POST"
      })
      if (res.ok) {
        const updated = await res.json()
        setSamples(samples.map(s => s.id === sampleId ? { ...s, ...updated } : s))
      } else {
        alert("Failed to approve sample.")
      }
    } catch (e) {
      console.error(e)
      alert("Error approving sample.")
    }
  }

  const handleReject = async (sampleId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/projects/${id}/samples/${sampleId}/reject`, {
        method: "POST"
      })
      if (res.ok) {
        const updated = await res.json()
        setSamples(samples.map(s => s.id === sampleId ? { ...s, ...updated } : s))
      } else {
        alert("Failed to reject sample.")
      }
    } catch (e) {
      console.error(e)
      alert("Error rejecting sample.")
    }
  }

  const startEdit = (sample: SampleData) => {
    setEditingSample(sample)
    setEditQuestion(sample.question)
    setEditAnswer(sample.expected_answer)
    setEditCategory(sample.category)
    setEditDifficulty(sample.difficulty)
    setSaveError(null)
  }

  const handleSaveEdit = async () => {
    if (!editingSample) return
    if (!editQuestion.trim() || !editAnswer.trim()) {
      setSaveError("Question and Expected Answer cannot be empty.")
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`${apiUrl}/api/projects/${id}/samples/${editingSample.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editQuestion,
          expected_answer: editAnswer,
          category: editCategory,
          difficulty: editDifficulty
        })
      })
      if (res.ok) {
        const updated = await res.json()
        setSamples(samples.map(s => s.id === updated.id ? { ...s, ...updated } : s))
        setEditingSample(null)
      } else {
        const errData = await res.json()
        setSaveError(errData.detail || "Failed to save sample changes.")
      }
    } catch (e) {
      console.error(e)
      setSaveError("Network error: Failed to connect to server.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto max-w-[1600px] px-4 py-8">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 pb-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Human-in-the-Loop Workbench</CardTitle>
            <CardDescription className="text-base mt-2">
              Review the generated evaluation samples and verify document grounding evidence. The autonomous agent has already applied self-reflection and repair loops where necessary.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Button variant="outline" onClick={() => router.push(`/projects/${id}`)} disabled={exporting}>
              Back to Project
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              onClick={handleApproveAndExport}
              disabled={exporting || samples.length === 0}
            >
              {exporting ? "Building Export..." : "Approve & Export"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {exportError && (
            <div className="mb-4 p-4 text-sm rounded-lg border border-red-200 bg-red-50 text-red-800 font-semibold">
              {exportError}
            </div>
          )}
          {exporting && (
            <div className="mb-6 p-6 rounded-lg border border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm font-bold text-primary animate-pulse">Building benchmark export package... Please wait.</p>
            </div>
          )}
          <div className="hidden overflow-hidden rounded-md border lg:block">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[16%]" />
                <col className="w-[8%]" />
                <col className="w-[25%]" />
                <col className="w-[25%]" />
                <col className="w-[12%]" />
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
                  <React.Fragment key={s.id}>
                    <TableRow className="group hover:bg-muted/30 transition-colors">
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
                        <div className="flex flex-col gap-2 items-end">
                           <div className="flex gap-2">
                             <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200" onClick={() => handleApprove(s.id)}>Approve</Button>
                             <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200" onClick={() => handleReject(s.id)}>Reject</Button>
                           </div>
                           <div className="flex gap-2">
                             <Button size="sm" variant="outline" onClick={() => toggleEvidence(s.id)}>
                               {expandedSampleIds[s.id] ? "Hide Evidence" : "View Evidence"}
                             </Button>
                             <Button size="sm" variant="outline" className="w-16" onClick={() => startEdit(s)}>Edit</Button>
                           </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedSampleIds[s.id] && (
                      <TableRow className="bg-muted/10">
                        <TableCell colSpan={6} className="p-4">
                          <EvidencePanel sample={s} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200" onClick={() => handleApprove(sample.id)}>Approve</Button>
                      <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200" onClick={() => handleReject(sample.id)}>Reject</Button>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleEvidence(sample.id)}>
                        {expandedSampleIds[sample.id] ? "Hide Evidence" : "View Evidence"}
                      </Button>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => startEdit(sample)}>Edit</Button>
                    </div>
                  </div>
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

                {expandedSampleIds[sample.id] && (
                  <div className="mt-4 border-t pt-4">
                    <EvidencePanel sample={sample} />
                  </div>
                )}
              </div>
            ))}
            {samples.length === 0 && (
              <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-md border text-center text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <p>No samples generated or processing yet. Check back soon.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="outline" onClick={() => router.push(`/projects/${id}`)} disabled={exporting}>
              Back to Project Page
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-5 text-sm h-auto shadow-md"
              onClick={handleApproveAndExport}
              disabled={exporting || samples.length === 0}
            >
              {exporting ? "Building Export Package..." : "Approve reviewed samples and build export"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Edit Modal */}
      {editingSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <Card className="max-w-2xl w-full shadow-2xl border-primary/20">
            <CardHeader className="bg-muted/40 border-b pb-4">
              <CardTitle className="text-lg">Edit Benchmark Sample</CardTitle>
              <CardDescription>Make manual corrections to the generated benchmark question and expected answer.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {saveError && (
                <div className="p-3 text-xs rounded-lg border border-red-200 bg-red-50 text-red-800 font-medium">
                  {saveError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase block">Category</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 bg-background text-sm"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase block">Difficulty</label>
                  <select
                    className="w-full border rounded-lg p-2.5 bg-background text-sm font-semibold"
                    value={editDifficulty}
                    onChange={e => setEditDifficulty(e.target.value)}
                  >
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase block">Question</label>
                <textarea
                  className="w-full border rounded-lg p-2.5 bg-background text-sm"
                  rows={3}
                  value={editQuestion}
                  onChange={e => setEditQuestion(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase block">Expected Answer</label>
                <textarea
                  className="w-full border rounded-lg p-2.5 bg-background text-sm leading-6"
                  rows={6}
                  value={editAnswer}
                  onChange={e => setEditAnswer(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-4 border-t justify-end">
                <Button variant="outline" onClick={() => setEditingSample(null)}>Cancel</Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
