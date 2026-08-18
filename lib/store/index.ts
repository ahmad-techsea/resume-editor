import { configureStore } from '@reduxjs/toolkit';
import editorResumeReducer from './editor-resume-slice';
import reviewResumeReducer from './review-resume-slice';

export function makeStore() {
  return configureStore({
    reducer: {
      editorResume: editorResumeReducer,
      reviewResume: reviewResumeReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
