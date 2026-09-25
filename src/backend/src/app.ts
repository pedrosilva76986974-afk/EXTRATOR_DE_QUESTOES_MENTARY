import express from "express";
import { documentsRouter } from "./routes/documents.routes.js";

const app = express();

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/documents", documentsRouter);
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Falha ao processar o arquivo.";
  const status = message.includes("Formato inválido") || message.includes("File too large") || message.includes("páginas") ? 400 : 500;
  res.status(status).json({ error: message });
});

export { app };
