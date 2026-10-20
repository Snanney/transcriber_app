import type { ProgressMessage, Segment, WorkerRequest, WorkerResponse } from "./workerMessages";

// Re-exported so toVtt.ts can keep importing Segment from here.
export type { Segment } from "./workerMessages";

// One shared worker, so the loaded model stays in memory between files.
let worker: Worker | null = null;

function getWorker(): Worker {
  if (worker === null) {
    // Vite recognises this exact pattern and bundles the worker file.
    worker = new Worker(new URL("./transcribe.worker.ts", import.meta.url), { type: "module" });
  }
  return worker;
}

export function transcribe(
  samples: Float32Array,
  onProgress: (message: ProgressMessage) => void
): Promise<Segment[]> {
  return new Promise((resolve, reject) => {
    const w = getWorker();

    w.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      switch (message.type) {
        case "loading":
        case "running":
          onProgress(message);
          break;
        case "result":
          resolve(message.segments);
          break;
        case "error":
          reject(new Error(message.message));
          break;
      }
    };

    w.onerror = (event) => {
      w.terminate();
      worker = null; // next call creates a fresh worker
      reject(new Error(event.message));
    };

    const request: WorkerRequest = { type: "transcribe", samples };
    // The second argument *transfers* the buffer (moves it, no copy). `samples`
    // becomes unusable on this side afterwards, which is fine for us.
    w.postMessage(request, [samples.buffer as ArrayBuffer]);
  });
}