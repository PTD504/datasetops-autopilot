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

function normalizeReport(data: unknown): SourceUnderstandingReport {
  const defaultReport: SourceUnderstandingReport = {
    document_summaries: [],
    coverage_by_category: {},
    strong_sections: [],
    weak_sections: [],
    unsupported_categories: [],
    source_warnings: [],
    recommended_adjustments_to_plan: [],
    confidence_score: 0
  };

  if (!data || typeof data !== "object") {
    return defaultReport;
  }

  const obj = data as Record<string, unknown>;

  // Normalize document_summaries
  const docSummaries: { document_id: string; filename: string; chunk_count: number }[] = [];
  if (Array.isArray(obj.document_summaries)) {
    obj.document_summaries.forEach((d: unknown) => {
      if (d && typeof d === "object") {
        const docObj = d as Record<string, unknown>;
        docSummaries.push({
          document_id: typeof docObj.document_id === "string" ? docObj.document_id : "",
          filename: typeof docObj.filename === "string" ? docObj.filename : "Unknown file",
          chunk_count: typeof docObj.chunk_count === "number" ? docObj.chunk_count : 0
        });
      }
    });
  }

  // Normalize coverage_by_category
  const coverageByCategory: Record<string, {
    coverage_level: string;
    coverage_score: number;
    matching_chunk_ids: string[];
    matching_snippets: string[];
  }> = {};

  if (obj.coverage_by_category && typeof obj.coverage_by_category === "object") {
    const covObj = obj.coverage_by_category as Record<string, unknown>;
    Object.entries(covObj).forEach(([category, info]) => {
      if (info && typeof info === "object") {
        const infoObj = info as Record<string, unknown>;
        const chunkIds: string[] = [];
        if (Array.isArray(infoObj.matching_chunk_ids)) {
          infoObj.matching_chunk_ids.forEach((id: unknown) => {
            if (typeof id === "string") chunkIds.push(id);
          });
        }
        const snippets: string[] = [];
        if (Array.isArray(infoObj.matching_snippets)) {
          infoObj.matching_snippets.forEach((snip: unknown) => {
            if (typeof snip === "string") snippets.push(snip);
          });
        }

        coverageByCategory[category] = {
          coverage_level: typeof infoObj.coverage_level === "string" ? infoObj.coverage_level : "unsupported",
          coverage_score: typeof infoObj.coverage_score === "number" ? infoObj.coverage_score : 0,
          matching_chunk_ids: chunkIds,
          matching_snippets: snippets
        };
      } else {
        coverageByCategory[category] = {
          coverage_level: "unsupported",
          coverage_score: 0,
          matching_chunk_ids: [],
          matching_snippets: []
        };
      }
    });
  }

  // Normalize list fields safely
  const getArrayOfStrings = (arr: unknown): string[] => {
    const result: string[] = [];
    if (Array.isArray(arr)) {
      arr.forEach((item: unknown) => {
        if (typeof item === "string") {
          result.push(item);
        }
      });
    }
    return result;
  };

  const confidenceScore = typeof obj.confidence_score === "number" ? obj.confidence_score : 0;

  return {
    document_summaries: docSummaries,
    coverage_by_category: coverageByCategory,
    strong_sections: getArrayOfStrings(obj.strong_sections),
    weak_sections: getArrayOfStrings(obj.weak_sections),
    unsupported_categories: getArrayOfStrings(obj.unsupported_categories),
    source_warnings: getArrayOfStrings(obj.source_warnings),
    recommended_adjustments_to_plan: getArrayOfStrings(obj.recommended_adjustments_to_plan),
    confidence_score: confidenceScore
  };
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
          const reports = artifacts.filter(
            (a: unknown) => {
              if (a && typeof a === "object") {
                const artObj = a as Record<string, unknown>;
                return artObj.artifact_type === "source_understanding_report";
              }
              return false;
            }
          ) as { artifact_type: string; created_at: string; content_json: unknown }[];
          
          if (reports.length > 0) {
            // Sort report artifacts by created_at descending
            reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setReport(normalizeReport(reports[0].content_json));
          }
        }
      })
      .catch(console.error)
  }

  const coverageByCategory = report?.coverage_by_category || {};
  const categoryEntries = Object.entries(coverageByCategory);
  const strongCount = categoryEntries.filter(([, info]) => info.coverage_level?.toLowerCase() === "strong").length;
  const mediumCount = categoryEntries.filter(([, info]) => info.coverage_level?.toLowerCase() === "medium").length;
  const weakCount = categoryEntries.filter(([, info]) => info.coverage_level?.toLowerCase() === "weak").length;
  const unsupportedCount = categoryEntries.filter(([, info]) => info.coverage_level?.toLowerCase() === "unsupported").length;

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

              {!report ? (
                <Card className="border-secondary/30 shadow-none bg-muted/5 border-dashed">
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">Source coverage audit is not available yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-secondary/30 shadow-none">
                  <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b bg-muted/10">
                    <div>
                      <CardTitle className="text-lg font-bold">Source Coverage Audit</CardTitle>
                      <CardDescription className="text-xs">
                        This audit checks whether uploaded documents support the proposed benchmark categories.
                      </CardDescription>
                    </div>
                    {report.confidence_score !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence Score:</span>
                        <Badge 
                          className={
                            report.confidence_score >= 0.8
                              ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 px-2.5 py-1 text-sm font-bold"
                              : report.confidence_score >= 0.4
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 px-2.5 py-1 text-sm font-bold"
                              : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 px-2.5 py-1 text-sm font-bold"
                          }
                          variant="outline"
                        >
                          {Math.round(report.confidence_score * 100)}%
                        </Badge>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* Summary Counts */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl text-center shadow-sm">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">{strongCount}</div>
                        <div className="text-xs text-muted-foreground font-medium">Strong</div>
                      </div>
                      <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center shadow-sm">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{mediumCount}</div>
                        <div className="text-xs text-muted-foreground font-medium">Medium</div>
                      </div>
                      <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-center shadow-sm">
                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{weakCount}</div>
                        <div className="text-xs text-muted-foreground font-medium">Weak</div>
                      </div>
                      <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-center shadow-sm">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">{unsupportedCount}</div>
                        <div className="text-xs text-muted-foreground font-semibold">Unsupported</div>
                      </div>
                    </div>

                    {/* Warning Alerts */}
                    {(weakCount > 0 || unsupportedCount > 0) && (
                      <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 text-sm text-red-800 dark:text-red-300 space-y-1 shadow-sm">
                        <div className="font-semibold flex items-center gap-1.5">
                          ⚠️ Incomplete Source Support Detected
                        </div>
                        <div className="text-xs leading-relaxed">
                          Some proposed benchmark categories have weak or unsupported coverage in the uploaded documents. You can still approve this plan, but sample generation quality for these categories may be degraded. Consider adding more source documents or editing the categories before proceeding.
                        </div>
                      </div>
                    )}

                    {/* Table of Categories */}
                    {categoryEntries.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category Details</div>
                        <div className="overflow-x-auto border border-border/80 rounded-xl">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-muted/40 border-b border-border/80">
                                <th className="p-3 font-semibold text-muted-foreground">Category</th>
                                <th className="p-3 font-semibold text-muted-foreground">Level</th>
                                <th className="p-3 font-semibold text-muted-foreground">Score</th>
                                <th className="p-3 font-semibold text-muted-foreground">Chunks</th>
                                <th className="p-3 font-semibold text-muted-foreground">Evidence Snippet</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryEntries.map(([category, info]) => {
                                const level = info.coverage_level || "unsupported";
                                const score = info.coverage_score !== undefined ? info.coverage_score : 0;
                                const chunkCount = info.matching_chunk_ids?.length || 0;
                                const snippet = info.matching_snippets?.[0] || "No evidence snippet available.";
                                
                                let rowClass = "border-b border-border/60 hover:bg-muted/10 transition-colors";
                                let levelColor = "bg-red-500/10 text-red-700 border-red-500/20";
                                if (level === "strong") {
                                  levelColor = "bg-green-500/10 text-green-700 border-green-500/20";
                                } else if (level === "medium") {
                                  levelColor = "bg-blue-500/10 text-blue-700 border-blue-500/20";
                                } else if (level === "weak") {
                                  levelColor = "bg-yellow-500/10 text-yellow-700 border-yellow-700/20";
                                } else if (level === "unsupported") {
                                  // Highlight unsupported categories clearly
                                  rowClass = "border-b border-red-100 bg-red-500/5 hover:bg-red-500/10 font-medium dark:border-red-950/40";
                                }

                                return (
                                  <tr key={category} className={rowClass}>
                                    <td className="p-3 font-semibold flex items-center gap-1.5">
                                      {level === "unsupported" && (
                                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" title="Unsupported category" />
                                      )}
                                      {category}
                                    </td>
                                    <td className="p-3">
                                      <Badge className={`${levelColor} px-2 py-0.5 text-[10px] uppercase font-bold`} variant="outline">{level}</Badge>
                                    </td>
                                    <td className="p-3 font-mono font-medium">{score.toFixed(2)}</td>
                                    <td className="p-3 font-mono font-medium">{chunkCount}</td>
                                    <td className="p-3 text-muted-foreground italic max-w-xs truncate" title={snippet}>
                                      &ldquo;{snippet}&rdquo;
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Source Warnings */}
                    {report.source_warnings && report.source_warnings.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-border/40">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Coverage Warnings</div>
                        <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50/50 dark:bg-yellow-500/5 text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                          <ul className="list-disc pl-5 space-y-1 font-medium">
                            {report.source_warnings.map((w: string, idx: number) => (
                              <li key={idx} className="leading-relaxed">{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Recommended adjustments */}
                    {report.recommended_adjustments_to_plan && report.recommended_adjustments_to_plan.length > 0 && (
                      <div className="space-y-1.5 pt-3 border-t border-border/40">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recommended Adjustments</div>
                        <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-500/5 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                          <ul className="list-disc pl-5 space-y-1 font-medium">
                            {report.recommended_adjustments_to_plan.map((adj: string, idx: number) => (
                              <li key={idx} className="leading-relaxed">{adj}</li>
                            ))}
                          </ul>
                        </div>
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

              {isPreGeneration && report && ((report.source_warnings && report.source_warnings.length > 0) || (report.recommended_adjustments_to_plan && report.recommended_adjustments_to_plan.length > 0)) && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold text-center mb-4 animate-pulse">
                  ⚠️ Review the source coverage warnings before approving generation.
                </p>
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
