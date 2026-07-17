import { useState, useEffect } from "react";

export interface EvidenceItem {
  id: string;
  index: number;
  document_name: string;
  text: string;
  evidence_unavailable?: boolean;
}

export interface EvaluatorSample {
  id: string;
  category: string;
  difficulty: string;
  sample_type: string;
  question: string;
  expected_answer: string;
  status: string;
  retry_count: number;
  
  // Quality evaluation specific fields
  overall_score: number | null;
  decision: "pass" | "repair" | "human_review" | "reject" | null;
  faithfulness_score: number | null;
  answer_relevance_score: number | null;
  context_precision_score?: number | null;
  context_recall_score?: number | null;
  hallucination_risk_score: number | null;
  clarity_score?: number | null;
  difficulty_match_score?: number | null;
  answerability_score?: number | null;
  novelty_score?: number | null;
  
  issues: string[];
  evaluator_notes: string | null;
  repair_instruction: string | null;
  evidence: EvidenceItem[];
}

export function useEvaluatorSamples(projectId: string) {
  const [samples, setSamples] = useState<EvaluatorSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchSamples = async () => {
      try {
        setLoading(true);
        const apiUrl = "";
        const res = await fetch(`${apiUrl}/api/projects/${projectId}/samples`);
        if (!res.ok) {
          throw new Error(`Error fetching samples: ${res.statusText}`);
        }
        const data = await res.json();
        
        if (active) {
          if (data && data.length > 0) {
            // Map backend data to evaluator shape, applying defaults where missing
            const mappedData: EvaluatorSample[] = data.map((s: any) => {
              // Map backend sample statuses to evaluator decisions if decision is missing
              let decision: "pass" | "repair" | "human_review" | "reject" | null = s.decision;
              if (!decision) {
                const stat = (s.status || "").toUpperCase();
                if (stat === "APPROVED" || stat === "PASS") decision = "pass";
                else if (stat === "REPAIRING" || stat === "REPAIRED" || stat === "REPAIR") decision = "repair";
                else if (stat === "HUMAN_REVIEW" || stat === "NEEDS_REVIEW") decision = "human_review";
                else if (stat === "REJECTED" || stat === "REJECT") decision = "reject";
              }
              
              return {
                id: s.id,
                category: s.category || "General",
                difficulty: s.difficulty || "medium",
                sample_type: s.sample_type || "single_hop",
                question: s.question,
                expected_answer: s.expected_answer,
                status: s.status,
                retry_count: s.retry_count || 0,
                overall_score: s.overall_score !== undefined ? s.overall_score : null,
                decision,
                faithfulness_score: s.faithfulness_score !== undefined ? s.faithfulness_score : null,
                answer_relevance_score: s.answer_relevance_score !== undefined ? s.answer_relevance_score : null,
                context_precision_score: s.context_precision_score !== undefined ? s.context_precision_score : null,
                context_recall_score: s.context_recall_score !== undefined ? s.context_recall_score : null,
                hallucination_risk_score: s.hallucination_risk_score !== undefined ? s.hallucination_risk_score : null,
                clarity_score: s.clarity_score !== undefined ? s.clarity_score : null,
                difficulty_match_score: s.difficulty_match_score !== undefined ? s.difficulty_match_score : null,
                answerability_score: s.answerability_score !== undefined ? s.answerability_score : null,
                novelty_score: s.novelty_score !== undefined ? s.novelty_score : null,
                issues: s.issues || [],
                evaluator_notes: s.evaluator_notes || s.evaluator_notes === null ? s.evaluator_notes : "Processed by Quality Evaluator Agent.",
                repair_instruction: s.repair_instruction || null,
                evidence: s.evidence || []
              };
            });
            setSamples(mappedData);
          } else {
            setSamples([]);
          }
          setError(null);
        }
      } catch (err: any) {
        console.error("Failed to load evaluation samples:", err);
        if (active) {
          setError(err.message || "Failed to load evaluation samples");
          setSamples([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSamples();

    return () => {
      active = false;
    };
  }, [projectId]);

  return { samples, setSamples, loading, error };
}
