export async function decodeToMono16k(file: File): Promise<Float32Array> {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const arrayBuffer = await file.arrayBuffer();


    try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const numChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length;

        // already mono, nothing to mix
        if (numChannels === 1) {
            return audioBuffer.getChannelData(0);
        }

        // two or more channels, mix down to mono
        const mono = new Float32Array(length);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);

            for (let i = 0; i < length; i++) {
                mono[i] += channelData[i] / numChannels;
            }
        }

        return mono;
    } finally {
        await audioContext.close();
    }
}