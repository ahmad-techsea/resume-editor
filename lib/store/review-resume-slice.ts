import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  createSampleReviewResume,
  type ReviewResumeDocument,
} from '@/lib/resume-data/review-resume-data';
import { getByPath, setByPath } from '@/lib/resume-review-engine';
import * as reviewResumeApi from '@/lib/api/review-resume-api';

interface ReviewResumeState {
  data: ReviewResumeDocument;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ReviewResumeState = {
  data: createSampleReviewResume(),
  status: 'idle',
};

export const fetchReviewResume = createAsyncThunk<ReviewResumeDocument, void>(
  'reviewResume/fetch',
  () => reviewResumeApi.fetchReviewResume(),
);

const reviewResumeSlice = createSlice({
  name: 'reviewResume',
  initialState,
  reducers: {
    setPath(state, action: PayloadAction<{ path: string; value: any }>) {
      setByPath(state.data, action.payload.path, action.payload.value);
    },
    pushToList(state, action: PayloadAction<{ listPath: string; item: any }>) {
      getByPath(state.data, action.payload.listPath).push(action.payload.item);
    },
    removeFromList(state, action: PayloadAction<{ listPath: string; index: number }>) {
      getByPath(state.data, action.payload.listPath).splice(action.payload.index, 1);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchReviewResume.fulfilled, (state, action) => {
      state.data = action.payload;
      state.status = 'succeeded';
    });
  },
});

export const reviewResumeActions = reviewResumeSlice.actions;
export default reviewResumeSlice.reducer;
