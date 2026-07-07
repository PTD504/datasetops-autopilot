import React, { useState, useEffect } from "react";
import { useMissionControlStore } from "../../../store/useMissionControlStore";
import { useEvaluatorSamples, EvaluatorSample } from "./useEvaluatorSamples";
import SummaryMetrics from "./components/SummaryMetrics";
import EvaluationCard from "./components/EvaluationCard";
import Section from "../../components/Section";
import Pagination from "../../components/Pagination";
import { X, RefreshCw, AlertTriangle, AlertCircle, Sparkles, Check, CheckCircle2, Cpu } from "lucide-react";

interface EvaluatorViewerProps {
  projectId: string;
  workflowStatus?: string;
}

export default function EvaluatorViewer({ projectId, workflowStatus }: EvaluatorViewerProps) {
  const { demoMode, setSelectedNodeId } = useMissionControlStore();
  const { samples, setSamples, loading } = useEvaluatorSamples(projectId, demoMode);
  
  // Search, filter, and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDecision, setSelectedDecision] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit Modal States
  const [editingSample, setEditingSample] = useState<EvaluatorSample | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("medium");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // 1. Default filter: if WAITING_FOR_SAMPLE_REVIEW, show human_review only if there are pending reviews, otherwise show all
  const [hasInitializedFilter, setHasInitializedFilter] = useState(false);

  useEffect(() => {
    if (!loading && samples.length > 0 && !hasInitializedFilter) {
      if (workflowStatus === "WAITING_FOR_SAMPLE_REVIEW") {
        const hasPendingReview = samples.some(
          (s) => s.decision === "human_review" &&
                 s.status !== "APPROVED" &&
                 s.status !== "PASS" &&
                 s.status !== "REJECTED"
        );
        if (hasPendingReview) {
          setSelectedDecision("human_review");
        } else {
          setSelectedDecision("all");
        }
      } else {
        setSelectedDecision("all");
      }
      setHasInitializedFilter(true);
    }
  }, [loading, samples, workflowStatus, hasInitializedFilter]);

  // Keyboard shortcut listener for edit modal
  useEffect(() => {
    if (!editingSample) return;

    // Check if the current modal data differs from original
    const isDirty = 
      editQuestion !== editingSample.question ||
      editAnswer !== editingSample.expected_answer ||
      editCategory !== editingSample.category ||
      editDifficulty !== editingSample.difficulty;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingSample(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty && !saving && editQuestion.trim() && editAnswer.trim()) {
          handleSaveEdit(editingSample.id, {
            question: editQuestion,
            expected_answer: editAnswer,
            category: editCategory,
            difficulty: editDifficulty,
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingSample, editQuestion, editAnswer, editCategory, editDifficulty, saving]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
          Analyzing Evaluation Logs...
        </p>
      </div>
    );
  }

  // Reset page count on filter or search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDecisionFilterChange = (dec: string) => {
    setSelectedDecision(dec);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const scrollContainer = document.querySelector(".custom-workspace-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    const scrollContainer = document.querySelector(".custom-workspace-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Helper to approve sample
  const handleApprove = async (sampleId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/samples/${sampleId}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        const updated = await res.json();
        setSamples((prev) => prev.map((s) => s.id === sampleId ? { ...s, status: updated.status } : s));
        if (selectedDecision === "human_review") {
          scrollToTop();
        }
      } else {
        alert("Failed to approve sample.");
      }
    } catch (e) {
      console.error(e);
      alert("Error approving sample.");
    }
  };

  // Helper to reject sample
  const handleReject = async (sampleId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/samples/${sampleId}/reject`, {
        method: "POST"
      });
      if (res.ok) {
        const updated = await res.json();
        setSamples((prev) => prev.map((s) => s.id === sampleId ? { ...s, status: updated.status } : s));
        if (selectedDecision === "human_review") {
          scrollToTop();
        }
      } else {
        alert("Failed to reject sample.");
      }
    } catch (e) {
      console.error(e);
      alert("Error rejecting sample.");
    }
  };

  // Helper to edit sample
  const startEdit = (sample: EvaluatorSample) => {
    setEditingSample(sample);
    setEditQuestion(sample.question);
    setEditAnswer(sample.expected_answer);
    setEditCategory(sample.category);
    setEditDifficulty(sample.difficulty);
    setSaveError(null);
  };

  // Helper to save edit
  const handleSaveEdit = async (sampleId: string, updatedFields: { question: string; expected_answer: string; category: string; difficulty: string }) => {
    if (!updatedFields.question.trim() || !updatedFields.expected_answer.trim()) {
      setSaveError("Question and Expected Answer cannot be empty.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/samples/${sampleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (res.ok) {
        const updated = await res.json();
        setSamples((prev) =>
          prev.map((s) =>
            s.id === updated.id
              ? {
                  ...s,
                  ...updated,
                  question: updated.question,
                  expected_answer: updated.expected_answer,
                  category: updated.category,
                  difficulty: updated.difficulty,
                }
              : s
          )
        );
        setEditingSample(null);
      } else {
        const errData = await res.json();
        setSaveError(errData.detail || "Failed to save sample changes.");
      }
    } catch (e) {
      console.error(e);
      setSaveError("Network error: Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // Final Approve and Export trigger
  const handleApproveAndExport = async () => {
    setIsExporting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/projects/${projectId}/samples/approve-and-export`, {
        method: "POST",
      });
      if (res.ok) {
        setSelectedNodeId(null);
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to finalize and build export.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error: Failed to complete export.");
    } finally {
      setIsExporting(false);
    }
  };

  // Filter samples based on search query and decision
  const filteredSamples = samples.filter((sample) => {
    const matchesSearch =
      (sample.question || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sample.expected_answer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sample.category || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    let matchesDecision = false;
    if (selectedDecision === "all") {
      matchesDecision = true;
    } else if (selectedDecision === "pass") {
      matchesDecision = sample.decision === "pass" && sample.retry_count === 0;
    } else if (selectedDecision === "repair") {
      matchesDecision = sample.decision === "repair" || sample.retry_count > 0;
    } else if (selectedDecision === "human_review") {
      // Only show pending human reviews
      matchesDecision = sample.decision === "human_review" &&
                        sample.status !== "APPROVED" &&
                        sample.status !== "PASS" &&
                        sample.status !== "REJECTED";
    } else {
      matchesDecision = (sample.decision || "").toLowerCase() === selectedDecision.toLowerCase();
    }
      
    return matchesSearch && matchesDecision;
  });

  // Calculate pagination details
  const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
  const paginatedSamples = filteredSamples.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Compute pending reviews count (only unresolved human_review samples)
  const pendingCount = samples.filter((s) => s.decision === "human_review" && s.status !== "APPROVED" && s.status !== "PASS" && s.status !== "REJECTED").length;

  // Check if the current modal data differs from original
  const isDirty = editingSample ? (
    editQuestion !== editingSample.question ||
    editAnswer !== editingSample.expected_answer ||
    editCategory !== editingSample.category ||
    editDifficulty !== editingSample.difficulty
  ) : false;

  const isCheckpointActive = workflowStatus === "WAITING_FOR_SAMPLE_REVIEW";

  return (
    <div className="flex flex-col gap-5 select-none text-left relative pb-8">
      {/* Scrollbar styling injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-workspace-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-workspace-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-workspace-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
        }
        .custom-workspace-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.16);
        }
      ` }} />
      
      {/* High-level Summary Metrics dashboard */}
      <SummaryMetrics samples={samples} />

      {/* Main workspace section */}
      <Section 
        title={isCheckpointActive ? "Human Review Workspace" : "Quality Evaluation Workspace"} 
        className="select-text"
      >
        <div className="space-y-4">
          <p className="text-slate-400 text-xs">
            {isCheckpointActive
              ? "Review generated benchmark samples, verify evidence grounding, and approve/reject review-routed samples before final export."
              : "Review the benchmark evaluation logs and repair negotiation traces generated by the Quality Evaluator Agent. Inspect check failures, novelty scores, and human review routing statuses."}
          </p>

          {/* Search and filter row */}
          <div className="flex flex-col sm:flex-row gap-3 border-b border-white/[0.04] pb-4 select-none">
            <input
              type="text"
              placeholder="Search evaluated questions, answers, or categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
            />
            
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold mr-1">Decision:</span>
              {["all", "pass", "repair", "human_review", "reject"].map((dec) => {
                const label = dec === "human_review" ? "review" : dec;
                return (
                  <button
                    key={dec}
                    onClick={() => handleDecisionFilterChange(dec)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-medium capitalize transition-all cursor-pointer ${
                      selectedDecision === dec
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                        : "bg-white/[0.01] text-slate-450 border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Stack */}
          <div className="space-y-4">
            {paginatedSamples.length > 0 ? (
              paginatedSamples.map((sample) => (
                <EvaluationCard 
                  key={sample.id} 
                  sample={sample} 
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onEdit={startEdit}
                />
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <p className="text-xs text-slate-500 italic">
                  No evaluated samples match the selected decision filter or search query.
                </p>
              </div>
            )}
          </div>

          {/* Pagination bar */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredSamples.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </Section>

      {/* Sticky Progress Footer inside Workspace Overlay */}
      {isCheckpointActive && (
        <div className="sticky bottom-0 bg-[#070921]/95 border-t border-white/[0.08] p-4 -mx-6 -mb-6 backdrop-blur-md z-30 flex items-center justify-between mt-8 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] select-none">
          <div className="flex items-center gap-2.5">
            {pendingCount > 0 ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-350">
                  Human Review Progress: <span className="text-amber-400 font-bold font-mono">{pendingCount} sample{pendingCount > 1 ? "s" : ""} remaining</span>
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">
                  All required human reviews completed.
                </span>
              </>
            )}
          </div>

          <button
            onClick={handleApproveAndExport}
            disabled={pendingCount > 0 || isExporting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
          >
            {isExporting ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                Building Export...
              </>
            ) : (
              <>
                <Check size={12} className="stroke-[3]" />
                Approve & Export
              </>
            )}
          </button>
        </div>
      )}

      {/* Edit Modal (Polished Glassmorphic Workspace overlay style) */}
      {editingSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-[MCFadeIn_0.2s_ease-out_forwards]">
          <div
            className="bg-gradient-to-b from-[#090d2e]/98 to-[#05071a]/98 border border-white/[0.08] backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.25)] rounded-2xl w-full max-w-xl flex flex-col overflow-hidden pointer-events-auto p-6 relative select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-4 select-none">
              <div className="space-y-0.5 text-left">
                <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                  Edit Benchmark Sample
                </h3>
                <p className="text-[10px] text-slate-400">
                  Make manual corrections to the generated benchmark question, answer, and metadata.
                </p>
              </div>
              <button
                onClick={() => setEditingSample(null)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                <X size={13} />
              </button>
            </div>

            {/* Content Area */}
            <div className="space-y-4 text-left">
              {saveError && (
                <div className="p-3 text-xs rounded-xl border border-red-500/20 bg-red-950/20 text-red-200 font-semibold flex items-center gap-2">
                  <AlertCircle size={13} className="text-red-400" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Category</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950/45 border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 rounded-xl px-3 h-10 text-xs placeholder:text-slate-600 transition-colors font-semibold"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Difficulty</label>
                  <select
                    className="w-full bg-slate-950/45 border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 rounded-xl px-3 h-10 text-xs placeholder:text-slate-655 transition-colors font-semibold font-mono"
                    value={editDifficulty}
                    onChange={(e) => setEditDifficulty(e.target.value)}
                  >
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Question</label>
                <textarea
                  className="w-full bg-slate-950/45 border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 rounded-xl p-3 text-xs placeholder:text-slate-600 transition-colors leading-relaxed custom-workspace-scroll"
                  rows={3}
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Expected Answer</label>
                <textarea
                  className="w-full bg-slate-950/45 border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 rounded-xl p-3 text-xs placeholder:text-slate-600 transition-colors leading-relaxed custom-workspace-scroll"
                  rows={6}
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-4 mt-4 border-t border-white/[0.06] justify-end select-none">
              <button
                onClick={() => setEditingSample(null)}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs cursor-pointer transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit(editingSample.id, {
                  question: editQuestion,
                  expected_answer: editAnswer,
                  category: editCategory,
                  difficulty: editDifficulty,
                })}
                disabled={saving || !isDirty || !editQuestion.trim() || !editAnswer.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-95 transition-all"
              >
                {saving ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={12} className="stroke-[3]" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
