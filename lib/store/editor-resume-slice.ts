import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  buildSampleEditorResume,
  createSection,
  createBlankEntry,
  type EditorResumeDocument,
  type EditorEntriesSection,
} from '@/lib/resume-data/editor-resume-data';
import * as editorResumeApi from '@/lib/api/editor-resume-api';
import { ensureArrayAtDotPath, resolveDotPath, setAtDotPath } from '@/lib/dot-path';
import type { RootState } from './index';

export type LinkTarget = { ci: number } | { si: number; ei: number };

interface EditorResumeState {
  data: EditorResumeDocument;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  nextId: number;
}

// Mirrors the component's former `_uid = 100` starting point ('x101' is the first minted id).
let seedCounter = 100;
const initialState: EditorResumeState = {
  data: buildSampleEditorResume(() => 'x' + ++seedCounter),
  status: 'idle',
  nextId: seedCounter + 1,
};

export const fetchEditorResume = createAsyncThunk<
  { data: EditorResumeDocument; nextId: number },
  boolean,
  { state: RootState }
>('editorResume/fetch', async (sampleOn, { getState }) => {
  let counter = getState().editorResume.nextId;
  const mintId = () => 'x' + counter++;
  const data = await editorResumeApi.fetchEditorResume(sampleOn, mintId);
  return { data, nextId: counter };
});

const editorResumeSlice = createSlice({
  name: 'editorResume',
  initialState,
  reducers: {
    setPath(state, action: PayloadAction<{ path: string; value: any }>) {
      setAtDotPath(state.data, action.payload.path, action.payload.value);
    },
    addSection(
      state,
      action: PayloadAction<{
        type: string;
        kind: 'text' | 'entries';
        style: string;
        title: string;
      }>,
    ) {
      const mintId = () => 'x' + state.nextId++;
      state.data.sections.push(createSection(action.payload, mintId));
    },
    addEntry(state, action: PayloadAction<{ sectionIndex: number }>) {
      const section = state.data.sections[action.payload.sectionIndex] as EditorEntriesSection;
      section.entries.push(createBlankEntry('x' + state.nextId++));
    },
    pushAtPath(state, action: PayloadAction<{ listPath: string; item: any }>) {
      ensureArrayAtDotPath(state.data, action.payload.listPath).push(action.payload.item);
    },
    removeAtPath(state, action: PayloadAction<{ listPath: string; index: number }>) {
      resolveDotPath(state.data, action.payload.listPath).splice(action.payload.index, 1);
    },
    moveAtPath(state, action: PayloadAction<{ listPath: string; from: number; to: number }>) {
      const list = resolveDotPath(state.data, action.payload.listPath);
      const [item] = list.splice(action.payload.from, 1);
      list.splice(action.payload.to, 0, item);
    },
    saveLink(state, action: PayloadAction<{ target: LinkTarget; url: string; text: string }>) {
      const { target, url, text } = action.payload;
      const plain = url.replace(/^https?:\/\//, '');
      if ('ci' in target) {
        const c = state.data.header.contacts[target.ci];
        c.url = url;
        if (text) c.text = text;
        else if (!c.text.trim()) c.text = plain;
      } else {
        const section = state.data.sections[target.si] as EditorEntriesSection;
        section.entries[target.ei].link = { url, text: text || plain };
      }
    },
    removeLink(state, action: PayloadAction<{ target: LinkTarget }>) {
      const { target } = action.payload;
      if ('ci' in target) {
        state.data.header.contacts[target.ci].url = null;
      } else {
        const section = state.data.sections[target.si] as EditorEntriesSection;
        section.entries[target.ei].link = null;
      }
    },
    resetData(state, action: PayloadAction<{ data: EditorResumeDocument; nextId: number }>) {
      state.data = action.payload.data;
      state.nextId = action.payload.nextId;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEditorResume.fulfilled, (state, action) => {
      state.data = action.payload.data;
      state.nextId = action.payload.nextId;
      state.status = 'succeeded';
    });
  },
});

export const editorResumeActions = editorResumeSlice.actions;
export default editorResumeSlice.reducer;
