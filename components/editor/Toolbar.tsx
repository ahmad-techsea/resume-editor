import React from 'react';

export interface ToolbarProps {
  tplName: string;
  openTemplatePicker: (e: React.MouseEvent) => void;
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

export default function Toolbar(v: ToolbarProps) {
  return (
    <div
      className="no-print"
      style={{
        width: '794px',
        maxWidth: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '14px',
        fontSize: '12.5px',
        color: '#6B665E',
      }}
    >
      <span>Template</span>
      <button
        onClick={v.openTemplatePicker}
        className="hv-soft"
        style={{
          padding: '5px 12px',
          border: '1px solid #DDD8CF',
          borderRadius: '7px',
          background: '#fff',
          fontWeight: '600',
          color: '#3F3B35',
        }}
      >
        {v.tplName}
      </button>
      <span>Dates</span>
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
            padding: '5px 11px',
            fontSize: '12.5px',
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
            padding: '5px 11px',
            fontSize: '12.5px',
            background: v.flBg,
            color: v.flFg,
            fontWeight: v.flFw,
          }}
        >
          January 2026
        </button>
      </div>
      <button
        onClick={v.toggleMargins}
        className="hv-soft"
        style={{
          padding: '5px 12px',
          border: '1px solid #DDD8CF',
          borderRadius: '7px',
          background: v.marginsBtnBg,
          color: v.marginsBtnFg,
          fontWeight: '600',
        }}
      >
        {v.marginsBtnLabel}
      </button>
      <button
        onClick={v.exportPDF}
        className="hv-soft"
        style={{
          padding: '5px 12px',
          border: '1px solid #DDD8CF',
          borderRadius: '7px',
          background: '#fff',
        }}
      >
        Export PDF
      </button>
      <button
        onClick={v.exportDocx}
        className="hv-soft"
        style={{
          padding: '5px 12px',
          border: '1px solid #DDD8CF',
          borderRadius: '7px',
          background: '#fff',
        }}
      >
        Export Word
      </button>
      <button
        onClick={v.doPrint}
        className="hv-soft"
        style={{
          padding: '5px 12px',
          border: '1px solid #DDD8CF',
          borderRadius: '7px',
          background: '#fff',
        }}
      >
        Print
      </button>
    </div>
  );
}
