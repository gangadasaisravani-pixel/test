import { z } from "zod";

export const CASE_DOMAINS = {
  ECOMMERCE_PRODUCT: {
    id: "ECOMMERCE_PRODUCT",
    label: "E-Commerce & Defective Products",
    subcategories: [
      "Damaged on Delivery",
      "Dead on Arrival (DOA)",
      "Wrong Product Received",
      "Counterfeit / Misrepresented Item",
      "Warranty Repair Refusal",
      "Missing Parts / Accessories"
    ],
    mandatoryEvidenceTypes: ["INVOICE", "PRODUCT_IMAGE", "PACKAGING_PHOTO"]
  },
  SERVICE_DISPUTES: {
    id: "SERVICE_DISPUTES",
    label: "Service Deficiencies & Repairs",
    subcategories: [
      "Incomplete Home Appliance Repair",
      "Automobile Service Malpractice",
      "Telecom / Broadband Outage Dispute",
      "Courier / Logistics Loss",
      "Travel / Hospitality Cancellation Breach"
    ],
    mandatoryEvidenceTypes: ["SERVICE_RECEIPT", "COMMUNICATION_LOG"]
  },
  TRANSACTION_BILLING: {
    id: "TRANSACTION_BILLING",
    label: "Billing, Subscriptions & Financial Redressal",
    subcategories: [
      "Unauthorized Recurring Charge",
      "Refund Initiated But Not Credited",
      "Double Debit on Gateway Failure",
      "Hidden Charges Not Disclosed at Checkout",
      "Subscription Cancellation Dark Pattern"
    ],
    mandatoryEvidenceTypes: ["BANK_STATEMENT", "ORDER_CONFIRMATION"]
  }
} as const;

export type CaseDomainKey = keyof typeof CASE_DOMAINS;

export const CaseStatusEnum = z.enum([
  "DRAFT",
  "ANALYZING",
  "PENDING_INPUT",
  "READY_FOR_NOTICE",
  "CLOSED"
]);
export type CaseStatus = z.infer<typeof CaseStatusEnum>;

export const EvidenceTypeEnum = z.enum([
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "DOCUMENT",
  "SCREENSHOT",
  "TEXT_NOTE"
]);
export type EvidenceType = z.infer<typeof EvidenceTypeEnum>;

export const ConfidenceLevelEnum = z.enum([
  "HIGH",
  "MEDIUM",
  "LOW",
  "UNCERTAIN"
]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelEnum>;

export const FactNatureEnum = z.enum([
  "DIRECTLY_OBSERVED",
  "EXTRACTED_TEXT",
  "USER_REPORTED",
  "AI_INFERENCE"
]);
export type FactNature = z.infer<typeof FactNatureEnum>;

export const CreateCaseSchema = z.object({
  domain: z.enum(["ECOMMERCE_PRODUCT", "SERVICE_DISPUTES", "TRANSACTION_BILLING"]),
  subcategory: z.string().min(2, "Subcategory is required"),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  opposingParty: z.string().min(2, "Merchant or provider name is required"),
  transactionAmount: z.number().positive().optional().nullable(),
  currency: z.string().default("INR"),
  transactionDate: z.string().optional().nullable(),
  orderReferenceNumber: z.string().optional().nullable(),
  userNarrative: z.string().min(20, "Please provide at least 20 characters describing the issue"),
});
export type CreateCaseInput = z.infer<typeof CreateCaseSchema>;

export const UpdateCaseSchema = z.object({
  domain: z.enum(["ECOMMERCE_PRODUCT", "SERVICE_DISPUTES", "TRANSACTION_BILLING"]).optional(),
  subcategory: z.string().optional(),
  title: z.string().min(5).max(200).optional(),
  opposingParty: z.string().optional(),
  transactionAmount: z.number().positive().optional().nullable(),
  currency: z.string().optional(),
  transactionDate: z.string().optional().nullable(),
  orderReferenceNumber: z.string().optional().nullable(),
  userNarrative: z.string().optional(),
  status: CaseStatusEnum.optional()
});
export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>;

export const EvidenceFileMetadataSchema = z.object({
  fileName: z.string(),
  fileType: EvidenceTypeEnum,
  mimeType: z.string(),
  fileSizeBytes: z.number(),
  userDescription: z.string().optional(),
});
export type EvidenceFileMetadata = z.infer<typeof EvidenceFileMetadataSchema>;

export const TimelineEventSchema = z.object({
  date: z.string().optional(),
  isDateUncertain: z.boolean().default(false),
  title: z.string(),
  description: z.string(),
  confidence: ConfidenceLevelEnum,
  supportingEvidenceFiles: z.array(z.string()),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const FollowUpAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().min(1, "Answer cannot be empty"),
});
export type FollowUpAnswer = z.infer<typeof FollowUpAnswerSchema>;

// Evidence Fusion Output Schema (Gemini Structured Output)
export const EvidenceFusionOutputSchema = z.object({
  merchant_details: z.object({
    name: z.string(),
    contact_info: z.string().optional().nullable(),
    platform: z.string().optional().nullable(),
  }),
  transaction_details: z.object({
    invoice_number: z.string().optional().nullable(),
    order_id: z.string().optional().nullable(),
    purchase_date: z.string().optional().nullable(),
    delivery_date: z.string().optional().nullable(),
    total_amount: z.number().optional().nullable(),
    currency: z.string().optional().nullable(),
    product_name: z.string().optional().nullable(),
    serial_or_imei: z.string().optional().nullable(),
  }).optional(),
  extracted_facts: z.array(
    z.object({
      evidence_file_name: z.string(),
      statement: z.string(),
      nature: FactNatureEnum,
      confidence: ConfidenceLevelEnum,
      page_or_timestamp: z.string().optional().nullable(),
    })
  ),
  timeline: z.array(
    z.object({
      date: z.string().optional().nullable(),
      is_date_uncertain: z.boolean().default(false),
      title: z.string(),
      description: z.string(),
      supporting_evidence_files: z.array(z.string()).default([]),
      confidence: ConfidenceLevelEnum,
    })
  ),
  claims_mapping: z.array(
    z.object({
      claim: z.string(),
      supported_by: z.array(z.string()),
      evidence_strength: ConfidenceLevelEnum,
      missing_support: z.string().optional().nullable(),
      requested_remedy: z.string().optional().nullable(),
    })
  ),
  contradictions: z.array(
    z.object({
      source_a: z.string(),
      source_b: z.string(),
      description: z.string(),
      suggested_verification: z.string().optional().nullable(),
    })
  ),
  missing_evidence_checklist: z.array(
    z.object({
      item_name: z.string(),
      status: z.enum(["AVAILABLE", "PARTIAL", "MISSING"]),
      importance: z.enum(["CRITICAL", "RECOMMENDED", "OPTIONAL"]),
      reason: z.string(),
    })
  ),
  follow_up_questions: z.array(
    z.object({
      question: z.string(),
      rationale: z.string(),
      target_evidence_type: z.string().optional().nullable(),
    })
  ),
});
export type EvidenceFusionOutput = z.infer<typeof EvidenceFusionOutputSchema>;

// Complaint Package Output Schema
export const ComplaintPackageOutputSchema = z.object({
  formal_legal_notice: z.string(),
  nch_grievance_payload: z.string(),
  evidence_annexure_index: z.array(
    z.object({
      exhibit_number: z.string(),
      file_name: z.string(),
      evidentiary_purpose: z.string(),
      date_of_document: z.string().optional().nullable(),
    })
  ),
});
export type ComplaintPackageOutput = z.infer<typeof ComplaintPackageOutputSchema>;

// Regulatory CPA 2019 Rights Constants
export const STATUTORY_CPA_RIGHTS = [
  {
    id: "RIGHT_TO_SAFETY",
    title: "Right to Safety",
    description: "Protection against goods and services hazardous to life and property.",
    sectionRef: "Consumer Protection Act, 2019, Section 2(9)(i)",
    relevanceCriteria: ["Dead on Arrival (DOA)", "Damaged on Delivery", "Automobile Service Malpractice"]
  },
  {
    id: "RIGHT_TO_INFORMATION",
    title: "Right to be Informed",
    description: "Right to know quantity, quality, potency, purity, standard, and price to protect against unfair trade practices.",
    sectionRef: "Consumer Protection Act, 2019, Section 2(9)(ii)",
    relevanceCriteria: ["Counterfeit / Misrepresented Item", "Hidden Charges Not Disclosed at Checkout", "Wrong Product Received"]
  },
  {
    id: "RIGHT_TO_CHOOSE",
    title: "Right to Choose",
    description: "Assured access to competitive goods and services at fair prices without deceptive tie-ins or forced bundling.",
    sectionRef: "Consumer Protection Act, 2019, Section 2(9)(iii)",
    relevanceCriteria: ["Subscription Cancellation Dark Pattern", "Unauthorized Recurring Charge"]
  },
  {
    id: "RIGHT_TO_BE_HEARD",
    title: "Right to be Heard",
    description: "Assurance that consumer grievances will receive due consideration in appropriate dispute redressal forums.",
    sectionRef: "Consumer Protection Act, 2019, Section 2(9)(iv)",
    relevanceCriteria: ["Warranty Repair Refusal", "Telecom / Broadband Outage Dispute"]
  },
  {
    id: "RIGHT_TO_REDRESSAL",
    title: "Right to Seek Redressal",
    description: "Remedy against unfair trade practices, unscrupulous exploitation, or supply of defective goods / deficient services.",
    sectionRef: "Consumer Protection Act, 2019, Section 2(9)(v)",
    relevanceCriteria: ["Refund Initiated But Not Credited", "Double Debit on Gateway Failure", "Incomplete Home Appliance Repair"]
  },
  {
    id: "RIGHT_TO_EDUCATION",
    title: "Right to Consumer Education",
    description: "Access to knowledge and skills required to be an informed, empowered consumer aware of legal mechanisms.",
    sectionRef: "Consumer Protection Act, 2019, Section 2(9)(vi)",
    relevanceCriteria: ["General Awareness", "Statutory Notice Procedures"]
  }
] as const;

export const ESCALATION_TIERS = [
  {
    tier: 1,
    title: "Tier 1: Internal Merchant Redressal",
    authority: "Merchant Grievance Redressal Officer",
    timeline: "Mandatory 48-hr acknowledgment, 30-day resolution",
    legalBasis: "Consumer Protection (E-Commerce) Rules, 2020",
    action: "Send Formal Legal Notice via Registered Post / Email."
  },
  {
    tier: 2,
    title: "Tier 2: Statutory Pre-Litigation Conciliation",
    authority: "National Consumer Helpline (NCH / INGRAM)",
    timeline: "Toll-free 1915 or portal consumerhelpline.gov.in",
    legalBasis: "Department of Consumer Affairs, Govt. of India",
    action: "File online grievance docket with merchant response monitoring."
  },
  {
    tier: 3,
    title: "Tier 3: Judicial Consumer Commission",
    authority: "District Consumer Disputes Redressal Commission (DCDRC)",
    timeline: "Up to ₹50 Lakhs pecuniary jurisdiction via e-Daakhil",
    legalBasis: "Consumer Protection Act, 2019, Chapter IV",
    action: "File formal petition on edaakhil.nic.in with sworn affidavit & annexures."
  }
] as const;
