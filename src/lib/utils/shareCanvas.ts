export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/** Shared by the collage generator and the cinematic DNA card. */
export async function shareCanvas(canvas: HTMLCanvasElement, filename: string, title: string, text: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('No se pudo crear la imagen.')), 'image/png'));
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ title, text, files: [file] }); return 'shared'; }
    catch (error) { if (error instanceof Error && error.name === 'AbortError') return 'cancelled'; }
  }
  downloadCanvas(canvas, filename);
  return 'downloaded';
}
