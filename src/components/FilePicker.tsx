import { useState } from "react";
import { formatFileSize } from "../utils/formateFileSize";
import { validateAudioFile } from "../utils/validateAudioFile";
import { decodeToMono16k } from "../audio/decodeToMono16k";

type PickerState =
    | { status: "empty" }
    | { status: "valid"; file: File }
    | { status: "invalid"; fileName: string; reason: string };

// export makes funciton available to other files
export function FilePicker() {
    // const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pickerState, setPickerState] = useState<PickerState>({ status: "empty" });

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (files === null || files.length === 0) {
            setPickerState({ status: "empty" });
            return;
        }

        const file = files[0];
        const result = validateAudioFile(file);

        if (result.valid) {
            setPickerState({ status: "valid", file });
            const samples = await decodeToMono16k(file);
            console.log(samples.length, samples.length / 16000);
        } else {
            setPickerState({ status: "invalid", fileName: file.name, reason: result.reason });
        }
    }

    return (
        // container, JSX must return one outer element and this lets us wrap multiple elements in a single container
        <div> 
            <h2>Choose an audio file</h2>
            <input type="file" accept=".mp3, .mp4, .wav, .mkv" onChange={handleFileChange} />
                {pickerState.status === "valid" && (
                <div>
                    <p>Name: {pickerState.file.name}</p>
                    <p>Size: {formatFileSize(pickerState.file.size)}</p>
                    <p>Type: {pickerState.file.type}</p>
                </div>
                )}

                {pickerState.status === "invalid" && (
                <p role="alert">
                    {pickerState.fileName}: {pickerState.reason}
                </p>
                )}
        </div>
        // The onChange event here is triggered when the user selects a file, then it runs the function handleFileChange
    )
}