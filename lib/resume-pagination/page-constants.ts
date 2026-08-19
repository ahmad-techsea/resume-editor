// Single source of truth for physical page dimensions and default margins. Imported by the
// on-screen paginated view, the print stylesheet component, and the headless PDF export route —
// adding a new page size means adding one entry here, nowhere else.

export type PageSizeId = 'a4' | 'letter' | 'legal';

export const CSS_DPI = 96;
export const MM_PER_IN = 25.4;

interface PageSizeDef {
  widthIn: number;
  heightIn: number;
}

export const PAGE_SIZES_IN: Record<PageSizeId, PageSizeDef> = {
  a4: { widthIn: 210 / MM_PER_IN, heightIn: 297 / MM_PER_IN },
  letter: { widthIn: 8.5, heightIn: 11 },
  legal: { widthIn: 8.5, heightIn: 14 },
};

export const PAGE_SIZE_LABELS: Record<PageSizeId, string> = {
  a4: 'A4',
  letter: 'Letter',
  legal: 'Legal',
};

export const PAGE_SIZE_IDS: PageSizeId[] = ['a4', 'letter', 'legal'];

export const DEFAULT_PAGE_SIZE_ID: PageSizeId = 'a4';

/** Page margin default, all sides, in inches (0.5in = 12.7mm). No code outside this constant
 *  may assume a margin value — a programmatic margin change must flow through here or be passed
 *  explicitly. */
export const DEFAULT_MARGIN_IN = 0.5;

/** Tolerance for height/position comparisons so floating-point rounding can never make a block
 *  flip between pages on successive measurement passes. */
export const EPSILON_PX = 0.5;

export function isPageSizeId(v: unknown): v is PageSizeId {
  return typeof v === 'string' && (PAGE_SIZE_IDS as string[]).includes(v);
}

export function inToPx(inches: number): number {
  return inches * CSS_DPI;
}

export interface MarginsIn {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function uniformMarginsIn(value: number = DEFAULT_MARGIN_IN): MarginsIn {
  return { top: value, right: value, bottom: value, left: value };
}

export interface PageMetrics {
  pageSizeId: PageSizeId;
  widthIn: number;
  heightIn: number;
  widthPx: number;
  heightPx: number;
  marginsIn: MarginsIn;
  marginsPx: MarginsIn;
  /** Usable content box, i.e. page size minus margins — where actual resume content lives. */
  contentWidthPx: number;
  contentHeightPx: number;
}

export function pageSizePx(id: PageSizeId): { widthPx: number; heightPx: number } {
  const def = PAGE_SIZES_IN[id];
  return { widthPx: inToPx(def.widthIn), heightPx: inToPx(def.heightIn) };
}

export function getPageMetrics(
  pageSizeId: PageSizeId,
  marginsIn: MarginsIn = uniformMarginsIn(),
): PageMetrics {
  const def = PAGE_SIZES_IN[pageSizeId] || PAGE_SIZES_IN[DEFAULT_PAGE_SIZE_ID];
  const widthPx = inToPx(def.widthIn);
  const heightPx = inToPx(def.heightIn);
  const marginsPx: MarginsIn = {
    top: inToPx(marginsIn.top),
    right: inToPx(marginsIn.right),
    bottom: inToPx(marginsIn.bottom),
    left: inToPx(marginsIn.left),
  };
  return {
    pageSizeId,
    widthIn: def.widthIn,
    heightIn: def.heightIn,
    widthPx,
    heightPx,
    marginsIn,
    marginsPx,
    contentWidthPx: widthPx - marginsPx.left - marginsPx.right,
    contentHeightPx: heightPx - marginsPx.top - marginsPx.bottom,
  };
}
