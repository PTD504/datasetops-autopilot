import React, { useState, useMemo } from "react";
import { useMissionControlStore } from "../../../store/useMissionControlStore";
import { useGeneratorSamples } from "./useGeneratorSamples";
import SampleCard from "./components/SampleCard";
import Section from "../../components/Section";
import Metric from "../../components/Metric";
import Pagination from "../../components/Pagination";
import { Sparkles, Link2, BarChart3, Database } from "lucide-react";

interface GeneratorViewerProps {
  projectId: string;
}

export default function GeneratorViewer({ projectId }: GeneratorViewerProps) {
  const { demoMode } = useMissionControlStore();
  const { samples, loading } = useGeneratorSamples(projectId, demoMode);
  
  // Minimalist search/filter/pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate difficulty and chunk counts (memoized)
  const totalCount = samples.length;
  const easyCount = useMemo(() => samples.filter((s) => s.difficulty?.toLowerCase() === "easy").length, [samples]);
  const mediumCount = useMemo(() => samples.filter((s) => s.difficulty?.toLowerCase() === "medium").length, [samples]);
  const hardCount = useMemo(() => samples.filter((s) => s.difficulty?.toLowerCase() === "hard").length, [samples]);
  
  const uniqueCategories = useMemo(() => new Set(samples.map((s) => s.category)).size, [samples]);
  const totalChunksReferenced = useMemo(() => {
    return new Set(samples.flatMap((s) => s.evidence?.map((e) => e.id) || [])).size;
  }, [samples]);

  // Filter logic (memoized)
  const filteredSamples = useMemo(() => {
    return samples.filter((sample) => {
      const matchesSearch =
        (sample.question || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sample.expected_answer || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty =
        selectedDifficulty === "all" ||
        (sample.difficulty || "").toLowerCase() === selectedDifficulty.toLowerCase();
      return matchesSearch && matchesDifficulty;
    });
  }, [samples, searchQuery, selectedDifficulty]);

  // Pagination calculations (memoized)
  const totalPages = useMemo(() => Math.ceil(filteredSamples.length / itemsPerPage), [filteredSamples.length]);
  const paginatedSamples = useMemo(() => {
    return filteredSamples.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredSamples, currentPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 select-none">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">
          Loading QA Artifacts...
        </p>
      </div>
    );
  }

  // Reset to first page on filter/search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (diff: string) => {
    setSelectedDifficulty(diff);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const scrollContainer = document.querySelector(".custom-workspace-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      
      {/* Overview stats panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric
          label="Total Synthesized"
          value={`${totalCount} QA Pairs`}
          icon={<Database size={12} className="text-indigo-400" />}
        />
        <Metric
          label="Difficulty Spread"
          value={`E:${easyCount} | M:${mediumCount} | H:${hardCount}`}
          icon={<BarChart3 size={12} className="text-amber-400" />}
        />
        <Metric
          label="Category Count"
          value={`${uniqueCategories} Topics`}
          icon={<Sparkles size={12} className="text-purple-400" />}
        />
        <Metric
          label="Source References"
          value={`${totalChunksReferenced} Chunks`}
          icon={<Link2 size={12} className="text-emerald-400" />}
        />
      </div>

      {/* Main Analysis Workspace */}
      <Section title="QA Sample Explorer" className="select-text">
        <div className="space-y-4">
          <p className="text-slate-400 text-xs">
            Review and inspect generated question-answer pairs and their semantic grounding vectors. Filter samples by difficulty or search content.
          </p>

          {/* Minimal Search & Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3 border-b border-white/[0.04] pb-4 select-none">
            <input
              type="text"
              placeholder="Search questions or expected answers..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
            />
            
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold mr-1">Difficulty:</span>
              {["all", "easy", "medium", "hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleDifficultyChange(diff)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-medium capitalize transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      : "bg-white/[0.01] text-slate-450 border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Cards stack */}
          <div className="space-y-4">
            {paginatedSamples.length > 0 ? (
              paginatedSamples.map((sample) => (
                <SampleCard key={sample.id} sample={sample} />
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                <p className="text-xs text-slate-500 italic">
                  No QA samples match your search criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredSamples.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </Section>

    </div>
  );
}
