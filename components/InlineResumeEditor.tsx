'use client';

import React from 'react';
import '@/styles/inline-resume-editor.css';

const PX_PER_IN = 794 / 8.5;
function firstFont(stack: string) { return (stack || 'Helvetica').split(',')[0].replace(/["']/g, '').trim(); }
function hexToRgb(hex: string): [number, number, number] {
  const h = (hex || '#3E5C76').replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export interface InlineResumeEditorProps {
  /** Accent colour used when the selected template does not define its own. */
  accent?: string;
  /** Start from the sample resume instead of an empty one. */
  sampleData?: boolean;
  /** Pin the hover-revealed editing controls open. */
  alwaysShowControls?: boolean;
}

type Pop = any;

interface EditorState {
  data: any;
  pop: Pop;
  editBody: string | null;
  margins: { top: number; right: number; bottom: number; left: number };
  showMargins: boolean;
}

const LINK_ICON = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 7.2 7.2 4.8" />
    <path d="M5.5 3.6l1-1a2 2 0 0 1 2.9 2.9l-1 1" />
    <path d="M6.5 8.4l-1 1a2 2 0 0 1-2.9-2.9l1-1" />
  </svg>
);
const TRASH_ICON = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5h8" />
    <path d="M4.5 3.5v-1h3v1" />
    <path d="M3.2 3.5l.5 6.2h4.6l.5-6.2" />
  </svg>
);

/** The style-picker thumbnails, shared by the add-section grid and the per-section restyle popover. */
function StyleThumb({ st }: { st: any }) {
  return (
    <div style={{ height: '56px', overflow: 'hidden', pointerEvents: 'none', marginBottom: '7px' }}>
      {st.cCl && <div><div style={{ fontSize: '7px', fontWeight: '700', letterSpacing: '.12em', color: 'var(--acc,#3E5C76)', borderBottom: '1px solid #E6E2DA', paddingBottom: '3px' }}>HEADING</div><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '8px' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '4px', width: '92%' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '4px', width: '58%' }} /></div>}
      {st.cSd && <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: '8px', paddingTop: '4px' }}><div style={{ fontSize: '7px', fontWeight: '700', letterSpacing: '.1em', color: 'var(--acc,#3E5C76)' }}>HEAD</div><div><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '4px', width: '90%' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '4px', width: '62%' }} /></div></div>}
      {st.cTn && <div style={{ background: 'color-mix(in oklab,var(--acc,#3E5C76) 6%,#fff)', borderRadius: '6px', padding: '7px 8px' }}><div style={{ fontSize: '7px', fontWeight: '700', letterSpacing: '.12em', color: 'var(--acc,#3E5C76)' }}>HEADING</div><div style={{ height: '4px', background: '#DFDAD1', borderRadius: '2px', marginTop: '6px' }} /><div style={{ height: '4px', background: '#DFDAD1', borderRadius: '2px', marginTop: '4px', width: '78%' }} /></div>}
      {st.cEd && <div style={{ borderTop: '1px solid #E6E2DA', borderBottom: '1px solid #E6E2DA', padding: '8px 0', marginTop: '4px' }}><div style={{ height: '5px', background: '#C9C4BB', borderRadius: '2px' }} /><div style={{ height: '5px', background: '#C9C4BB', borderRadius: '2px', marginTop: '5px', width: '84%' }} /><div style={{ height: '5px', background: '#C9C4BB', borderRadius: '2px', marginTop: '5px', width: '52%' }} /></div>}
      {st.cCe && <div><div style={{ fontSize: '7px', fontWeight: '700', letterSpacing: '.12em', color: 'var(--acc,#3E5C76)', borderBottom: '1px solid #E6E2DA', paddingBottom: '3px', textAlign: 'left' }}>HEADING</div><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', margin: '14px auto 0', width: '55%' }} /></div>}
      {st.cPl && <div><div style={{ fontSize: '7px', fontWeight: '700', letterSpacing: '.12em', color: 'var(--acc,#3E5C76)', borderBottom: '1px solid #E6E2DA', paddingBottom: '3px' }}>HEADING</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '7px' }}><span style={{ width: '34px', height: '11px', border: '1px solid #D8D4CC', borderRadius: '999px' }} /><span style={{ width: '26px', height: '11px', border: '1px solid #D8D4CC', borderRadius: '999px' }} /><span style={{ width: '40px', height: '11px', border: '1px solid #D8D4CC', borderRadius: '999px' }} /><span style={{ width: '30px', height: '11px', border: '1px solid #D8D4CC', borderRadius: '999px' }} /><span style={{ width: '22px', height: '11px', border: '1px solid #D8D4CC', borderRadius: '999px' }} /></div></div>}
      {st.eCl && <div style={{ paddingTop: '2px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ height: '5px', background: '#B9B3A9', borderRadius: '2px', width: '55%' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', width: '36px' }} /></div><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '5px', width: '44%' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '7px' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '4px', width: '86%' }} /></div>}
      {st.eTl && <div style={{ borderLeft: '2px solid #E6E2DA', paddingLeft: '9px', position: 'relative', marginTop: '2px', marginLeft: '3px' }}><span style={{ position: 'absolute', left: '-4px', top: '1px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--acc,#3E5C76)' }} /><div style={{ height: '3.5px', background: '#E3DFD7', borderRadius: '2px', width: '38px' }} /><div style={{ height: '5px', background: '#B9B3A9', borderRadius: '2px', marginTop: '5px', width: '70%' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '5px', width: '88%' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '4px', width: '60%' }} /></div>}
      {st.eDl && <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: '7px', paddingTop: '3px' }}><div><div style={{ height: '3.5px', background: '#E3DFD7', borderRadius: '2px' }} /><div style={{ height: '3.5px', background: '#E3DFD7', borderRadius: '2px', marginTop: '4px', width: '80%' }} /></div><div><div style={{ height: '5px', background: '#B9B3A9', borderRadius: '2px', width: '75%' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '5px', width: '55%' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '6px' }} /></div></div>}
      {st.eCp && <div style={{ paddingTop: '3px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #F0EDE7' }}><div style={{ height: '4.5px', background: '#B9B3A9', borderRadius: '2px', width: '58%' }} /><div style={{ height: '3.5px', background: '#E3DFD7', borderRadius: '2px', width: '28px' }} /></div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}><div style={{ height: '4.5px', background: '#B9B3A9', borderRadius: '2px', width: '48%' }} /><div style={{ height: '3.5px', background: '#E3DFD7', borderRadius: '2px', width: '28px' }} /></div></div>}
      {st.eCf && <div style={{ paddingTop: '2px' }}><div style={{ fontSize: '6.5px', fontWeight: '700', letterSpacing: '.11em', color: 'var(--acc,#3E5C76)' }}>COMPANY</div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}><div style={{ height: '5.5px', background: '#8F897F', borderRadius: '2px', width: '58%' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', width: '34px' }} /></div><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '7px' }} /><div style={{ height: '4px', background: '#E3DFD7', borderRadius: '2px', marginTop: '4px', width: '70%' }} /></div>}
    </div>
  );
}

export default class InlineResumeEditor extends React.Component<InlineResumeEditorProps, EditorState> {
  private _uid = 100;
  private _snap: { p: string; v: string } | null = null;
  private _rootEl: HTMLDivElement | null = null;
  private _pageEl: HTMLDivElement | null = null;
  private _dragDir: string | null = null;
  private _dragRect: DOMRect | null = null;

  MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  ML = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  PHE: Record<string, [string, string, string]> = {
    experience: ['Job title', 'Company', 'Describe your role and achievements…'],
    education: ['Degree', 'School or university', 'Notes, honors, coursework…'],
    projects: ['Project name', 'Role or technologies', 'Describe the project…'],
  };
  PHB: Record<string, string> = {
    summary: 'Write a 2–3 sentence professional summary…',
    skills: 'List your key skills, separated by commas…',
    certifications: 'List your certifications…',
    awards: 'List awards and honors…',
    languages: 'Languages you speak and proficiency levels…',
    references: 'Name, role, company, and contact for each reference…',
    custom: 'Add content…',
  };
  CAT = [
    { key: 'summary', label: 'Summary', kind: 'text' },
    { key: 'experience', label: 'Experience', kind: 'entries' },
    { key: 'education', label: 'Education', kind: 'entries' },
    { key: 'projects', label: 'Projects', kind: 'entries' },
    { key: 'skills', label: 'Skills', kind: 'text' },
    { key: 'certifications', label: 'Certifications', kind: 'text' },
    { key: 'awards', label: 'Awards & Achievements', kind: 'text' },
    { key: 'languages', label: 'Languages', kind: 'text' },
    { key: 'references', label: 'References', kind: 'text' },
    { key: 'custom', label: 'Custom section…', kind: 'text' },
  ];
  SNAMES: Record<string, string> = { classic: 'Classic ruled', side: 'Side label', tinted: 'Tinted panel', editorial: 'Editorial', center: 'Centered note', pills: 'Pill tags', timeline: 'Timeline rail', datesLeft: 'Dates left', compact: 'Compact rows', companyFirst: 'Company first' };
  TSTYLES: Record<string, string[]> = {
    entries: ['classic', 'timeline', 'datesLeft', 'compact', 'companyFirst'],
    summary: ['classic', 'side', 'tinted', 'editorial'],
    skills: ['classic', 'pills', 'side', 'tinted', 'editorial'],
    languages: ['classic', 'pills', 'side', 'tinted', 'center'],
    certifications: ['classic', 'side', 'tinted', 'center', 'editorial'],
    awards: ['classic', 'side', 'tinted', 'center', 'editorial'],
    references: ['classic', 'center', 'side', 'tinted', 'editorial'],
    custom: ['classic', 'side', 'tinted', 'editorial', 'center'],
  };
  TEMPLATES = [
    { id: 'openSans', name: 'Open Sans Modern', font: "'Open Sans',system-ui,sans-serif", accent: null as string | null, header: 'left' },
    { id: 'arial', name: 'Arial ATS Classic', font: 'Arial,Helvetica,sans-serif', accent: '#2C4A6E', header: 'left' },
    { id: 'georgia', name: 'Georgia Traditional', font: "Georgia,'Times New Roman',serif", accent: '#6E3B3B', header: 'center' },
    { id: 'verdana', name: 'Verdana Minimal', font: 'Verdana,Tahoma,sans-serif', accent: '#44484E', header: 'split' },
    { id: 'times', name: 'Times Executive', font: "'Times New Roman',Times,serif", accent: '#1F3A5F', header: 'center' },
    { id: 'tahoma', name: 'Tahoma Bold', font: 'Tahoma,Geneva,sans-serif', accent: '#3F5940', header: 'banner' },
  ];

  constructor(props: InlineResumeEditorProps) {
    super(props);
    this.state = { data: this.initData(), pop: null, editBody: null, margins: { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 }, showMargins: false };
  }
  get sampleOn() { return this.props.sampleData !== false; }
  initData() { return this.sampleOn ? this.sample() : this.blank(); }
  componentDidUpdate(pp: InlineResumeEditorProps) {
    if ((pp.sampleData !== false) !== this.sampleOn) this.setState({ data: this.initData(), pop: null });
  }
  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onDragMove);
    window.removeEventListener('mouseup', this.onDragEnd);
  }
  uid() { return 'x' + (++this._uid); }
  blankEntry() { return { id: this.uid(), title: '', subtitle: '', start: null, end: null, desc: '', contribs: [] as string[], link: null as any }; }
  blank(): any {
    return { dateFormat: 'MMM', templateId: 'openSans', header: { name: '', title: '', contacts: [
      { kind: 'email', text: '', url: null }, { kind: 'phone', text: '', url: null }, { kind: 'location', text: '', url: null },
    ] }, sections: [
      { id: this.uid(), type: 'summary', kind: 'text', style: 'classic', title: 'Summary', body: '' },
      { id: this.uid(), type: 'experience', kind: 'entries', style: 'classic', title: 'Experience', entries: [this.blankEntry()] },
      { id: this.uid(), type: 'education', kind: 'entries', style: 'classic', title: 'Education', entries: [this.blankEntry()] },
      { id: this.uid(), type: 'skills', kind: 'text', style: 'classic', title: 'Skills', body: '' },
    ] };
  }
  sample(): any {
    const d = this.blank();
    d.header.name = 'Maya Chen';
    d.header.title = 'Senior Software Engineer';
    d.header.contacts[0].text = 'hello@mayachen.dev';
    d.header.contacts[1].text = '+1 (415) 555-0192';
    d.header.contacts[2].text = 'San Francisco, CA';
    d.sections[0].body = 'Software engineer with 8 years of experience building web applications and developer tools. Led frontend architecture for products serving 2M+ users, with a focus on design systems, performance, and mentoring.';
    const e1 = this.blankEntry(), e2 = this.blankEntry(), ed = this.blankEntry();
    e1.title = 'Senior Software Engineer'; e1.subtitle = 'Fieldstone Labs';
    (e1 as any).start = { y: 2022, m: 3 }; (e1 as any).end = 'present';
    e1.desc = 'Lead engineer on the design systems team; mentor three engineers.';
    e1.contribs = ['Built a component library adopted across four products', 'Cut UI defect reports by 38% with visual regression testing', 'Drove the migration of 240k lines to TypeScript'];
    e2.title = 'Software Engineer'; e2.subtitle = 'Copperline Software';
    (e2 as any).start = { y: 2018, m: 7 }; (e2 as any).end = { y: 2022, m: 2 };
    e2.desc = 'Built customer-facing analytics dashboards in React and Node.js. Reduced initial page load from 4.1s to 1.3s and introduced end-to-end testing that halved regression bugs.';
    ed.title = 'B.S. Computer Science'; ed.subtitle = 'University of Washington';
    (ed as any).start = { y: 2014, m: 9 }; (ed as any).end = { y: 2018, m: 6 };
    ed.contribs = ['Dean’s List, six quarters — graduated with honors'];
    d.sections[1].entries = [e1, e2];
    d.sections[2].entries = [ed];
    d.sections[3].body = 'TypeScript, React, Node.js, GraphQL, design systems, accessibility, performance profiling, CI/CD';
    return d;
  }
  fmt(dt: any) {
    if (!dt) return '';
    if (dt === 'present') return 'Present';
    return (this.state.data.dateFormat === 'MMMM' ? this.ML : this.MS)[dt.m - 1] + ' ' + dt.y;
  }
  idx(dt: any) { return dt.y * 12 + (dt.m - 1); }
  mut(fn: (d: any) => void) { const d = structuredClone(this.state.data); fn(d); this.setState({ data: d }); }
  sp(path: string, val: any) { this.mut(d => { const ks = String(path).split('.'); let o = d; for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = val; }); }
  anchor(e: React.MouseEvent, w: number, alignRight: boolean) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const rr = this._rootEl!.getBoundingClientRect();
    let x = (alignRight ? r.right - w : r.left) - rr.left;
    x = Math.max(8, Math.min(x, rr.width - w - 8));
    return { x, y: r.bottom - rr.top + 6 };
  }
  onEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => this.sp(e.target.dataset.path!, e.target.value);
  onFocusF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { this._snap = { p: e.target.dataset.path!, v: e.target.value }; };
  esc(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === 'Escape' && this._snap && this._snap.p === (e.target as HTMLElement).dataset.path) {
      e.preventDefault(); this.sp(this._snap.p, this._snap.v); (e.target as HTMLInputElement).blur();
    }
  }
  onKeyS = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } else this.esc(e); };
  onKeyM = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => this.esc(e);
  doPrint = () => window.print();
  toggleMargins = () => this.setState(s => ({ showMargins: !s.showMargins }));
  rootRef = (el: HTMLDivElement | null) => { this._rootEl = el; };
  pageRef = (el: HTMLDivElement | null) => { this._pageEl = el; };
  startDrag = (dir: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    this._dragDir = dir;
    this._dragRect = this._pageEl!.getBoundingClientRect();
    window.addEventListener('mousemove', this.onDragMove);
    window.addEventListener('mouseup', this.onDragEnd);
  };
  onDragMove = (e: MouseEvent) => {
    if (!this._dragDir) return;
    const r = this._dragRect!; let val: number;
    if (this._dragDir === 'top') val = (e.clientY - r.top) / PX_PER_IN;
    else if (this._dragDir === 'bottom') val = (r.bottom - e.clientY) / PX_PER_IN;
    else if (this._dragDir === 'left') val = (e.clientX - r.left) / PX_PER_IN;
    else val = (r.right - e.clientX) / PX_PER_IN;
    val = Math.max(0.25, Math.min(2, Math.round(val * 20) / 20));
    const dir = this._dragDir;
    this.setState(s => ({ margins: { ...s.margins, [dir]: val } }));
  };
  onDragEnd = () => { this._dragDir = null; window.removeEventListener('mousemove', this.onDragMove); window.removeEventListener('mouseup', this.onDragEnd); };

  buildExportModel() {
    const D = this.state.data;
    const contacts = D.header.contacts.filter((c: any) => c.text && c.text.trim()).map((c: any) => ({ text: c.text, url: c.url || null }));
    const sections = D.sections.map((s: any) => ({
      title: s.title || '', kind: s.kind,
      body: s.kind === 'text' ? (s.body || '') : null,
      entries: s.kind === 'entries' ? s.entries.map((en: any) => ({
        title: en.title || '', subtitle: en.subtitle || '',
        dates: [this.fmt(en.start), this.fmt(en.end)].filter(Boolean).join(' – '),
        desc: en.desc || '', contribs: (en.contribs || []).filter((c: string) => c && c.trim()),
        link: en.link || null,
      })) : null,
    }));
    return { name: D.header.name || '', title: D.header.title || '', contacts, sections };
  }
  exportAccent() { const tpl = this.getTemplate(); return tpl.id === 'openSans' ? (this.props.accent ?? '#3E5C76') : (tpl.accent || '#3E5C76'); }

  exportPDF = async () => {
    let jsPDFCtor: any;
    try { ({ jsPDF: jsPDFCtor } = await import('jspdf')); } catch { jsPDFCtor = null; }
    if (!jsPDFCtor) { alert('PDF library failed to load — check your connection and try again.'); return; }
    const m = this.state.margins;
    const tpl = this.getTemplate();
    const baseFont = /georgia|times/i.test(tpl.font) ? 'times' : 'helvetica';
    const [ar, ag, ab] = hexToRgb(this.exportAccent());
    const model = this.buildExportModel();
    const doc = new jsPDFCtor({ unit: 'in', format: 'letter' });
    const pageW = 8.5, pageH = 11;
    const contentW = pageW - m.left - m.right;
    let y = m.top;
    const ensureRoom = (h: number) => { if (y + h > pageH - m.bottom) { doc.addPage(); y = m.top; } };
    const writeLines = (text: string, size: number, opts?: any) => {
      opts = opts || {};
      doc.setFont(baseFont, opts.style || 'normal');
      doc.setFontSize(size);
      doc.setTextColor(opts.color ? opts.color[0] : 40, opts.color ? opts.color[1] : 38, opts.color ? opts.color[2] : 34);
      const indent = opts.indent || 0;
      const lines = doc.splitTextToSize(text, contentW - indent);
      const lh = (size / 72) * 1.32;
      lines.forEach((line: string) => { ensureRoom(lh); doc.text(line, m.left + indent, y); y += lh; });
      y += (opts.gapAfter || 0);
    };
    doc.setFont(baseFont, 'bold'); doc.setFontSize(20); doc.setTextColor(30, 27, 22);
    ensureRoom(0.3); doc.text(model.name || 'Your name', m.left, y); y += 0.3;
    if (model.title) writeLines(model.title, 11, { color: [90, 90, 84], gapAfter: 0.06 });
    if (model.contacts.length) {
      doc.setFont(baseFont, 'normal'); doc.setFontSize(9.5); doc.setTextColor(70, 68, 65);
      let cx = m.left; ensureRoom(0.2);
      model.contacts.forEach((c: any, i: number) => {
        const sep = i < model.contacts.length - 1 ? '   ·   ' : '';
        if (c.url) doc.textWithLink(c.text, cx, y, { url: c.url }); else doc.text(c.text, cx, y);
        cx += doc.getTextWidth(c.text + sep);
      });
      y += 0.22;
    }
    y += 0.12;
    model.sections.forEach((sec: any) => {
      ensureRoom(0.25);
      doc.setDrawColor(ar, ag, ab);
      doc.setFont(baseFont, 'bold'); doc.setFontSize(9.5); doc.setTextColor(ar, ag, ab);
      doc.text((sec.title || '').toUpperCase(), m.left, y);
      doc.setLineWidth(0.01); doc.line(m.left, y + 0.05, pageW - m.right, y + 0.05);
      y += 0.2;
      if (sec.kind === 'text') {
        if (sec.body) writeLines(sec.body, 9.8, { color: [55, 52, 48], gapAfter: 0.14 });
      } else {
        (sec.entries || []).forEach((en: any) => {
          ensureRoom(0.2);
          doc.setFont(baseFont, 'bold'); doc.setFontSize(11); doc.setTextColor(35, 33, 30);
          doc.text(en.title || '', m.left, y);
          if (en.dates) { doc.setFont(baseFont, 'normal'); doc.setFontSize(9); doc.setTextColor(120, 116, 108); doc.text(en.dates, pageW - m.right, y, { align: 'right' }); }
          y += 0.17;
          if (en.subtitle) writeLines(en.subtitle, 9.5, { style: 'italic', color: [100, 96, 90], gapAfter: 0.04 });
          if (en.link) { doc.setFont(baseFont, 'normal'); doc.setTextColor(ar, ag, ab); doc.setFontSize(8.5); doc.textWithLink(en.link.text || en.link.url, m.left, y, { url: en.link.url }); y += 0.14; }
          if (en.desc) writeLines(en.desc, 9.5, { color: [55, 52, 48], gapAfter: 0.03 });
          en.contribs.forEach((c: string) => writeLines('•  ' + c, 9.5, { color: [55, 52, 48], indent: 0.12 }));
          y += 0.12;
        });
      }
    });
    doc.save((model.name || 'resume').trim().replace(/\s+/g, '_') + '.pdf');
  };

  exportDocx = async () => {
    let docxLib: any;
    try { docxLib = await import('docx'); } catch { docxLib = null; }
    if (!docxLib) { alert('DOCX library failed to load — check your connection and try again.'); return; }
    const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, BorderStyle, TabStopType } = docxLib;
    const m = this.state.margins;
    const tpl = this.getTemplate();
    const font = firstFont(tpl.font);
    const accentHex = this.exportAccent().replace('#', '');
    const model = this.buildExportModel();
    const twips = (inch: number) => Math.round(inch * 1440);
    const contentTwips = twips(8.5 - m.left - m.right);
    const children: any[] = [];
    children.push(new Paragraph({ children: [new TextRun({ text: model.name || 'Your name', bold: true, size: 40, font })], spacing: { after: 60 } }));
    if (model.title) children.push(new Paragraph({ children: [new TextRun({ text: model.title, size: 22, color: '5A5A54', font })], spacing: { after: 100 } }));
    if (model.contacts.length) {
      const runs: any[] = [];
      model.contacts.forEach((c: any, i: number) => {
        if (c.url) runs.push(new ExternalHyperlink({ link: c.url, children: [new TextRun({ text: c.text, size: 19, color: accentHex, font, underline: {} })] }));
        else runs.push(new TextRun({ text: c.text, size: 19, color: '46443E', font }));
        if (i < model.contacts.length - 1) runs.push(new TextRun({ text: '   ·   ', size: 19, color: '46443E', font }));
      });
      children.push(new Paragraph({ children: runs, spacing: { after: 200 } }));
    }
    model.sections.forEach((sec: any) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: (sec.title || '').toUpperCase(), bold: true, size: 19, color: accentHex, font })],
        spacing: { before: 160, after: 80 },
        border: { bottom: { color: 'E6E2DA', space: 4, style: BorderStyle.SINGLE, size: 4 } },
      }));
      if (sec.kind === 'text') {
        if (sec.body) children.push(new Paragraph({ children: [new TextRun({ text: sec.body, size: 20, font })], spacing: { after: 140 } }));
      } else {
        (sec.entries || []).forEach((en: any) => {
          const headerRuns = [new TextRun({ text: en.title || '', bold: true, size: 22, font })];
          if (en.dates) headerRuns.push(new TextRun({ text: '\t' + en.dates, size: 18, color: '78746C', font }));
          children.push(new Paragraph({ children: headerRuns, tabStops: [{ type: TabStopType.RIGHT, position: contentTwips }], spacing: { after: 20 } }));
          if (en.subtitle) children.push(new Paragraph({ children: [new TextRun({ text: en.subtitle, italics: true, size: 19, color: '64605A', font })], spacing: { after: 20 } }));
          if (en.link) children.push(new Paragraph({ children: [new ExternalHyperlink({ link: en.link.url, children: [new TextRun({ text: en.link.text || en.link.url, size: 17, color: accentHex, font, underline: {} })] })], spacing: { after: 40 } }));
          if (en.desc) children.push(new Paragraph({ children: [new TextRun({ text: en.desc, size: 19, font })], spacing: { after: 30 } }));
          en.contribs.forEach((c: string) => children.push(new Paragraph({ children: [new TextRun({ text: '•  ' + c, size: 19, font })], indent: { left: 180 }, spacing: { after: 20 } })));
          children.push(new Paragraph({ text: '', spacing: { after: 60 } }));
        });
      }
    });
    const doc = new Document({ sections: [{ properties: { page: { margin: { top: twips(m.top), right: twips(m.right), bottom: twips(m.bottom), left: twips(m.left) } } }, children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = (model.name || 'resume').trim().replace(/\s+/g, '_') + '.docx'; a.click();
    URL.revokeObjectURL(url);
  };
  closePop = () => this.setState({ pop: null });
  popKey = (e: React.KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); this.closePop(); } };
  moveSec(si: number, dir: number) {
    const j = si + dir;
    if (j < 0 || j >= this.state.data.sections.length) return;
    this.mut(d => { const s = d.sections.splice(si, 1)[0]; d.sections.splice(j, 0, s); });
  }
  hasContent(s: any) {
    if (s.kind === 'text') return !!(s.body && s.body.trim());
    return s.entries.some((en: any) => [en.title, en.subtitle, en.desc].some((x: string) => x && x.trim()) || en.start || en.end || en.link || (en.contribs || []).some((x: string) => x && x.trim()));
  }
  reqDelSec(e: React.MouseEvent, si: number) {
    const s = this.state.data.sections[si];
    if (this.hasContent(s)) {
      const { x, y } = this.anchor(e, 272, false);
      this.setState({ pop: { t: 'confirm', si, x, y } });
    } else this.mut(d => d.sections.splice(si, 1));
  }
  addEntry(si: number) { this.mut(d => d.sections[si].entries.push(this.blankEntry())); }
  delEntry(si: number, ei: number) { this.mut(d => d.sections[si].entries.splice(ei, 1)); }
  getTemplate() { return this.TEMPLATES.find(t => t.id === this.state.data.templateId) || this.TEMPLATES[0]; }
  setTemplate(id: string) { this.sp('templateId', id); this.setState({ pop: null }); }
  openTemplatePicker(e: React.MouseEvent) { const { x, y } = this.anchor(e, 300, true); this.setState({ pop: { t: 'template', x, y } }); }
  styleThumbFlags(entriesKind: boolean, sid: string) {
    return {
      cCl: !entriesKind && sid === 'classic', cSd: sid === 'side', cTn: sid === 'tinted',
      cEd: sid === 'editorial', cCe: sid === 'center', cPl: sid === 'pills',
      eCl: entriesKind && sid === 'classic', eTl: sid === 'timeline',
      eDl: sid === 'datesLeft', eCp: sid === 'compact', eCf: sid === 'companyFirst',
    };
  }
  openRestyle(e: React.MouseEvent, si: number) {
    const { x, y } = this.anchor(e, 320, true);
    this.setState({ pop: { t: 'restyle', si, x, y } });
  }
  addFromPicker(sid: string) {
    const P = this.state.pop;
    if (!P || !P.sel) return;
    const def = this.CAT.find(c => c.key === P.sel)!;
    const title = P.sel === 'custom' ? (P.title || '').trim() : def.label;
    if (!title) return;
    const type = P.sel === 'custom' ? 'custom' : P.sel;
    this.mut(d => d.sections.push(def.kind === 'entries'
      ? { id: this.uid(), type, kind: 'entries', style: sid, title, entries: [this.blankEntry()] }
      : { id: this.uid(), type, kind: 'text', style: sid, title, body: '' }));
    this.setState({ pop: null });
  }
  openDate(e: React.MouseEvent, si: number, ei: number, which: 'start' | 'end') {
    const ent = this.state.data.sections[si].entries[ei];
    const cur = ent[which], other = which === 'end' ? ent.start : ent.end;
    const vy = (cur && cur !== 'present' && cur.y) || (other && other !== 'present' && other.y) || 2026;
    const { x, y } = this.anchor(e, 256, true);
    this.setState({ pop: { t: 'date', si, ei, which, vy, err: null, x, y } });
  }
  pickMonth(m: number) {
    const p = this.state.pop;
    const cand = { y: p.vy, m };
    const ent = this.state.data.sections[p.si].entries[p.ei];
    const other = p.which === 'start' ? ent.end : ent.start;
    let err: string | null = null;
    if (other && other !== 'present') {
      if (p.which === 'end' && this.idx(cand) < this.idx(other)) err = 'End date can’t be before the start date.';
      if (p.which === 'start' && this.idx(cand) > this.idx(other)) err = 'Start date can’t be after the end date.';
    }
    if (err) { this.setState({ pop: { ...p, err } }); return; }
    this.spDate(cand);
  }
  spDate(v: any) {
    const p = this.state.pop;
    this.mut(d => { d.sections[p.si].entries[p.ei][p.which] = v; });
    this.setState({ pop: null });
  }
  normUrl(raw: string) {
    let u = String(raw || '').trim();
    if (!u || /\s/.test(u)) return null;
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u)) u = 'https://' + u;
    let p: URL; try { p = new URL(u); } catch { return null; }
    if (/^https?:$/.test(p.protocol) && !/^[^.]+(\.[^.]+)+$/.test(p.hostname)) return null;
    return u;
  }
  openLinkPop(e: React.MouseEvent, tgt: any) {
    const { x, y } = this.anchor(e, 308, false);
    let url = '', text = '', can = false;
    if (tgt.ci != null) {
      const c = this.state.data.header.contacts[tgt.ci];
      url = c.url || ''; text = c.text || ''; can = !!c.url;
    } else {
      const l = this.state.data.sections[tgt.si].entries[tgt.ei].link;
      if (l) { url = l.url; text = l.text; can = true; }
    }
    this.setState({ pop: { t: 'link', ...tgt, x, y, url, text, err: null, canRemove: can } });
  }
  saveLink() {
    const p = this.state.pop;
    const norm = this.normUrl(p.url);
    if (!norm) { this.setState({ pop: { ...p, err: 'Enter a valid URL (e.g. example.com/portfolio).' } }); return; }
    const txt = String(p.text || '').trim();
    const plain = norm.replace(/^https?:\/\//, '');
    this.mut(d => {
      if (p.ci != null) {
        const c = d.header.contacts[p.ci];
        c.url = norm;
        if (txt) c.text = txt; else if (!c.text.trim()) c.text = plain;
      } else {
        d.sections[p.si].entries[p.ei].link = { url: norm, text: txt || plain };
      }
    });
    this.setState({ pop: null });
  }
  removeLink() {
    const p = this.state.pop;
    this.mut(d => {
      if (p.ci != null) d.header.contacts[p.ci].url = null;
      else d.sections[p.si].entries[p.ei].link = null;
    });
    this.setState({ pop: null });
  }

  renderVals(): any {
    const D = this.state.data, P = this.state.pop;
    const acc = 'var(--acc,#3E5C76)';
    const mkC = (i: number) => {
      const c = D.header.contacts[i];
      return { isLink: !!c.url, noLink: !c.url, href: c.url || '', text: c.text,
        path: 'header.contacts.' + i + '.text', openLink: (e: React.MouseEvent) => this.openLinkPop(e, { ci: i }) };
    };
    const secs = D.sections.map((s: any, si: number) => {
      const st = s.style || 'classic';
      const v: any = {
        id: s.id, title: s.title, pTitle: 'sections.' + si + '.title',
        isText: s.kind === 'text', isEntries: s.kind === 'entries',
        headTop: s.kind === 'entries' || st === 'classic' || st === 'center' || st === 'pills',
        txtClassic: s.kind === 'text' && (st === 'classic' || st === 'center'),
        bodyAlign: st === 'center' ? 'center' : 'left',
        bodyColor: st === 'center' ? '#6B665E' : '#3B3833',
        txtSide: s.kind === 'text' && st === 'side',
        txtTinted: s.kind === 'text' && st === 'tinted',
        txtEditorial: s.kind === 'text' && st === 'editorial',
        txtPills: s.kind === 'text' && st === 'pills',
        entClassic: s.kind === 'entries' && st === 'classic',
        entTimeline: s.kind === 'entries' && st === 'timeline',
        entDatesLeft: s.kind === 'entries' && st === 'datesLeft',
        entCompact: s.kind === 'entries' && st === 'compact',
        entCompanyFirst: s.kind === 'entries' && st === 'companyFirst',
        entDisp: st === 'datesLeft' ? 'grid' : 'block',
        entRail: st === 'timeline' ? '2px solid #E6E2DA' : '0',
        entRailPad: st === 'timeline' ? '16px' : '0px',
        ectlLeft: st === 'timeline' ? '-58px' : '-42px',
        ectlPad: st === 'timeline' ? '36px' : '20px',
        up: () => this.moveSec(si, -1), down: () => this.moveSec(si, 1),
        upDis: si === 0, dnDis: si === D.sections.length - 1,
        del: (e: React.MouseEvent) => this.reqDelSec(e, si),
        openStyle: (e: React.MouseEvent) => this.openRestyle(e, si),
      };
      if (s.kind === 'text') {
        v.pBody = 'sections.' + si + '.body'; v.body = s.body;
        v.phBody = this.PHB[s.type] || this.PHB.custom;
        v.pills = (s.body || '').split(',').map((x: string) => x.trim()).filter(Boolean).map((t: string) => ({ t }));
        v.pillsEmpty = v.pills.length === 0;
        v.pillsEditing = this.state.editBody === s.id;
        v.pillsIdle = !v.pillsEditing;
        v.editPills = () => this.setState({ editBody: s.id });
        v.pillsBlur = () => this.setState({ editBody: null });
      } else {
        const ph = this.PHE[s.type] || ['Title', 'Organization', 'Description…'];
        v.addLbl = ({ experience: 'Add position', education: 'Add education', projects: 'Add project' } as Record<string, string>)[s.type] || 'Add entry';
        v.addEntry = () => this.addEntry(si);
        v.entries = s.entries.map((en: any, ei: number) => ({
          id: en.id, title: en.title, subtitle: en.subtitle, desc: en.desc,
          pT: 'sections.' + si + '.entries.' + ei + '.title',
          pS: 'sections.' + si + '.entries.' + ei + '.subtitle',
          pD: 'sections.' + si + '.entries.' + ei + '.desc',
          phT: ph[0], phS: ph[1], phD: ph[2],
          startLbl: this.fmt(en.start) || 'Start date', startCol: en.start ? '#6B665E' : '#A9A29A',
          endLbl: this.fmt(en.end) || 'End date', endCol: en.end ? '#6B665E' : '#A9A29A',
          openStart: (e: React.MouseEvent) => this.openDate(e, si, ei, 'start'),
          openEnd: (e: React.MouseEvent) => this.openDate(e, si, ei, 'end'),
          del: () => this.delEntry(si, ei),
          openLink: (e: React.MouseEvent) => this.openLinkPop(e, { si, ei }),
          hasLink: !!en.link, linkHref: en.link ? en.link.url : '', linkText: en.link ? en.link.text : '',
          hasContribs: (en.contribs || []).length > 0,
          addContrib: () => this.mut(d => { const t = d.sections[si].entries[ei]; if (!t.contribs) t.contribs = []; t.contribs.push(''); }),
          contribs: (en.contribs || []).map((c: string, ci: number) => ({
            id: en.id + '-c' + ci, val: c,
            path: 'sections.' + si + '.entries.' + ei + '.contribs.' + ci,
            del: () => this.mut(d => d.sections[si].entries[ei].contribs.splice(ci, 1)),
          })),
        }));
      }
      return v;
    });
    const fmtShortSel = D.dateFormat === 'MMM', fmtLongSel = !fmtShortSel;
    let dp: any = null;
    if (P && P.t === 'date') {
      const ent = D.sections[P.si].entries[P.ei];
      const cur = ent[P.which];
      dp = {
        x: P.x, y: P.y, year: String(P.vy), err: P.err || false, isEnd: P.which === 'end',
        prev: () => this.setState({ pop: { ...this.state.pop, vy: Math.max(1950, this.state.pop.vy - 1), err: null } }),
        next: () => this.setState({ pop: { ...this.state.pop, vy: Math.min(2040, this.state.pop.vy + 1), err: null } }),
        months: this.MS.map((lbl, i) => {
          const sel = cur && cur !== 'present' && cur.y === P.vy && cur.m === i + 1;
          return { lbl, bg: sel ? acc : 'transparent', fg: sel ? '#fff' : '#33302B', fw: sel ? 600 : 400, pick: () => this.pickMonth(i + 1) };
        }),
        clear: () => this.spDate(null),
        present: () => this.spDate('present'),
        presBg: cur === 'present' ? acc : 'color-mix(in oklab,' + acc + ' 10%,transparent)',
        presFg: cur === 'present' ? '#fff' : 'var(--acc,#3E5C76)',
      };
    }
    let lp: any = null;
    if (P && P.t === 'link') {
      lp = {
        x: P.x, y: P.y, url: P.url, text: P.text, err: P.err || false, canRemove: P.canRemove,
        heading: P.ci != null ? 'Link for ' + ['email', 'phone', 'location'][P.ci] : 'Entry link',
        onUrl: (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ pop: { ...this.state.pop, url: e.target.value, err: null } }),
        onText: (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ pop: { ...this.state.pop, text: e.target.value } }),
        save: () => this.saveLink(), remove: () => this.removeLink(),
      };
    }
    let cf: any = null;
    if (P && P.t === 'confirm') {
      const s = D.sections[P.si];
      const n = s.kind === 'entries' ? s.entries.length : 0;
      cf = {
        x: P.x, y: P.y,
        title: 'Delete ' + (s.title.trim() || 'this section') + '?',
        msg: s.kind === 'entries' ? (n + (n === 1 ? ' entry' : ' entries') + ' and their content will be lost.') : 'Its content will be lost.',
        confirm: () => { this.mut(d => d.sections.splice(P.si, 1)); this.setState({ pop: null }); },
      };
    }
    const addOpen = !!(P && P.t === 'add');
    let pickTypes: any[] = [], pickStyles: any[] = [], pickSel = false, pickIsCustom = false;
    if (addOpen) {
      pickSel = !!P.sel;
      pickIsCustom = P.sel === 'custom';
      pickTypes = this.CAT.map(c => {
        const dis = c.key !== 'custom' && D.sections.some((s: any) => s.type === c.key);
        const sel = P.sel === c.key;
        return { label: c.label, dis, note: dis ? 'Added' : '',
          bg: sel ? 'color-mix(in oklab,var(--acc,#3E5C76) 10%,transparent)' : 'transparent',
          fg: sel ? 'var(--acc,#3E5C76)' : '#33302B', fw: sel ? 600 : 400,
          pick: () => this.setState({ pop: { ...this.state.pop, sel: c.key } }) };
      });
      if (P.sel) {
        const def = this.CAT.find(c => c.key === P.sel)!;
        const ids = def.kind === 'entries' ? this.TSTYLES.entries : (this.TSTYLES[P.sel] || this.TSTYLES.custom);
        const noTitle = P.sel === 'custom' && !(P.title || '').trim();
        pickStyles = ids.map(sid => ({
          name: this.SNAMES[sid], dis: noTitle, sel: false, brd: '#E6E2DA', bgc: '#fff',
          pick: () => this.addFromPicker(sid),
          ...this.styleThumbFlags(def.kind === 'entries', sid),
        }));
      }
    }
    let rp: any = null;
    if (P && P.t === 'restyle') {
      const s = D.sections[P.si];
      const entriesKind = s.kind === 'entries';
      const ids = entriesKind ? this.TSTYLES.entries : (this.TSTYLES[s.type] || this.TSTYLES.custom);
      const curSt = s.style || 'classic';
      rp = {
        x: P.x, y: P.y, secTitle: (s.title || '').trim() || 'this section',
        styles: ids.map(sid => {
          const sel = sid === curSt;
          return {
            name: this.SNAMES[sid], sel,
            brd: sel ? 'var(--acc,#3E5C76)' : '#E6E2DA',
            bgc: sel ? 'color-mix(in oklab,var(--acc,#3E5C76) 4%,#fff)' : '#fff',
            pick: () => { this.mut(d => { d.sections[P.si].style = sid; }); this.setState({ pop: null }); },
            ...this.styleThumbFlags(entriesKind, sid),
          };
        }),
      };
    }
    let tp: any = null;
    if (P && P.t === 'template') {
      tp = {
        x: P.x, y: P.y,
        items: this.TEMPLATES.map(t => ({
          id: t.id, name: t.name, font: t.font,
          dot: t.accent || (this.props.accent ?? '#3E5C76'),
          sel: t.id === D.templateId,
          brd: t.id === D.templateId ? 'var(--acc,#3E5C76)' : '#E6E2DA',
          pick: () => this.setTemplate(t.id),
        })),
      };
    }
    const tpl = this.getTemplate();
    const tplAccent = tpl.accent || (this.props.accent ?? '#3E5C76');
    const hv = tpl.header;
    const mg = this.state.margins;
    return {
      accent: tplAccent, tplFont: tpl.font, tplName: tpl.name,
      showMargins: this.state.showMargins,
      pgPadTop: Math.round(mg.top * PX_PER_IN), pgPadRight: Math.round(mg.right * PX_PER_IN), pgPadBottom: Math.round(mg.bottom * PX_PER_IN), pgPadLeft: Math.round(mg.left * PX_PER_IN),
      mTop: mg.top.toFixed(2), mRight: mg.right.toFixed(2), mBottom: mg.bottom.toFixed(2), mLeft: mg.left.toFixed(2),
      dragTop: this.startDrag('top'), dragRight: this.startDrag('right'), dragBottom: this.startDrag('bottom'), dragLeft: this.startDrag('left'),
      toggleMargins: this.toggleMargins, marginsBtnLabel: this.state.showMargins ? 'Done' : 'Margins',
      marginsBtnBg: this.state.showMargins ? tplAccent : '#fff', marginsBtnFg: this.state.showMargins ? '#fff' : '#3F3B35',
      exportPDF: this.exportPDF, exportDocx: this.exportDocx,
      hdrStacked: hv !== 'split', hdrRow: hv === 'split',
      hdrAlign: hv === 'center' ? 'center' : 'left',
      hdrContactsJustify: hv === 'center' ? 'center' : 'flex-start',
      hdrBg: hv === 'banner' ? tplAccent : 'transparent',
      hdrPad: hv === 'banner' ? '18px 22px 16px' : '0',
      hdrRadius: hv === 'banner' ? '10px' : '0',
      hdrGap: hv === 'banner' ? '14px' : '16px',
      hdrNameColor: hv === 'banner' ? '#ffffff' : '#26231F',
      hdrTitleColor: hv === 'banner' ? 'rgba(255,255,255,.82)' : '#6B665E',
      openTemplatePicker: (e: React.MouseEvent) => this.openTemplatePicker(e), tpOpen: !!tp, tp,
      rpOpen: !!rp, rp,
      showAllCls: this.props.alwaysShowControls ? 'showall' : '',
      d: D, c0: mkC(0), c1: mkC(1), c2: mkC(2), secs,
      doPrint: this.doPrint, closePop: this.closePop, popKey: this.popKey,
      fmtShortSel, fmtLongSel,
      fsBg: fmtShortSel ? acc : 'transparent', fsFg: fmtShortSel ? '#fff' : '#6B665E', fsFw: fmtShortSel ? 600 : 400,
      flBg: fmtLongSel ? acc : 'transparent', flFg: fmtLongSel ? '#fff' : '#6B665E', flFw: fmtLongSel ? 600 : 400,
      setFmtS: () => this.sp('dateFormat', 'MMM'), setFmtL: () => this.sp('dateFormat', 'MMMM'),
      anyPop: !!P,
      dpOpen: !!dp, dp, lpOpen: !!lp, lp, cfOpen: !!cf, cf,
      lpKeySave: (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); this.saveLink(); } },
      addOpen, pickTypes, pickStyles, pickSel, pickIsCustom,
      pickNone: addOpen && !pickSel,
      addTitle: (P && P.title) || '',
      onAddTitle: (e: React.ChangeEvent<HTMLInputElement>) => this.setState({ pop: { ...this.state.pop, title: e.target.value } }),
      addKey: (e: React.KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); this.closePop(); } },
      openAdd: () => this.setState({ pop: { t: 'add', sel: null, title: '' } }),
    };
  }

  /** A contact chip: either a rendered anchor or an editable input, plus its link control. */
  private renderContact(c: any, placeholder: string, label: string) {
    const { onEdit, onFocusF, onKeyS } = this;
    return (
      <span className="citem" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        {c.isLink && <a href={c.href} target="_blank" rel="noopener" style={{ display: 'inline-block', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>{c.text}</a>}
        {c.noLink && <input data-path={c.path} value={c.text} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={placeholder} aria-label={label} style={{ minWidth: '36px' }} />}
        <button className="lctl hv-link" onClick={c.openLink} aria-label={`Edit link for ${label.toLowerCase()}`} title="Add or edit link" style={{ width: '20px', height: '20px', display: 'grid', placeItems: 'center', borderRadius: '5px', color: '#948E84' }}>{LINK_ICON}</button>
      </span>
    );
  }

  private renderDateRange(ent: any, fontSize: string, gap: string, extra?: React.CSSProperties) {
    return (
      <span style={{ whiteSpace: 'nowrap', fontSize, display: 'inline-flex', alignItems: 'baseline', gap, ...extra }}>
        <button onClick={ent.openStart} title="Set start date" className="hv-link" style={{ color: ent.startCol, borderRadius: '4px', padding: '0 2px' }}>{ent.startLbl}</button>
        <span style={{ color: '#B5AFA5' }}>–</span>
        <button onClick={ent.openEnd} title="Set end date" className="hv-link" style={{ color: ent.endCol, borderRadius: '4px', padding: '0 2px' }}>{ent.endLbl}</button>
      </span>
    );
  }

  private renderEntry(s: any, ent: any) {
    const { onEdit, onFocusF, onKeyS, onKeyM } = this;
    return (
      <div className="ent" style={{ position: 'relative', marginTop: '16px', display: s.entDisp, gridTemplateColumns: '112px 1fr', gap: '0 14px' }}>
        <div className="ectls" style={{ position: 'absolute', left: s.ectlLeft, top: '0', display: 'flex', flexDirection: 'column', gap: '2px', padding: `2px ${s.ectlPad} 6px 0` }}>
          <button onClick={ent.openLink} aria-label="Add or edit entry link" title="Add or edit link" className="hv-ctl" style={{ width: '22px', height: '22px', display: 'grid', placeItems: 'center', borderRadius: '6px', color: '#8A857D' }}>{LINK_ICON}</button>
          <button onClick={ent.del} aria-label="Delete entry" title="Delete entry" className="hv-ctl-del" style={{ width: '22px', height: '22px', display: 'grid', placeItems: 'center', borderRadius: '6px', color: '#8A857D' }}>{TRASH_ICON}</button>
        </div>
        {s.entTimeline && <span style={{ position: 'absolute', left: '-21px', top: '5px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--acc,#3E5C76)' }} />}
        {s.entDatesLeft && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', fontSize: '12px', paddingTop: '3px' }}>
            <button onClick={ent.openStart} title="Set start date" className="hv-link" style={{ color: ent.startCol, borderRadius: '4px', padding: '0 2px' }}>{ent.startLbl}</button>
            <button onClick={ent.openEnd} title="Set end date" className="hv-link" style={{ color: ent.endCol, borderRadius: '4px', padding: '0 2px' }}>{ent.endLbl}</button>
          </div>
        )}
        <div style={{ minWidth: '0' }}>
          {s.entClassic && (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
                <input data-path={ent.pT} value={ent.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phT} aria-label="Entry title" style={{ flex: '1', minWidth: '60px', fontSize: '15px', fontWeight: '600', color: '#2E2B26' }} />
                {this.renderDateRange(ent, '12.5px', '5px')}
              </div>
              <input data-path={ent.pS} value={ent.subtitle} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phS} aria-label="Organization" style={{ display: 'block', width: '100%', fontSize: '13.5px', color: '#6B665E', marginTop: '3px' }} />
            </>
          )}
          {s.entTimeline && (
            <>
              <div style={{ fontSize: '11.5px', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <button onClick={ent.openStart} title="Set start date" className="hv-link" style={{ color: ent.startCol, borderRadius: '4px', padding: '0 2px' }}>{ent.startLbl}</button>
                <span style={{ color: '#B5AFA5' }}>–</span>
                <button onClick={ent.openEnd} title="Set end date" className="hv-link" style={{ color: ent.endCol, borderRadius: '4px', padding: '0 2px' }}>{ent.endLbl}</button>
              </div>
              <input data-path={ent.pT} value={ent.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phT} aria-label="Entry title" style={{ display: 'block', width: '100%', fontSize: '15px', fontWeight: '600', color: '#2E2B26', marginTop: '2px' }} />
              <input data-path={ent.pS} value={ent.subtitle} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phS} aria-label="Organization" style={{ display: 'block', width: '100%', fontSize: '13px', color: '#6B665E', marginTop: '2px' }} />
            </>
          )}
          {s.entDatesLeft && (
            <>
              <input data-path={ent.pT} value={ent.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phT} aria-label="Entry title" style={{ display: 'block', width: '100%', fontSize: '15px', fontWeight: '600', color: '#2E2B26' }} />
              <input data-path={ent.pS} value={ent.subtitle} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phS} aria-label="Organization" style={{ display: 'block', width: '100%', fontSize: '13px', color: '#6B665E', marginTop: '2px' }} />
            </>
          )}
          {s.entCompact && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <input data-path={ent.pT} value={ent.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phT} aria-label="Entry title" style={{ minWidth: '60px', fontSize: '14px', fontWeight: '600', color: '#2E2B26' }} />
              <input data-path={ent.pS} value={ent.subtitle} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phS} aria-label="Organization" style={{ flex: '1', minWidth: '90px', fontSize: '13px', color: '#6B665E' }} />
              {this.renderDateRange(ent, '12px', '5px', { marginLeft: 'auto' })}
            </div>
          )}
          {s.entCompanyFirst && (
            <>
              <input data-path={ent.pS} value={ent.subtitle} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phS} aria-label="Organization" style={{ display: 'block', width: '100%', fontSize: '11px', fontWeight: '700', letterSpacing: '.11em', textTransform: 'uppercase', color: 'var(--acc,#3E5C76)' }} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '2px' }}>
                <input data-path={ent.pT} value={ent.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder={ent.phT} aria-label="Entry title" style={{ flex: '1', minWidth: '60px', fontSize: '15px', fontWeight: '700', color: '#26231F' }} />
                {this.renderDateRange(ent, '12.5px', '5px')}
              </div>
            </>
          )}
          {ent.hasLink && (
            <div style={{ marginTop: '4px', fontSize: '12.5px' }}><a href={ent.linkHref} target="_blank" rel="noopener" style={{ display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>{ent.linkText}</a></div>
          )}
          <textarea data-path={ent.pD} value={ent.desc} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} placeholder={ent.phD} aria-label="Description" rows={1} style={{ width: '100%', marginTop: '6px', fontSize: '13.5px', lineHeight: '1.6', color: '#3B3833', textWrap: 'pretty' }} />
          {ent.hasContribs && (
            <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {ent.contribs.map((cb: any) => (
                <div key={cb.id} className="cbrow" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', paddingLeft: '2px' }}>
                  <span style={{ color: 'var(--acc,#3E5C76)', fontSize: '13px', lineHeight: '1.6' }}>•</span>
                  <input data-path={cb.path} value={cb.val} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Contribution or achievement…" aria-label="Contribution" style={{ flex: '1', minWidth: '60px', fontSize: '13.5px', lineHeight: '1.6', color: '#3B3833' }} />
                  <button className="cbdel hv-ctl-del" onClick={cb.del} aria-label="Delete contribution" title="Delete contribution" style={{ width: '18px', height: '18px', display: 'grid', placeItems: 'center', borderRadius: '5px', color: '#948E84', alignSelf: 'center' }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 2l6 6M8 2l-6 6" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <button className="adde hv-add-contrib" onClick={ent.addContrib} style={{ marginTop: '4px', fontSize: '11.5px', fontWeight: '600', color: '#8A857C', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 6px', borderRadius: '5px' }}>+ Add contribution</button>
        </div>
      </div>
    );
  }

  private renderSection(s: any) {
    const { onEdit, onFocusF, onKeyS, onKeyM } = this;
    return (
      <section className="sec" style={{ position: 'relative', marginTop: '30px' }}>
        <div className="sctls" style={{ position: 'absolute', right: '-4px', top: '-2px', display: 'flex', flexDirection: 'row', gap: '2px', padding: '2px 0 18px 16px' }}>
          <button onClick={s.openStyle} aria-label="Change section style" title="Change section style" className="hv-ctl" style={{ width: '22px', height: '22px', display: 'grid', placeItems: 'center', borderRadius: '6px', color: '#8A857D' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><rect x="1.3" y="1.3" width="4" height="4" rx="0.8" /><rect x="6.7" y="1.3" width="4" height="4" rx="0.8" /><rect x="1.3" y="6.7" width="4" height="4" rx="0.8" /><rect x="6.7" y="6.7" width="4" height="4" rx="0.8" /></svg>
          </button>
          <button onClick={s.up} disabled={s.upDis} aria-label="Move section up" title="Move up" className="hv-ctl" style={{ width: '22px', height: '22px', display: 'grid', placeItems: 'center', borderRadius: '6px', color: '#8A857D' }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5 6 4l3.5 3.5" /></svg>
          </button>
          <button onClick={s.down} disabled={s.dnDis} aria-label="Move section down" title="Move down" className="hv-ctl" style={{ width: '22px', height: '22px', display: 'grid', placeItems: 'center', borderRadius: '6px', color: '#8A857D' }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
          </button>
          <button onClick={s.del} aria-label="Delete section" title="Delete section" className="hv-ctl-del" style={{ width: '22px', height: '22px', display: 'grid', placeItems: 'center', borderRadius: '6px', color: '#8A857D' }}>{TRASH_ICON}</button>
        </div>

        {s.headTop && (
          <div style={{ borderBottom: '1px solid #E6E2DA', paddingBottom: '5px' }}>
            <input data-path={s.pTitle} value={s.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Section title" aria-label="Section title" style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--acc,#3E5C76)', minWidth: '90px', maxWidth: '100%' }} />
          </div>
        )}
        {s.txtClassic && (
          <textarea data-path={s.pBody} value={s.body} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} placeholder={s.phBody} aria-label="Section text" rows={1} style={{ width: '100%', marginTop: '9px', fontSize: '13.5px', lineHeight: '1.62', color: s.bodyColor, textAlign: s.bodyAlign, textWrap: 'pretty' }} />
        )}
        {s.txtSide && (
          <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', gap: '18px', marginTop: '4px' }}>
            <input data-path={s.pTitle} value={s.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Section title" aria-label="Section title" style={{ width: '100%', alignSelf: 'start', paddingTop: '3px', fontSize: '11.5px', fontWeight: '700', letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--acc,#3E5C76)' }} />
            <textarea data-path={s.pBody} value={s.body} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} placeholder={s.phBody} aria-label="Section text" rows={1} style={{ width: '100%', fontSize: '13.5px', lineHeight: '1.62', color: '#3B3833', textWrap: 'pretty' }} />
          </div>
        )}
        {s.txtTinted && (
          <div style={{ background: 'color-mix(in oklab,var(--acc,#3E5C76) 5%,#fff)', borderRadius: '8px', padding: '14px 16px', marginTop: '6px' }}>
            <input data-path={s.pTitle} value={s.title} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyS} placeholder="Section title" aria-label="Section title" style={{ display: 'block', width: '100%', fontSize: '10.5px', fontWeight: '700', letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--acc,#3E5C76)' }} />
            <textarea data-path={s.pBody} value={s.body} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} placeholder={s.phBody} aria-label="Section text" rows={1} style={{ width: '100%', marginTop: '6px', fontSize: '13px', lineHeight: '1.6', color: '#3B3833', textWrap: 'pretty' }} />
          </div>
        )}
        {s.txtEditorial && (
          <div style={{ borderTop: '1px solid #E6E2DA', borderBottom: '1px solid #E6E2DA', padding: '12px 0', marginTop: '6px' }}>
            <textarea data-path={s.pBody} value={s.body} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} placeholder={s.phBody} aria-label="Section text" rows={1} style={{ width: '100%', fontSize: '15px', lineHeight: '1.6', color: '#26231F', textWrap: 'pretty' }} />
          </div>
        )}
        {s.txtPills && (
          <>
            {s.pillsEditing && (
              <textarea data-path={s.pBody} value={s.body} onChange={onEdit} onFocus={onFocusF} onKeyDown={onKeyM} onBlur={s.pillsBlur} autoFocus placeholder={s.phBody} aria-label="Section text" rows={1} style={{ width: '100%', marginTop: '9px', fontSize: '13.5px', lineHeight: '1.62', color: '#3B3833' }} />
            )}
            {s.pillsIdle && (
              <div role="button" tabIndex={0} onClick={s.editPills} onFocus={s.editPills} aria-label="Edit list (comma-separated)" title="Click to edit" style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '11px', cursor: 'text', minHeight: '24px', borderRadius: '4px' }}>
                {s.pills.map((pl: any, i: number) => (
                  <span key={i} style={{ border: '1px solid #D8D4CC', borderRadius: '999px', padding: '4px 11px', fontSize: '11.5px', color: '#3B3833' }}>{pl.t}</span>
                ))}
                {s.pillsEmpty && <span style={{ fontSize: '13.5px', color: '#A9A29A', padding: '4px 0' }}>{s.phBody}</span>}
              </div>
            )}
          </>
        )}
        {s.isEntries && (
          <>
            <div style={{ borderLeft: s.entRail, paddingLeft: s.entRailPad }}>
              {s.entries.map((ent: any) => <React.Fragment key={ent.id}>{this.renderEntry(s, ent)}</React.Fragment>)}
            </div>
            {/* The label is its own element on purpose: this button is an inline-flex box with
                `gap: 5px`, so "+" and the label must be two flex items for the gap to apply. */}
            <button className="adde hv-add-entry" onClick={s.addEntry} style={{ marginTop: '12px', fontSize: '12.5px', fontWeight: '600', color: 'var(--acc,#3E5C76)', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 6px', borderRadius: '6px' }}>{'+ '}<span>{s.addLbl}</span></button>
          </>
        )}
      </section>
    );
  }

  render() {
    const v = this.renderVals();
    return (
      <div className={`ire rzr ${v.showAllCls}`} ref={this.rootRef} style={{ minHeight: '100vh', position: 'relative', padding: '34px 24px 90px', ['--acc' as string]: v.accent }}>
        <div className="no-print" style={{ width: '794px', maxWidth: '100%', margin: '0 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px', fontSize: '12.5px', color: '#6B665E' }}>
          <span>Template</span>
          <button onClick={v.openTemplatePicker} className="hv-soft" style={{ padding: '5px 12px', border: '1px solid #DDD8CF', borderRadius: '7px', background: '#fff', fontWeight: '600', color: '#3F3B35' }}>{v.tplName}</button>
          <span>Dates</span>
          <div style={{ display: 'flex', border: '1px solid #DDD8CF', borderRadius: '7px', overflow: 'hidden', background: '#fff' }}>
            <button onClick={v.setFmtS} aria-pressed={v.fmtShortSel} style={{ padding: '5px 11px', fontSize: '12.5px', background: v.fsBg, color: v.fsFg, fontWeight: v.fsFw }}>Jan 2026</button>
            <button onClick={v.setFmtL} aria-pressed={v.fmtLongSel} style={{ padding: '5px 11px', fontSize: '12.5px', background: v.flBg, color: v.flFg, fontWeight: v.flFw }}>January 2026</button>
          </div>
          <button onClick={v.toggleMargins} className="hv-soft" style={{ padding: '5px 12px', border: '1px solid #DDD8CF', borderRadius: '7px', background: v.marginsBtnBg, color: v.marginsBtnFg, fontWeight: '600' }}>{v.marginsBtnLabel}</button>
          <button onClick={v.exportPDF} className="hv-soft" style={{ padding: '5px 12px', border: '1px solid #DDD8CF', borderRadius: '7px', background: '#fff' }}>Export PDF</button>
          <button onClick={v.exportDocx} className="hv-soft" style={{ padding: '5px 12px', border: '1px solid #DDD8CF', borderRadius: '7px', background: '#fff' }}>Export Word</button>
          <button onClick={v.doPrint} className="hv-soft" style={{ padding: '5px 12px', border: '1px solid #DDD8CF', borderRadius: '7px', background: '#fff' }}>Print</button>
        </div>

        <div className="pg" ref={this.pageRef} style={{ width: '794px', maxWidth: '100%', boxSizing: 'border-box', margin: '14px auto 0', background: '#fff', boxShadow: '0 1px 2px rgba(30,27,22,.05),0 16px 40px -18px rgba(30,27,22,.22)', padding: `${v.pgPadTop}px ${v.pgPadRight}px ${v.pgPadBottom}px ${v.pgPadLeft}px`, position: 'relative', fontFamily: v.tplFont }}>
          {v.showMargins && (
            <>
              <div style={{ position: 'absolute', top: `${v.pgPadTop}px`, left: '0', right: '0', height: '0', borderTop: '1px dashed var(--acc,#3E5C76)', pointerEvents: 'none', zIndex: '5' }} />
              <div onMouseDown={v.dragTop} title="Drag to set top margin" style={{ position: 'absolute', top: `${v.pgPadTop}px`, left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'auto', cursor: 'ns-resize', background: 'var(--acc,#3E5C76)', color: '#fff', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '999px', zIndex: '6', whiteSpace: 'nowrap' }}>Top {v.mTop}&quot;</div>
              <div style={{ position: 'absolute', bottom: `${v.pgPadBottom}px`, left: '0', right: '0', height: '0', borderTop: '1px dashed var(--acc,#3E5C76)', pointerEvents: 'none', zIndex: '5' }} />
              <div onMouseDown={v.dragBottom} title="Drag to set bottom margin" style={{ position: 'absolute', bottom: `${v.pgPadBottom}px`, left: '50%', transform: 'translate(-50%,50%)', pointerEvents: 'auto', cursor: 'ns-resize', background: 'var(--acc,#3E5C76)', color: '#fff', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '999px', zIndex: '6', whiteSpace: 'nowrap' }}>Bottom {v.mBottom}&quot;</div>
              <div style={{ position: 'absolute', left: `${v.pgPadLeft}px`, top: '0', bottom: '0', width: '0', borderLeft: '1px dashed var(--acc,#3E5C76)', pointerEvents: 'none', zIndex: '5' }} />
              <div onMouseDown={v.dragLeft} title="Drag to set left margin" style={{ position: 'absolute', left: `${v.pgPadLeft}px`, top: `calc(${v.pgPadTop}px / 2)`, transform: 'translate(-50%,-50%)', pointerEvents: 'auto', cursor: 'ew-resize', background: 'var(--acc,#3E5C76)', color: '#fff', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '999px', zIndex: '6', whiteSpace: 'nowrap' }}>Left {v.mLeft}&quot;</div>
              <div style={{ position: 'absolute', right: `${v.pgPadRight}px`, top: '0', bottom: '0', width: '0', borderLeft: '1px dashed var(--acc,#3E5C76)', pointerEvents: 'none', zIndex: '5' }} />
              <div onMouseDown={v.dragRight} title="Drag to set right margin" style={{ position: 'absolute', right: `${v.pgPadRight}px`, top: `calc(${v.pgPadTop}px / 2)`, transform: 'translate(50%,-50%)', pointerEvents: 'auto', cursor: 'ew-resize', background: 'var(--acc,#3E5C76)', color: '#fff', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '999px', zIndex: '6', whiteSpace: 'nowrap' }}>Right {v.mRight}&quot;</div>
            </>
          )}

          <div style={{ background: v.hdrBg, padding: v.hdrPad, borderRadius: v.hdrRadius, marginBottom: v.hdrGap }}>
            {v.hdrStacked && (
              <>
                <input data-path="header.name" value={v.d.header.name} onChange={this.onEdit} onFocus={this.onFocusF} onKeyDown={this.onKeyS} placeholder="Your name" aria-label="Name" style={{ display: 'block', width: '100%', fontSize: '33px', fontWeight: '700', letterSpacing: '-.015em', color: v.hdrNameColor, lineHeight: '1.15', textAlign: v.hdrAlign }} />
                <input data-path="header.title" value={v.d.header.title} onChange={this.onEdit} onFocus={this.onFocusF} onKeyDown={this.onKeyS} placeholder="Professional title" aria-label="Professional title" style={{ display: 'block', width: '100%', fontSize: '15px', color: v.hdrTitleColor, marginTop: '5px', textAlign: v.hdrAlign }} />
              </>
            )}
            {v.hdrRow && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '14px' }}>
                <input data-path="header.name" value={v.d.header.name} onChange={this.onEdit} onFocus={this.onFocusF} onKeyDown={this.onKeyS} placeholder="Your name" aria-label="Name" style={{ flex: '1', minWidth: '0', fontSize: '29px', fontWeight: '700', letterSpacing: '-.015em', color: v.hdrNameColor }} />
                <input data-path="header.title" value={v.d.header.title} onChange={this.onEdit} onFocus={this.onFocusF} onKeyDown={this.onKeyS} placeholder="Professional title" aria-label="Professional title" style={{ flex: 'none', textAlign: 'right', fontSize: '14px', color: v.hdrTitleColor }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: v.hdrContactsJustify, columnGap: '9px', rowGap: '4px', fontSize: '13px', color: '#4C4841' }}>
            {this.renderContact(v.c0, 'Email', 'Email')}
            <span style={{ color: '#C9C4BB' }}>·</span>
            {this.renderContact(v.c1, 'Phone', 'Phone')}
            <span style={{ color: '#C9C4BB' }}>·</span>
            {this.renderContact(v.c2, 'City, State', 'Location')}
          </div>

          {v.secs.map((s: any) => <React.Fragment key={s.id}>{this.renderSection(s)}</React.Fragment>)}

          <div style={{ position: 'relative', marginTop: '34px' }}>
            <button className="adds hv-add-section" onClick={v.openAdd} style={{ width: '100%', padding: '9px', border: '1px dashed #D5D0C6', borderRadius: '8px', color: '#8A857C', fontSize: '12.5px', fontWeight: '600', background: 'none' }}>+ Add section</button>
            {v.addOpen && (
              <div className="pop" role="dialog" aria-label="Add section" onKeyDown={v.addKey} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '46px', zIndex: '50', width: '560px', maxWidth: '96%', boxSizing: 'border-box', background: '#fff', border: '1px solid #E2DDD4', borderRadius: '12px', boxShadow: '0 14px 40px -12px rgba(30,27,22,.3)', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '2px 4px 9px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#54504A' }}>Add a section</div>
                  <div style={{ fontSize: '11px', color: '#9A948A' }}>Pick a section, then a style</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                  <div style={{ width: '152px', flex: 'none', display: 'flex', flexDirection: 'column', gap: '1px', borderRight: '1px solid #F0EDE7', paddingRight: '10px' }}>
                    {v.pickTypes.map((it: any, i: number) => (
                      <button key={i} onClick={it.pick} disabled={it.dis} className="hv-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px', width: '100%', textAlign: 'left', padding: '6px 8px', borderRadius: '6px', fontSize: '12.5px', background: it.bg, color: it.fg, fontWeight: it.fw }}><span>{it.label}</span><span style={{ fontSize: '10.5px', color: '#A9A29A', flex: 'none' }}>{it.note}</span></button>
                    ))}
                  </div>
                  <div style={{ flex: '1', minWidth: '0' }}>
                    {v.pickNone && (
                      <div style={{ minHeight: '180px', height: '100%', display: 'grid', placeItems: 'center', fontSize: '12px', color: '#A9A29A', textAlign: 'center', padding: '0 24px', lineHeight: '1.5' }}>Select a section on the left to preview its styles</div>
                    )}
                    {v.pickIsCustom && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <input value={v.addTitle} onChange={v.onAddTitle} autoFocus placeholder="Section title" aria-label="Custom section title" className="fc-field" style={{ flex: '1', minWidth: '0', fieldSizing: 'fixed', border: '1px solid #D8D3CA', borderRadius: '6px', padding: '6px 9px', margin: '0', fontSize: '13px', background: '#fff' } as React.CSSProperties} />
                        <span style={{ fontSize: '11px', color: '#9A948A', flex: 'none' }}>then pick a style</span>
                      </div>
                    )}
                    {v.pickSel && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '8px' }}>
                        {v.pickStyles.map((st: any, i: number) => (
                          <button key={i} onClick={st.pick} disabled={st.dis} title="Add with this style" className="hv-style-card" style={{ textAlign: 'left', border: `1px solid ${st.brd}`, borderRadius: '8px', padding: '9px 10px', background: st.bgc }}>
                            <StyleThumb st={st} />
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#54504A' }}>{st.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="no-print" style={{ width: '794px', maxWidth: '100%', margin: '16px auto 0', fontSize: '11.5px', color: '#9A948A', lineHeight: '1.65', textAlign: 'center' }}>Mockup notes — editing controls appear on hover or keyboard focus (or turn on “Always show controls” in Tweaks). The month picker stands in for react-datepicker’s showMonthYearPicker. Printing hides all editing UI.</div>

        {v.anyPop && <div style={{ position: 'fixed', inset: '0', zIndex: '40' }} onClick={v.closePop} />}

        {v.dpOpen && (
          <div className="pop" role="dialog" aria-label="Choose month and year" onKeyDown={v.popKey} style={{ position: 'absolute', zIndex: '50', left: `${v.dp.x}px`, top: `${v.dp.y}px`, width: '256px', boxSizing: 'border-box', background: '#fff', border: '1px solid #E2DDD4', borderRadius: '10px', boxShadow: '0 12px 34px -10px rgba(30,27,22,.3)', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={v.dp.prev} aria-label="Previous year" className="hv-list-item" style={{ width: '24px', height: '24px', display: 'grid', placeItems: 'center', borderRadius: '6px', color: '#6B665E' }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 2.5 4 6l3.5 3.5" /></svg>
              </button>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#2E2B26' }}>{v.dp.year}</span>
              <button onClick={v.dp.next} aria-label="Next year" className="hv-list-item" style={{ width: '24px', height: '24px', display: 'grid', placeItems: 'center', borderRadius: '6px', color: '#6B665E' }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 2.5 8 6 4.5 9.5" /></svg>
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '4px', marginTop: '10px' }}>
              {v.dp.months.map((m: any, i: number) => (
                <button key={i} onClick={m.pick} className="hv-month" style={{ padding: '7px 0', borderRadius: '6px', fontSize: '12.5px', background: m.bg, color: m.fg, fontWeight: m.fw }}>{m.lbl}</button>
              ))}
            </div>
            {v.dp.err && <div role="alert" style={{ marginTop: '9px', fontSize: '12px', color: '#B04A42', lineHeight: '1.45' }}>{v.dp.err}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '11px' }}>
              <button onClick={v.dp.clear} className="hv-muted" style={{ fontSize: '12.5px', color: '#8A857C', padding: '4px 8px', borderRadius: '6px' }}>Clear</button>
              {v.dp.isEnd && (
                <button onClick={v.dp.present} className="hv-b105" style={{ fontSize: '12.5px', fontWeight: '600', padding: '4px 12px', borderRadius: '6px', background: v.dp.presBg, color: v.dp.presFg }}>Present</button>
              )}
            </div>
          </div>
        )}

        {v.lpOpen && (
          <div className="pop" role="dialog" aria-label="Edit link" onKeyDown={v.popKey} style={{ position: 'absolute', zIndex: '50', left: `${v.lp.x}px`, top: `${v.lp.y}px`, width: '308px', boxSizing: 'border-box', background: '#fff', border: '1px solid #E2DDD4', borderRadius: '10px', boxShadow: '0 12px 34px -10px rgba(30,27,22,.3)', padding: '13px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#54504A' }}>{v.lp.heading}</div>
            <label style={{ display: 'block', marginTop: '9px', fontSize: '11.5px', fontWeight: '600', color: '#8A857C' }}>URL
              <input value={v.lp.url} onChange={v.lp.onUrl} onKeyDown={v.lpKeySave} autoFocus placeholder="example.com/portfolio" className="fc-field" style={{ display: 'block', width: '100%', boxSizing: 'border-box', margin: '3px 0 0', fieldSizing: 'fixed', border: '1px solid #D8D3CA', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', fontWeight: '400', background: '#fff' } as React.CSSProperties} />
            </label>
            <label style={{ display: 'block', marginTop: '8px', fontSize: '11.5px', fontWeight: '600', color: '#8A857C' }}>Display text <span style={{ fontWeight: '400' }}>(optional — defaults to the URL)</span>
              <input value={v.lp.text} onChange={v.lp.onText} onKeyDown={v.lpKeySave} placeholder="Defaults to the URL" className="fc-field" style={{ display: 'block', width: '100%', boxSizing: 'border-box', margin: '3px 0 0', fieldSizing: 'fixed', border: '1px solid #D8D3CA', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', fontWeight: '400', background: '#fff' } as React.CSSProperties} />
            </label>
            {v.lp.err && <div role="alert" style={{ marginTop: '8px', fontSize: '12px', color: '#B04A42', lineHeight: '1.45' }}>{v.lp.err}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <button onClick={v.lp.save} className="hv-b108" style={{ background: 'var(--acc,#3E5C76)', color: '#fff', borderRadius: '6px', padding: '5px 13px', fontSize: '12.5px', fontWeight: '600' }}>Save</button>
              {v.lp.canRemove && <button onClick={v.lp.remove} className="hv-remove" style={{ color: '#B04A42', fontSize: '12.5px', fontWeight: '600', padding: '5px 8px', borderRadius: '6px' }}>Remove</button>}
              <button onClick={v.closePop} className="hv-muted" style={{ marginLeft: 'auto', color: '#8A857C', fontSize: '12.5px', padding: '5px 8px', borderRadius: '6px' }}>Cancel</button>
            </div>
          </div>
        )}

        {v.cfOpen && (
          <div className="pop" role="alertdialog" aria-label="Confirm delete" onKeyDown={v.popKey} style={{ position: 'absolute', zIndex: '50', left: `${v.cf.x}px`, top: `${v.cf.y}px`, width: '272px', boxSizing: 'border-box', background: '#fff', border: '1px solid #E2DDD4', borderRadius: '10px', boxShadow: '0 12px 34px -10px rgba(30,27,22,.3)', padding: '13px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#2E2B26' }}>{v.cf.title}</div>
            <div style={{ marginTop: '4px', fontSize: '12.5px', color: '#6B665E', lineHeight: '1.5' }}>{v.cf.msg}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <button onClick={v.closePop} autoFocus className="hv-plain" style={{ color: '#54504A', fontSize: '12.5px', padding: '5px 10px', borderRadius: '6px', border: '1px solid #DDD8CF' }}>Cancel</button>
              <button onClick={v.cf.confirm} className="hv-confirm-del" style={{ background: '#B04A42', color: '#fff', borderRadius: '6px', padding: '5px 12px', fontSize: '12.5px', fontWeight: '600' }}>Delete section</button>
            </div>
          </div>
        )}

        {v.rpOpen && (
          <div className="pop" role="dialog" aria-label="Section style" onKeyDown={v.popKey} style={{ position: 'absolute', zIndex: '50', left: `${v.rp.x}px`, top: `${v.rp.y}px`, width: '320px', boxSizing: 'border-box', background: '#fff', border: '1px solid #E2DDD4', borderRadius: '12px', boxShadow: '0 14px 40px -12px rgba(30,27,22,.3)', padding: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#54504A', marginBottom: '9px' }}>Style — {v.rp.secTitle}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '8px' }}>
              {v.rp.styles.map((st: any, i: number) => (
                <button key={i} onClick={st.pick} title={st.name} className="hv-style-card-plain" style={{ textAlign: 'left', border: `1px solid ${st.brd}`, borderRadius: '8px', padding: '9px 10px', background: st.bgc }}>
                  <StyleThumb st={st} />
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#54504A', display: 'flex', alignItems: 'center', gap: '5px' }}>{st.name}{st.sel && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--acc,#3E5C76)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.3l2.3 2.3L9.5 3.8" /></svg>}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {v.tpOpen && (
          <div className="pop" role="dialog" aria-label="Choose a template" onKeyDown={v.popKey} style={{ position: 'absolute', zIndex: '50', left: `${v.tp.x}px`, top: `${v.tp.y}px`, width: '300px', boxSizing: 'border-box', background: '#fff', border: '1px solid #E2DDD4', borderRadius: '12px', boxShadow: '0 14px 40px -12px rgba(30,27,22,.3)', padding: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#54504A', marginBottom: '8px', padding: '0 2px' }}>Resume template</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {v.tp.items.map((it: any) => (
                <button key={it.id} onClick={it.pick} className="hv-soft" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '8px 9px', border: `1px solid ${it.brd}`, borderRadius: '8px', background: '#fff' }}>
                  <span style={{ width: '15px', height: '15px', flex: 'none', borderRadius: '50%', background: it.dot }} />
                  <span style={{ flex: '1', minWidth: '0' }}>
                    <span style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#2E2B26', fontFamily: it.font }}>{it.name}</span>
                    <span style={{ display: 'block', fontSize: '10.5px', color: '#9A948A', fontFamily: it.font, marginTop: '1px' }}>The quick brown fox</span>
                  </span>
                  {it.sel && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--acc,#3E5C76)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5l2.7 2.7L11 4.5" /></svg>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}
