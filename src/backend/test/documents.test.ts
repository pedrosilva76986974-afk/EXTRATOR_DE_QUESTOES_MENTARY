import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import request from "supertest";
import { app } from "../src/app.js";
import { extractDocument } from "../src/services/document-extraction.service.js";

async function createPdf(text?: string): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  if (text) {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    page.drawText(text, { x: 50, y: 700, size: 12, font });
  }
  return Buffer.from(await pdf.save());
}

test("GET /health reports that the backend is available", async () => {
  const response = await request(app).get("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("POST /documents extracts text from a digital PDF", async () => {
  const expectedText = "This is a digital exam document with enough text for extraction.";
  const response = await request(app)
    .post("/documents")
    .attach("document", await createPdf(expectedText), {
      filename: "exam.pdf",
      contentType: "application/pdf",
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "processed");
  assert.equal(response.body.method, "pdf-text");
  assert.equal(response.body.pages, 1);
  assert.match(response.body.text, /digital exam document/);
});

test("POST /documents rejects unsupported file types", async () => {
  const response = await request(app)
    .post("/documents")
    .attach("document", Buffer.from("not a supported document"), {
      filename: "notes.txt",
      contentType: "text/plain",
    });

  assert.equal(response.status, 400);
  assert.match(response.body.error, /Formato inválido/);
});

test("extractDocument sends scanned PDF pages to OCR", async () => {
  const calls: Buffer[] = [];
  const recognizedText = "Texto reconhecido pelo OCR de teste.";
  const result = await extractDocument(
    await createPdf(),
    "application/pdf",
    async (image) => {
      calls.push(image);
      return recognizedText;
    },
  );

  assert.equal(result.method, "ocr");
  assert.equal(result.pages, 1);
  assert.match(result.text, /Texto reconhecido pelo OCR/);
  assert.equal(calls.length, 1);
  assert.ok(calls[0]?.byteLength);
});
