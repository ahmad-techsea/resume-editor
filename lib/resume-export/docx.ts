import { firstFont } from '@/lib/resume-data/editor-resume-data';
import { PAGE_SIZES_IN, type PageSizeId } from '@/lib/resume-pagination/page-constants';
import type { ExportModel } from './build-model';
import type { ExportMargins } from './pdf';

export async function exportResumeToDocx(
  model: ExportModel,
  templateFont: string,
  margins: ExportMargins,
  accent: string,
  pageSize: PageSizeId,
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
  const { Document, Packer, Paragraph, TextRun, ExternalHyperlink, BorderStyle, TabStopType } =
    docxLib;
  const m = margins;
  const { widthIn, heightIn } = PAGE_SIZES_IN[pageSize];
  const font = firstFont(templateFont);
  const accentHex = accent.replace('#', '');
  const twips = (inch: number) => Math.round(inch * 1440);
  const contentTwips = twips(widthIn - m.left - m.right);
  const children: any[] = [];
  children.push(
    new Paragraph({
      children: [new TextRun({ text: model.name || 'Your name', bold: true, size: 40, font })],
      spacing: { after: 60 },
    }),
  );
  if (model.title)
    children.push(
      new Paragraph({
        children: [new TextRun({ text: model.title, size: 22, color: '5A5A54', font })],
        spacing: { after: 100 },
      }),
    );
  if (model.contacts.length) {
    const runs: any[] = [];
    model.contacts.forEach((c, i) => {
      if (c.url)
        runs.push(
          new ExternalHyperlink({
            link: c.url,
            children: [
              new TextRun({ text: c.text, size: 19, color: accentHex, font, underline: {} }),
            ],
          }),
        );
      else runs.push(new TextRun({ text: c.text, size: 19, color: '46443E', font }));
      if (i < model.contacts.length - 1)
        runs.push(new TextRun({ text: '   ·   ', size: 19, color: '46443E', font }));
    });
    children.push(new Paragraph({ children: runs, spacing: { after: 200 } }));
  }
  model.sections.forEach((sec) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: (sec.title || '').toUpperCase(),
            bold: true,
            size: 19,
            color: accentHex,
            font,
          }),
        ],
        spacing: { before: 160, after: 80 },
        border: { bottom: { color: 'E6E2DA', space: 4, style: BorderStyle.SINGLE, size: 4 } },
      }),
    );
    if (sec.kind === 'text') {
      if (sec.body)
        children.push(
          new Paragraph({
            children: [new TextRun({ text: sec.body, size: 20, font })],
            spacing: { after: 140 },
          }),
        );
    } else {
      (sec.entries || []).forEach((en) => {
        const headerRuns = [new TextRun({ text: en.title || '', bold: true, size: 22, font })];
        if (en.dates)
          headerRuns.push(new TextRun({ text: '\t' + en.dates, size: 18, color: '78746C', font }));
        children.push(
          new Paragraph({
            children: headerRuns,
            tabStops: [{ type: TabStopType.RIGHT, position: contentTwips }],
            spacing: { after: 20 },
          }),
        );
        if (en.subtitle)
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: en.subtitle, italics: true, size: 19, color: '64605A', font }),
              ],
              spacing: { after: 20 },
            }),
          );
        if (en.link)
          children.push(
            new Paragraph({
              children: [
                new ExternalHyperlink({
                  link: en.link.url,
                  children: [
                    new TextRun({
                      text: en.link.text || en.link.url,
                      size: 17,
                      color: accentHex,
                      font,
                      underline: {},
                    }),
                  ],
                }),
              ],
              spacing: { after: 40 },
            }),
          );
        if (en.desc)
          children.push(
            new Paragraph({
              children: [new TextRun({ text: en.desc, size: 19, font })],
              spacing: { after: 30 },
            }),
          );
        en.contribs.forEach((c: string) =>
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '•  ' + c, size: 19, font })],
              indent: { left: 180 },
              spacing: { after: 20 },
            }),
          ),
        );
        children.push(new Paragraph({ text: '', spacing: { after: 60 } }));
      });
    }
  });
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: twips(widthIn),
              height: twips(heightIn),
            },
            margin: {
              top: twips(m.top),
              right: twips(m.right),
              bottom: twips(m.bottom),
              left: twips(m.left),
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
