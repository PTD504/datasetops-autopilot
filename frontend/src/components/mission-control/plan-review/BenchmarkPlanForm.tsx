import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Check, RefreshCw } from "lucide-react";

export interface PlanData {
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

interface BenchmarkPlanFormProps {
  plan: PlanData;
  onSave: (updatedPlan: PlanData) => Promise<boolean>;
  isSaving: boolean;
  onCancel?: () => void;
  isPreGeneration?: boolean;
}

export default function BenchmarkPlanForm({
  plan,
  onSave,
  isSaving,
  onCancel,
  isPreGeneration = true,
}: BenchmarkPlanFormProps) {
  // Input fields
  const [goal, setGoal] = useState("");
  const [language, setLanguage] = useState("");
  const [totalSamples, setTotalSamples] = useState(10);
  const [easySamples, setEasySamples] = useState(5);
  const [mediumSamples, setMediumSamples] = useState(3);
  const [hardSamples, setHardSamples] = useState(2);
  const [categoriesText, setCategoriesText] = useState("");
  const [qualityRulesText, setQualityRulesText] = useState("");

  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form state from plan prop
  useEffect(() => {
    if (plan) {
      setGoal(plan.goal || "");
      setLanguage(plan.language || "");
      
      const total = plan.sample_count?.total ?? 10;
      setTotalSamples(total);
      setEasySamples(plan.sample_count?.easy ?? 0);
      setMediumSamples(plan.sample_count?.medium ?? 0);
      setHardSamples(plan.sample_count?.hard ?? 0);
      
      setCategoriesText((plan.categories || []).join(", "));
      setQualityRulesText((plan.quality_rules || []).join("\n"));
    }
  }, [plan]);

  // Clean value normalization for numeric fields (prevents leading zeros, negative values, etc.)
  const handleNumberChange = (valueStr: string, setter: (val: number) => void) => {
    const sanitized = valueStr.replace(/\D/g, ""); // strip non-numeric characters
    if (sanitized === "") {
      setter(0);
      return;
    }
    const parsed = parseInt(sanitized, 10);
    setter(parsed);
  };

  const validate = (): boolean => {
    if (!goal.trim()) {
      setValidationError("Benchmark Goal objective is a required field.");
      return false;
    }
    if (!language.trim()) {
      setValidationError("Target Language is a required field.");
      return false;
    }
    if (totalSamples <= 0) {
      setValidationError("Total Samples count must be a positive number.");
      return false;
    }
    
    // Validate categories
    const categoriesList = categoriesText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (categoriesList.length === 0) {
      setValidationError("Proposed Categories list cannot be empty. Specify at least one category.");
      return false;
    }

    // Validate difficulty splits
    if (easySamples < 0 || mediumSamples < 0 || hardSamples < 0) {
      setValidationError("Difficulty counts cannot be negative.");
      return false;
    }
    if (easySamples + mediumSamples + hardSamples !== totalSamples) {
      setValidationError(
        `The sum of Easy (${easySamples}), Medium (${mediumSamples}), and Hard (${hardSamples}) samples must equal Total Samples (${totalSamples}). Current sum is ${
          easySamples + mediumSamples + hardSamples
        }.`
      );
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const categories = categoriesText
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    
    const quality_rules = qualityRulesText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const updatedPlan: PlanData = {
      goal,
      language,
      sample_count: {
        total: totalSamples,
        easy: easySamples,
        medium: mediumSamples,
        hard: hardSamples,
      },
      categories,
      quality_rules,
    };

    await onSave(updatedPlan);
  };

  const splitSum = easySamples + mediumSamples + hardSamples;
  const isSplitMismatch = splitSum !== totalSamples;

  // Change detection logic (isDirty)
  const isDirty = plan ? (
    goal !== (plan.goal || "") ||
    language !== (plan.language || "") ||
    totalSamples !== (plan.sample_count?.total ?? 10) ||
    easySamples !== (plan.sample_count?.easy ?? 0) ||
    mediumSamples !== (plan.sample_count?.medium ?? 0) ||
    hardSamples !== (plan.sample_count?.hard ?? 0) ||
    categoriesText !== (plan.categories || []).join(", ") ||
    qualityRulesText !== (plan.quality_rules || []).join("\n")
  ) : false;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5 text-left select-text">
      {/* Dynamic local styles to strip number spinners and format scrollbars */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide standard HTML5 number spinners */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        
        /* Custom scrollbar for form fields */
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

      {validationError && (
        <Alert variant="destructive" className="border-red-500/20 bg-red-950/20 text-red-200">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertTitle className="font-bold text-xs uppercase tracking-wide">Validation Error</AlertTitle>
          <AlertDescription className="text-xs">{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Benchmark Goal */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
          Benchmark Goal / Objective
        </label>
        <textarea
          rows={3}
          value={goal}
          disabled={!isPreGeneration || isSaving}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full bg-slate-950/45 border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 rounded-xl p-3.5 text-xs placeholder:text-slate-600 transition-colors leading-relaxed disabled:opacity-50"
          placeholder="e.g. Evaluate RAG system reasoning accuracy over financial report tables."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Language */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            Target Language
          </label>
          <input
            type="text"
            value={language}
            disabled={!isPreGeneration || isSaving}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-slate-950/45 border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 rounded-xl px-3.5 h-11 text-xs placeholder:text-slate-600 transition-colors disabled:opacity-50 font-medium"
            placeholder="e.g. English"
          />
        </div>

        {/* Total Samples */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            Total Samples
          </label>
          <input
            type="number"
            min={1}
            value={totalSamples === 0 ? "" : totalSamples}
            disabled={!isPreGeneration || isSaving}
            onChange={(e) => handleNumberChange(e.target.value, setTotalSamples)}
            className="w-full bg-slate-950/45 border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 rounded-xl px-3.5 h-11 text-xs placeholder:text-slate-650 transition-colors disabled:opacity-50 font-mono font-bold text-cyan-400"
          />
        </div>
      </div>

      {/* Difficulty Splits Card */}
      <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.01] space-y-3.5">
        <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            Difficulty Distribution Split
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${isSplitMismatch ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            Sum: {splitSum} / {totalSamples}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Easy</label>
            <input
              type="number"
              min={0}
              value={easySamples === 0 ? "" : easySamples}
              disabled={!isPreGeneration || isSaving}
              onChange={(e) => handleNumberChange(e.target.value, setEasySamples)}
              className="w-full bg-slate-950/35 border border-white/[0.06] text-white focus:outline-none focus:border-cyan-500/50 rounded-lg p-2.5 text-xs text-center font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Medium</label>
            <input
              type="number"
              min={0}
              value={mediumSamples === 0 ? "" : mediumSamples}
              disabled={!isPreGeneration || isSaving}
              onChange={(e) => handleNumberChange(e.target.value, setMediumSamples)}
              className="w-full bg-slate-950/35 border border-white/[0.06] text-white focus:outline-none focus:border-cyan-500/50 rounded-lg p-2.5 text-xs text-center font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Hard</label>
            <input
              type="number"
              min={0}
              value={hardSamples === 0 ? "" : hardSamples}
              disabled={!isPreGeneration || isSaving}
              onChange={(e) => handleNumberChange(e.target.value, setHardSamples)}
              className="w-full bg-slate-950/35 border border-white/[0.06] text-white focus:outline-none focus:border-cyan-500/50 rounded-lg p-2.5 text-xs text-center font-mono"
            />
          </div>
        </div>

        {isSplitMismatch && (
          <p className="text-[10px] text-amber-400 font-medium leading-relaxed">
            ⚠️ Split counts ({splitSum}) must sum up exactly to the total sample count ({totalSamples}).
          </p>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
          Proposed Categories (comma-separated list)
        </label>
        <input
          type="text"
          value={categoriesText}
          disabled={!isPreGeneration || isSaving}
          onChange={(e) => setCategoriesText(e.target.value)}
          className="w-full bg-slate-950/45 border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 rounded-xl px-3.5 h-11 text-xs placeholder:text-slate-600 transition-colors disabled:opacity-50"
          placeholder="e.g. Reasoning, Fact Retrieval, Synthesis"
        />
      </div>

      {/* Quality Rules */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
          Quality Rules (one rule per line)
        </label>
        <textarea
          rows={4}
          value={qualityRulesText}
          disabled={!isPreGeneration || isSaving}
          onChange={(e) => setQualityRulesText(e.target.value)}
          className="w-full bg-slate-950/45 border border-white/[0.08] text-white focus:outline-none focus:border-cyan-500/50 rounded-xl p-3 text-xs placeholder:text-slate-600 transition-colors font-mono disabled:opacity-50 leading-relaxed custom-workspace-scroll"
          placeholder="e.g. Output answer must be supported by chunks."
        />
      </div>

      {/* Action buttons inside form */}
      {isPreGeneration && (
        <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
          <button
            type="submit"
            disabled={isSaving || isSplitMismatch || !isDirty}
            className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 disabled:pointer-events-none text-white font-bold h-11 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-95 transition-all"
          >
            {isSaving ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Check size={12} />
                Save Changes
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onCancel}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-350 font-bold h-11 text-xs cursor-pointer transition-all active:scale-95"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </form>
  );
}
