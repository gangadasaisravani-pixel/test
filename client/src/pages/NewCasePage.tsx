import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck2,
  ShoppingBag,
  Wrench,
  CreditCard,
} from "lucide-react";
import { Navbar } from "../components/Layout/Navbar";
import { api } from "../lib/api";
import { CASE_DOMAINS, CaseDomainKey } from "@shared/schema";

export const NewCasePage: React.FC = () => {
  const navigate = useNavigate();

  const [domain, setDomain] = useState<CaseDomainKey>("ECOMMERCE_PRODUCT");
  const [subcategory, setSubcategory] = useState<string>(
    CASE_DOMAINS.ECOMMERCE_PRODUCT.subcategories[0]
  );
  const [title, setTitle] = useState<string>("");
  const [opposingParty, setOpposingParty] = useState<string>("");
  const [transactionAmount, setTransactionAmount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("INR");
  const [transactionDate, setTransactionDate] = useState<string>("");
  const [orderReferenceNumber, setOrderReferenceNumber] = useState<string>("");
  const [userNarrative, setUserNarrative] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentDomainConfig = CASE_DOMAINS[domain];

  const handleDomainChange = (newDomain: CaseDomainKey) => {
    setDomain(newDomain);
    setSubcategory(CASE_DOMAINS[newDomain].subcategories[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (title.trim().length < 5) {
      setErrorMsg("Title must be at least 5 characters.");
      return;
    }
    if (opposingParty.trim().length < 2) {
      setErrorMsg("Please provide the merchant or service provider's name.");
      return;
    }
    if (userNarrative.trim().length < 20) {
      setErrorMsg("Please provide at least 20 characters describing the grievance.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createCase({
        domain,
        subcategory,
        title: title.trim(),
        opposingParty: opposingParty.trim(),
        transactionAmount: transactionAmount ? parseFloat(transactionAmount) : undefined,
        currency,
        transactionDate: transactionDate || undefined,
        orderReferenceNumber: orderReferenceNumber.trim() || undefined,
        userNarrative: userNarrative.trim(),
      });

      // Redirect directly to evidence vault for file uploads
      navigate(`/cases/${res.case.id}/evidence`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create case.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Form Container */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8">
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              Initialize Consumer Grievance Case
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure dispute taxonomy and transaction particulars to calibrate forensic reasoning under CPA 2019.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Target Domain */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Select Target Domain
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.values(CASE_DOMAINS).map((dom) => {
                  const isSelected = domain === dom.id;
                  const Icon =
                    dom.id === "ECOMMERCE_PRODUCT"
                      ? ShoppingBag
                      : dom.id === "SERVICE_DISPUTES"
                      ? Wrench
                      : CreditCard;

                  return (
                    <button
                      key={dom.id}
                      type="button"
                      onClick={() => handleDomainChange(dom.id as CaseDomainKey)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                        {isSelected && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100">{dom.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Subcategory & Mandatory Evidence Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Grievance Subcategory
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {currentDomainConfig.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mandatory Evidence Checklist Reminder */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-indigo-400 text-[11px] uppercase tracking-wider block">
                  Mandatory Proof Checklist for this Category:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentDomainConfig.mandatoryEvidenceTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/50 text-[10px] text-indigo-300 font-semibold"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Case Title & Opposing Party */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Case Title / Subject *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Defective 55-Inch 4K OLED Smart TV with Cracked Display"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Opposing Party / Merchant / Provider *
                </label>
                <input
                  type="text"
                  value={opposingParty}
                  onChange={(e) => setOpposingParty(e.target.value)}
                  placeholder="e.g. OmniTech Retail Pvt. Ltd. (Flipkart Seller)"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Step 4: Transaction Particulars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Transaction Amount (INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="e.g. 64999.00"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Transaction / Order Date
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Order / Invoice / Docket Reference #
                </label>
                <input
                  type="text"
                  value={orderReferenceNumber}
                  onChange={(e) => setOrderReferenceNumber(e.target.value)}
                  placeholder="e.g. OD4092817294819"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Step 5: User Grievance Narrative */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-300">
                  Detailed Narrative Overview * (Min 20 characters)
                </label>
                <span className="text-[11px] text-slate-500">{userNarrative.length} chars</span>
              </div>
              <textarea
                value={userNarrative}
                onChange={(e) => setUserNarrative(e.target.value)}
                rows={5}
                required
                placeholder="Describe what occurred in chronological order. Example: Ordered television on Sept 15 for ₹64,999. Arrived in crushed box on Sept 18. Authorized installation technician on Sept 19 unboxed and verified shattered internal panel as DOA. Merchant refuses replacement citing arbitrary 24-hr transit clause..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex items-center justify-end space-x-3">
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? "Creating Case..." : "Save & Proceed to Evidence Vault →"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
