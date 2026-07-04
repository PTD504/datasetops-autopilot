import React from "react";
import { X } from "lucide-react";
import { useMissionControlStore } from "../store/useMissionControlStore";
import { AGENT_NODES } from "../config/agentConfig";
import { GRAPH_LAYOUT, GRAPH_EDGES } from "../config/graphLayout";
import WorkflowNode, { NodeUiStatus } from "./WorkflowNode";
import WorkflowEdge from "./WorkflowEdge";
import { WorkflowStatus } from "../types";
import InspectorPanel from "../inspector/InspectorPanel";

interface DirectedWorkflowGraphProps {
  currentWorkflowStatus: WorkflowStatus;
  repairsCount?: number;
}

export default function DirectedWorkflowGraph({ 
  currentWorkflowStatus,
  repairsCount = 0
}: DirectedWorkflowGraphProps) {
  const { 
    selectedNodeId, 
    setSelectedNodeId 
  } = useMissionControlStore();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = React.useState<Record<string, { x: number; y: number; w: number; h: number }>>({});

  const updateNodePositions = React.useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const positions: typeof nodePositions = {};
    
    AGENT_NODES.forEach((node) => {
      const el = document.getElementById(`node-${node.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        positions[node.id] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          w: rect.width,
          h: rect.height,
        };
      }
    });
    setNodePositions(positions);
  }, []);

  React.useEffect(() => {
    // Measure on mount
    updateNodePositions();
    
    // Measure on window resize
    window.addEventListener("resize", updateNodePositions);
    
    // Measure on container resize (layout shifts, Inspector state changes, etc.)
    const observer = new ResizeObserver(updateNodePositions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    // Run after a small timeout to ensure layout completed
    const timer = setTimeout(updateNodePositions, 100);
    
    return () => {
      window.removeEventListener("resize", updateNodePositions);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [updateNodePositions, selectedNodeId, currentWorkflowStatus]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedNodeId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSelectedNodeId]);

  // Helper to resolve the order of the current active node
  const getActiveOrder = () => {
    const activeNode = AGENT_NODES.find((n) => 
      n.workflowStates.includes(currentWorkflowStatus)
    );
    return activeNode ? activeNode.pipelineOrder : 0;
  };

  const activeOrder = getActiveOrder();

  // Resolve the status of a specific node
  const getNodeStatus = (nodeId: string, nodeOrder: number): NodeUiStatus => {
    // 1. Successful complete states
    if (currentWorkflowStatus === "DONE" || currentWorkflowStatus === "EXPORT_READY") {
      return "Completed";
    }

    // 2. Failed state
    if (currentWorkflowStatus === "FAILED") {
      const activeNode = AGENT_NODES.find((n) => n.workflowStates.includes(currentWorkflowStatus));
      if (activeNode && nodeId === activeNode.id) {
        return "Failed";
      }
      return nodeOrder < (activeNode?.pipelineOrder || 0) ? "Completed" : "Pending";
    }

    // 3. Current active state checking
    const isActive = AGENT_NODES.find((n) => n.id === nodeId)?.workflowStates.includes(currentWorkflowStatus);
    if (isActive) {
      if (currentWorkflowStatus.startsWith("WAITING_")) {
        return "Waiting";
      }
      if (currentWorkflowStatus === "REPAIRING") {
        return "Repair Requested";
      }
      return "Running";
    }

    // 4. Fallback checking order
    if (nodeOrder < activeOrder) {
      return "Completed";
    }
    return "Pending";
  };

  // Helper to determine if an edge is active
  const isEdgeActive = (sourceId: string, targetId: string) => {
    // 1. Specific condition for the repair loop evaluator -> generator
    if (sourceId === "evaluator" && targetId === "generator") {
      return currentWorkflowStatus === "REPAIRING";
    }

    const sourceNode = AGENT_NODES.find((n) => n.id === sourceId);
    const targetNode = AGENT_NODES.find((n) => n.id === targetId);
    if (!sourceNode || !targetNode) return false;

    const sourceStatus = getNodeStatus(sourceId, sourceNode.pipelineOrder);
    const targetStatus = getNodeStatus(targetId, targetNode.pipelineOrder);

    // If repair is active, don't show normal generator-to-evaluator forward path as active
    if (sourceId === "generator" && targetId === "evaluator" && currentWorkflowStatus === "REPAIRING") {
      return false;
    }

    return (
      (sourceStatus === "Completed" && targetStatus !== "Pending") ||
      (sourceStatus === "Running" && targetStatus === "Running")
    );
  };

  // Smart popover positioning calculation
  const getPopoverPos = () => {
    if (!selectedNodeId || !nodePositions[selectedNodeId] || !containerRef.current) return null;
    const node = nodePositions[selectedNodeId];
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const popoverW = 280;
    const popoverH = 240;
    const gap = 12;

    const spaceRight = containerWidth - (node.x + node.w / 2);
    const spaceLeft = node.x - node.w / 2;
    const spaceBelow = containerHeight - (node.y + node.h / 2);
    const spaceAbove = node.y - node.h / 2;

    let placement: "right" | "left" | "below" | "above" = "right";

    if (spaceRight >= popoverW + gap) {
      placement = "right";
    } else if (spaceLeft >= popoverW + gap) {
      placement = "left";
    } else if (spaceBelow >= popoverH + gap) {
      placement = "below";
    } else if (spaceAbove >= popoverH + gap) {
      placement = "above";
    } else {
      // Pick direction with the maximum space
      const maxSpace = Math.max(spaceRight, spaceLeft, spaceBelow, spaceAbove);
      if (maxSpace === spaceRight) placement = "right";
      else if (maxSpace === spaceLeft) placement = "left";
      else if (maxSpace === spaceBelow) placement = "below";
      else placement = "above";
    }

    let left = 0;
    let top = 0;

    if (placement === "right") {
      left = node.x + node.w / 2 + gap;
      top = node.y - popoverH / 2;
    } else if (placement === "left") {
      left = node.x - node.w / 2 - popoverW - gap;
      top = node.y - popoverH / 2;
    } else if (placement === "below") {
      left = node.x - popoverW / 2;
      top = node.y + node.h / 2 + gap;
    } else {
      left = node.x - popoverW / 2;
      top = node.y - node.h / 2 - popoverH - gap;
    }

    // Clamp coordinates to keep popover inside container boundaries
    const padding = 12;
    left = Math.max(padding, Math.min(containerWidth - popoverW - padding, left));
    top = Math.max(padding, Math.min(containerHeight - popoverH - padding, top));

    return { left, top };
  };

  const popoverPos = getPopoverPos();

  return (
    <div 
      ref={containerRef}
      className="w-full h-[380px] relative bg-[#090b20]/25 rounded-xl overflow-hidden p-4 select-none"
    >
      {/* Click outside catcher to close popup (only active when a node is selected) */}
      {selectedNodeId && (
        <div 
          className="absolute inset-0 z-10 cursor-default pointer-events-auto"
          onClick={() => setSelectedNodeId(null)}
        />
      )}

      {/* Dynamic SVG connection stroke styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes edge-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-edge-dash {
          stroke-dasharray: 6 4;
          animation: edge-dash 1s linear infinite;
        }
        @keyframes edge-glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 1px rgba(99, 102, 241, 0.2));
          }
          50% {
            filter: drop-shadow(0 0 4px rgba(99, 102, 241, 0.6));
          }
        }
        .animate-edge-glow {
          animation: edge-glow-pulse 2s ease-in-out infinite;
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />

      {/* Blueprint grid mesh overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "2.5rem 2.5rem",
        }}
      ></div>

      {/* Subtle ambient indigo background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/5 blur-[90px] pointer-events-none"></div>

      {/* SVG Connections Canvas */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          {/* Default gray arrow marker */}
          <marker
            id="arrow-gray"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-500/70" />
          </marker>

          {/* Active indigo arrow marker */}
          <marker
            id="arrow-indigo"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-indigo-400" />
          </marker>

          {/* Curved repair loop arrow marker */}
          <marker
            id="arrow-rose"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-rose-400" />
          </marker>

          {/* Active orange arrow marker */}
          <marker
            id="arrow-orange"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-orange-500" />
          </marker>

          {/* Active amber arrow marker */}
          <marker
            id="arrow-amber"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-amber-500" />
          </marker>

          {/* Inactive repair loop arrow marker */}
          <marker
            id="arrow-rose-dim"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-amber-500/20" />
          </marker>
        </defs>

        {/* Map connection lines */}
        {GRAPH_EDGES.map((edge) => {
          const sPos = nodePositions[edge.source];
          const tPos = nodePositions[edge.target];
          const isActive = isEdgeActive(edge.source, edge.target);

          return (
            <WorkflowEdge
              key={edge.id}
              edge={edge}
              sourcePos={sPos}
              targetPos={tPos}
              isActive={isActive}
              repairsCount={repairsCount}
            />
          );
        })}
      </svg>

      {/* HTML Nodes overlay */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {AGENT_NODES.map((node) => {
          const pos = GRAPH_LAYOUT[node.id];
          if (!pos) return null;

          const status = getNodeStatus(node.id, node.pipelineOrder);
          const isSelected = selectedNodeId === node.id;

          return (
            <div
              key={node.id}
              id={`node-${node.id}`}
              className="absolute pointer-events-auto"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <WorkflowNode
                node={node}
                status={status}
                isSelected={isSelected}
                onClick={() => setSelectedNodeId(selectedNodeId === node.id ? null : node.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Contextual Floating Popover Node Inspector (z-30) */}
      {selectedNodeId && popoverPos && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-30 bg-[#07091e]/95 border border-white/[0.08] backdrop-blur-xl shadow-2xl rounded-2xl flex flex-col p-4 w-[280px] max-h-[250px] overflow-hidden pointer-events-auto select-text"
          style={{
            left: `${popoverPos.left}px`,
            top: `${popoverPos.top}px`,
            animation: "fadeInScale 0.18s ease-out forwards",
            transformOrigin: "center center"
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-500 to-rose-600 opacity-60"></div>
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 mb-2 shrink-0">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wide">Node Inspector</h3>
            <button 
              onClick={() => setSelectedNodeId(null)}
              className="p-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer"
              aria-label="Close Inspector"
            >
              <X size={10} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar pr-0.5 select-text">
            <InspectorPanel />
          </div>
        </div>
      )}
    </div>
  );
}
