import { Router } from "express";
import multer from "multer";
import { uploadAndExtract } from "../controllers/documents.controller.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.mimetype)) {
      callback(new Error("Formato inválido. Envie PDF, PNG ou JPG."));
      return;
    }
    callback(null, true);
  },
});

router.post("/", upload.single("document"), uploadAndExtract);

export { router as documentsRouter };
