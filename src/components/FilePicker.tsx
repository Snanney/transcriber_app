import { useState } from "react";

// export makes funciton available to other files
export function FilePicker() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (files === null || files.length === 0) {
            setSelectedFile(null);
            return;
        }
        
        setSelectedFile(files[0]);
    }
    return (
        // container, JSX must return one outer element and this lets us wrap multiple elements in a single container
        <div> 
            <h2>Choose an audio file</h2>
            <input type="file" accept=".mp3, .mp4, .wav" onChange={handleFileChange} />
            {selectedFile !== null && <p>Selected: {selectedFile.name}</p>}
        </div>
        // The onChange event here is triggered when the user selects a file, then it runs the function handleFileChange
    )
}