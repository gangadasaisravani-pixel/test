import { CreateCaseInput, UpdateCaseInput } from "@shared/schema";

const API_BASE = "";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // System Health & Config
  async checkHealth(): Promise<{ status: string; geminiConfigured: boolean }> {
    const res = await fetch(`${API_BASE}/api/health`);
    return handleResponse(res);
  },

  async setGeminiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/config/gemini-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    return handleResponse(res);
  },

  // Cases
  async getCases(): Promise<{ cases: any[] }> {
    const res = await fetch(`${API_BASE}/api/cases`);
    return handleResponse(res);
  },

  async getCase(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/cases/${id}`);
    return handleResponse(res);
  },

  async createCase(data: CreateCaseInput): Promise<{ case: any }> {
    const res = await fetch(`${API_BASE}/api/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateCase(id: string, data: UpdateCaseInput): Promise<{ case: any }> {
    const res = await fetch(`${API_BASE}/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteCase(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/cases/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  // Evidence
  async uploadEvidenceFiles(caseId: string, formData: FormData): Promise<{ success: boolean; evidenceFiles: any[] }> {
    const res = await fetch(`${API_BASE}/api/cases/${caseId}/evidence`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(res);
  },

  async uploadVoiceStatement(caseId: string, formData: FormData): Promise<{ success: boolean; evidenceFile: any }> {
    const res = await fetch(`${API_BASE}/api/cases/${caseId}/evidence/voice`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteEvidence(evidenceId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/evidence/${evidenceId}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  // Analysis & Reasoning
  async triggerAnalysis(caseId: string): Promise<{ success: boolean; fusion: any }> {
    const res = await fetch(`${API_BASE}/api/cases/${caseId}/analyze`, {
      method: "POST",
    });
    return handleResponse(res);
  },

  async answerFollowUp(caseId: string, questionId: string, answerText: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/cases/${caseId}/follow-up/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answerText }),
    });
    return handleResponse(res);
  },

  async resolveContradiction(contradictionId: string, isResolved = true, comment?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/contradictions/${contradictionId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isResolved, comment }),
    });
    return handleResponse(res);
  },

  // Package & Dossier
  async generatePackage(caseId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/cases/${caseId}/generate-package`, {
      method: "POST",
    });
    return handleResponse(res);
  },
};
