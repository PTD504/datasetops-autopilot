import { useState, useEffect } from "react";
import { SampleData } from "./components/SampleCard";

export function useGeneratorSamples(projectId: string) {
  const [samples, setSamples] = useState<SampleData[]>([]);
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
          setSamples(data || []);
          setError(null);
        }
      } catch (err: unknown) {
        console.error("Failed to load samples:", err);
        if (active) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message || "Failed to load samples");
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

  return { samples, loading, error };
}
