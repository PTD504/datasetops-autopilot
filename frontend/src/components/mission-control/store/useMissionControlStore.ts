import React, { createContext, useContext, useState, ReactNode } from "react";
import { 
  WorkflowStatus, 
  TraceItem, 
  AgentArtifact, 
  UsageSummary 
} from "../types";

export interface MissionControlState {
  selectedNodeId: string | null;
  currentWorkflowStatus: WorkflowStatus;
  demoMode: boolean;
  traces: TraceItem[];
  artifacts: AgentArtifact[];
  usage: UsageSummary | null;
  loading: boolean;
  error: boolean;
  setSelectedNodeId: (id: string | null) => void;
  setCurrentWorkflowStatus: (status: WorkflowStatus) => void;
  setDemoMode: (enabled: boolean) => void;
  setTraces: (traces: TraceItem[]) => void;
  setArtifacts: (artifacts: AgentArtifact[]) => void;
  setUsage: (usage: UsageSummary | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: boolean) => void;
}

const MissionControlContext = createContext<MissionControlState | undefined>(undefined);

export function useMissionControlStore(): MissionControlState {
  const context = useContext(MissionControlContext);
  if (!context) {
    throw new Error("useMissionControlStore must be used within a MissionControlProvider");
  }
  return context;
}

interface ProviderProps {
  children: ReactNode;
  initialProjectId: string;
}

export function MissionControlProvider({ children }: ProviderProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [currentWorkflowStatus, setCurrentWorkflowStatus] = useState<WorkflowStatus>("LOADING");
  const [demoMode, setDemoMode] = useState<boolean>(false); // Default to false to reflect real backend state
  const [traces, setTraces] = useState<TraceItem[]>([]);
  const [artifacts, setArtifacts] = useState<AgentArtifact[]>([]);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const value: MissionControlState = {
    selectedNodeId,
    currentWorkflowStatus,
    demoMode,
    traces,
    artifacts,
    usage,
    loading,
    error,
    setSelectedNodeId,
    setCurrentWorkflowStatus,
    setDemoMode,
    setTraces,
    setArtifacts,
    setUsage,
    setLoading,
    setError,
  };

  return React.createElement(
    MissionControlContext.Provider,
    { value },
    children
  );
}

