import { createCanvas } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { recognizeImage } from "./ocr.service.js";

const MAX_PDF_PAGES = 50;
const MIN_DIGITAL_TEXT_LENGTH = 40;

type ExtractionResult = {
  text: string;
  pages: number;
  method: "pdf-text" | "ocr";
};

type ImageRecognizer = (image: Buffer) => Promise<string>;

async function extractPdf(buffer: Buffer, recognize: ImageRecognizer): Promise<ExtractionResult> {
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  if (pdf.numPages > MAX_PDF_PAGES) {
    await loadingTask.destroy();
    throw new Error(`O PDF pode ter no máximo ${MAX_PDF_PAGES} páginas neste MVP.`);
  }

  const textPages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    textPages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" ").trim());
  }

  const digitalText = textPages.filter(Boolean).join("\n\n");
  if (digitalText.length >= MIN_DIGITAL_TEXT_LENGTH) {
    await loadingTask.destroy();
    return { text: digitalText, pages: pdf.numPages, method: "pdf-text" };
  }

  const scannedPages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d");
    await page.render({ canvas: canvas as never, canvasContext: context as never, viewport }).promise;
    const imageText = await recognize(canvas.toBuffer("image/png"));
    scannedPages.push(`Página ${pageNumber}\n${imageText}`);
  }
  const pages = pdf.numPages;
  await loadingTask.destroy();
  return { text: scannedPages.join("\n\n"), pages, method: "ocr" };
}

async function extractDocument(
  buffer: Buffer,
  mimeType: string,
  recognize: ImageRecognizer = recognizeImage,
): Promise<ExtractionResult> {
  if (mimeType === "application/pdf") return extractPdf(buffer, recognize);
  return { text: await recognize(buffer), pages: 1, method: "ocr" };
}

export { extractDocument };
