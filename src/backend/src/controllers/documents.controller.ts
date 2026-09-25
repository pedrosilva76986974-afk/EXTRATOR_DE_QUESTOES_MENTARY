import type { Request, Response, NextFunction } from "express";
import { unlink } from "node:fs/promises";
import { extractDocument } from "../services/document-extraction.service.js";

async function uploadAndExtract(req: Request, res: Response, next: NextFunction): Promise<void> {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Envie um arquivo PDF, PNG, JPG ou JPEG no campo 'document'." });
    return;
  }

  try {
    const result = await extractDocument(file.buffer, file.mimetype);
    res.status(200).json({
      status: "processed",
      fileName: file.originalname,
      pages: result.pages,
      method: result.method,
      text: result.text,
    });
  } catch (error) {
    next(error);
  } finally {
    if (file.path) await unlink(file.path).catch(() => undefined);
  }
}

export { uploadAndExtract };
