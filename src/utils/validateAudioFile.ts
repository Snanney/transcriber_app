export type ValidationResult =
    | { valid: true }
    | { valid: false; reason: string };

export function validateAudioFile(file: File): ValidationResult {
    const name = file.name.toLowerCase();

    const allowedExtensions = ['.mp3', '.wav', '.mp4'];

    const hasAllowedExtension = allowedExtensions.some((ext) => name.endsWith(ext));

    if (hasAllowedExtension) {
        return { valid: true };
    }

    return { valid: false, reason: 'Invalid file type. Only MP3, WAV, and MP4 files are allowed.' }; 
}