'use client';

import React from 'react';
import { connect, type ConnectedProps } from 'react-redux';
import '@/styles/inline-resume-editor.css';
import {
  MS,
  ML,
  PHE,
  PHB,
  CAT,
  SNAMES,
  TSTYLES,
  TEMPLATES,
  getTemplate,
  buildBlankEditorResume,
  buildSampleEditorResume,
  sectionHasContent,
} from '@/lib/resume-data/editor-resume-data';
import { CSS_DPI, DEFAULT_MARGIN_IN, type PageSizeId } from '@/lib/resume-pagination/page-constants';
import { getOrCreateResumeId, loadPageSize, savePageSize } from '@/lib/resume-data/resume-persistence';
import { buildExportModel, exportAccent } from '@/lib/resume-export/build-model';
import { exportResumeToPDF } from '@/lib/resume-export/pdf';
import { exportResumeToDocx } from '@/lib/resume-export/docx';
import {
  editorResumeActions,
  fetchEditorResume,
  type LinkTarget,
} from '@/lib/store/editor-resume-slice';
import type { RootState, AppDispatch } from '@/lib/store';
import { usesCatalog, catalogFor } from '@/components/sections/catalog';
import ContactChip from './editor/ContactChip';
import buildSectionBlocks from './editor/SectionBlock';
import SettingsDrawer from './editor/SettingsDrawer';
import ReviewDrawer from './editor/ReviewDrawer';
import MarginsOverlay from './editor/MarginsOverlay';
import PaginatedResumeView from './editor/pagination/PaginatedResumeView';
import { atomicBlock, type PgBlockSpec } from './editor/pagination/block-spec';
import AddSectionPopover from './editor/popovers/AddSectionPopover';
import DatePickerPopover from './editor/popovers/DatePickerPopover';
import LinkPopover from './editor/popovers/LinkPopover';
import ConfirmDeletePopover from './editor/popovers/ConfirmDeletePopover';
import RestylePopover from './editor/popovers/RestylePopover';
import TemplatePopover from './editor/popovers/TemplatePopover';

export interface InlineResumeEditorProps {
  /** Accent colour used when the selected template does not define its own. */
  accent?: string;
  /** Start from the sample resume instead of an empty one. */
  sampleData?: boolean;
  /** Pin the hover-revealed editing controls open. */
  alwaysShowControls?: boolean;
  /** Margins aren't part of the persisted document (no UI to save them yet) — the headless export
   *  route seeds this from the live editor's current margins so a customized margin still
   *  produces byte-identical pagination in the exported PDF. Defaults to DEFAULT_MARGIN_IN. */
  initialMargins?: { top: number; right: number; bottom: number; left: number };
  /** The headless export route (app/export/pdf-print/PdfPrintClient.tsx) and the landing page
   *  (components/LandingPage.tsx, for both Upload and Scratch) both seed the store with the real
   *  document *before* this component mounts. The default componentDidMount fetch is asynchronous
   *  even though its stub API resolves on a bare microtask, so — mounted after the seed — it would
   *  still resolve after and silently overwrite the seeded document with a fresh blank/sample one.
   *  This skips that fetch entirely for such pre-seeded contexts; app/editor/page.tsx always sets
   *  it, since the landing page is the only entry point into the editor now. */
  skipInitialFetch?: boolean;
}

type Pop = any;

interface EditorState {
  pop: Pop;
  editBody: string | null;
  margins: { top: number; right: number; bottom: number; left: number };
  showMargins: boolean;
  zoom: number;
  settingsOpen: boolean;
  reviewOpen: boolean;
}

const mapStateToProps = (state: RootState) => ({
  data: state.editorResume.data,
  resumeId: state.editorResume.resumeId,
});
const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setPath: (path: string, value: any) => dispatch(editorResumeActions.setPath({ path, value })),
  addSection: (section: { type: string; kind: 'text' | 'entries'; style: string; title: string }) =>
    dispatch(editorResumeActions.addSection(section)),
  addEntry: (sectionIndex: number) => dispatch(editorResumeActions.addEntry({ sectionIndex })),
  pushAtPath: (listPath: string, item: any) =>
    dispatch(editorResumeActions.pushAtPath({ listPath, item })),
  removeAtPath: (listPath: string, index: number) =>
    dispatch(editorResumeActions.removeAtPath({ listPath, index })),
  moveAtPath: (listPath: string, from: number, to: number) =>
    dispatch(editorResumeActions.moveAtPath({ listPath, from, to })),
  saveLink: (target: LinkTarget, url: string, text: string) =>
    dispatch(editorResumeActions.saveLink({ target, url, text })),
  removeLink: (target: LinkTarget) => dispatch(editorResumeActions.removeLink({ target })),
  resetData: (data: any, nextId: number, resumeId?: string) =>
    dispatch(editorResumeActions.resetData({ data, nextId, resumeId })),
  fetchEditorResume: (sampleOn: boolean) => dispatch(fetchEditorResume(sampleOn)),
  hydrateResumeMeta: (resumeId: string, pageSize: PageSizeId) =>
    dispatch(editorResumeActions.hydrateResumeMeta({ resumeId, pageSize })),
});
const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & InlineResumeEditorProps;

class InlineResumeEditor extends React.Component<Props, EditorState> {
  private _snap: { p: string; v: string } | null = null;
  private _rootEl: HTMLDivElement | null = null;
  private _pageEl: HTMLDivElement | null = null;
  private _dragDir: string | null = null;
  private _dragRect: DOMRect | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      pop: null,
      editBody: null,
      margins: props.initialMargins ?? {
        top: DEFAULT_MARGIN_IN,
        right: DEFAULT_MARGIN_IN,
        bottom: DEFAULT_MARGIN_IN,
        left: DEFAULT_MARGIN_IN,
      },
      showMargins: false,
      zoom: 1,
      settingsOpen: false,
      reviewOpen: false,
    };
  }
  toggleSettings = () => this.setState((s) => ({ settingsOpen: !s.settingsOpen }));
  toggleReview = () => this.setState((s) => ({ reviewOpen: !s.reviewOpen }));
  get sampleOn() {
    return this.props.sampleData !== false;
  }
  componentDidMount() {
    // Always hydrate page-size/resume-identity — narrow and header/sections-safe, so it can never
    // clobber content the landing page or the export route just seeded (unlike fetchEditorResume,
    // which replaces the whole document and is correctly skipped in those cases below).
    const resumeId = getOrCreateResumeId();
    this.props.hydrateResumeMeta(resumeId, loadPageSize(resumeId));
    if (!this.props.skipInitialFetch) this.props.fetchEditorResume(this.sampleOn);
  }
  componentDidUpdate(pp: Props) {
    if ((pp.sampleData !== false) !== this.sampleOn) {
      let counter = 100;
      const mintId = () => 'x' + ++counter;
      const data = this.sampleOn ? buildSampleEditorResume(mintId) : buildBlankEditorResume(mintId);
      const resumeId = getOrCreateResumeId();
      data.pageSize = loadPageSize(resumeId);
      this.props.resetData(data, counter + 1, resumeId);
      this.setState({ pop: null });
    }
  }
  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onDragMove);
    window.removeEventListener('mouseup', this.onDragEnd);
  }
  fmt(dt: any) {
    if (!dt) return '';
    if (dt === 'present') return 'Present';
    return (this.props.data.dateFormat === 'MMMM' ? ML : MS)[dt.m - 1] + ' ' + dt.y;
  }
  idx(dt: any) {
    return dt.y * 12 + (dt.m - 1);
  }
  anchor(e: React.MouseEvent, w: number, alignRight: boolean) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const rr = this._rootEl!.getBoundingClientRect();
    let x = (alignRight ? r.right - w : r.left) - rr.left;
    x = Math.max(8, Math.min(x, rr.width - w - 8));
    return { x, y: r.bottom - rr.top + 6 };
  }
  onEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    this.props.setPath(e.target.dataset.path!, e.target.value);
  onFocusF = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this._snap = { p: e.target.dataset.path!, v: e.target.value };
  };
  esc(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (
      e.key === 'Escape' &&
      this._snap &&
      this._snap.p === (e.target as HTMLElement).dataset.path
    ) {
      e.preventDefault();
      this.props.setPath(this._snap.p, this._snap.v);
      (e.target as HTMLInputElement).blur();
    }
  }
  onKeyS = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    } else this.esc(e);
  };
  onKeyM = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => this.esc(e);
  doPrint = () => window.print();
  setPageSize = (id: PageSizeId) => {
    this.props.setPath('pageSize', id);
    savePageSize(this.props.resumeId || getOrCreateResumeId(), id);
  };
  toggleMargins = () => this.setState((s) => ({ showMargins: !s.showMargins }));
  setZoom = (zoom: number) => this.setState({ zoom });
  rootRef = (el: HTMLDivElement | null) => {
    this._rootEl = el;
  };
  pageRef = (el: HTMLDivElement | null) => {
    this._pageEl = el;
  };
  startDrag = (dir: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    this._dragDir = dir;
    this._dragRect = this._pageEl!.getBoundingClientRect();
    window.addEventListener('mousemove', this.onDragMove);
    window.addEventListener('mouseup', this.onDragEnd);
  };
  onDragMove = (e: MouseEvent) => {
    if (!this._dragDir) return;
    const r = this._dragRect!;
    let val: number;
    if (this._dragDir === 'top') val = (e.clientY - r.top) / CSS_DPI;
    else if (this._dragDir === 'bottom') val = (r.bottom - e.clientY) / CSS_DPI;
    else if (this._dragDir === 'left') val = (e.clientX - r.left) / CSS_DPI;
    else val = (r.right - e.clientX) / CSS_DPI;
    val = Math.max(0.25, Math.min(2, Math.round(val * 20) / 20));
    const dir = this._dragDir;
    this.setState((s) => ({ margins: { ...s.margins, [dir]: val } }));
  };
  onDragEnd = () => {
    this._dragDir = null;
    window.removeEventListener('mousemove', this.onDragMove);
    window.removeEventListener('mouseup', this.onDragEnd);
  };

  exportPDF = async () => {
    const tpl = getTemplate(this.props.data.templateId);
    const accent = exportAccent(tpl.id, tpl.accent, this.props.accent);
    await exportResumeToPDF(this.props.data, this.state.margins, accent);
  };
  exportDocx = async () => {
    const tpl = getTemplate(this.props.data.templateId);
    const accent = exportAccent(tpl.id, tpl.accent, this.props.accent);
    const model = buildExportModel(this.props.data);
    await exportResumeToDocx(model, tpl.font, this.state.margins, accent, this.props.data.pageSize);
  };

  closePop = () => this.setState({ pop: null });
  popKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.closePop();
    }
  };
  moveSec(si: number, dir: number) {
    const j = si + dir;
    if (j < 0 || j >= this.props.data.sections.length) return;
    this.props.moveAtPath('sections', si, j);
  }
  reqDelSec(e: React.MouseEvent, si: number) {
    const s = this.props.data.sections[si];
    if (sectionHasContent(s)) {
      const { x, y } = this.anchor(e, 272, false);
      this.setState({ pop: { t: 'confirm', si, x, y } });
    } else this.props.removeAtPath('sections', si);
  }
  delEntry(si: number, ei: number) {
    this.props.removeAtPath(`sections.${si}.entries`, ei);
  }
  setTemplate(id: string) {
    this.props.setPath('templateId', id);
    this.setState({ pop: null });
  }
  openTemplatePicker(e: React.MouseEvent) {
    const { x, y } = this.anchor(e, 300, true);
    this.setState({ pop: { t: 'template', x, y } });
  }
  styleThumbFlags(entriesKind: boolean, sid: string) {
    return {
      cCl: !entriesKind && sid === 'classic',
      cSd: sid === 'side',
      cTn: sid === 'tinted',
      cEd: sid === 'editorial',
      cCe: sid === 'center',
      cPl: sid === 'pills',
      eCl: entriesKind && sid === 'classic',
      eTl: sid === 'timeline',
      eDl: sid === 'datesLeft',
      eCp: sid === 'compact',
      eCf: sid === 'companyFirst',
    };
  }
  openRestyle(e: React.MouseEvent, si: number) {
    const { x, y } = this.anchor(e, 320, true);
    this.setState({ pop: { t: 'restyle', si, x, y } });
  }
  addFromPicker(sid: string) {
    const P = this.state.pop;
    if (!P || !P.sel) return;
    const def = CAT.find((c) => c.key === P.sel)!;
    const title = P.sel === 'custom' ? (P.title || '').trim() : def.label;
    if (!title) return;
    const type = P.sel === 'custom' ? 'custom' : P.sel;
    this.props.addSection({ type, kind: def.kind as 'text' | 'entries', style: sid, title });
    this.setState({ pop: null });
  }
  openDate(e: React.MouseEvent, si: number, ei: number, which: 'start' | 'end') {
    const ent = (this.props.data.sections[si] as any).entries[ei];
    const cur = ent[which],
      other = which === 'end' ? ent.start : ent.end;
    const vy =
      (cur && cur !== 'present' && cur.y) || (other && other !== 'present' && other.y) || 2026;
    const { x, y } = this.anchor(e, 256, true);
    this.setState({ pop: { t: 'date', si, ei, which, vy, err: null, x, y } });
  }
  pickMonth(m: number) {
    const p = this.state.pop;
    const cand = { y: p.vy, m };
    const ent = (this.props.data.sections[p.si] as any).entries[p.ei];
    const other = p.which === 'start' ? ent.end : ent.start;
    let err: string | null = null;
    if (other && other !== 'present') {
      if (p.which === 'end' && this.idx(cand) < this.idx(other))
        err = 'End date can’t be before the start date.';
      if (p.which === 'start' && this.idx(cand) > this.idx(other))
        err = 'Start date can’t be after the end date.';
    }
    if (err) {
      this.setState({ pop: { ...p, err } });
      return;
    }
    this.spDate(cand);
  }
  spDate(v: any) {
    const p = this.state.pop;
    this.props.setPath(`sections.${p.si}.entries.${p.ei}.${p.which}`, v);
    this.setState({ pop: null });
  }
  normUrl(raw: string) {
    let u = String(raw || '').trim();
    if (!u || /\s/.test(u)) return null;
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u)) u = 'https://' + u;
    let p: URL;
    try {
      p = new URL(u);
    } catch {
      return null;
    }
    if (/^https?:$/.test(p.protocol) && !/^[^.]+(\.[^.]+)+$/.test(p.hostname)) return null;
    return u;
  }
  openLinkPop(e: React.MouseEvent, tgt: any) {
    const { x, y } = this.anchor(e, 308, false);
    let url = '',
      text = '',
      can = false;
    if (tgt.ci != null) {
      const c = this.props.data.header.contacts[tgt.ci];
      url = c.url || '';
      text = c.text || '';
      can = !!c.url;
    } else {
      const l = (this.props.data.sections[tgt.si] as any).entries[tgt.ei].link;
      if (l) {
        url = l.url;
        text = l.text;
        can = true;
      }
    }
    this.setState({ pop: { t: 'link', ...tgt, x, y, url, text, err: null, canRemove: can } });
  }
  saveLink() {
    const p = this.state.pop;
    const norm = this.normUrl(p.url);
    if (!norm) {
      this.setState({ pop: { ...p, err: 'Enter a valid URL (e.g. example.com/portfolio).' } });
      return;
    }
    const txt = String(p.text || '').trim();
    const target: LinkTarget = p.ci != null ? { ci: p.ci } : { si: p.si, ei: p.ei };
    this.props.saveLink(target, norm, txt);
    this.setState({ pop: null });
  }
  removeLink() {
    const p = this.state.pop;
    const target: LinkTarget = p.ci != null ? { ci: p.ci } : { si: p.si, ei: p.ei };
    this.props.removeLink(target);
    this.setState({ pop: null });
  }

  renderVals(): any {
    const D = this.props.data,
      P = this.state.pop;
    const acc = 'var(--acc,#3E5C76)';
    const mkC = (i: number) => {
      const c = D.header.contacts[i];
      return {
        isLink: !!c.url,
        noLink: !c.url,
        href: c.url || '',
        text: c.text,
        path: 'header.contacts.' + i + '.text',
        openLink: (e: React.MouseEvent) => this.openLinkPop(e, { ci: i }),
      };
    };
    const secs = D.sections.map((s: any, si: number) => {
      const st = s.style || 'classic';
      const v: any = {
        id: s.id,
        type: s.type,
        style: st,
        title: s.title,
        pTitle: 'sections.' + si + '.title',
        isText: s.kind === 'text',
        isEntries: s.kind === 'entries',
        useCatalog: usesCatalog(s.type),
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
        up: () => this.moveSec(si, -1),
        down: () => this.moveSec(si, 1),
        upDis: si === 0,
        dnDis: si === D.sections.length - 1,
        del: (e: React.MouseEvent) => this.reqDelSec(e, si),
        openStyle: (e: React.MouseEvent) => this.openRestyle(e, si),
      };
      if (s.kind === 'text') {
        v.pBody = 'sections.' + si + '.body';
        v.body = s.body;
        v.phBody = PHB[s.type] || PHB.custom;
        v.pills = (s.body || '')
          .split(',')
          .map((x: string) => x.trim())
          .filter(Boolean)
          .map((t: string) => ({ t }));
        v.pillsEmpty = v.pills.length === 0;
        v.pillsEditing = this.state.editBody === s.id;
        v.pillsIdle = !v.pillsEditing;
        v.editPills = () => this.setState({ editBody: s.id });
        v.pillsBlur = () => this.setState({ editBody: null });
        v.pHook = 'sections.' + si + '.hook';
        v.hook = s.hook || '';
        v.phHook = 'One-line hook…';
        v.skillGroups = (s.skillGroups || []).map((g: any, gi: number) => ({
          key: s.id + '-sg' + gi,
          label: g.label,
          items: g.items,
          pLabel: 'sections.' + si + '.skillGroups.' + gi + '.label',
          pItems: 'sections.' + si + '.skillGroups.' + gi + '.items',
          del: () => this.props.removeAtPath('sections.' + si + '.skillGroups', gi),
        }));
        v.addSkillGroup = () =>
          this.props.pushAtPath('sections.' + si + '.skillGroups', { label: '', items: '' });
        v.skillLevels = (s.skillLevels || []).map((sk: any, ki: number) => ({
          key: s.id + '-sl' + ki,
          name: sk.name,
          level: sk.level,
          pName: 'sections.' + si + '.skillLevels.' + ki + '.name',
          pLevel: 'sections.' + si + '.skillLevels.' + ki + '.level',
          pct: Number(sk.level) || 0,
          dots: Math.round((Number(sk.level) || 0) / 20),
          del: () => this.props.removeAtPath('sections.' + si + '.skillLevels', ki),
        }));
        v.addSkillLevel = () =>
          this.props.pushAtPath('sections.' + si + '.skillLevels', { name: '', level: '60' });
      } else {
        const ph = PHE[s.type] || ['Title', 'Organization', 'Description…'];
        v.addLbl =
          (
            {
              experience: 'Add position',
              education: 'Add education',
              projects: 'Add project',
              certifications: 'Add certification',
              awards: 'Add award',
              references: 'Add reference',
            } as Record<string, string>
          )[s.type] || 'Add entry';
        v.addEntry = () => this.props.addEntry(si);
        v.entries = s.entries.map((en: any, ei: number) => ({
          id: en.id,
          // Pagination block key for this entry as a whole — stable across content edits since
          // entries are only ever pushed/removed by index, never reordered.
          pathPrefix: 'sections.' + si + '.entries.' + ei,
          title: en.title,
          subtitle: en.subtitle,
          desc: en.desc,
          pT: 'sections.' + si + '.entries.' + ei + '.title',
          pS: 'sections.' + si + '.entries.' + ei + '.subtitle',
          pD: 'sections.' + si + '.entries.' + ei + '.desc',
          phT: ph[0],
          phS: ph[1],
          phD: ph[2],
          startLbl: this.fmt(en.start) || 'Start date',
          startCol: en.start ? '#6B665E' : '#A9A29A',
          endLbl: this.fmt(en.end) || 'End date',
          endCol: en.end ? '#6B665E' : '#A9A29A',
          openStart: (e: React.MouseEvent) => this.openDate(e, si, ei, 'start'),
          openEnd: (e: React.MouseEvent) => this.openDate(e, si, ei, 'end'),
          del: () => this.delEntry(si, ei),
          openLink: (e: React.MouseEvent) => this.openLinkPop(e, { si, ei }),
          hasLink: !!en.link,
          linkHref: en.link ? en.link.url : '',
          linkText: en.link ? en.link.text : '',
          hasContribs: (en.contribs || []).length > 0,
          addContrib: () => this.props.pushAtPath(`sections.${si}.entries.${ei}.contribs`, ''),
          contribs: (en.contribs || []).map((c: string, ci: number) => ({
            id: en.id + '-c' + ci,
            val: c,
            path: 'sections.' + si + '.entries.' + ei + '.contribs.' + ci,
            del: () => this.props.removeAtPath(`sections.${si}.entries.${ei}.contribs`, ci),
          })),
          pYear: 'sections.' + si + '.entries.' + ei + '.year',
          year: en.year || '',
          phYear: 'Year',
          pEmail: 'sections.' + si + '.entries.' + ei + '.email',
          email: en.email || '',
          phEmail: 'email@example.com',
          pPhone: 'sections.' + si + '.entries.' + ei + '.phone',
          phone: en.phone || '',
          phPhone: 'Phone',
        }));
      }
      return v;
    });
    const fmtShortSel = D.dateFormat === 'MMM',
      fmtLongSel = !fmtShortSel;
    let dp: any = null;
    if (P && P.t === 'date') {
      const ent = (D.sections[P.si] as any).entries[P.ei];
      const cur = ent[P.which];
      dp = {
        x: P.x,
        y: P.y,
        year: String(P.vy),
        err: P.err || false,
        isEnd: P.which === 'end',
        prev: () =>
          this.setState({
            pop: { ...this.state.pop, vy: Math.max(1950, this.state.pop.vy - 1), err: null },
          }),
        next: () =>
          this.setState({
            pop: { ...this.state.pop, vy: Math.min(2040, this.state.pop.vy + 1), err: null },
          }),
        months: MS.map((lbl, i) => {
          const sel = cur && cur !== 'present' && cur.y === P.vy && cur.m === i + 1;
          return {
            lbl,
            bg: sel ? acc : 'transparent',
            fg: sel ? '#fff' : '#33302B',
            fw: sel ? 600 : 400,
            pick: () => this.pickMonth(i + 1),
          };
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
        x: P.x,
        y: P.y,
        url: P.url,
        text: P.text,
        err: P.err || false,
        canRemove: P.canRemove,
        heading: P.ci != null ? 'Link for ' + ['email', 'phone', 'location'][P.ci] : 'Entry link',
        onUrl: (e: React.ChangeEvent<HTMLInputElement>) =>
          this.setState({ pop: { ...this.state.pop, url: e.target.value, err: null } }),
        onText: (e: React.ChangeEvent<HTMLInputElement>) =>
          this.setState({ pop: { ...this.state.pop, text: e.target.value } }),
        save: () => this.saveLink(),
        remove: () => this.removeLink(),
      };
    }
    let cf: any = null;
    if (P && P.t === 'confirm') {
      const s = D.sections[P.si];
      const n = s.kind === 'entries' ? s.entries.length : 0;
      cf = {
        x: P.x,
        y: P.y,
        title: 'Delete ' + (s.title.trim() || 'this section') + '?',
        msg:
          s.kind === 'entries'
            ? n + (n === 1 ? ' entry' : ' entries') + ' and their content will be lost.'
            : 'Its content will be lost.',
        confirm: () => {
          this.props.removeAtPath('sections', P.si);
          this.setState({ pop: null });
        },
      };
    }
    const addOpen = !!(P && P.t === 'add');
    let pickTypes: any[] = [],
      pickStyles: any[] = [],
      pickSel = false,
      pickIsCustom = false;
    if (addOpen) {
      pickSel = !!P.sel;
      pickIsCustom = P.sel === 'custom';
      pickTypes = CAT.map((c) => {
        const dis = c.key !== 'custom' && D.sections.some((s: any) => s.type === c.key);
        const sel = P.sel === c.key;
        return {
          label: c.label,
          dis,
          note: dis ? 'Added' : '',
          bg: sel ? 'color-mix(in oklab,var(--acc,#3E5C76) 10%,transparent)' : 'transparent',
          fg: sel ? 'var(--acc,#3E5C76)' : '#33302B',
          fw: sel ? 600 : 400,
          pick: () => this.setState({ pop: { ...this.state.pop, sel: c.key } }),
        };
      });
      if (P.sel) {
        const def = CAT.find((c) => c.key === P.sel)!;
        const noTitle = P.sel === 'custom' && !(P.title || '').trim();
        if (usesCatalog(P.sel)) {
          pickStyles = catalogFor(P.sel)!.templates.map((Comp) => ({
            isCatalog: true,
            Component: Comp,
            name: Comp.templateLabel,
            dis: noTitle,
            brd: '#E6E2DA',
            bgc: '#fff',
            pick: () => this.addFromPicker(Comp.templateId),
          }));
        } else {
          const ids = TSTYLES[P.sel] || TSTYLES.custom;
          pickStyles = ids.map((sid) => ({
            isCatalog: false,
            name: SNAMES[sid],
            dis: noTitle,
            sel: false,
            brd: '#E6E2DA',
            bgc: '#fff',
            pick: () => this.addFromPicker(sid),
            ...this.styleThumbFlags(def.kind === 'entries', sid),
          }));
        }
      }
    }
    let rp: any = null;
    if (P && P.t === 'restyle') {
      const s = D.sections[P.si];
      const curSt = s.style || 'classic';
      let styles: any[];
      if (usesCatalog(s.type)) {
        styles = catalogFor(s.type)!.templates.map((Comp) => {
          const sel = Comp.templateId === curSt;
          return {
            isCatalog: true,
            Component: Comp,
            name: Comp.templateLabel,
            sel,
            brd: sel ? 'var(--acc,#3E5C76)' : '#E6E2DA',
            bgc: sel ? 'color-mix(in oklab,var(--acc,#3E5C76) 4%,#fff)' : '#fff',
            pick: () => {
              this.props.setPath(`sections.${P.si}.style`, Comp.templateId);
              this.setState({ pop: null });
            },
          };
        });
      } else {
        const entriesKind = s.kind === 'entries';
        const ids = TSTYLES[s.type] || TSTYLES.custom;
        styles = ids.map((sid) => {
          const sel = sid === curSt;
          return {
            isCatalog: false,
            name: SNAMES[sid],
            sel,
            brd: sel ? 'var(--acc,#3E5C76)' : '#E6E2DA',
            bgc: sel ? 'color-mix(in oklab,var(--acc,#3E5C76) 4%,#fff)' : '#fff',
            pick: () => {
              this.props.setPath(`sections.${P.si}.style`, sid);
              this.setState({ pop: null });
            },
            ...this.styleThumbFlags(entriesKind, sid),
          };
        });
      }
      rp = {
        x: P.x,
        y: P.y,
        secTitle: (s.title || '').trim() || 'this section',
        styles,
      };
    }
    let tp: any = null;
    if (P && P.t === 'template') {
      tp = {
        x: P.x,
        y: P.y,
        items: TEMPLATES.map((t) => ({
          id: t.id,
          name: t.name,
          font: t.font,
          dot: t.accent || (this.props.accent ?? '#3E5C76'),
          sel: t.id === D.templateId,
          brd: t.id === D.templateId ? 'var(--acc,#3E5C76)' : '#E6E2DA',
          pick: () => this.setTemplate(t.id),
        })),
      };
    }
    const tpl = getTemplate(D.templateId);
    const tplAccent = tpl.accent || (this.props.accent ?? '#3E5C76');
    const hv = tpl.header;
    const mg = this.state.margins;
    return {
      accent: tplAccent,
      tplFont: tpl.font,
      tplName: tpl.name,
      showMargins: this.state.showMargins,
      pgPadTop: mg.top * CSS_DPI,
      pgPadRight: mg.right * CSS_DPI,
      pgPadBottom: mg.bottom * CSS_DPI,
      pgPadLeft: mg.left * CSS_DPI,
      mTop: mg.top.toFixed(2),
      mRight: mg.right.toFixed(2),
      mBottom: mg.bottom.toFixed(2),
      mLeft: mg.left.toFixed(2),
      dragTop: this.startDrag('top'),
      dragRight: this.startDrag('right'),
      dragBottom: this.startDrag('bottom'),
      dragLeft: this.startDrag('left'),
      toggleMargins: this.toggleMargins,
      marginsBtnLabel: this.state.showMargins ? 'Done' : 'Margins',
      marginsBtnBg: this.state.showMargins ? tplAccent : '#fff',
      marginsBtnFg: this.state.showMargins ? '#fff' : '#3F3B35',
      exportPDF: this.exportPDF,
      exportDocx: this.exportDocx,
      pageSize: D.pageSize,
      setPageSize: this.setPageSize,
      zoom: this.state.zoom,
      setZoom: this.setZoom,
      hdrStacked: hv !== 'split',
      hdrRow: hv === 'split',
      hdrAlign: hv === 'center' ? 'center' : 'left',
      hdrContactsJustify: hv === 'center' ? 'center' : 'flex-start',
      hdrBg: hv === 'banner' ? tplAccent : 'transparent',
      hdrPad: hv === 'banner' ? '18px 22px 16px' : '0',
      hdrRadius: hv === 'banner' ? '10px' : '0',
      hdrGap: hv === 'banner' ? '14px' : '16px',
      hdrNameColor: hv === 'banner' ? '#ffffff' : '#26231F',
      hdrTitleColor: hv === 'banner' ? 'rgba(255,255,255,.82)' : '#6B665E',
      openTemplatePicker: (e: React.MouseEvent) => this.openTemplatePicker(e),
      tpOpen: !!tp,
      tp,
      rpOpen: !!rp,
      rp,
      showAllCls: this.props.alwaysShowControls ? 'showall' : '',
      d: D,
      c0: mkC(0),
      c1: mkC(1),
      c2: mkC(2),
      secs,
      doPrint: this.doPrint,
      closePop: this.closePop,
      popKey: this.popKey,
      fmtShortSel,
      fmtLongSel,
      fsBg: fmtShortSel ? acc : 'transparent',
      fsFg: fmtShortSel ? '#fff' : '#6B665E',
      fsFw: fmtShortSel ? 600 : 400,
      flBg: fmtLongSel ? acc : 'transparent',
      flFg: fmtLongSel ? '#fff' : '#6B665E',
      flFw: fmtLongSel ? 600 : 400,
      setFmtS: () => this.props.setPath('dateFormat', 'MMM'),
      setFmtL: () => this.props.setPath('dateFormat', 'MMMM'),
      anyPop: !!P,
      dpOpen: !!dp,
      dp,
      lpOpen: !!lp,
      lp,
      cfOpen: !!cf,
      cf,
      lpKeySave: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveLink();
        }
      },
      addOpen,
      pickTypes,
      pickStyles,
      pickSel,
      pickIsCustom,
      pickNone: addOpen && !pickSel,
      addTitle: (P && P.title) || '',
      onAddTitle: (e: React.ChangeEvent<HTMLInputElement>) =>
        this.setState({ pop: { ...this.state.pop, title: e.target.value } }),
      addKey: (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          this.closePop();
        }
      },
      openAdd: () => this.setState({ pop: { t: 'add', sel: null, title: '' } }),
    };
  }

  /** Flattens the resume into the ordered pagination block list: header, contacts, then each
   *  section's blocks in turn. This is the single place content becomes "blocks" — sections can
   *  no longer own a wrapping DOM node once their pieces may land on different pages (see
   *  SectionBlock.tsx), so their builder returns flat siblings that get concatenated here. */
  buildBlocks(v: any): PgBlockSpec[] {
    const header = (
      <div
        style={{
          background: v.hdrBg,
          padding: v.hdrPad,
          borderRadius: v.hdrRadius,
          marginBottom: v.hdrGap,
        }}
      >
        {v.hdrStacked && (
          <>
            <input
              data-path="header.name"
              value={v.d.header.name}
              onChange={this.onEdit}
              onFocus={this.onFocusF}
              onKeyDown={this.onKeyS}
              placeholder="Your name"
              aria-label="Name"
              style={{
                display: 'block',
                width: '100%',
                fontSize: '33px',
                fontWeight: '700',
                letterSpacing: '-.015em',
                color: v.hdrNameColor,
                lineHeight: '1.15',
                textAlign: v.hdrAlign,
              }}
            />
            <input
              data-path="header.title"
              value={v.d.header.title}
              onChange={this.onEdit}
              onFocus={this.onFocusF}
              onKeyDown={this.onKeyS}
              placeholder="Professional title"
              aria-label="Professional title"
              style={{
                display: 'block',
                width: '100%',
                fontSize: '15px',
                color: v.hdrTitleColor,
                marginTop: '5px',
                textAlign: v.hdrAlign,
              }}
            />
          </>
        )}
        {v.hdrRow && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '14px',
            }}
          >
            <input
              data-path="header.name"
              value={v.d.header.name}
              onChange={this.onEdit}
              onFocus={this.onFocusF}
              onKeyDown={this.onKeyS}
              placeholder="Your name"
              aria-label="Name"
              style={{
                flex: '1',
                minWidth: '0',
                fontSize: '29px',
                fontWeight: '700',
                letterSpacing: '-.015em',
                color: v.hdrNameColor,
              }}
            />
            <input
              data-path="header.title"
              value={v.d.header.title}
              onChange={this.onEdit}
              onFocus={this.onFocusF}
              onKeyDown={this.onKeyS}
              placeholder="Professional title"
              aria-label="Professional title"
              style={{
                flex: 'none',
                textAlign: 'right',
                fontSize: '14px',
                color: v.hdrTitleColor,
              }}
            />
          </div>
        )}
      </div>
    );

    const contacts = (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: v.hdrContactsJustify,
          columnGap: '9px',
          rowGap: '4px',
          fontSize: '13px',
          color: '#4C4841',
        }}
      >
        <ContactChip
          c={v.c0}
          placeholder="Email"
          label="Email"
          onEdit={this.onEdit}
          onFocusF={this.onFocusF}
          onKeyS={this.onKeyS}
        />
        <span style={{ color: '#C9C4BB' }}>·</span>
        <ContactChip
          c={v.c1}
          placeholder="Phone"
          label="Phone"
          onEdit={this.onEdit}
          onFocusF={this.onFocusF}
          onKeyS={this.onKeyS}
        />
        <span style={{ color: '#C9C4BB' }}>·</span>
        <ContactChip
          c={v.c2}
          placeholder="City, State"
          label="Location"
          onEdit={this.onEdit}
          onFocusF={this.onFocusF}
          onKeyS={this.onKeyS}
        />
      </div>
    );

    const sectionBlocks = v.secs.flatMap((s: any) =>
      buildSectionBlocks({
        s,
        onEdit: this.onEdit,
        onFocusF: this.onFocusF,
        onKeyS: this.onKeyS,
        onKeyM: this.onKeyM,
      }),
    );

    return [atomicBlock('header', header), atomicBlock('header.contacts', contacts), ...sectionBlocks];
  }

  render() {
    const v = this.renderVals();
    const blocks = this.buildBlocks(v);
    return (
      <div
        className={`ire rzr ${v.showAllCls}`}
        ref={this.rootRef}
        style={{
          minHeight: '100vh',
          position: 'relative',
          padding: '34px 24px 90px',
          ['--acc' as string]: v.accent,
        }}
      >
        <SettingsDrawer
          open={this.state.settingsOpen}
          onToggle={this.toggleSettings}
          toolbar={{
            tplName: v.tplName,
            openTemplatePicker: v.openTemplatePicker,
            pageSize: v.pageSize,
            setPageSize: v.setPageSize,
            zoom: v.zoom,
            setZoom: v.setZoom,
            fmtShortSel: v.fmtShortSel,
            fmtLongSel: v.fmtLongSel,
            fsBg: v.fsBg,
            fsFg: v.fsFg,
            fsFw: v.fsFw,
            flBg: v.flBg,
            flFg: v.flFg,
            flFw: v.flFw,
            setFmtS: v.setFmtS,
            setFmtL: v.setFmtL,
            marginsBtnLabel: v.marginsBtnLabel,
            marginsBtnBg: v.marginsBtnBg,
            marginsBtnFg: v.marginsBtnFg,
            toggleMargins: v.toggleMargins,
            exportPDF: v.exportPDF,
            exportDocx: v.exportDocx,
            doPrint: v.doPrint,
          }}
        />
        <ReviewDrawer open={this.state.reviewOpen} onToggle={this.toggleReview} />

        <PaginatedResumeView
          blocks={blocks}
          pageSize={v.pageSize}
          margins={this.state.margins}
          zoom={v.zoom}
          fontFamily={v.tplFont}
          firstPageFrameRef={this.pageRef}
          pageOverlay={
            v.showMargins ? (
              <MarginsOverlay
                pgPadTop={v.pgPadTop}
                pgPadBottom={v.pgPadBottom}
                pgPadLeft={v.pgPadLeft}
                pgPadRight={v.pgPadRight}
                mTop={v.mTop}
                mBottom={v.mBottom}
                mLeft={v.mLeft}
                mRight={v.mRight}
                dragTop={v.dragTop}
                dragBottom={v.dragBottom}
                dragLeft={v.dragLeft}
                dragRight={v.dragRight}
              />
            ) : null
          }
        />

        {/* Editor chrome, not resume content — deliberately rendered below the whole page stack
            rather than inside any one page, so pagination never tries to fit it onto a page. */}
        <div
          className="no-print"
          style={{ position: 'relative', width: '794px', maxWidth: '100%', margin: '18px auto 0' }}
        >
          <button
            className="adds hv-add-section"
            onClick={v.openAdd}
            style={{
              width: '100%',
              padding: '9px',
              border: '1px dashed #D5D0C6',
              borderRadius: '8px',
              color: '#8A857C',
              fontSize: '12.5px',
              fontWeight: '600',
              background: 'none',
            }}
          >
            + Add section
          </button>
          {v.addOpen && (
            <AddSectionPopover
              addKey={v.addKey}
              pickTypes={v.pickTypes}
              pickNone={v.pickNone}
              pickIsCustom={v.pickIsCustom}
              addTitle={v.addTitle}
              onAddTitle={v.onAddTitle}
              pickSel={v.pickSel}
              pickStyles={v.pickStyles}
            />
          )}
        </div>

        <div
          className="no-print"
          style={{
            width: '794px',
            maxWidth: '100%',
            margin: '16px auto 0',
            fontSize: '11.5px',
            color: '#9A948A',
            lineHeight: '1.65',
            textAlign: 'center',
          }}
        >
          Mockup notes — editing controls appear on hover or keyboard focus (or turn on “Always show
          controls” in Tweaks). The month picker stands in for react-datepicker’s
          showMonthYearPicker. Printing hides all editing UI.
        </div>

        {v.anyPop && (
          <div style={{ position: 'fixed', inset: '0', zIndex: '40' }} onClick={v.closePop} />
        )}

        {v.dpOpen && <DatePickerPopover popKey={v.popKey} dp={v.dp} />}
        {v.lpOpen && (
          <LinkPopover popKey={v.popKey} lpKeySave={v.lpKeySave} closePop={v.closePop} lp={v.lp} />
        )}
        {v.cfOpen && <ConfirmDeletePopover popKey={v.popKey} closePop={v.closePop} cf={v.cf} />}
        {v.rpOpen && <RestylePopover popKey={v.popKey} rp={v.rp} />}
        {v.tpOpen && <TemplatePopover popKey={v.popKey} tp={v.tp} />}
      </div>
    );
  }
}

export default connector(InlineResumeEditor);
