import { Request, Response, NextFunction } from "express";

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  // Videos
  "video/mp4",
  "video/webm",
  // Audios
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/webm",
  "audio/ogg",
  // Documents
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
]);

export function validateUploadedFiles(req: Request, res: Response, next: NextFunction) {
  const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);

  if (!files || files.length === 0) {
    return next();
  }

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      return res.status(400).json({
        error: "Unsupported File Type",
        message: `MIME type "${file.mimetype}" is not supported. Please upload high-resolution images, video (MP4/WebM), voice recordings (WAV/MP3/M4A/WebM), or PDFs.`,
      });
    }
  }

  next();
}
