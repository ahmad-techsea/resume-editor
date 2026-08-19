// Stand-in for a future real API. Resolves via a bare microtask (no fetch/setTimeout), which is
// what lets the Redux thunk finish before first paint — the store's initial state is pre-seeded
// with the same builder this wraps, so dispatching this on mount never produces a visible change.
import {
  buildBlankEditorResume,
  buildSampleEditorResume,
  type EditorResumeDocument,
} from '@/lib/resume-data/editor-resume-data';

export async function fetchEditorResume(
  sampleOn: boolean,
  mintId: () => string,
): Promise<EditorResumeDocument> {
  return sampleOn ? buildSampleEditorResume(mintId) : buildBlankEditorResume(mintId);
}
