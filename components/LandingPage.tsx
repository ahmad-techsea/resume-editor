'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { FiFileText, FiUpload, FiAlertCircle } from 'react-icons/fi';
import '@/styles/landing-page.css';
import { buildBlankEditorResume } from '@/lib/resume-data/editor-resume-data';
import { convertParsedResumeToEditorDocument } from '@/lib/resume-data/parsed-resume-to-editor';
import { getOrCreateResumeId, loadPageSize } from '@/lib/resume-data/resume-persistence';
import { editorResumeActions } from '@/lib/store/editor-resume-slice';
import type { AppDispatch } from '@/lib/store';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.pdf') || lower.endsWith('.docx');
}

type UiState =
  | { kind: 'idle' }
  | { kind: 'uploading'; file: File }
  | { kind: 'error'; file: File; message: string };

export default function LandingPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<UiState>({ kind: 'idle' });

  const goToBlankEditor = () => {
    let counter = 100;
    const mintId = () => 'x' + ++counter;
    const data = buildBlankEditorResume(mintId);
    const resumeId = getOrCreateResumeId();
    data.pageSize = loadPageSize(resumeId);
    dispatch(editorResumeActions.resetData({ data, nextId: counter + 1, resumeId }));
    router.push('/editor');
  };

  const uploadAndParse = async (file: File) => {
    setState({ kind: 'uploading', file });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(payload?.error || `Parsing failed (${res.status}).`);
      }
      let counter = 100;
      const mintId = () => 'x' + ++counter;
      const data = convertParsedResumeToEditorDocument(payload.data, mintId);
      const resumeId = getOrCreateResumeId();
      data.pageSize = loadPageSize(resumeId);
      dispatch(editorResumeActions.resetData({ data, nextId: counter + 1, resumeId }));
      router.push('/editor');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setState({ kind: 'error', file, message });
    }
  };

  const onFilePicked = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_MIME_TYPES.has(file.type) && !hasAcceptedExtension(file.name)) {
      setState({ kind: 'error', file, message: 'Only PDF and DOCX files are accepted.' });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setState({ kind: 'error', file, message: 'File is larger than 5 MB.' });
      return;
    }
    void uploadAndParse(file);
  };

  const uploading = state.kind === 'uploading';

  return (
    <div
      className="landing"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '820px', maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#26231F' }}>
            Inline Resume Editor
          </div>
          <div style={{ fontSize: '14px', color: '#6B665E', marginTop: '8px' }}>
            Upload an existing resume or start with a blank one.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '18px',
            flexWrap: 'wrap',
          }}
        >
          <div
            className="choice-card"
            style={{
              flex: '1 1 320px',
              border: '1px solid #E2DDD4',
              borderRadius: '14px',
              background: '#fff',
              padding: '26px 24px',
              boxSizing: 'border-box',
            }}
          >
            <FiUpload size={22} color="#3E5C76" />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#26231F', marginTop: '14px' }}>
              Upload resume
            </div>
            <div style={{ fontSize: '13px', color: '#6B665E', marginTop: '6px', lineHeight: 1.5 }}>
              We&apos;ll read your PDF or DOCX and fill in the editor for you. Nothing is invented —
              only what&apos;s in your file.
            </div>
            <button
              className="primary-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '10px',
                background: '#3E5C76',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {uploading ? 'Reading your resume…' : 'Choose file'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                const file = e.target.files?.[0];
                onFilePicked(file);
                e.target.value = '';
              }}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '11px', color: '#9A948A', marginTop: '8px' }}>
              PDF or DOCX, up to 5 MB.
            </div>

            {uploading && (
              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#6B665E',
                }}
                role="status"
                aria-live="polite"
              >
                <span
                  className="spinner"
                  style={{
                    display: 'inline-block',
                    width: '13px',
                    height: '13px',
                    border: '2px solid #DDD8CF',
                    borderTopColor: '#3E5C76',
                    borderRadius: '50%',
                  }}
                />
                Parsing {state.file.name}…
              </div>
            )}

            {state.kind === 'error' && (
              <div
                role="alert"
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                  background: '#FBEDEC',
                  border: '1px solid #EFC9C4',
                  borderRadius: '8px',
                  padding: '10px 12px',
                }}
              >
                <FiAlertCircle size={15} color="#9A3F38" style={{ flex: 'none', marginTop: '1px' }} />
                <div style={{ fontSize: '12px', color: '#9A3F38', lineHeight: 1.5 }}>
                  <div>{state.message}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '14px' }}>
                    <button
                      className="link-btn"
                      onClick={() => void uploadAndParse(state.file)}
                      style={{ fontWeight: 600, color: '#9A3F38' }}
                    >
                      Try again
                    </button>
                    <button
                      className="link-btn"
                      onClick={goToBlankEditor}
                      style={{ fontWeight: 600, color: '#9A3F38' }}
                    >
                      Continue from scratch instead
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            className="choice-card"
            style={{
              flex: '1 1 320px',
              border: '1px solid #E2DDD4',
              borderRadius: '14px',
              background: '#fff',
              padding: '26px 24px',
              boxSizing: 'border-box',
            }}
          >
            <FiFileText size={22} color="#3E5C76" />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#26231F', marginTop: '14px' }}>
              Create from scratch
            </div>
            <div style={{ fontSize: '13px', color: '#6B665E', marginTop: '6px', lineHeight: 1.5 }}>
              Start with a completely empty resume and build it up section by section.
            </div>
            <button
              onClick={goToBlankEditor}
              disabled={uploading}
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '10px',
                background: '#fff',
                color: '#3F3B35',
                border: '1px solid #DDD8CF',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                opacity: uploading ? 0.6 : 1,
              }}
            >
              Start blank
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
