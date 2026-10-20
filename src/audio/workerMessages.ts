export type Segment = { start: number; end: number; text: string };

// Page -> worker
export type WorkerRequest = { type: "transcribe"; samples: Float32Array };

// Worker -> page. `type` is the discriminant.
export type WorkerResponse =
  | { type: "loading"; percent: number } // model downloading (0-100)
  | { type: "running" } // model ready, transcribing
  | { type: "result"; segments: Segment[] }
  | { type: "error"; message: string };

export type ProgressMessage = Extract<WorkerResponse, { type: "loading" | "running" }>;