import { pipeline } from "@huggingface/transformers";
import type { Segment, WorkerRequest, WorkerResponse } from "./workerMessages";

// Typed wrapper: under the DOM lib, self.postMessage expects window-style args.
function post(message: WorkerResponse): void {
  (self as unknown as { postMessage: (m: WorkerResponse) => void }).postMessage(message);
}

type WhisperChunk = { timestamp: [number, number | null]; text: string };
type WhisperOutput = { text: string; chunks?: WhisperChunk[] };
type Transcriber = (
  audio: Float32Array,
  options: Record<string, unknown>
) => Promise<WhisperOutput | WhisperOutput[]>;

type ProgressInfo = { status: string; file?: string; loaded?: number; total?: number };

let transcriberPromise: Promise<Transcriber> | null = null;

function getTranscriber(): Promise<Transcriber> {
  if (transcriberPromise === null) {
    // The model is several files, so track each file and report the combined total.
    const files: Record<string, { loaded: number; total: number }> = {};

    transcriberPromise = pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en", {
      progress_callback: (info: ProgressInfo) => {
        if (info.status === "progress" && info.file && info.loaded !== undefined && info.total !== undefined) {
          files[info.file] = { loaded: info.loaded, total: info.total };
          const all = Object.values(files);
          const loaded = all.reduce((sum, f) => sum + f.loaded, 0);
          const total = all.reduce((sum, f) => sum + f.total, 0);
          post({ type: "loading", percent: total > 0 ? Math.round((loaded / total) * 100) : 0 });
        }
      },
    }) as unknown as Promise<Transcriber>;
  }
  return transcriberPromise;
}

async function run(samples: Float32Array): Promise<Segment[]> {
  const transcriber = await getTranscriber();
  post({ type: "running" });

  const durationSeconds = samples.length / 16000;
  const raw = await transcriber(samples, {
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
  });
  const output = Array.isArray(raw) ? raw[0] : raw;

  if (!output.chunks || output.chunks.length === 0) {
    return [{ start: 0, end: durationSeconds, text: output.text }];
  }
  return output.chunks.map((chunk) => ({
    start: chunk.timestamp[0],
    end: chunk.timestamp[1] ?? durationSeconds,
    text: chunk.text,
  }));
}

// Runs whenever the page sends this worker a message.
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type === "transcribe") {
    try {
      post({ type: "result", segments: await run(request.samples) });
    } catch (error) {
      transcriberPromise = null; // allow a retry after a failed model load
      post({ type: "error", message: error instanceof Error ? error.message : String(error) });
    }
  }
};