import type { EditorResumeDocument } from '@/lib/resume-data/editor-resume-data';

export interface ExportMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Downloads a PDF rendered by the headless-browser export pipeline (app/api/export-pdf), which
 *  renders the same paginated component tree the user sees on screen — page-for-page identical
 *  by construction, not a separately-maintained layout. Takes the real document (not the
 *  flattened ExportModel jsPDF used to draw by hand) since the headless render goes through the
 *  actual editor components. */
export async function exportResumeToPDF(
  resumeDocument: EditorResumeDocument,
  margins: ExportMargins,
  accent: string,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: resumeDocument, margins, accent }),
    });
  } catch {
    alert('Could not reach the PDF export service — check your connection and try again.');
    return;
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    alert(`PDF export failed: ${body?.error || response.statusText}`);
    return;
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (resumeDocument.header.name || 'resume').trim().replace(/\s+/g, '_') + '.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
