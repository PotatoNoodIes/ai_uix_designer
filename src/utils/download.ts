/**
 * Creates an anchor element, triggers a file download for the given URL,
 * then immediately cleans up the object URL and removes the anchor.
 */
export function triggerDownload(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
