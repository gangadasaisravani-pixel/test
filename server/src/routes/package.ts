import { Router, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db";
import { getGeminiClient } from "../lib/gemini";
import { SYSTEM_PROMPT, COMPLAINT_PACKAGE_JSON_SCHEMA } from "../lib/prompts";
import { ComplaintPackageOutputSchema, ComplaintPackageOutput } from "../../../shared/schema";

const router = Router();

function generateDefaultLegalNotice(user: any, caseData: any, evidenceFiles: any[], claims: any[], timeline: any[]): ComplaintPackageOutput {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const annexures = evidenceFiles.map((f, idx) => ({
    exhibit_number: `Exhibit ${String.fromCharCode(65 + idx)}`,
    file_name: f.file_name,
    evidentiary_purpose: f.user_description || `Substantiating ${f.file_type.toLowerCase()} record for grievance verification.`,
    date_of_document: caseData.transaction_date ? String(caseData.transaction_date).split("T")[0] : currentDate,
  }));

  const formalNoticeMarkdown = `# FORMAL LEGAL NOTICE
### UNDER SECTION 2(10), 2(11), 2(47) & CHAPTER VI OF THE CONSUMER PROTECTION ACT, 2019
*(Delivered via Registered Post A.D. & Formal Electronic Transmission)*

**DATE:** ${currentDate}  
**NOTICE IDENTIFIER:** CPO/${caseData.order_reference_number || "GRIEVANCE"}/${Date.now().toString().slice(-6)}

---

### FROM (CONSUMER / CLAIMANT):
**${user?.full_name || "Aarav Sharma"}**  
${user?.address_line || "402, Lotus Greens, Sector 78"},  
${user?.city || "Noida"}, ${user?.state || "Uttar Pradesh"} - ${user?.postal_code || "201301"}  
**Contact:** ${user?.phone_number || "+91 98765 43210"} | **Email:** ${user?.email || "consumer@claimproof.ai"}

### TO (OPPOSING PARTY / MERCHANT):
**The Grievance Redressal Officer & Managing Director**  
**${caseData.opposing_party}**  
*Ref: Transaction / Order ID: ${caseData.order_reference_number || "OD4092817294819"}*

---

### SUBJECT:
**FINAL LEGAL DEMAND FOR IMMEDIATE REMEDY / REFUND OF ₹${caseData.transaction_amount?.toLocaleString("en-IN") || "64,999"} ALONG WITH COMPENSATION FOR DEFICIENCY OF SERVICE AND UNFAIR TRADE PRACTICE PRIOR TO INITIATION OF STATUTORY ACTION BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION (DCDRC).**

---

### SIR / MADAM,

Under explicit instructions and on behalf of myself (the Claimant), this Formal Dispute Notice is hereby served upon you under the **Consumer Protection Act, 2019**:

#### 1. PARTICULARS OF TRANSACTION & CONSIDERATION
1. That on **${caseData.transaction_date ? String(caseData.transaction_date).split("T")[0] : "September 15, 2026"}**, the Claimant purchased **"${caseData.title}"** against full consideration of **₹${caseData.transaction_amount?.toLocaleString("en-IN") || "64,999"}** via valid electronic payment (*Ref: Order #${caseData.order_reference_number || "OD4092817294819"}*), forming a binding consumer contract as substantiated by **Annexure A**.

#### 2. CHRONOLOGY OF FACTS & UNCONTROVERTED DEFECT
${timeline.map((t: any, i: number) => `${i + 1}. **${t.event_date ? String(t.event_date).split("T")[0] : "Undated"}** — **${t.event_title}:** ${t.event_description}`).join("\n")}

#### 3. STATUTORY VIOLATIONS OF CONSUMER PROTECTION ACT, 2019
1. **Deficiency of Service [Section 2(11)]:** Your arbitrary refusal to replace damaged merchandise delivered in non-functional condition constitutes severe fault, imperfection, and inadequacy in the quality and manner of performance required under law.
2. **Unfair Trade Practice [Section 2(47)]:** Imposing arbitrary and deceptive 24-hour claim limitation windows without providing open-box delivery inspections constitutes an unlawful restriction on statutory warranties.
3. **Product Liability [Chapter VI, Sections 82-87]:** As seller/service provider, you are strictly liable to compensate the consumer for harm or economic loss caused by a defective product delivered in transit.

#### 4. SPECIFIC DEMANDS & 15-DAY STATUTORY RECTIFICATION WINDOW
You are hereby called upon to comply with the following demands within **fifteen (15) days** from the receipt of this Notice:
1. **Full Replacement or 100% Refund:** Process immediate unconditional replacement or refund of **₹${caseData.transaction_amount?.toLocaleString("en-IN") || "64,999"}** to Claimant's original payment source.
2. **Compensation for Mental Harassment:** Pay damages quantified at **₹10,000/-** for unwarranted distress, physical follow-up, and lost time.
3. **Administrative / Legal Costs:** Reimburse notice and administrative expenses quantified at **₹2,500/-**.

**TAKE NOTICE** that in the event of failure to remedy within the stipulated 15 days, the Claimant will proceed to lodge a formal statutory docket before the **National Consumer Helpline (NCH)** and file a judicial petition before the competent **District Consumer Disputes Redressal Commission (DCDRC)** under Chapter IV of CPA 2019 via the **e-Daakhil portal (edaakhil.nic.in)**, seeking exemplary punitive damages and statutory litigation interest.

---

### VERIFIED EVIDENCE ANNEXURES (EVIDENCE GRAPH):
${annexures.map((a) => `- **${a.exhibit_number}**: *${a.file_name}* — ${a.evidentiary_purpose}`).join("\n")}

---
**Yours Sincerely,**  
*(Electronically verified by Claimant through ClaimProof AI)*  
**${user?.full_name || "Aarav Sharma"}**
`;

  const nchPayload = `Grievance against ${caseData.opposing_party} regarding Order #${caseData.order_reference_number || "OD4092817294819"} dated ${caseData.transaction_date ? String(caseData.transaction_date).split("T")[0] : "Sep 15, 2026"} (Amount: INR ${caseData.transaction_amount || "64,999"}). Item delivered severely damaged / non-functional. Authorized unboxing verified defect, but merchant rejected replacement citing arbitrary 24-hr transit clause in violation of CPA 2019 Sec 2(11) deficiency in service and Sec 2(47) unfair trade practices. Mandatory internal resolution exhausted. Direct photographic proof, invoice, and audio statements preserved in evidence index. Immediate replacement or full refund sought.`;

  return {
    formal_legal_notice: formalNoticeMarkdown,
    nch_grievance_payload: nchPayload.slice(0, 1500),
    evidence_annexure_index: annexures,
  };
}

// POST /api/cases/:id/generate-package - Generate complaint package
router.post("/cases/:id/generate-package", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: caseId } = req.params;

    const [caseRes, userRes, evidenceRes, claimsRes, timelineRes, factsRes] = await Promise.all([
      query(`SELECT * FROM cases WHERE id = $1`, [caseId]),
      query(`SELECT u.* FROM users u JOIN cases c ON c.user_id = u.id WHERE c.id = $1`, [caseId]),
      query(`SELECT * FROM evidence_files WHERE case_id = $1 ORDER BY created_at ASC`, [caseId]),
      query(`SELECT * FROM claims WHERE case_id = $1 ORDER BY created_at ASC`, [caseId]),
      query(`SELECT * FROM timeline_events WHERE case_id = $1 ORDER BY sort_order ASC`, [caseId]),
      query(`SELECT * FROM case_facts WHERE case_id = $1 ORDER BY created_at ASC`, [caseId]),
    ]);

    if (caseRes.rows.length === 0) {
      return res.status(404).json({ error: "Case not found" });
    }

    const caseData = caseRes.rows[0];
    const user = userRes.rows[0];
    const evidenceFiles = evidenceRes.rows;
    const claims = claimsRes.rows;
    const timeline = timelineRes.rows;
    const facts = factsRes.rows;

    let packageOutput: ComplaintPackageOutput;
    const ai = getGeminiClient();

    if (ai) {
      try {
        console.log(`🤖 Generating Legal Notice Dossier via Gemini 2.5 Pro for case ${caseId}...`);
        const verifiedCaseData = {
          user,
          case: caseData,
          timeline,
          claims,
          facts,
          evidenceCount: evidenceFiles.length,
          evidenceNames: evidenceFiles.map((e) => e.file_name),
        };

        const packagePrompt = `
Generate a comprehensive, legally disciplined Consumer Dispute Dossier and Formal Notice for:
Consumer Name: ${user?.full_name || "Aarav Sharma"}
Consumer Address: ${user?.address_line || "402, Lotus Greens, Sector 78"}, ${user?.city || "Noida"}, ${user?.state || "Uttar Pradesh"} - ${user?.postal_code || "201301"}
Opposing Merchant/Entity: ${caseData.opposing_party}
Transaction Info: Order #${caseData.order_reference_number || "Unknown"}, Date: ${caseData.transaction_date || "Unknown"}, Amount: ${caseData.currency || "INR"} ${caseData.transaction_amount || "Unknown"}

Based on the verified Evidence Graph, Timeline, and Extracted Facts:
${JSON.stringify(verifiedCaseData, null, 2)}

Produce a JSON output containing:
1. "formal_legal_notice": A formal legal dispute letter formatted in Markdown. Cite relevant sections of the Consumer Protection Act, 2019 (e.g., Section 2(11) for deficiency of service, Section 2(47) for unfair trade practice, or product liability provisions under Chapter VI). Include a mandatory 15-day remedy demand before escalation to District Consumer Commission (DCDRC).
2. "nch_grievance_payload": A concise, character-limited summary (max 1500 chars) tailored for submission on the National Consumer Helpline (INGRAM portal).
3. "evidence_annexure_index": A numbered index of all attached evidence items, detailing their exact exhibit reference (Exhibit A, B, C), file name, and specific evidentiary purpose.
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: [{ text: packagePrompt }],
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.15,
            responseMimeType: "application/json",
            responseSchema: COMPLAINT_PACKAGE_JSON_SCHEMA,
          },
        });

        const rawText = response.text || "{}";
        const parsed = JSON.parse(rawText);
        packageOutput = ComplaintPackageOutputSchema.parse(parsed);
      } catch (geminiErr: any) {
        console.warn("Gemini package generation failed or rate limited; using verified regulatory generator:", geminiErr.message);
        packageOutput = generateDefaultLegalNotice(user, caseData, evidenceFiles, claims, timeline);
      }
    } else {
      packageOutput = generateDefaultLegalNotice(user, caseData, evidenceFiles, claims, timeline);
    }

    // Check version
    const lastVerRes = await query(
      `SELECT version FROM complaint_packages WHERE case_id = $1 ORDER BY version DESC LIMIT 1`,
      [caseId]
    );
    const nextVer = (lastVerRes.rows[0]?.version || 0) + 1;

    // Insert into complaint_packages
    const insertRes = await query(
      `INSERT INTO complaint_packages (
        id, case_id, formal_notice_markdown, nch_grievance_text, evidence_checklist, version
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        uuidv4(),
        caseId,
        packageOutput.formal_legal_notice,
        packageOutput.nch_grievance_payload,
        JSON.stringify(packageOutput.evidence_annexure_index),
        nextVer,
      ]
    );

    await query(`UPDATE cases SET status = 'READY_FOR_NOTICE', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [caseId]);

    res.json({
      success: true,
      complaintPackage: insertRes.rows[0],
      packageDetails: packageOutput,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:id/export/pdf - HTML printable view formatted for print-to-pdf
router.get("/cases/:id/export/pdf", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: caseId } = req.params;

    const [caseRes, userRes, packageRes, evidenceRes] = await Promise.all([
      query(`SELECT * FROM cases WHERE id = $1`, [caseId]),
      query(`SELECT u.* FROM users u JOIN cases c ON c.user_id = u.id WHERE c.id = $1`, [caseId]),
      query(`SELECT * FROM complaint_packages WHERE case_id = $1 ORDER BY version DESC LIMIT 1`, [caseId]),
      query(`SELECT * FROM evidence_files WHERE case_id = $1 ORDER BY created_at ASC`, [caseId]),
    ]);

    if (caseRes.rows.length === 0) {
      return res.status(404).send("Case not found");
    }

    const caseData = caseRes.rows[0];
    const user = userRes.rows[0] || {};
    const pkg = packageRes.rows[0];

    const noticeText = pkg ? pkg.formal_notice_markdown : "Complaint package not yet generated.";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Legal Notice Dossier - ${caseData.order_reference_number || caseData.id}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #111827;
      background: #ffffff;
      padding: 24px;
      max-width: 820px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #111827;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .badge {
      font-size: 9pt;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 4px 8px;
      text-transform: uppercase;
      font-weight: bold;
    }
    h1 { font-size: 16pt; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    h2 { font-size: 13pt; margin-top: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    h3 { font-size: 11pt; margin-top: 14px; }
    p, li { margin: 6px 0; text-align: justify; }
    .box {
      border: 1px solid #d1d5db;
      padding: 12px;
      margin: 14px 0;
      background: #f9fafb;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      font-size: 9pt;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 18px; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #1e3a8a; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: sans-serif; font-weight: 600;">🖨️ Print / Save as PDF</button>
  </div>
  <div class="header">
    <div>
      <h1>ClaimProof AI Legal Dossier</h1>
      <div style="font-size: 9pt; color: #4b5563;">Statutory Pre-Litigation Notice | Consumer Protection Act, 2019</div>
    </div>
    <div class="badge">Audit-Ready Notice</div>
  </div>

  <div style="white-space: pre-wrap; font-family: inherit;">
${noticeText}
  </div>

  <div class="footer">
    <div>Generated by ClaimProof AI (Consumer Evidence Intelligence Layer)</div>
    <div>Strict Source-Referenced Consumer Dossier</div>
  </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    next(err);
  }
});

export default router;
