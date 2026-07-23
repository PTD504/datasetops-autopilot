import { TraceItem, AgentArtifact } from "../../../../types";
import { EvaluatorSample, EvidenceItem } from "../../EvaluatorViewer/useEvaluatorSamples";

export interface ExportSummaryData {
  export_id: string;
  exported_files: string[];
  approved_sample_count: number;
  rejected_sample_count: number;
  file_urls: Record<string, string>;
  generated_at: string;
  is_rebuild?: boolean;
}

export function resolveExportSummaryArtifact(traces: TraceItem[]): ExportSummaryData | null {
  const artifactItem = traces.find(
    (t) =>
      t.type === "artifact" &&
      (t.data as AgentArtifact).artifact_type === "export_summary"
  );
  if (!artifactItem) return null;
  return (artifactItem.data as AgentArtifact).content_json as unknown as ExportSummaryData;
}

export function reconstructRagEval(samples: EvaluatorSample[]): string {
  const approvedSamples = samples.filter((s) => s.status?.toLowerCase() === "approved");
  return approvedSamples
    .map((s) =>
      JSON.stringify({
        id: s.id,
        sample_type: s.sample_type,
        question: s.question,
        source_chunk_ids: s.evidence?.map((e: EvidenceItem) => e.id) || [],
      })
    )
    .join("\n");
}

export function reconstructAnswerKey(samples: EvaluatorSample[]): string {
  const approvedSamples = samples.filter((s) => s.status?.toLowerCase() === "approved");
  return approvedSamples
    .map((s) =>
      JSON.stringify({
        id: s.id,
        expected_answer: s.expected_answer,
      })
    )
    .join("\n");
}

export function reconstructDatasetCard(
  projectName: string,
  goal: string,
  language: string,
  categories: string[],
  samples: EvaluatorSample[]
): string {
  const approvedSamples = samples.filter((s) => s.status?.toLowerCase() === "approved");
  
  const difficultyCounts: Record<string, number> = {};
  const sampleTypeCounts: Record<string, number> = {};
  
  approvedSamples.forEach((s) => {
    const diff = s.difficulty || "unknown";
    difficultyCounts[diff] = (difficultyCounts[diff] || 0) + 1;
    
    const stype = s.sample_type || "unknown";
    sampleTypeCounts[stype] = (sampleTypeCounts[stype] || 0) + 1;
  });

  return `# Dataset Card: ${projectName || "Acme Docs Evaluation"}

**Goal:** ${goal || "N/A"}

**Language:** ${language || "English"}

**Categories:** ${categories && categories.length > 0 ? categories.join(", ") : "N/A"}

**Total Samples:** ${approvedSamples.length}

**Difficulty Distribution:**
${Object.entries(difficultyCounts)
  .map(([diff, count]) => `- ${diff.charAt(0).toUpperCase() + diff.slice(1)}: ${count}`)
  .join("\n")}

**Sample Type Distribution:**
${Object.entries(sampleTypeCounts)
  .map(([stype, count]) => `- ${stype}: ${count}`)
  .join("\n")}

**Quality Evaluation:**
Samples were evaluated using RAG-specific quality metrics including faithfulness, answer relevance, context precision, and hallucination risk.

**Limitations:**
- This is an auto-generated benchmark.
- The final exported files (jsonl) intentionally contain only explicitly 'APPROVED' samples. This includes valid, verified \`unanswerable\` sample types.
- May require further human review for production use.
`;
}

export function reconstructQualityReport(samples: EvaluatorSample[]): string {
  const allSamples = samples;
  const passedSamples = allSamples.filter((s) => s.status?.toLowerCase() === "approved");
  const repairedSamples = allSamples.filter((s) => (s.retry_count || 0) > 0);
  const humanReviewSamples = allSamples.filter((s) => s.status?.toLowerCase() === "human_review");
  const rejectedSamples = allSamples.filter((s) => s.status?.toLowerCase() === "rejected");

  const evals = allSamples.filter(
    (s) => s.overall_score !== null && s.overall_score !== undefined
  );

  let avgOverall = 0;
  let avgFaithfulness = 0;
  let avgAnswerRelevance = 0;
  let avgContextPrecision = 0;
  let avgContextRecall = 0;
  let avgHallucinationRisk = 0;

  if (evals.length > 0) {
    avgOverall = evals.reduce((acc, s) => acc + (s.overall_score || 0), 0) / evals.length;
    avgFaithfulness = evals.reduce((acc, s) => acc + (s.faithfulness_score || 0), 0) / evals.length;
    avgAnswerRelevance = evals.reduce((acc, s) => acc + (s.answer_relevance_score || 0), 0) / evals.length;
    avgContextPrecision = evals.reduce((acc, s) => acc + (s.context_precision_score || 0), 0) / evals.length;
    avgContextRecall = evals.reduce((acc, s) => acc + (s.context_recall_score || 0), 0) / evals.length;
    avgHallucinationRisk = evals.reduce((acc, s) => acc + (s.hallucination_risk_score || 0), 0) / evals.length;
  }

  // Aggregate issues
  const allIssues: string[] = [];
  evals.forEach((s) => {
    if (s.issues && Array.isArray(s.issues)) {
      allIssues.push(...s.issues);
    }
  });

  const uniqueIssues = Array.from(new Set(allIssues.map((i) => String(i).trim()))).slice(0, 5);

  // Recommendations based on decisions
  const decisionCounts: Record<string, number> = {};
  evals.forEach((s) => {
    const d = (s.decision || "unknown").trim().toLowerCase();
    decisionCounts[d] = (decisionCounts[d] || 0) + 1;
  });

  const recs: string[] = [];
  if ((decisionCounts["human_review"] || 0) > 0) {
    recs.push(`- Review the ${decisionCounts["human_review"]} sample(s) flagged for human review to improve generation prompts.`);
  }
  if ((decisionCounts["repair"] || 0) > 0) {
    recs.push(`- Investigate the ${decisionCounts["repair"]} sample(s) that required repair for recurring grounding weaknesses.`);
  }
  if ((decisionCounts["reject"] || 0) > 0) {
    recs.push(`- Examine the ${decisionCounts["reject"]} rejected sample(s) and consider adjusting source document coverage or quality rules.`);
  }
  if (recs.length === 0) {
    recs.push("- All samples passed evaluation. No corrective action required.");
  }

  // Sample types passed
  const stCounts: Record<string, number> = {};
  passedSamples.forEach((s) => {
    const st = s.sample_type || "unknown";
    stCounts[st] = (stCounts[st] || 0) + 1;
  });

  return `# Quality Report

## Evaluator Rubric
Samples were evaluated using a rich set of RAG-specific metrics:
- **Faithfulness:** whether the expected answer is supported by the evidence chunks.
- **Answer Relevance:** whether the expected answer directly answers the question.
- **Context Precision:** whether provided evidence chunks are actually relevant.
- **Context Recall:** whether provided evidence chunks contain enough information to answer.
- **Hallucination Risk:** risk that the answer includes unsupported information. Lower is better.

## Summary
- **Passed Samples:** ${passedSamples.length}
- **Repaired Samples:** ${repairedSamples.length}
- **Human Review Samples:** ${humanReviewSamples.length}
- **Rejected Samples:** ${rejectedSamples.length}

## Metrics Averages (All Samples)
- **Average Overall Score:** ${avgOverall.toFixed(2)}
- **Average Faithfulness Score:** ${avgFaithfulness.toFixed(2)}
- **Average Answer Relevance Score:** ${avgAnswerRelevance.toFixed(2)}
- **Average Context Precision Score:** ${avgContextPrecision.toFixed(2)}
- **Average Context Recall Score:** ${avgContextRecall.toFixed(2)}
- **Average Hallucination Risk Score:** ${avgHallucinationRisk.toFixed(2)}

## Sample Types (Passed)
${Object.entries(stCounts)
  .map(([st, count]) => `- ${st}: ${count}`)
  .join("\n")}

## Common Issues
${uniqueIssues.length > 0 
  ? uniqueIssues.map((issue) => `- ${issue}`).join("\n") 
  : "- No issues recorded."}

## Recommendations
${recs.join("\n")}
`;
}
