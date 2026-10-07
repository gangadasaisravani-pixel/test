import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export function useCase(caseId?: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const fetchCase = useCallback(async () => {
    if (!caseId) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getCase(caseId);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load case data");
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const runAnalysis = async () => {
    if (!caseId) return;
    try {
      setIsAnalyzing(true);
      await api.triggerAnalysis(caseId);
      await fetchCase();
    } catch (err: any) {
      setError(err.message || "Analysis failed");
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateDossier = async () => {
    if (!caseId) return;
    try {
      const res = await api.generatePackage(caseId);
      await fetchCase();
      return res;
    } catch (err: any) {
      setError(err.message || "Failed to generate complaint dossier");
      throw err;
    }
  };

  return {
    ...data,
    isLoading,
    error,
    isAnalyzing,
    refresh: fetchCase,
    runAnalysis,
    generateDossier,
  };
}
