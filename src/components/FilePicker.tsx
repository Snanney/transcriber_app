// export makes funciton available to other files
export function FilePicker() {
    return (
        // container, JSX must return one outer element and this lets us wrap multiple elements in a single container
        <div> 
            <h2>Choose an audio file</h2>
            <input type="file" accept=".mp3, .mp4, .wav" />
        </div>
    )
}