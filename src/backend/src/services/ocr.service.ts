import { createWorker } from "tesseract.js";

let workerPromise: ReturnType<typeof createWorker> | undefined;

async function recognizeImage(image: Buffer): Promise<string> {
  workerPromise ??= createWorker("por");
  const worker = await workerPromise;
  const result = await worker.recognize(image);
  return result.data.text.trim();
}

export { recognizeImage };
