import React from 'react';
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
  children,
}: DrawerProps) {
  const ChevronOpen = side === 'left' ? FiChevronLeft : FiChevronRight;
  const ChevronClosed = side === 'left' ? FiChevronRight : FiChevronLeft;
  return (
    <>
      <button
        type="button"
        className={`ire-drawer-toggle side-${side} no-print`}
        onClick={onToggle}
        aria-expanded={open}
        aria-label={toggleLabel}
      >
        {open ? <ChevronOpen size={15} /> : <ChevronClosed size={15} />}
      </button>
      {open && (
        <div
          className={`ire-drawer-backdrop open no-print`}
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
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
