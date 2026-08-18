// Stand-in for a future real API — see editor-resume-api.ts for why this resolves synchronously
// enough to never produce a visible loading flash.
import {
  createSampleReviewResume,
  type ReviewResumeDocument,
} from '@/lib/resume-data/review-resume-data';

export async function fetchReviewResume(): Promise<ReviewResumeDocument> {
  return createSampleReviewResume();
}
