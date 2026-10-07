export const SYSTEM_PROMPT = `You are the Lead Forensic Evidence Investigator and Consumer Protection Specialist for ClaimProof AI.

Your role is to critically analyze, connect, verify, and structure multimodal evidence (documents, photographs, videos, audio dictations, chat logs) submitted by consumers seeking redressal for consumer disputes.

OPERATIONAL AND ETHICAL DIRECTIVES:
1. STRICT FACTUAL ANCHORING: You must NEVER invent, assume, extrapolate, or hallucinate facts, dates, transaction amounts, order numbers, or tracking identifiers. If a detail is not explicitly present in the evidence or user statement, you must record it as UNKNOWN or UNCERTAIN.
2. SOURCE ATTRIBUTION: Every extracted fact, timeline event, and claim connection must cite its exact evidence source (filename, page number, timestamp, or audio index).
3. FACT NATURE TAXONOMY: You must strictly categorize every individual observation into:
   - DIRECTLY_OBSERVED: Physically visible in an image/video (e.g., shattered glass panel).
   - EXTRACTED_TEXT: Verbatim text parsed from invoice, email, or chat OCR.
   - USER_REPORTED: Consumer's verbal or written statement without third-party corroboration.
   - AI_INFERENCE: Logical deduction linking two verified pieces of evidence.
4. OBJECTIVE & NON-ACCUSATORY TONE: When flagging contradictions (e.g., between an invoice description and a support email), state the discrepancy neutrally as an "Inconsistency requiring verification". Do NOT accuse either party of fraud, crime, or bad faith.
5. NO LEGAL GUARANTEES: You are an evidence intelligence assistant, NOT a court, judge, or licensed attorney. Never tell a consumer they will "win" or that a merchant is "guilty". Frame all statutory findings around official provisions of the Consumer Protection Act, 2019 (India) and National Consumer Helpline (NCH) procedures.`;

export const EVIDENCE_FUSION_JSON_SCHEMA = {
  type: "object",
  properties: {
    merchant_details: {
      type: "object",
      properties: {
        name: { type: "string" },
        contact_info: { type: "string" },
        platform: { type: "string" }
      },
      required: ["name"]
    },
    transaction_details: {
      type: "object",
      properties: {
        invoice_number: { type: "string" },
        order_id: { type: "string" },
        purchase_date: { type: "string" },
        delivery_date: { type: "string" },
        total_amount: { type: "number" },
        currency: { type: "string" },
        product_name: { type: "string" },
        serial_or_imei: { type: "string" }
      }
    },
    extracted_facts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          evidence_file_name: { type: "string" },
          statement: { type: "string" },
          nature: { type: "string", enum: ["DIRECTLY_OBSERVED", "EXTRACTED_TEXT", "USER_REPORTED", "AI_INFERENCE"] },
          confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "UNCERTAIN"] },
          page_or_timestamp: { type: "string" }
        },
        "required": ["evidence_file_name", "statement", "nature", "confidence"]
      }
    },
    timeline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string" },
          is_date_uncertain: { type: "boolean" },
          title: { type: "string" },
          description: { type: "string" },
          supporting_evidence_files: { type: "array", items: { type: "string" } },
          confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "UNCERTAIN"] }
        },
        required: ["title", "description", "confidence", "is_date_uncertain"]
      }
    },
    claims_mapping: {
      type: "array",
      items: {
        type: "object",
        properties: {
          claim: { type: "string" },
          supported_by: { type: "array", items: { type: "string" } },
          evidence_strength: { type: "string", enum: ["HIGH", "MEDIUM", "LOW", "UNCERTAIN"] },
          missing_support: { type: "string" },
          requested_remedy: { type: "string" }
        },
        required: ["claim", "supported_by", "evidence_strength"]
      }
    },
    contradictions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          source_a: { type: "string" },
          source_b: { type: "string" },
          description: { type: "string" },
          suggested_verification: { type: "string" }
        },
        required: ["source_a", "source_b", "description"]
      }
    },
    missing_evidence_checklist: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item_name: { type: "string" },
          status: { type: "string", enum: ["AVAILABLE", "PARTIAL", "MISSING"] },
          importance: { type: "string", enum: ["CRITICAL", "RECOMMENDED", "OPTIONAL"] },
          reason: { type: "string" }
        },
        required: ["item_name", "status", "importance", "reason"]
      }
    },
    follow_up_questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          rationale: { type: "string" },
          target_evidence_type: { type: "string" }
        },
        required: ["question", "rationale"]
      }
    }
  },
  required: [
    "merchant_details",
    "extracted_facts",
    "timeline",
    "claims_mapping",
    "contradictions",
    "missing_evidence_checklist",
    "follow_up_questions"
  ]
};

export const COMPLAINT_PACKAGE_JSON_SCHEMA = {
  type: "object",
  properties: {
    formal_legal_notice: {
      type: "string",
      description: "Markdown formal legal notice citing CPA 2019 sections, 15-day remedy demand, and full annexure citations."
    },
    nch_grievance_payload: {
      type: "string",
      description: "Concise summary capped at 1500 characters designed for INGRAM/National Consumer Helpline portal."
    },
    evidence_annexure_index: {
      type: "array",
      items: {
        type: "object",
        properties: {
          exhibit_number: { type: "string" },
          file_name: { type: "string" },
          evidentiary_purpose: { type: "string" },
          date_of_document: { type: "string" }
        },
        required: ["exhibit_number", "file_name", "evidentiary_purpose"]
      }
    }
  },
  required: ["formal_legal_notice", "nch_grievance_payload", "evidence_annexure_index"]
};
