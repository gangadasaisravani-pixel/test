import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Scale,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { api } from "../lib/api";
import { CaseCard } from "../components/Dashboard/CaseCard";
import { Navbar } from "../components/Layout/Navbar";
import { CASE_DOMAINS } from "@shared/schema";

export const DashboardPage: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const res = await api.getCases();
      setCases(res.cases || []);
    } catch (err: any) {
      console.error("Failed to load cases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleDeleteCase = async (id: string) => {
    if (!confirm("Are you sure you want to delete this case and its evidence vault?")) return;
    try {
      await api.deleteCase(id);
      loadCases();
    } catch (err: any) {
      alert("Failed to delete case: " + err.message);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.opposing_party.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.order_reference_number && c.order_reference_number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain = selectedDomain === "ALL" || c.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  // Calculate high-level metrics
  const totalEvidence = cases.reduce((acc, c) => acc + (c.evidenceCount || 0), 0);
  const totalUnresolvedContradictions = cases.reduce((acc, c) => acc + (c.unresolvedContradictions || 0), 0);
  const averageCompleteness =
    cases.length > 0
      ? Math.round(cases.reduce((acc, c) => acc + (c.completenessScore || 0), 0) / cases.length)
      : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section with Quick CTA */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>CPA 2019 Forensic Evidence Intelligence Layer</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Transform Fragmented Proofs Into an <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">Audit-Ready Legal Dossier</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Synthesize invoices, unboxing videos, photos, and voice statements into a chronological case timeline, detect contradictions, and export formal notices compliant with the Consumer Protection Act, 2019.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/cases/new"
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center space-x-2 group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span>Initialize New Case</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Grievance Cases
            </div>
            <div className="text-2xl font-black text-slate-100 mt-2 font-mono">{cases.length}</div>
            <div className="text-[11px] text-indigo-400 mt-1">Across 3 statutory domains</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Multimodal Evidence Indexed
            </div>
            <div className="text-2xl font-black text-slate-100 mt-2 font-mono">{totalEvidence}</div>
            <div className="text-[11px] text-cyan-400 mt-1">SHA-256 Verified Exhibits</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Evidence Completeness
            </div>
            <div className="text-2xl font-black text-slate-100 mt-2 font-mono">{averageCompleteness}%</div>
            <div className="text-[11px] text-emerald-400 mt-1">Ready for Pre-Litigation Notice</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Unreconciled Variances
            </div>
            <div className="text-2xl font-black text-slate-100 mt-2 font-mono">{totalUnresolvedContradictions}</div>
            <div className="text-[11px] text-amber-400 mt-1">Neutral Verification Flags</div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {/* Domain Category Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedDomain("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDomain === "ALL"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Domains ({cases.length})
            </button>

            {Object.values(CASE_DOMAINS).map((dom) => (
              <button
                key={dom.id}
                onClick={() => setSelectedDomain(dom.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDomain === dom.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {dom.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by merchant, title, or order #..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Case Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No Cases Found Matching Criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Initialize a consumer case to begin uploading documents, receipts, and photos for AI evidence cross-checking.
            </p>
            <Link
              to="/cases/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Case</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((c) => (
              <CaseCard key={c.id} caseData={c} onDelete={handleDeleteCase} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
