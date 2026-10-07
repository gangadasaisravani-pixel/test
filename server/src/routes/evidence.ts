import { Router, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db";
import {
  uploadMiddleware,
  calculateFileHash,
  mapMimeToEvidenceType,
  saveAudioBuffer,
  deleteUploadedFile,
} from "../lib/fileStorage";
import { validateUploadedFiles } from "../middleware/fileValidator";

const router = Router();

// POST /api/cases/:id/evidence - Multipart batch file upload
router.post(
  "/cases/:id/evidence",
  uploadMiddleware.array("files", 10),
  validateUploadedFiles,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: caseId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files were uploaded" });
      }

      // Verify case exists
      const caseRes = await query(`SELECT id FROM cases WHERE id = $1`, [caseId]);
      if (caseRes.rows.length === 0) {
        return res.status(404).json({ error: "Case not found" });
      }

      const insertedFiles: any[] = [];

      for (const file of files) {
        const fileId = uuidv4();
        const sha256 = calculateFileHash(file.path);
        const fileType = mapMimeToEvidenceType(file.mimetype);
        const userDescription = req.body.description || `Uploaded file: ${file.originalname}`;

        const insertRes = await query(
          `INSERT INTO evidence_files (
            id, case_id, file_name, file_path, file_type,
            mime_type, file_size_bytes, sha256_hash, user_description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            fileId,
            caseId,
            file.originalname,
            file.path,
            fileType,
            file.mimetype,
            file.size,
            sha256,
            userDescription,
          ]
        );

        insertedFiles.push(insertRes.rows[0]);
      }

      res.status(201).json({
        success: true,
        count: insertedFiles.length,
        evidenceFiles: insertedFiles,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/cases/:id/evidence/voice - In-browser direct microphone voice recording upload
router.post(
  "/cases/:id/evidence/voice",
  uploadMiddleware.single("audio"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: caseId } = req.params;
      const file = req.file;

      // Verify case exists
      const caseRes = await query(`SELECT id FROM cases WHERE id = $1`, [caseId]);
      if (caseRes.rows.length === 0) {
        return res.status(404).json({ error: "Case not found" });
      }

      let filePath: string;
      let fileSize: number;
      let sha256: string;
      let mimeType = "audio/webm";
      let originalName = "Voice_Statement.webm";

      if (file) {
        filePath = file.path;
        fileSize = file.size;
        sha256 = calculateFileHash(filePath);
        mimeType = file.mimetype || "audio/webm";
        originalName = file.originalname || "Voice_Statement.webm";
      } else if (req.body && req.body.audioBase64) {
        // Support base64 upload if sent as JSON body
        const buffer = Buffer.from(req.body.audioBase64, "base64");
        const saved = await saveAudioBuffer(buffer, "Dictation_" + Date.now() + ".webm");
        filePath = saved.filePath;
        fileSize = saved.fileSizeBytes;
        sha256 = saved.sha256Hash;
        mimeType = saved.mimeType;
        originalName = saved.fileName;
      } else {
        return res.status(400).json({ error: "No audio file or audioBase64 payload received" });
      }

      const fileId = uuidv4();
      const userDescription = req.body.description || "Consumer Verbal Grievance Dictation (In-Browser Mic)";

      const insertRes = await query(
        `INSERT INTO evidence_files (
          id, case_id, file_name, file_path, file_type,
          mime_type, file_size_bytes, sha256_hash, user_description
        ) VALUES ($1, $2, $3, $4, 'AUDIO', $5, $6, $7, $8)
        RETURNING *`,
        [fileId, caseId, originalName, filePath, mimeType, fileSize, sha256, userDescription]
      );

      res.status(201).json({
        success: true,
        evidenceFile: insertRes.rows[0],
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/evidence/:evidenceId - Remove an evidence item
router.delete("/evidence/:evidenceId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { evidenceId } = req.params;

    const evRes = await query(`SELECT * FROM evidence_files WHERE id = $1`, [evidenceId]);
    if (evRes.rows.length === 0) {
      return res.status(404).json({ error: "Evidence item not found" });
    }

    const file = evRes.rows[0];
    if (file.file_path) {
      deleteUploadedFile(file.file_path);
    }

    await query(`DELETE FROM evidence_files WHERE id = $1`, [evidenceId]);

    res.json({ success: true, message: "Evidence item removed" });
  } catch (err) {
    next(err);
  }
});

export default router;
