import { configureStore } from '@reduxjs/toolkit';
import editorResumeReducer from './editor-resume-slice';
import reviewReducer from './review-slice';

export function makeStore() {
  return configureStore({
    reducer: {
      editorResume: editorResumeReducer,
      review: reviewReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
