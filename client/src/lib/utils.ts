import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CASE_DOMAINS, CaseDomainKey } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number | null, currency = "INR") {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "Not Specified";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return "Date Unknown";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(dateString);
  }
}

export function getDomainInfo(domainKey: string) {
  return CASE_DOMAINS[domainKey as CaseDomainKey] || {
    id: domainKey,
    label: domainKey,
    subcategories: [],
    mandatoryEvidenceTypes: [],
  };
}

export function getConfidenceBadgeClass(confidence: string) {
  switch (confidence) {
    case "HIGH":
      return "bg-emerald-950/80 text-emerald-400 border-emerald-500/40";
    case "MEDIUM":
      return "bg-amber-950/80 text-amber-400 border-amber-500/40";
    case "LOW":
      return "bg-rose-950/80 text-rose-400 border-rose-500/40";
    case "UNCERTAIN":
    default:
      return "bg-purple-950/80 text-purple-400 border-purple-500/40";
  }
}

export function getStatusBadgeClass(status: string) {
  switch (status) {
    case "DRAFT":
      return "bg-slate-800 text-slate-300 border-slate-700";
    case "ANALYZING":
      return "bg-indigo-950/80 text-indigo-400 border-indigo-500/40 animate-pulse";
    case "PENDING_INPUT":
      return "bg-amber-950/80 text-amber-400 border-amber-500/40";
    case "READY_FOR_NOTICE":
      return "bg-emerald-950/80 text-emerald-400 border-emerald-500/40";
    case "CLOSED":
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
}
