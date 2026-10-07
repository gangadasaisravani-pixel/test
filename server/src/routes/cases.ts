import { Router, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db";
import { CreateCaseSchema, UpdateCaseSchema } from "../../../shared/schema";
import { deleteUploadedFile } from "../lib/fileStorage";

const router = Router();
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

// Helper: Calculate completeness score (0-100%)
function calculateCompletenessScore(caseRow: any, evidenceFiles: any[], claims: any[], timeline: any[]): number {
  let score = 20; // Initial draft with details
  if (evidenceFiles.length >= 1) score += 20;
  if (evidenceFiles.length >= 3) score += 15;
  if (timeline.length >= 2) score += 15;
  if (claims.length >= 1) score += 15;
  if (caseRow.status === "READY_FOR_NOTICE") score += 15;
  return Math.min(100, score);
}

// GET /api/cases - List all cases
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const casesRes = await query(
      `SELECT * FROM cases WHERE user_id = $1 ORDER BY created_at DESC`,
      [DEFAULT_USER_ID]
    );

    // Enrich each case with counts
    const enrichedCases = await Promise.all(
      casesRes.rows.map(async (c) => {
        const evCountRes = await query(
          `SELECT COUNT(*) as count FROM evidence_files WHERE case_id = $1`,
          [c.id]
        );
        const timelineCountRes = await query(
          `SELECT COUNT(*) as count FROM timeline_events WHERE case_id = $1`,
          [c.id]
        );
        const claimsCountRes = await query(
          `SELECT COUNT(*) as count FROM claims WHERE case_id = $1`,
          [c.id]
        );
        const contradictionCountRes = await query(
          `SELECT COUNT(*) as count FROM contradictions WHERE case_id = $1 AND is_resolved = false`,
          [c.id]
        );

        const evidenceCount = parseInt(evCountRes.rows[0]?.count || "0", 10);
        const timelineCount = parseInt(timelineCountRes.rows[0]?.count || "0", 10);
        const claimsCount = parseInt(claimsCountRes.rows[0]?.count || "0", 10);
        const unresolvedContradictions = parseInt(contradictionCountRes.rows[0]?.count || "0", 10);

        const completeness = calculateCompletenessScore(
          c,
          new Array(evidenceCount),
          new Array(claimsCount),
          new Array(timelineCount)
        );

        return {
          ...c,
          evidenceCount,
          timelineCount,
          claimsCount,
          unresolvedContradictions,
          completenessScore: completeness,
        };
      })
    );

    res.json({ cases: enrichedCases });
  } catch (err) {
    next(err);
  }
});

// POST /api/cases - Create new case draft
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = CreateCaseSchema.parse(req.body);
    const caseId = uuidv4();

    const result = await query(
      `INSERT INTO cases (
        id, user_id, domain, subcategory, title, opposing_party,
        transaction_amount, currency, transaction_date, order_reference_number,
        user_narrative, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'DRAFT')
      RETURNING *`,
      [
        caseId,
        DEFAULT_USER_ID,
        validated.domain,
        validated.subcategory,
        validated.title,
        validated.opposingParty,
        validated.transactionAmount ?? null,
        validated.currency,
        validated.transactionDate ? validated.transactionDate : null,
        validated.orderReferenceNumber ?? null,
        validated.userNarrative,
      ]
    );

    res.status(201).json({ case: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/cases/:id - Retrieve full case graph
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const caseRes = await query(`SELECT * FROM cases WHERE id = $1`, [id]);
    if (caseRes.rows.length === 0) {
      return res.status(404).json({ error: "Case Not Found" });
    }
    const caseData = caseRes.rows[0];

    const [
      evidenceRes,
      factsRes,
      timelineRes,
      claimsRes,
      claimMapRes,
      contradictionsRes,
      questionsRes,
      packageRes,
      userRes,
    ] = await Promise.all([
      query(`SELECT * FROM evidence_files WHERE case_id = $1 ORDER BY created_at ASC`, [id]),
      query(`SELECT * FROM case_facts WHERE case_id = $1 ORDER BY created_at ASC`, [id]),
      query(`SELECT * FROM timeline_events WHERE case_id = $1 ORDER BY sort_order ASC, event_date ASC`, [id]),
      query(`SELECT * FROM claims WHERE case_id = $1 ORDER BY created_at ASC`, [id]),
      query(
        `SELECT cm.*, ef.file_name, ef.file_type 
         FROM claim_evidence_map cm 
         JOIN evidence_files ef ON cm.evidence_id = ef.id 
         JOIN claims c ON cm.claim_id = c.id 
         WHERE c.case_id = $1`,
        [id]
      ),
      query(`SELECT * FROM contradictions WHERE case_id = $1 ORDER BY created_at ASC`, [id]),
      query(`SELECT * FROM follow_up_questions WHERE case_id = $1 ORDER BY created_at ASC`, [id]),
      query(`SELECT * FROM complaint_packages WHERE case_id = $1 ORDER BY version DESC LIMIT 1`, [id]),
      query(`SELECT * FROM users WHERE id = $1`, [caseData.user_id]),
    ]);

    // Attach mapped evidence to claims
    const claimsWithEvidence = claimsRes.rows.map((claim) => {
      const supporting = claimMapRes.rows.filter((m) => m.claim_id === claim.id);
      return {
        ...claim,
        supportingEvidence: supporting,
      };
    });

    const completenessScore = calculateCompletenessScore(
      caseData,
      evidenceRes.rows,
      claimsRes.rows,
      timelineRes.rows
    );

    res.json({
      case: caseData,
      user: userRes.rows[0] || null,
      evidenceFiles: evidenceRes.rows,
      facts: factsRes.rows,
      timeline: timelineRes.rows,
      claims: claimsWithEvidence,
      contradictions: contradictionsRes.rows,
      followUpQuestions: questionsRes.rows,
      complaintPackage: packageRes.rows[0] || null,
      completenessScore,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cases/:id - Update case metadata
router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = UpdateCaseSchema.parse(req.body);

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (validated.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(validated.title);
    }
    if (validated.opposingParty !== undefined) {
      fields.push(`opposing_party = $${idx++}`);
      values.push(validated.opposingParty);
    }
    if (validated.transactionAmount !== undefined) {
      fields.push(`transaction_amount = $${idx++}`);
      values.push(validated.transactionAmount);
    }
    if (validated.currency !== undefined) {
      fields.push(`currency = $${idx++}`);
      values.push(validated.currency);
    }
    if (validated.transactionDate !== undefined) {
      fields.push(`transaction_date = $${idx++}`);
      values.push(validated.transactionDate);
    }
    if (validated.orderReferenceNumber !== undefined) {
      fields.push(`order_reference_number = $${idx++}`);
      values.push(validated.orderReferenceNumber);
    }
    if (validated.userNarrative !== undefined) {
      fields.push(`user_narrative = $${idx++}`);
      values.push(validated.userNarrative);
    }
    if (validated.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(validated.status);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update provided" });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE cases SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Case Not Found" });
    }

    res.json({ case: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cases/:id - Cascade delete case and disk files
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Get files to delete on disk
    const filesRes = await query(`SELECT file_path FROM evidence_files WHERE case_id = $1`, [id]);
    for (const f of filesRes.rows) {
      if (f.file_path) {
        deleteUploadedFile(f.file_path);
      }
    }

    // Cascade delete in database
    await query(`DELETE FROM cases WHERE id = $1`, [id]);

    res.json({ success: true, message: "Case and associated files deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
