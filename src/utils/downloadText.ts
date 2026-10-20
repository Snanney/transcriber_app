// Saves a string as a file by making a temporary download link.
export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob); // temporary URL pointing at the blob

  const link = document.createElement("a");
  link.href = url;
  link.download = filename; // tells the browser to save instead of navigate
  link.click();

  URL.revokeObjectURL(url); // free the memory
}