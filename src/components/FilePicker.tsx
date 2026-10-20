import { useState } from "react";
import { formatFileSize } from "../utils/formatFileSize";
import { validateAudioFile } from "../utils/validateAudioFile";
import { decodeToMono16k } from "../audio/decodeToMono16k";
import { transcribe } from "../audio/transcribe";
import { toVtt } from "../utils/toVtt";
import { downloadText } from "../utils/downloadText";
import { ProgressBar } from "./ProgressBar";

type PickerState =
    | { status: "empty" }
    | { status: "invalid"; fileName: string; reason: string }
    | { status: "decoding"; file: File }
    | { status: "transcribing"; file: File; phase: "loading-model" | "running"; percent: number }
    | { status: "done"; file: File; vtt: string }
    | { status: "error"; fileName: string; message: string };

export function FilePicker() {
    const [pickerState, setPickerState] = useState<PickerState>({ status: "empty" });

    // The input is disabled while work is in progress.
    const busy = pickerState.status === "decoding" || pickerState.status === "transcribing";

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (files === null || files.length === 0) {
            setPickerState({ status: "empty" });
            return;
        }

        const file = files[0];
        const result = validateAudioFile(file);
        if (!result.valid) {
            setPickerState({ status: "invalid", fileName: file.name, reason: result.reason });
            return;
        }

        setPickerState({ status: "decoding", file });
        try {
            const samples = await decodeToMono16k(file);
            setPickerState({ status: "transcribing", file, phase: "loading-model", percent: 0 });

            // The worker reports progress; each message updates the state.
            const segments = await transcribe(samples, (message) => {
                if (message.type === "loading") {
                    setPickerState({ status: "transcribing", file, phase: "loading-model", percent: message.percent });
                } else {
                    setPickerState({ status: "transcribing", file, phase: "running", percent: 100 });
                }
            });

            setPickerState({ status: "done", file, vtt: toVtt(segments) });
        } catch (error) {
            console.error(error);
            setPickerState({ status: "error", fileName: file.name, message: "Failed to process audio file." });
        }
    }

    return (
        <div className="card">
            <input
                id="file-input"
                className="visually-hidden"
                type="file"
                accept=".mp3,.mp4,.wav,.mkv"
                onChange={handleFileChange}
                disabled={busy}
            />
            <label htmlFor="file-input" className={busy ? "dropzone disabled" : "dropzone"}>
                <span className="dropzone-title">Choose an audio or video file</span>
                <span className="dropzone-hint">MP3, WAV, MP4 or MKV</span>
            </label>

            {pickerState.status === "invalid" && (
                <p className="message error" role="alert">
                    {pickerState.fileName}: {pickerState.reason}
                </p>
            )}

            {pickerState.status === "error" && (
                <p className="message error" role="alert">
                    {pickerState.fileName}: {pickerState.message}
                </p>
            )}

            {pickerState.status === "decoding" && (
                <ProgressBar label={`Decoding ${pickerState.file.name}`} percent={null} />
            )}

            {pickerState.status === "transcribing" && pickerState.phase === "loading-model" && (
                <ProgressBar label="Downloading speech model (first run only)" percent={pickerState.percent} />
            )}

            {pickerState.status === "transcribing" && pickerState.phase === "running" && (
                <ProgressBar label={`Transcribing ${pickerState.file.name}`} percent={null} />
            )}

            {pickerState.status === "done" && (
                <div className="result">
                    <p className="file-meta">
                        {pickerState.file.name} <span>({formatFileSize(pickerState.file.size)})</span>
                    </p>
                    <button
                        className="button"
                        onClick={() =>
                            downloadText(
                                pickerState.file.name.replace(/\.[^.]+$/, "") + ".vtt",
                                pickerState.vtt,
                                "text/vtt"
                            )
                        }
                    >
                        Download .vtt
                    </button>
                    <pre className="preview">{pickerState.vtt}</pre>
                </div>
            )}
        </div>
    );
}