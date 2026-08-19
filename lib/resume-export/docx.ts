import { PAGE_SIZES_IN, type PageSizeId } from '@/lib/resume-pagination/page-constants';
import type { PageAssignment } from '@/lib/resume-pagination/block-model';
import type { ExportModel, ExportSection } from './build-model';
import type { ExportMargins } from './pdf';

// Word re-flows text with its own engine, so a .docx can never be line-identical to the browser —
// but everything coarser than a line is mirrored here from the real editor UI: the template's
// header layout (banner/center/split/left), accent + the exact px type scale converted to
// half-points (×1.5) and twips (×15), and — crucially — an explicit page break at every block
// that starts a new page in the live on-screen pagination (`assignments`), so the exported
// document has the same page count and page boundaries the user sees. Blocks the UI split
// mid-paragraph flow naturally in Word (no forced intra-paragraph break) — the accepted
// approximation.

/** The subset of a TEMPLATES entry the DOCX builder needs. `docxFont` is the classic name
 *  (Tahoma/Arial/…): recipients' machines have those, almost never the bundled web faces. */
export interface DocxTemplate {
  docxFont: string;
  header: string;
}

const hp = (px: number) => Math.round(px * 1.5); // px → half-points (96dpi: 1px = 0.75pt)
const tw = (px: number) => Math.round(px * 15); // px → twips
const twIn = (inch: number) => Math.round(inch * 1440);

/** Flatten white-over-accent alpha (the banner title's rgba(255,255,255,.82)) to a solid hex —
 *  OOXML has no alpha channel. */
function blendWhiteOver(accentHex: string, alpha: number): string {
  const h = accentHex.replace('#', '');
  const ch = (i: number) =>
    Math.round(alpha * 255 + (1 - alpha) * parseInt(h.slice(i, i + 2), 16))
      .toString(16)
      .padStart(2, '0');
  return `${ch(0)}${ch(2)}${ch(4)}`;
}

export async function exportResumeToDocx(
  model: ExportModel,
  template: DocxTemplate,
  margins: ExportMargins,
  accent: string,
  pageSize: PageSizeId,
  assignments: PageAssignment[] = [],
): Promise<void> {
  let docxLib: any;
  try {
    docxLib = await import('docx');
  } catch {
    docxLib = null;
  }
  if (!docxLib) {
    alert('DOCX library failed to load — check your connection and try again.');
    return;
  }
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ExternalHyperlink,
    BorderStyle,
    TabStopType,
    AlignmentType,
    WidthType,
    Table,
    TableRow,
    TableCell,
  } = docxLib;

  const m = margins;
  const { widthIn, heightIn } = PAGE_SIZES_IN[pageSize];
  const font = template.docxFont;
  const accentHex = accent.replace('#', '');
  const contentTwips = twIn(widthIn - m.left - m.right);
  const hv = template.header;
  const centered = hv === 'center';
  const align = centered ? AlignmentType.CENTER : AlignmentType.LEFT;

  // ---- Page-break bookkeeping ------------------------------------------------------------------
  // For every pagination block key, the first and last on-screen page it appears on (split
  // paragraphs span several). Walking the document in buildBlocks() order, a block whose first
  // page exceeds everything emitted so far starts a new sheet → pageBreakBefore on its first
  // paragraph. Keys with no assignment (styles that fold several fields into one block) simply
  // inherit the running page, same as group-by-page.ts.
  const firstPage = new Map<string, number>();
  const lastPage = new Map<string, number>();
  for (const a of assignments) {
    if (!firstPage.has(a.blockKey)) firstPage.set(a.blockKey, a.pageIndex);
    lastPage.set(a.blockKey, Math.max(lastPage.get(a.blockKey) ?? a.pageIndex, a.pageIndex));
  }
  let runningPage = 0;
  const breakBefore = (blockKey: string): boolean => {
    const fp = firstPage.get(blockKey);
    if (fp === undefined) return false;
    const brk = fp > runningPage;
    runningPage = Math.max(runningPage, lastPage.get(blockKey) ?? fp);
    return brk;
  };

  const children: any[] = [];

  // ---- Header (mirrors buildBlocks()'s header block per template.header) -----------------------
  const banner = hv === 'banner';
  const nameColor = banner ? 'FFFFFF' : '26231F';
  const titleColor = banner ? blendWhiteOver(accent, 0.82) : '6B665E';
  const headerGapPx = banner ? 14 : 16; // header block's margin-bottom in the UI

  let headerParas: any[];
  if (hv === 'split') {
    // One row: name left, professional title right-aligned on the same baseline.
    const runs: any[] = [
      new TextRun({ text: model.name || 'Your name', bold: true, size: hp(29), font, color: nameColor, characterSpacing: -7 }),
    ];
    if (model.title) runs.push(new TextRun({ text: '\t' + model.title, size: hp(14), font, color: titleColor }));
    headerParas = [
      new Paragraph({ children: runs, tabStops: [{ type: TabStopType.RIGHT, position: contentTwips }] }),
    ];
  } else {
    headerParas = [
      new Paragraph({
        children: [
          new TextRun({ text: model.name || 'Your name', bold: true, size: hp(33), font, color: nameColor, characterSpacing: -7 }),
        ],
        alignment: align,
      }),
    ];
    if (model.title)
      headerParas.push(
        new Paragraph({
          children: [new TextRun({ text: model.title, size: hp(15), font, color: titleColor })],
          alignment: align,
          spacing: { before: tw(5) },
        }),
      );
  }

  if (banner) {
    // The UI banner is an accent-filled rounded box (padding 18/22/16); a 1×1 borderless shaded
    // table is Word's closest equivalent — rounded corners don't exist in OOXML.
    const noBorder = { style: BorderStyle.NONE, size: 0, color: 'auto' };
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: noBorder,
          bottom: noBorder,
          left: noBorder,
          right: noBorder,
          insideHorizontal: noBorder,
          insideVertical: noBorder,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: accentHex },
                margins: { top: tw(18), bottom: tw(16), left: tw(22), right: tw(22) },
                children: headerParas,
              }),
            ],
          }),
        ],
      }),
    );
  } else {
    children.push(...headerParas);
  }

  // ---- Contacts (block key `header.contacts`) --------------------------------------------------
  if (model.contacts.length) {
    const runs: any[] = [];
    model.contacts.forEach((c, i) => {
      if (c.url)
        runs.push(
          new ExternalHyperlink({
            link: c.url,
            children: [new TextRun({ text: c.text, size: hp(13), color: accentHex, font, underline: {} })],
          }),
        );
      else runs.push(new TextRun({ text: c.text, size: hp(13), color: '4C4841', font }));
      if (i < model.contacts.length - 1)
        runs.push(new TextRun({ text: '  ·  ', size: hp(13), color: 'C9C4BB', font }));
    });
    children.push(
      new Paragraph({
        children: runs,
        alignment: align,
        spacing: { before: tw(headerGapPx) },
        pageBreakBefore: breakBefore('header.contacts'),
      }),
    );
  }

  // ---- Sections --------------------------------------------------------------------------------
  const SECTION_GAP = tw(30); // every section's first block carries marginTop: 30px in the UI

  model.sections.forEach((sec) => {
    emitSection(sec);
  });

  function bodyParagraphs(
    text: string,
    opts: { sizePx: number; color: string; lineHeight: number; beforePx: number; align?: any; brk?: boolean; firstBefore?: number },
  ): any[] {
    return text.split('\n').map(
      (line, i) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: hp(opts.sizePx), color: opts.color, font })],
          alignment: opts.align,
          spacing: {
            before: i === 0 ? (opts.firstBefore ?? tw(opts.beforePx)) : tw(3),
            line: tw(opts.sizePx * opts.lineHeight),
            lineRule: 'exact',
          },
          widowControl: false,
          pageBreakBefore: i === 0 && !!opts.brk,
        }),
    );
  }

  function emitSection(sec: ExportSection) {
    // '1e' (bold hook + detail) and 'editorial' render without a section heading in the UI.
    const hasHeading = sec.style !== '1e' && sec.style !== 'editorial';
    let firstEmitted = false;
    const sectionLead = () => {
      // The 30px section gap belongs to whichever block renders first, exactly like decorateFirst.
      if (firstEmitted) return undefined;
      firstEmitted = true;
      return SECTION_GAP;
    };

    if (hasHeading) {
      const brk = breakBefore(sec.headingKey);
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sec.title || '',
              bold: true,
              allCaps: true,
              size: hp(11),
              color: accentHex,
              font,
              characterSpacing: tw(0.14 * 11), // .14em tracking at 11px
            }),
          ],
          border: { bottom: { color: 'E6E2DA', space: 4, style: BorderStyle.SINGLE, size: 4 } },
          spacing: { before: sectionLead(), after: tw(5) },
          keepNext: true,
          pageBreakBefore: brk,
        }),
      );
    }

    if (sec.hook) {
      const brk = breakBefore(sec.hookKey);
      children.push(
        new Paragraph({
          children: [new TextRun({ text: sec.hook, bold: true, size: hp(14.5), color: '26231F', font })],
          spacing: { before: sectionLead() ?? tw(6) },
          keepNext: true,
          pageBreakBefore: brk,
        }),
      );
    }

    if (sec.body) {
      const brk = breakBefore(sec.bodyKey);
      const isHookDetail = sec.style === '1e';
      children.push(
        ...bodyParagraphs(sec.body, {
          sizePx: isHookDetail ? 13 : 13.5,
          color: sec.style === 'center' || isHookDetail ? '6B665E' : '3B3833',
          lineHeight: isHookDetail ? 1.6 : 1.62,
          beforePx: 9,
          align: sec.style === 'center' ? AlignmentType.CENTER : undefined,
          brk,
          firstBefore: sectionLead() ?? tw(isHookDetail ? 6 : 9),
        }),
      );
    }

    (sec.skillGroups || []).forEach((g, gi) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: g.label,
              bold: true,
              allCaps: true,
              size: hp(10.5),
              color: '9A948A',
              font,
              characterSpacing: tw(0.1 * 10.5),
            }),
            new TextRun({ text: g.label ? '   ' : '', size: hp(12.5), font }),
            new TextRun({ text: g.items, size: hp(12.5), color: '3B3833', font }),
          ],
          spacing: { before: sectionLead() ?? tw(gi === 0 ? 11 : 8) },
          widowControl: false,
        }),
      );
    });

    (sec.skillLevels || []).forEach((sk, ki) => {
      const readout =
        sec.style === '7d'
          ? [new TextRun({ text: `  —  ${sk.pct}%`, size: hp(10.5), color: '9A948A', font })]
          : [
              new TextRun({ text: '  ' + '●'.repeat(Math.min(5, Math.max(0, sk.dots))), size: hp(12.5), color: '3E5C76', font }),
              new TextRun({ text: '○'.repeat(5 - Math.min(5, Math.max(0, sk.dots))), size: hp(12.5), color: 'E6E2DA', font }),
            ];
      children.push(
        new Paragraph({
          children: [new TextRun({ text: sk.name, size: hp(12.5), color: '2E2B26', font }), ...readout],
          spacing: { before: sectionLead() ?? tw(ki === 0 ? 12 : 9) },
          widowControl: false,
        }),
      );
    });

    (sec.entries || []).forEach((en) => {
      const brk = breakBefore(en.key);
      const headerRuns: any[] = [
        new TextRun({ text: en.title || '', bold: true, size: hp(15), color: '2E2B26', font }),
      ];
      if (en.dates)
        headerRuns.push(new TextRun({ text: '\t' + en.dates, size: hp(12.5), color: '6B665E', font }));
      children.push(
        new Paragraph({
          children: headerRuns,
          tabStops: [{ type: TabStopType.RIGHT, position: contentTwips }],
          spacing: { before: sectionLead() ?? tw(16) },
          keepNext: true,
          pageBreakBefore: brk,
        }),
      );
      if (en.subtitle)
        children.push(
          new Paragraph({
            children: [new TextRun({ text: en.subtitle, size: hp(13.5), color: '6B665E', font })],
            spacing: { before: tw(3) },
            keepNext: !!(en.desc || en.contribs.length || en.link),
          }),
        );
      if (en.link)
        children.push(
          new Paragraph({
            children: [
              new ExternalHyperlink({
                link: en.link.url,
                children: [
                  new TextRun({ text: en.link.text || en.link.url, size: hp(12.5), color: accentHex, font, underline: {} }),
                ],
              }),
            ],
            spacing: { before: tw(4) },
          }),
        );
      if (en.desc)
        children.push(
          ...bodyParagraphs(en.desc, { sizePx: 13.5, color: '3B3833', lineHeight: 1.6, beforePx: 6 }),
        );
      en.contribs.forEach((c, ci) =>
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: '•  ', size: hp(13), color: accentHex, font }),
              new TextRun({ text: c, size: hp(13.5), color: '3B3833', font }),
            ],
            indent: { left: tw(16), hanging: tw(16) },
            spacing: { before: tw(ci === 0 ? 5 : 2), line: tw(13.5 * 1.6), lineRule: 'exact' },
            widowControl: false,
          }),
        ),
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: twIn(widthIn), height: twIn(heightIn) },
            margin: {
              top: twIn(m.top),
              right: twIn(m.right),
              bottom: twIn(m.bottom),
              left: twIn(m.left),
            },
          },
        },
        children,
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (model.name || 'resume').trim().replace(/\s+/g, '_') + '.docx';
  a.click();
  URL.revokeObjectURL(url);
}
