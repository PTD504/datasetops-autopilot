"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlanData {
  goal?: string;
  language?: string;
  sample_count?: {
    total: number;
    easy?: number;
    medium?: number;
    hard?: number;
  };
  categories?: string[];
  quality_rules?: string[];
  source_warnings?: string[];
}

interface SourceUnderstandingReport {
  document_summaries: {
    document_id: string;
    filename: string;
    chunk_count: number;
  }[];
  coverage_by_category: Record<string, {
    coverage_level: string;
    coverage_score: number;
    matching_chunk_ids: string[];
    matching_snippets: string[];
  }>;
  strong_sections: string[];
  weak_sections: string[];
  unsupported_categories: string[];
  source_warnings: string[];
  recommended_adjustments_to_plan: string[];
  confidence_score: number;
}

export default function PlanApproval() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [plan, setPlan] = useState<PlanData | null>(null)
  const [projectState, setProjectState] = useState<string | null>(null)
  const [report, setReport] = useState<SourceUnderstandingReport | null>(null)

  // Edit States
  const [isEditing, setIsEditing] = useState(false)
  const [goal, setGoal] = useState("")
  const [language, setLanguage] = useState("")
  const [totalSamples, setTotalSamples] = useState(10)
  const [easySamples, setEasySamples] = useState(5)
  const [mediumSamples, setMediumSamples] = useState(3)
  const [hardSamples, setHardSamples] = useState(2)
  const [categoriesText, setCategoriesText] = useState("")
  const [qualityRulesText, setQualityRulesText] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchPlanAndProject = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    fetch(`${apiUrl}/api/projects/${id}`)
      .then(r => r.json())
      .then(data => setProjectState(data.workflow_state))
      .catch(console.error)

    fetch(`${apiUrl}/api/projects/${id}/plan`)
      .then(r => r.json())
      .then(setPlan)
      .catch(console.error)

    fetch(`${apiUrl}/api/projects/${id}/artifacts`)
      .then(r => r.json())
      .then(artifacts => {
        if (Array.isArray(artifacts)) {
          const rep = artifacts.find((a: { artifact_type: string; content_json: unknown }) => a.artifact_type === "source_understanding_report")
          if (rep) {
            setReport(rep.content_json as SourceUnderstandingReport)
          }
        }
      })
      .catch(console.error)
  }

  useEffect(() => {
    fetchPlanAndProject()
  }, [id])

  const handleApprove = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/${id}/plan/approve`, { method: "POST" })
      if (!res.ok) {
        const errData = await res.json()
        alert(errData.detail || "Failed to approve plan due to budget/quota constraints.")
        return
      }
      router.push(`/projects/${id}`)
    } catch (e) {
      console.error(e)
      alert("Network error: Failed to connect to server.")
    }
  }

  const handleStartEdit = () => {
    if (!plan) return
    setGoal(plan.goal || "")
    setLanguage(plan.language || "")
    setTotalSamples(plan.sample_count?.total || 10)
    setEasySamples(plan.sample_count?.easy || 0)
    setMediumSamples(plan.sample_count?.medium || 0)
    setHardSamples(plan.sample_count?.hard || 0)
    setCategoriesText((plan.categories || []).join(", "))
    setQualityRulesText((plan.quality_rules || []).join("\n"))
    setSaveError(null)
    setIsEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const categories = categoriesText.split(",").map(c => c.trim()).filter(Boolean)
      const quality_rules = qualityRulesText.split("\n").map(r => r.trim()).filter(Boolean)

      if (easySamples + mediumSamples + hardSamples !== totalSamples) {
        setSaveError("The sum of Easy, Medium, and Hard samples must equal Total Samples.")
        setSaving(false)
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/${id}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          language,
          sample_count: {
            total: totalSamples,
            easy: easySamples,
            medium: mediumSamples,
            hard: hardSamples
          },
          categories,
          quality_rules
        })
      })

      if (res.ok) {
        const updatedPlan = await res.json()
        setPlan(updatedPlan)
        setIsEditing(false)
        fetchPlanAndProject()
      } else {
        const errData = await res.json()
        setSaveError(errData.detail || "Failed to save plan changes.")
      }
    } catch (e) {
      console.error(e)
      setSaveError("Network error: Failed to connect to server.")
    } finally {
      setSaving(false)
    }
  }

  if (!plan) return <div className="p-8 flex justify-center mt-12"><div className="animate-pulse flex items-center space-x-4"><div className="rounded-full bg-primary/20 h-10 w-10"></div><div className="space-y-2"><div className="h-4 bg-primary/20 rounded w-[200px]"></div><div className="h-4 bg-primary/20 rounded w-[150px]"></div></div></div></div>

  const postGenStates = ["PLAN_APPROVED", "GENERATING", "VALIDATING", "EVALUATING", "REPAIRING", "WAITING_FOR_SAMPLE_REVIEW", "EXPORTING", "EXPORT_READY", "DONE"];
  const isPreGeneration = projectState ? !postGenStates.includes(projectState) : true;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-muted/30 pb-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Benchmark Plan Approval</CardTitle>
              <CardDescription className="text-base mt-2">
                Human-in-the-loop checkpoint: Review the autonomous agent&apos;s proposed evaluation plan before sample generation begins.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 uppercase tracking-wider hidden sm:block">Human Review Required</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          {plan.source_warnings && plan.source_warnings.length > 0 && (
            <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-sm text-yellow-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                Workflow Warnings / Applied Guardrails:
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {plan.source_warnings.map((w: string, idx: number) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {saveError && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-800">
              <div className="font-semibold mb-1">Save Error:</div>
              <div>{saveError}</div>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block">Benchmark Goal</label>
                <textarea
                  className="w-full border rounded-xl p-3 bg-background text-sm"
                  rows={3}
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block">Language</label>
                  <input
                    type="text"
                    className="w-full border rounded-xl p-3 bg-background text-sm font-semibold"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block">Total Samples</label>
                  <input
                    type="number"
                    className="w-full border rounded-xl p-3 bg-background text-sm font-semibold"
                    value={totalSamples}
                    onChange={e => setTotalSamples(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-muted/20 space-y-4">
                <div className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Difficulty Distribution</div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Easy</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg p-2 bg-background text-sm"
                      value={easySamples}
                      onChange={e => setEasySamples(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Medium</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg p-2 bg-background text-sm"
                      value={mediumSamples}
                      onChange={e => setMediumSamples(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Hard</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg p-2 bg-background text-sm"
                      value={hardSamples}
                      onChange={e => setHardSamples(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                {easySamples + mediumSamples + hardSamples !== totalSamples && (
                  <p className="text-xs text-red-500 font-medium">Warning: Sum of distributions ({easySamples + mediumSamples + hardSamples}) must equal total samples ({totalSamples}).</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block">Categories (comma-separated)</label>
                <input
                  type="text"
                  className="w-full border rounded-xl p-3 bg-background text-sm"
                  value={categoriesText}
                  onChange={e => setCategoriesText(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block">Quality Rules (one per line)</label>
                <textarea
                  className="w-full border rounded-xl p-3 bg-background text-sm font-mono"
                  rows={4}
                  value={qualityRulesText}
                  onChange={e => setQualityRulesText(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button size="lg" className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
                <Button size="lg" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-secondary/30 shadow-none">
                  <CardHeader className="pb-3">
                     <CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Benchmark Goal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base font-medium">{plan.goal || "Evaluate RAG System Accuracy and Reasoning"}</p>
                  </CardContent>
                </Card>

                <Card className="border-secondary/30 shadow-none">
                  <CardHeader className="pb-3">
                     <CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Target Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Language</div>
                        <div className="font-semibold text-lg">{plan.language || "English"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Total Samples</div>
                        <div className="font-semibold text-lg">{plan.sample_count?.total || 10}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-secondary/30 shadow-none">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Proposed Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(plan.categories || []).map((c: string) => (
                      <Badge key={c} variant="secondary" className="px-3 py-1.5 text-sm font-medium">{c}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {report && (
                <Card className="border-secondary/30 shadow-none">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Source Coverage Audit</CardTitle>
                    {report.confidence_score !== undefined && (
                      <Badge 
                        className={
                          report.confidence_score >= 0.8
                            ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                            : report.confidence_score >= 0.4
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                            : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                        }
                        variant="outline"
                      >
                        Confidence: {Math.round(report.confidence_score * 100)}%
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {report.coverage_by_category && Object.keys(report.coverage_by_category).length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase">Category Support</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {Object.entries(report.coverage_by_category).map(([category, info]) => {
                            const level = info.coverage_level;
                            let badgeColor = "bg-red-500/10 text-red-700 border-red-500/20";
                            if (level === "strong") badgeColor = "bg-green-500/10 text-green-700 border-green-500/20";
                            else if (level === "medium") badgeColor = "bg-blue-500/10 text-blue-700 border-blue-500/20";
                            else if (level === "weak") badgeColor = "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";

                            return (
                              <div key={category} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-secondary/15 text-sm">
                                <span className="font-medium text-foreground">{category}</span>
                                <Badge className={badgeColor} variant="outline">{level}</Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {report.recommended_adjustments_to_plan && report.recommended_adjustments_to_plan.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-border/40">
                        <div className="text-xs font-semibold text-muted-foreground uppercase">Recommended Adjustments</div>
                        <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                          {report.recommended_adjustments_to_plan.map((adj: string, idx: number) => (
                            <li key={idx} className="leading-relaxed">{adj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {plan.quality_rules && plan.quality_rules.length > 0 && (
                <Card className="border-secondary/30 shadow-none">
                  <CardHeader className="pb-3">
                      <CardTitle className="text-sm uppercase text-muted-foreground tracking-wider">Quality Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {plan.quality_rules.map((r: string, idx: number) => (
                        <li key={idx} className="leading-6">{r}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-8">
                {isPreGeneration ? (
                  <>
                    <Button size="lg" onClick={handleApprove} className="w-full sm:flex-1 text-lg h-14 rounded-xl shadow-md hover:shadow-lg transition-all">
                      Approve & Generate Samples
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleStartEdit} className="w-full sm:flex-1 text-lg h-14 rounded-xl">
                      Edit Plan Parameters
                    </Button>
                  </>
                ) : (
                  <div className="w-full text-center py-4 bg-muted/30 border border-dashed rounded-xl">
                    <p className="text-muted-foreground text-sm font-medium">This plan has already been approved and generation has started. Workflow State: <span className="font-mono text-foreground font-bold">{projectState}</span></p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
