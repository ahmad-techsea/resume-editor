import { hexToRgb } from '@/lib/resume-data/editor-resume-data';
import type { ExportModel } from './build-model';

export interface ExportMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export async function exportResumeToPDF(
  model: ExportModel,
  templateFont: string,
  margins: ExportMargins,
  accent: string,
): Promise<void> {
  let jsPDFCtor: any;
  try {
    ({ jsPDF: jsPDFCtor } = await import('jspdf'));
  } catch {
    jsPDFCtor = null;
  }
  if (!jsPDFCtor) {
    alert('PDF library failed to load — check your connection and try again.');
    return;
  }
  const m = margins;
  const baseFont = /georgia|times/i.test(templateFont) ? 'times' : 'helvetica';
  const [ar, ag, ab] = hexToRgb(accent);
  const doc = new jsPDFCtor({ unit: 'in', format: 'letter' });
  const pageW = 8.5,
    pageH = 11;
  const contentW = pageW - m.left - m.right;
  let y = m.top;
  const ensureRoom = (h: number) => {
    if (y + h > pageH - m.bottom) {
      doc.addPage();
      y = m.top;
    }
  };
  const writeLines = (text: string, size: number, opts?: any) => {
    opts = opts || {};
    doc.setFont(baseFont, opts.style || 'normal');
    doc.setFontSize(size);
    doc.setTextColor(
      opts.color ? opts.color[0] : 40,
      opts.color ? opts.color[1] : 38,
      opts.color ? opts.color[2] : 34,
    );
    const indent = opts.indent || 0;
    const lines = doc.splitTextToSize(text, contentW - indent);
    const lh = (size / 72) * 1.32;
    lines.forEach((line: string) => {
      ensureRoom(lh);
      doc.text(line, m.left + indent, y);
      y += lh;
    });
    y += opts.gapAfter || 0;
  };
  doc.setFont(baseFont, 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 27, 22);
  ensureRoom(0.3);
  doc.text(model.name || 'Your name', m.left, y);
  y += 0.3;
  if (model.title) writeLines(model.title, 11, { color: [90, 90, 84], gapAfter: 0.06 });
  if (model.contacts.length) {
    doc.setFont(baseFont, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(70, 68, 65);
    let cx = m.left;
    ensureRoom(0.2);
    model.contacts.forEach((c, i) => {
      const sep = i < model.contacts.length - 1 ? '   ·   ' : '';
      if (c.url) doc.textWithLink(c.text, cx, y, { url: c.url });
      else doc.text(c.text, cx, y);
      cx += doc.getTextWidth(c.text + sep);
    });
    y += 0.22;
  }
  y += 0.12;
  model.sections.forEach((sec) => {
    ensureRoom(0.25);
    doc.setDrawColor(ar, ag, ab);
    doc.setFont(baseFont, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(ar, ag, ab);
    doc.text((sec.title || '').toUpperCase(), m.left, y);
    doc.setLineWidth(0.01);
    doc.line(m.left, y + 0.05, pageW - m.right, y + 0.05);
    y += 0.2;
    if (sec.kind === 'text') {
      if (sec.body) writeLines(sec.body, 9.8, { color: [55, 52, 48], gapAfter: 0.14 });
    } else {
      (sec.entries || []).forEach((en) => {
        ensureRoom(0.2);
        doc.setFont(baseFont, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(35, 33, 30);
        doc.text(en.title || '', m.left, y);
        if (en.dates) {
          doc.setFont(baseFont, 'normal');
          doc.setFontSize(9);
          doc.setTextColor(120, 116, 108);
          doc.text(en.dates, pageW - m.right, y, { align: 'right' });
        }
        y += 0.17;
        if (en.subtitle)
          writeLines(en.subtitle, 9.5, { style: 'italic', color: [100, 96, 90], gapAfter: 0.04 });
        if (en.link) {
          doc.setFont(baseFont, 'normal');
          doc.setTextColor(ar, ag, ab);
          doc.setFontSize(8.5);
          doc.textWithLink(en.link.text || en.link.url, m.left, y, { url: en.link.url });
          y += 0.14;
        }
        if (en.desc) writeLines(en.desc, 9.5, { color: [55, 52, 48], gapAfter: 0.03 });
        en.contribs.forEach((c: string) =>
          writeLines('•  ' + c, 9.5, { color: [55, 52, 48], indent: 0.12 }),
        );
        y += 0.12;
      });
    }
  });
  doc.save((model.name || 'resume').trim().replace(/\s+/g, '_') + '.pdf');
}
