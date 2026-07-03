import React from "react";
import { GraphEdgeConfig } from "../config/graphLayout";

interface WorkflowEdgeProps {
  edge: GraphEdgeConfig;
  sourcePos?: { x: number; y: number; w: number; h: number };
  targetPos?: { x: number; y: number; w: number; h: number };
  isActive?: boolean;
}

export default function WorkflowEdge({
  edge,
  sourcePos,
  targetPos,
  isActive = false,
}: WorkflowEdgeProps) {
  // Safeguard if positions are not measured yet on the first frame
  if (!sourcePos || !targetPos) return null;

  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;
  let cp1X = 0;
  let cp1Y = 0;
  let cp2X = 0;
  let cp2Y = 0;

  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;

  // Custom routing per edge for artistic precision (S-Curve & loops)
  const edgeKey = `${edge.source}-${edge.target}`;
  
  if (edgeKey === "preprocessing-source_understanding") {
    // Exit RIGHT of Preprocessing stage, enter LEFT of Source Understanding agent
    startX = sourcePos.x + sourcePos.w / 2;
    startY = sourcePos.y;
    endX = targetPos.x - targetPos.w / 2;
    endY = targetPos.y;
    const spanX = endX - startX;
    cp1X = startX + spanX * 0.4;
    cp1Y = startY;
    cp2X = endX - spanX * 0.4;
    cp2Y = endY;
  } else if (edgeKey === "source_understanding-intake_planner") {
    // Exit RIGHT of Source Understanding, enter LEFT of Intake Planner
    startX = sourcePos.x + sourcePos.w / 2;
    startY = sourcePos.y;
    endX = targetPos.x - targetPos.w / 2;
    endY = targetPos.y;
    const spanX = endX - startX;
    cp1X = startX + spanX * 0.4;
    cp1Y = startY;
    cp2X = endX - spanX * 0.4;
    cp2Y = endY;
  } else if (edgeKey === "intake_planner-generator") {
    // Exit RIGHT of Intake Planner, enter LEFT of Generator
    startX = sourcePos.x + sourcePos.w / 2;
    startY = sourcePos.y;
    endX = targetPos.x - targetPos.w / 2;
    endY = targetPos.y;
    const spanX = endX - startX;
    cp1X = startX + spanX * 0.4;
    cp1Y = startY;
    cp2X = endX - spanX * 0.4;
    cp2Y = endY;
  } else if (edgeKey === "generator-evaluator") {
    // Negotiation forward loop: exit RIGHT of Generator, enter LEFT of Evaluator, arch UPWARDS
    startX = sourcePos.x + sourcePos.w / 2;
    startY = sourcePos.y;
    endX = targetPos.x - targetPos.w / 2;
    endY = targetPos.y;
    const spanX = endX - startX;
    cp1X = startX + spanX * 0.35;
    cp1Y = startY - 45;
    cp2X = endX - spanX * 0.35;
    cp2Y = endY - 45;
  } else if (edgeKey === "evaluator-generator") {
    // Negotiation repair loop: exit LEFT of Evaluator, enter RIGHT of Generator, arch DOWNWARDS
    startX = sourcePos.x - sourcePos.w / 2;
    startY = sourcePos.y;
    endX = targetPos.x + targetPos.w / 2;
    endY = targetPos.y;
    const spanX = endX - startX;
    cp1X = startX + spanX * 0.35;
    cp1Y = startY + 45;
    cp2X = endX - spanX * 0.35;
    cp2Y = endY + 45;
  } else if (edgeKey === "evaluator-exporter") {
    // Exit RIGHT of Evaluator, enter LEFT of Exporter
    startX = sourcePos.x + sourcePos.w / 2;
    startY = sourcePos.y;
    endX = targetPos.x - targetPos.w / 2;
    endY = targetPos.y;
    const spanX = endX - startX;
    cp1X = startX + spanX * 0.4;
    cp1Y = startY;
    cp2X = endX - spanX * 0.4;
    cp2Y = endY;
  } else {
    // Fallback default routing
    startX = sourcePos.x + (dx > 0 ? sourcePos.w / 2 : -sourcePos.w / 2);
    startY = sourcePos.y;
    endX = targetPos.x - (dx > 0 ? targetPos.w / 2 : -targetPos.w / 2);
    endY = targetPos.y;
    const spanX = endX - startX;
    const spanY = endY - startY;
    cp1X = startX + spanX * 0.35;
    cp1Y = startY + spanY * 0.1;
    cp2X = endX - spanX * 0.35;
    cp2Y = endY - spanY * 0.1;
  }

  // Construct Cubic Bezier path
  const pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  
  // Calculate Cubic Bezier midpoint (t = 0.5)
  const labelX = 0.125 * startX + 0.375 * cp1X + 0.375 * cp2X + 0.125 * endX;
  const labelY = 0.125 * startY + 0.375 * cp1Y + 0.375 * cp2Y + 0.125 * endY;

  let markerId = "arrow-gray";
  if (isActive) {
    markerId = "arrow-indigo";
  }
  if (edge.isCurved) {
    markerId = "arrow-rose";
  }

  let pathColorClass = "stroke-slate-700/25";
  let textColorClass = "fill-slate-500 font-medium";
  let strokeWidth = 0.9;

  if (edge.isCurved) {
    if (isActive) {
      pathColorClass = "stroke-rose-500/80";
      textColorClass = "fill-rose-400 font-extrabold";
      strokeWidth = 1.4;
    } else {
      pathColorClass = "stroke-rose-500/20";
      textColorClass = "fill-rose-500/35 font-medium";
      strokeWidth = 0.9;
    }
  } else {
    if (isActive) {
      pathColorClass = "stroke-indigo-400/80";
      textColorClass = "fill-indigo-300 font-extrabold";
      strokeWidth = 1.2;
    } else {
      pathColorClass = "stroke-white/[0.12]";
      textColorClass = "fill-slate-550 font-medium";
      strokeWidth = 0.9;
    }
  }

  let labelShiftY = -12;
  if (edge.isCurved) {
    labelShiftY = 22; // Display loop text below the curve
  }
  const textY = labelY + labelShiftY;

  return (
    <g className="select-none">
      {/* Outer Glowing Path (Cubic Bezier Neon Pipe) */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          className={`${edge.isCurved ? "stroke-rose-500/20" : "stroke-indigo-500/20"} blur-[2px] transition-all duration-300`}
          strokeWidth={strokeWidth + 2.5}
        />
      )}

      {/* Core solid path */}
      <path
        d={pathD}
        fill="none"
        className={`${pathColorClass} transition-all duration-300`}
        strokeWidth={strokeWidth}
        markerEnd={`url(#${markerId})`}
      />

      {/* Active dashed flow overlay */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          className={`${edge.isCurved ? "stroke-rose-350" : "stroke-indigo-300"} animate-edge-dash pointer-events-none opacity-90`}
          strokeWidth={strokeWidth * 0.9}
          strokeDasharray="4 8"
        />
      )}

      {/* Connection Label (Only active to avoid floating orphans) */}
      {edge.label && isActive && (
        <g>
          {/* Label backdrop mask */}
          <text
            x={labelX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            className="fill-black stroke-slate-950 select-none stroke-[3px] paint-order-stroke font-mono font-bold"
          >
            {edge.label}
          </text>
          
          {/* Real Text */}
          <text
            x={labelX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="10"
            className={`${textColorClass} font-mono tracking-wide select-none`}
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}
