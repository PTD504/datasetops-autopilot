import React from "react";
import { GraphEdgeConfig } from "../config/graphLayout";
import { resolveAnchor, AnchorType, Box, Point } from "./graphGeometry";

interface WorkflowEdgeProps {
  edge: GraphEdgeConfig;
  sourcePos?: { x: number; y: number; w: number; h: number };
  targetPos?: { x: number; y: number; w: number; h: number };
  isActive?: boolean;
  repairsCount?: number;
  isDimmed?: boolean;
}

export default function WorkflowEdge({
  edge,
  sourcePos,
  targetPos,
  isActive = false,
  repairsCount = 0,
  isDimmed = false,
}: WorkflowEdgeProps) {
  // Safeguard if positions are not measured yet on the first frame
  if (!sourcePos || !targetPos) return null;

  const edgeKey = `${edge.source}-${edge.target}`;
  const isNegotiationLoop = edgeKey === "generator-evaluator" || edgeKey === "evaluator-generator";

  // 1. Convert sourcePos/targetPos to Box shapes for geometry calculations
  const sourceBox: Box = {
    x: sourcePos.x,
    y: sourcePos.y,
    w: sourcePos.w,
    h: sourcePos.h,
  };
  const targetBox: Box = {
    x: targetPos.x,
    y: targetPos.y,
    w: targetPos.w,
    h: targetPos.h,
  };

  // 2. Resolve anchors from config or fall back to standard defaults
  let sAnchor: AnchorType = "right";
  let tAnchor: AnchorType = "left";

  if (isNegotiationLoop) {
    sAnchor = (edge.sourceAnchor as AnchorType) ?? "right";
    tAnchor = (edge.targetAnchor as AnchorType) ?? "left";
  } else {
    sAnchor = "right";
    tAnchor = targetBox.y > sourceBox.y ? "top" : "bottom";
  }

  const startPt = resolveAnchor(sourceBox, sAnchor);
  const endPt = resolveAnchor(targetBox, tAnchor);

  const startX = startPt.x;
  const startY = startPt.y;
  const endX = endPt.x;
  const endY = endPt.y;

  const dx = endX - startX;
  const dy = endY - startY;
  const spanX = Math.abs(dx);

  // 3. Resolve exit and entry angles (in degrees) to compute Bezier control points
  let exitAngle = 0;
  let entryAngleOpposite = 180;
  let d1 = spanX * 0.4;
  let d2 = spanX * 0.4;

  if (edgeKey === "generator-evaluator") {
    // Top negotiation curve wrapping over:
    exitAngle = 295;            // Flares right and up (25 degrees from vertical 270)
    entryAngleOpposite = 245;   // Flares left and up (25 degrees from vertical 270)
    d1 = 90;
    d2 = 90;
  } else if (edgeKey === "evaluator-generator") {
    // Bottom repair curve wrapping under:
    exitAngle = 115;            // Flares left and down (25 degrees from vertical 90)
    entryAngleOpposite = 65;    // Flares right and down (25 degrees from vertical 90)
    d1 = 90;
    d2 = 90;
  } else {
    // Standard connection edge: exits right horizontally (0°), enters vertically (270° or 90°)
    exitAngle = 0;
    entryAngleOpposite = targetBox.y > sourceBox.y ? 270 : 90;
    
    const gapX = Math.abs(endX - startX);
    const gapY = Math.abs(endY - startY);
    
    d1 = gapX * 0.65;
    d2 = gapY * 0.6;
  }

  // Convert angles to radians
  const rExit = (exitAngle * Math.PI) / 180;
  const rEntryOpp = (entryAngleOpposite * Math.PI) / 180;

  const cp1X = startX + d1 * Math.cos(rExit);
  const cp1Y = startY + d1 * Math.sin(rExit);
  const cp2X = endX + d2 * Math.cos(rEntryOpp);
  const cp2Y = endY + d2 * Math.sin(rEntryOpp);

  // Construct Cubic Bezier path
  const pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  
  // Calculate Cubic Bezier midpoint (t = 0.5)
  const labelX = 0.125 * startX + 0.375 * cp1X + 0.375 * cp2X + 0.125 * endX;
  const labelY = 0.125 * startY + 0.375 * cp1Y + 0.375 * cp2Y + 0.125 * endY;

  // 4. Determine colors, styles, and weights based on edge types
  let pathColorClass = "stroke-slate-700/25";
  let textColorClass = "fill-slate-500 font-medium";
  let strokeWidth = 0.9;
  let glowColorClass = "stroke-indigo-500/20";
  let dashColorClass = "stroke-indigo-300";
  let arrowColor = "rgb(71, 85, 105)"; // slate-600


  if (edgeKey === "generator-evaluator") {
    if (isActive) {
      // Forward path is active purple/indigo
      pathColorClass = "stroke-indigo-400/80";
      textColorClass = "fill-indigo-300 font-extrabold";
      strokeWidth = 1.2;
      glowColorClass = "stroke-indigo-500/20";
      dashColorClass = "stroke-indigo-300";
      arrowColor = "#818cf8";
    } else {
      // Inactive dim styling
      pathColorClass = "stroke-white/[0.12]";
      textColorClass = "fill-slate-550 font-medium";
      strokeWidth = 0.9;
      arrowColor = "rgba(255, 255, 255, 0.15)";
    }
  } else if (edgeKey === "evaluator-generator") {
    const hasRepaired = repairsCount > 0;
    if (isActive || hasRepaired) {
      // Return path is active orange
      pathColorClass = "stroke-orange-500/80";
      textColorClass = "fill-orange-400 font-extrabold";
      strokeWidth = 1.2;
      glowColorClass = "stroke-orange-500/20";
      dashColorClass = "stroke-orange-400";
      arrowColor = "#f97316";
    } else {
      // Inactive dim styling
      pathColorClass = "stroke-white/[0.12]";
      textColorClass = "fill-slate-550 font-medium";
      strokeWidth = 0.9;
      arrowColor = "rgba(255, 255, 255, 0.15)";
    }
  } else {
    // Normal edge
    if (isActive) {
      pathColorClass = "stroke-indigo-400/80";
      textColorClass = "fill-indigo-300 font-extrabold";
      strokeWidth = 1.2;
      glowColorClass = "stroke-indigo-500/20";
      dashColorClass = "stroke-indigo-300";
      arrowColor = "#818cf8";
    } else {
      pathColorClass = "stroke-white/[0.12]";
      textColorClass = "fill-slate-550 font-medium";
      strokeWidth = 0.9;
      arrowColor = "rgba(255, 255, 255, 0.15)";
    }
  }

  let labelShiftY = -12;
  if (edgeKey === "evaluator-generator") {
    labelShiftY = 22; // Display loop text below the curve
  }
  const textY = labelY + labelShiftY;

  // 5. Draw manual arrowhead pointing exactly along the end tangent vector (end - cp2)
  const angleRad = Math.atan2(endY - cp2Y, endX - cp2X);
  const angleDeg = (angleRad * 180) / Math.PI;

  const arrowhead = (
    <g transform={`translate(${endX}, ${endY}) rotate(${angleDeg})`}>
      <path
        d="M -7 -3.5 L 0 0 L -7 3.5 Z"
        fill={arrowColor}
        className="transition-all duration-300"
      />
    </g>
  );

  return (
    <g className={`select-none transition-all duration-500 ${isDimmed ? "opacity-15 pointer-events-none filter blur-[0.5px]" : ""}`}>
      {/* Outer Glowing Path (Cubic Bezier Neon Pipe) */}
      {(isActive || (edgeKey === "evaluator-generator" && repairsCount > 0)) && (
        <path
          d={pathD}
          fill="none"
          className={`${glowColorClass} blur-[3px] transition-all duration-300`}
          strokeWidth={strokeWidth + 3}
        />
      )}

      {/* Core solid path */}
      <path
        d={pathD}
        fill="none"
        className={`${pathColorClass} transition-all duration-300`}
        strokeWidth={strokeWidth}
      />

      {/* Active dashed flow overlay */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          className={`${dashColorClass} animate-edge-dash pointer-events-none opacity-90`}
          strokeWidth={strokeWidth * 0.9}
          strokeDasharray="4 8"
        />
      )}

      {/* Manual Arrowhead */}
      {arrowhead}

      {/* Travelling payload animations (Packets) */}
      {isActive && edgeKey === "generator-evaluator" && (
        <>
          <circle r="4" fill="#818cf8" className="filter drop-shadow-[0_0_3px_#818cf8]">
            <animateMotion dur="3s" repeatCount="indefinite" path={pathD} begin="0s" />
          </circle>
          <circle r="4" fill="#818cf8" className="filter drop-shadow-[0_0_3px_#818cf8]">
            <animateMotion dur="3s" repeatCount="indefinite" path={pathD} begin="1s" />
          </circle>
          <circle r="4" fill="#818cf8" className="filter drop-shadow-[0_0_3px_#818cf8]">
            <animateMotion dur="3s" repeatCount="indefinite" path={pathD} begin="2s" />
          </circle>
        </>
      )}

      {isActive && edgeKey === "evaluator-generator" && (
        <>
          <circle r="4" fill="#f97316" className="filter drop-shadow-[0_0_3px_#f97316]">
            <animateMotion dur="3s" repeatCount="indefinite" path={pathD} begin="0s" />
          </circle>
          <circle r="4" fill="#f97316" className="filter drop-shadow-[0_0_3px_#f97316]">
            <animateMotion dur="3s" repeatCount="indefinite" path={pathD} begin="1s" />
          </circle>
          <circle r="4" fill="#f97316" className="filter drop-shadow-[0_0_3px_#f97316]">
            <animateMotion dur="3s" repeatCount="indefinite" path={pathD} begin="2s" />
          </circle>
        </>
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
