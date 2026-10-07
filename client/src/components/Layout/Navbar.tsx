import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Scale,
  ShieldAlert,
  FileCheck2,
  Brain,
  HelpCircle,
  FileText,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { api } from "../../lib/api";

interface NavbarProps {
  currentCaseId?: string;
  caseTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentCaseId, caseTitle }) => {
  const location = useLocation();
  const [geminiConnected, setGeminiConnected] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [inputKey, setInputKey] = useState<string>("");
  const [keyStatusMsg, setKeyStatusMsg] = useState<string>("");

  useEffect(() => {
    api.checkHealth()
      .then((res) => setGeminiConnected(res.geminiConfigured))
      .catch(() => setGeminiConnected(false));
  }, []);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.setGeminiKey(inputKey);
      if (res.success) {
        setGeminiConnected(true);
        setKeyStatusMsg("Key successfully configured for session!");
        setTimeout(() => setShowKeyModal(false), 1200);
      }
    } catch (err: any) {
      setKeyStatusMsg(err.message || "Failed to update key");
    }
  };

  const navLinks = currentCaseId
    ? [
        { to: `/cases/${currentCaseId}/evidence`, label: "Evidence Vault", icon: FolderOpen },
        { to: `/cases/${currentCaseId}/analysis`, label: "Evidence Fusion", icon: Brain },
        { to: `/cases/${currentCaseId}/agent`, label: "AI Clarification", icon: HelpCircle },
        { to: `/cases/${currentCaseId}/rights`, label: "CPA 2019 Rights", icon: Scale },
        { to: `/cases/${currentCaseId}/package`, label: "Complaint Dossier", icon: FileText },
      ]
    : [];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Scale className="w-5 h-5 text-indigo-400 group-hover:rotate-6 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  ClaimProof<span className="text-indigo-400">AI</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800/60 rounded">
                  Forensic v1.0
                </span>
              </div>
            </Link>

            {/* Active Case Title Badge */}
            {currentCaseId && caseTitle && (
              <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800 text-xs">
                <span className="text-slate-400">Case:</span>
                <span className="font-semibold text-slate-200 max-w-[200px] truncate" title={caseTitle}>
                  {caseTitle}
                </span>
              </div>
            )}
          </div>

          {/* Case Navigation Links */}
          {currentCaseId && (
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Tools */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-slate-900 transition-colors"
            >
              All Cases
            </Link>

            {/* Gemini Live SDK Status Badge */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-all ${
                geminiConnected
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/50"
                  : "bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/50"
              }`}
              title="Click to configure Google Gemini API Key"
            >
              {geminiConnected ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Gemini 2.5 Pro Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  <span>Forensic Simulation Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Case Tabs */}
        {currentCaseId && (
          <div className="lg:hidden flex overflow-x-auto border-t border-slate-800/80 px-2 py-1.5 gap-1 scrollbar-none">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 whitespace-nowrap rounded-md text-xs font-medium ${
                    isActive
                      ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-100">Google Gemini Configuration</h3>
                  <p className="text-xs text-slate-400">Powered by official @google/genai SDK</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
              <p>
                ClaimProof AI uses <strong>gemini-2.5-pro</strong> for deep multimodal evidence reasoning (OCR, unboxing videos, audio transcripts) and <strong>gemini-2.5-flash</strong> for follow-up turns.
              </p>
              <p className="text-slate-400">
                You can set your key in <code className="text-indigo-300">.env</code> as <code className="text-indigo-300">GEMINI_API_KEY</code> or input it below for immediate live reasoning.
              </p>
            </div>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              {keyStatusMsg && (
                <div className="text-xs font-medium text-indigo-300 bg-indigo-950/50 p-2 rounded-lg border border-indigo-800/40">
                  {keyStatusMsg}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Save & Connect Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
