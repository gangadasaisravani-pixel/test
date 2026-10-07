import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Map MIME type to EvidenceType enum
export function mapMimeToEvidenceType(mimeType: string): "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "SCREENSHOT" {
  if (mimeType.startsWith("image/")) {
    return "IMAGE";
  }
  if (mimeType.startsWith("video/")) {
    return "VIDEO";
  }
  if (mimeType.startsWith("audio/")) {
    return "AUDIO";
  }
  if (mimeType === "application/pdf" || mimeType.includes("text/") || mimeType.includes("document")) {
    return "DOCUMENT";
  }
  return "DOCUMENT";
}

// Calculate SHA-256 hash of a file
export function calculateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

// Multer storage engine with sanitized UUID filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedUniqueName = `${uuidv4()}${ext}`;
    cb(null, sanitizedUniqueName);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_BYTES || "52428800", 10), // 50MB
  },
});

// Save direct audio recording buffer to disk
export async function saveAudioBuffer(buffer: Buffer, originalName = "voice_statement.webm"): Promise<{
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  sha256Hash: string;
  mimeType: string;
}> {
  const ext = path.extname(originalName) || ".webm";
  const uniqueName = `${uuidv4()}${ext}`;
  const fullPath = path.join(uploadDir, uniqueName);

  fs.writeFileSync(fullPath, buffer);
  const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    fileName: uniqueName,
    filePath: fullPath,
    fileSizeBytes: buffer.length,
    sha256Hash,
    mimeType: "audio/webm",
  };
}

// Delete file securely
export function deleteUploadedFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn("Failed to delete file:", filePath, err);
  }
}
