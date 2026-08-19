import React, { useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import '@/styles/editor-drawers.css';

export interface DrawerProps {
  side: 'left' | 'right';
  open: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  width?: number;
  toggleLabel: string;
  /** Shown on the desktop collapsed rail (see .ire-drawer-toggle.collapsed) — not used at all when
   *  open, or on mobile, where the toggle stays a plain chevron tab. */
  icon: React.ReactNode;
  /** Rail label text; defaults to `title` when the full title is short enough to fit vertically. */
  railLabel?: string;
  children: React.ReactNode;
}

export default function Drawer({
  side,
  open,
  onToggle,
  title,
  subtitle,
  width = 300,
  toggleLabel,
  icon,
  railLabel,
  children,
}: DrawerProps) {
  const ChevronOpen = side === 'left' ? FiChevronLeft : FiChevronRight;
  const ChevronClosed = side === 'left' ? FiChevronRight : FiChevronLeft;

  // Desktop: clicking anywhere outside every drawer/rail collapses this one back to its rail —
  // but a click inside *another* open drawer must not (both can be open independently), so this
  // checks the shared drawer/toggle classes rather than this instance's own DOM node. Deliberately
  // doesn't block the click from also reaching whatever's underneath (unlike the mobile backdrop
  // below) — collapsing while the same click focuses a resume field is the point, not a bug.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Element | null;
      if (target?.closest('.ire-drawer, .ire-drawer-toggle')) return;
      onToggle();
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, onToggle]);

  return (
    <>
      <button
        type="button"
        className={`ire-drawer-toggle side-${side} ${!open ? 'collapsed' : ''} no-print`}
        onClick={onToggle}
        aria-expanded={open}
        aria-label={toggleLabel}
      >
        {open ? (
          <ChevronOpen size={15} />
        ) : (
          <>
            <span className="ire-drawer-toggle-chevron">
              <ChevronClosed size={15} />
            </span>
            <span className="ire-drawer-toggle-icon">{icon}</span>
            <span className="ire-drawer-toggle-label">{railLabel ?? title}</span>
          </>
        )}
      </button>
      {open && <div className="ire-drawer-backdrop open no-print" aria-hidden="true" />}
      <div
        className={`ire-drawer side-${side} ${open ? 'open' : 'closed'} no-print`}
        style={{ ['--drawer-width' as string]: `${width}px` }}
        role="complementary"
        aria-label={title}
        aria-hidden={!open}
      >
        <div className="ire-drawer-header">
          <div>
            <div className="ire-drawer-title">{title}</div>
            {subtitle && <div className="ire-drawer-subtitle">{subtitle}</div>}
          </div>
          <button
            type="button"
            className="ire-drawer-close"
            onClick={onToggle}
            aria-label={`Close ${title}`}
          >
            <FiX size={16} />
          </button>
        </div>
        <div className="ire-drawer-body">{children}</div>
      </div>
    </>
  );
}
