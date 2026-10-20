import type { Segment } from "../audio/transcribe";

// Turns seconds (e.g. 3661.5) into "HH:MM:SS.mmm" (e.g. "01:01:01.500").
export function formatTimestamp(seconds: number): string {
  // Work in whole milliseconds to avoid decimal rounding problems.
  const totalMs = Math.round(seconds * 1000);

  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;

  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(secs)}.${String(ms).padStart(3, "0")}`;
}

// Builds a WebVTT file: a "WEBVTT" header, then one cue per segment.
export function toVtt(segments: Segment[]): string {
  const cues = segments
    .filter((segment) => segment.text.trim() !== "")
    .map(
      (segment) =>
        `${formatTimestamp(segment.start)} --> ${formatTimestamp(segment.end)}\n${segment.text.trim()}`
    );

  return `WEBVTT\n\n${cues.join("\n\n")}\n`;
}