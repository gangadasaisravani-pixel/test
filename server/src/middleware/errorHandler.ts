import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Server API Error:", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File Too Large",
        message: "Maximum allowed file upload size is 50MB.",
      });
    }
    return res.status(400).json({
      error: "File Upload Error",
      message: err.message,
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    error: err.name || "Internal Server Error",
    message: err.message || "An unexpected error occurred processing your request.",
  });
}
