# ClaimProof AI — Consumer Evidence Intelligence Platform

[![Node.js](https://img.shields.io/badge/Node.js-20.x%20LTS-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gen%20AI-gemini--2.5--pro-orange.svg)](https://deepmind.google/technologies/gemini/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Supabase-336791.svg)](https://www.postgresql.org/)

**ClaimProof AI** is an enterprise-grade forensic evidence platform engineered to help consumers organize, cross-examine, and transform fragmented multimodal evidence (invoices, receipts, damage photos, unboxing videos, audio recordings, and chat screenshots) into a chronological, legally disciplined consumer dispute dossier backed by the **Consumer Protection Act, 2019 (India)** and the **National Consumer Helpline (NCH / INGRAM)**.

---

## ⚡ Deterministic Evidence Intelligence Lifecycle

```
[COLLECT] ➔ [UNDERSTAND] ➔ [EXTRACT] ➔ [CONNECT] ➔ [CROSS-CHECK] ➔ [ORGANIZE] ➔ [IDENTIFY GAPS] ➔ [FOLLOW-UP AGENT] ➔ [COMPLAINT DRAFTING]
```

1. **Multimodal Evidence Vault**: Ingests high-resolution images (JPEG/PNG/WEBP), unboxing videos (MP4/WebM), voice recordings (WAV/MP3/M4A/WebM), and tax invoices (PDF). Automatically calculates and records **SHA-256 cryptographic hashes** for evidentiary integrity.
2. **Direct In-Browser Voice Dictation**: Web Audio MediaRecorder interface with real-time animated frequency visualizers allowing consumers to dictate sworn grievance accounts.
3. **Multimodal Evidence Fusion Engine**: Single-pass and multi-pass Google Gemini reasoning (`@google/genai` SDK using `gemini-2.5-pro` and `gemini-2.5-flash`) performing OCR, speech-to-text, entity extraction, and cross-file correlations.
4. **Forensic Chronological Timeline**: Interactive timeline builder with inferred confidence levels (`HIGH`, `MEDIUM`, `LOW`, `UNCERTAIN`), date uncertainty flags, and clickable evidence source citations.
5. **Claim-to-Evidence Corroboration Matrix**: Tabular matrix linking consumer allegations directly to physical proofs, invoice excerpts, and statutory remedy demands.
6. **Neutral Contradiction & Discrepancy Engine**: Flags internal factual variances (e.g., invoice specifications vs customer service statements) using objective, non-accusatory language, with consumer reconciliation controls.
7. **Statutory Evidence Gap Auditor**: Domain-specific checklist identifying missing documents (Proof of Purchase, DOA slip, Support deadlock log).
8. **Adaptive Clarification Agent**: Multi-turn interactive questioning where the AI asks targeted questions to bridge ambiguities, triggering selective re-fusion upon reply.
9. **Statutory Consumer Rights Advisor**: Real-time cross-referencing against the 6 CPA 2019 rights:
   - *Right to Safety* [Sec 2(9)(i)]
   - *Right to be Informed* [Sec 2(9)(ii)]
   - *Right to Choose* [Sec 2(9)(iii)]
   - *Right to be Heard* [Sec 2(9)(iv)]
   - *Right to Seek Redressal* [Sec 2(9)(v)]
   - *Right to Consumer Education* [Sec 2(9)(vi)]
   - *3-Tier Escalation Framework*: Grievance Redressal Officer (Tier 1), NCH 1915 (Tier 2), and District Consumer Disputes Redressal Commission (DCDRC via e-Daakhil, Tier 3).
10. **Formal Complaint Package Generator**: Produces an audit-ready Markdown legal notice (with mandatory 15-day remedy demand), an INGRAM NCH submission text (max 1,500 chars), a numbered Evidence Annexure Index (Exhibits A–Z), and an A4-optimized printable PDF view.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS (Dark Glassmorphism Design System), Lucide Icons, React Router DOM.
- **Backend**: Node.js 20 LTS, Express.js, Multer file streaming, Crypto SHA-256 hashing.
- **Database**: PostgreSQL (Supabase / Neon / standard Postgres) with full RLS policies and standalone embedded PGlite compatibility.
- **AI Reasoning**: Official `@google/genai` SDK (`gemini-2.5-pro` and `gemini-2.5-flash`).
- **Validation**: Shared Zod schemas (`@shared/schema`) across client and server.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ LTS
- npm 10+

### Installation

```bash
# Clone repository
git clone https://github.com/gangadasaisravani-pixel/test.git
cd test

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (PostgreSQL / Supabase / Neon)
DATABASE_URL=postgresql://postgres:password@localhost:5432/claimproof_db

# Google Gemini API Key
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_BYTES=52428800
```

### Run Migrations

```bash
npm run migrate
```

### Start Development Server

```bash
# Starts both Express backend (:5000) and Vite frontend (:5173)
npm run dev
```

Visit **http://localhost:5173** to launch ClaimProof AI.

---

## 📂 Project Structure

```
claimproof-ai/
├── .env.example              # Environment variables template
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # Root TypeScript configuration
├── shared/
│   └── schema.ts             # Shared Zod schemas, types & CPA 2019 constants
├── server/
│   ├── src/
│   │   ├── index.ts          # Express application entrypoint
│   │   ├── db.ts             # Postgres pool and PGlite standalone engine
│   │   ├── migrate.ts        # Database migration runner
│   │   ├── routes/
│   │   │   ├── cases.ts      # Case CRUD and full graph endpoints
│   │   │   ├── evidence.ts   # File upload and audio dictation handlers
│   │   │   ├── analysis.ts   # Gemini Evidence Fusion reasoning
│   │   │   └── package.ts    # Formal legal dossier and PDF export
│   │   ├── lib/
│   │   │   ├── gemini.ts     # @google/genai SDK integration
│   │   │   ├── fileStorage.ts# Multer and SHA-256 hash utilities
│   │   │   └── prompts.ts    # System prompts & JSON schemas
│   │   └── middleware/
│   │       ├── errorHandler.ts
│   │       └── fileValidator.ts
├── client/
│   ├── index.html            # HTML template with modern typography
│   ├── vite.config.ts        # Vite configuration with proxying
│   └── src/
│       ├── App.tsx           # React Router route hierarchy
│       ├── main.tsx          # Application root
│       ├── index.css         # Tailwind tokens, glassmorphism & gradients
│       ├── components/
│       │   ├── Layout/       # Header navbar with Gemini status indicator
│       │   ├── Dashboard/    # Case cards and metric summaries
│       │   ├── Evidence/     # Batch dropzone & voice dictation modal
│       │   ├── Analysis/     # Timeline, Claim matrix & Contradiction cards
│       │   ├── Agent/        # Follow-up interactive questionnaire
│       │   ├── Rights/       # 6 statutory rights & escalation accordion
│       │   └── Package/      # Live editable legal notice & export menu
│       ├── pages/            # 7 core route pages
│       ├── hooks/            # useCase and useAudioRecorder hooks
│       └── lib/              # API client and formatting utilities
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql # Complete PostgreSQL schema & RLS policies
```

---

## ⚖️ Legal Disclaimer

ClaimProof AI is an objective evidence organization and preparation tool. It does not provide legal representation, act as an advocate, or guarantee dispute outcomes. All generated complaint packages must be reviewed and verified by the consumer before submission to the merchant, the National Consumer Helpline (1915), or the District Consumer Disputes Redressal Commission (DCDRC).
