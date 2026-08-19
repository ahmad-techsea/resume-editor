import React from 'react';
import PageSizeSelect from './PageSizeSelect';
import ZoomControl from './ZoomControl';
import type { PageSizeId } from '@/lib/resume-pagination/page-constants';

export interface ToolbarProps {
  tplName: string;
  openTemplatePicker: (e: React.MouseEvent) => void;
  pageSize: PageSizeId;
  setPageSize: (id: PageSizeId) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  fmtShortSel: boolean;
  fmtLongSel: boolean;
  fsBg: string;
  fsFg: string;
  fsFw: number;
  flBg: string;
  flFg: string;
  flFw: number;
  setFmtS: () => void;
  setFmtL: () => void;
  marginsBtnLabel: string;
  marginsBtnBg: string;
  marginsBtnFg: string;
  toggleMargins: () => void;
  exportPDF: () => void;
  exportDocx: () => void;
  doPrint: () => void;
}

const row: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '18px',
};
const label: React.CSSProperties = {
  fontSize: '10.5px',
  fontWeight: 700,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: '#9A948A',
};
const fullBtn: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 12px',
  border: '1px solid #DDD8CF',
  borderRadius: '7px',
  background: '#fff',
  fontWeight: 600,
  color: '#3F3B35',
  fontSize: '12.5px',
  textAlign: 'center',
};

/** Rendered inside the right-side Settings drawer (see SettingsDrawer.tsx) — a vertical stack
 *  sized for a ~300px panel, not the horizontal bar this used to be. Every handler/prop below is
 *  unchanged; only the layout changed to fit a drawer. */
export default function Toolbar(v: ToolbarProps) {
  return (
    <div className="no-print" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={row}>
        <span style={label}>Template</span>
        <button
          onClick={v.openTemplatePicker}
          className="hv-soft"
          style={{ ...fullBtn, textAlign: 'left' }}
        >
          {v.tplName}
        </button>
      </div>

      <div style={row}>
        <span style={label}>Page size</span>
        <PageSizeSelect value={v.pageSize} onChange={v.setPageSize} />
      </div>

      <div style={row}>
        <span style={label}>Zoom</span>
        <ZoomControl zoom={v.zoom} onChange={v.setZoom} />
      </div>

      <div style={row}>
        <span style={label}>Date format</span>
        <div
          style={{
            display: 'flex',
            border: '1px solid #DDD8CF',
            borderRadius: '7px',
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          <button
            onClick={v.setFmtS}
            aria-pressed={v.fmtShortSel}
            style={{
              flex: '1',
              padding: '7px 6px',
              fontSize: '12px',
              background: v.fsBg,
              color: v.fsFg,
              fontWeight: v.fsFw,
            }}
          >
            Jan 2026
          </button>
          <button
            onClick={v.setFmtL}
            aria-pressed={v.fmtLongSel}
            style={{
              flex: '1',
              padding: '7px 6px',
              fontSize: '12px',
              background: v.flBg,
              color: v.flFg,
              fontWeight: v.flFw,
            }}
          >
            January 2026
          </button>
        </div>
      </div>

      <div style={row}>
        <span style={label}>Margins</span>
        <button
          onClick={v.toggleMargins}
          className="hv-soft"
          style={{ ...fullBtn, background: v.marginsBtnBg, color: v.marginsBtnFg }}
        >
          {v.marginsBtnLabel}
        </button>
      </div>

      <div style={{ ...row, borderTop: '1px solid #F0EDE7', paddingTop: '16px' }}>
        <span style={label}>Export &amp; print</span>
        <button onClick={v.exportPDF} className="hv-soft" style={fullBtn}>
          Export PDF
        </button>
        <button onClick={v.exportDocx} className="hv-soft" style={fullBtn}>
          Export Word
        </button>
        <button onClick={v.doPrint} className="hv-soft" style={fullBtn}>
          Print
        </button>
      </div>
    </div>
  );
}
