import { useState } from "react";
import { formatFileSize } from "../utils/formateFileSize"; // keep whatever matches your file name
import { validateAudioFile } from "../utils/validateAudioFile";
import { decodeToMono16k } from "../audio/decodeToMono16k";
import { transcribe } from "../audio/transcribe";
import { toVtt } from "../utils/toVtt";
import { downloadText } from "../utils/downloadText";

type PickerState =
    | { status: "empty" }
    | { status: "invalid"; fileName: string; reason: string }
    | { status: "decoding"; file: File }
    | { status: "transcribing"; file: File }
    | { status: "done"; file: File; vtt: string }
    | { status: "error"; fileName: string; message: string };

export function FilePicker() {
    const [pickerState, setPickerState] = useState<PickerState>({ status: "empty" });

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
            setPickerState({ status: "transcribing", file });
            const segments = await transcribe(samples);
            setPickerState({ status: "done", file, vtt: toVtt(segments) });
        } catch (error) {
            console.error(error);
            setPickerState({ status: "error", fileName: file.name, message: "Failed to process audio file." });
        }
    }

    return (
        <div>
            <h2>Choose an audio file</h2>
            <input type="file" accept=".mp3,.mp4,.wav,.mkv" onChange={handleFileChange} />

            {pickerState.status === "invalid" && (
                <p role="alert">
                    {pickerState.fileName}: {pickerState.reason}
                </p>
            )}

            {pickerState.status === "decoding" && (
                <p>Decoding {pickerState.file.name}...</p>
            )}

            {pickerState.status === "transcribing" && (
                <p>Transcribing {pickerState.file.name}... the first run downloads the model, so it may take a while.</p>
            )}

            {pickerState.status === "done" && (
                <div>
                    <p>
                        {pickerState.file.name} ({formatFileSize(pickerState.file.size)})
                    </p>
                    <button
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
                    <pre>{pickerState.vtt}</pre>
                </div>
            )}

            {pickerState.status === "error" && (
                <p role="alert">
                    {pickerState.fileName}: {pickerState.message}
                </p>
            )}
        </div>
    );
}