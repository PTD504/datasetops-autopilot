import React from "react";

interface DifficultyBadgeProps {
  difficulty?: string;
}

export default function DifficultyBadge({ difficulty = "medium" }: DifficultyBadgeProps) {
  const diff = (difficulty || "").toLowerCase();
  let classes = "bg-amber-500/10 text-amber-300 border-amber-500/25";
  let label = "Medium";

  if (diff === "easy") {
    classes = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    label = "Easy";
  } else if (diff === "hard") {
    classes = "bg-rose-500/10 text-rose-400 border-rose-500/25";
    label = "Hard";
  }

  return (
    <span className={`inline-flex items-center text-[9px] px-2.5 py-0.5 rounded-full border font-mono font-semibold uppercase tracking-wider ${classes}`}>
      {label}
    </span>
  );
}
