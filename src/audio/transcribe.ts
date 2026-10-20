import { pipeline } from "@huggingface/transformers";

export type Segment = { start: number; end: number; text: string };

// Minimal shapes for what the Whisper pipeline returns.
type WhisperChunk = { timestamp: [number, number | null]; text: string };
type WhisperOutput = { text: string; chunks?: WhisperChunk[] };
type Transcriber = (
  audio: Float32Array,
  options: Record<string, unknown>
) => Promise<WhisperOutput | WhisperOutput[]>;

// Cache the model so it only loads once (the first load downloads it).
let transcriberPromise: Promise<Transcriber> | null = null;

function getTranscriber(): Promise<Transcriber> {
  if (transcriberPromise === null) {
    // The library's own types for pipeline() are very complex, so we cast
    // to our simpler Transcriber type. "whisper-tiny.en" is English only;
    // use "Xenova/whisper-tiny" for other languages.
    transcriberPromise = pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny.en"
    ) as unknown as Promise<Transcriber>;
  }
  return transcriberPromise;
}

export async function transcribe(samples: Float32Array): Promise<Segment[]> {
  const transcriber = await getTranscriber();
  const durationSeconds = samples.length / 16000;

  // chunk_length_s / stride_length_s: Whisper handles ~30s windows, so long
  // audio is split into overlapping chunks and stitched back together.
  const raw = await transcriber(samples, {
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
  });

  const output = Array.isArray(raw) ? raw[0] : raw;

  // If no chunks come back, treat the whole text as one segment.
  if (!output.chunks || output.chunks.length === 0) {
    return [{ start: 0, end: durationSeconds, text: output.text }];
  }

  return output.chunks.map((chunk) => {
    const [start, end] = chunk.timestamp;
    return {
      start,
      // The last chunk's end can be null, so fall back to the audio duration.
      end: end ?? durationSeconds,
      text: chunk.text,
    };
  });
}