import React from 'react';

export interface MarginsOverlayProps {
  pgPadTop: number;
  pgPadBottom: number;
  pgPadLeft: number;
  pgPadRight: number;
  mTop: string;
  mBottom: string;
  mLeft: string;
  mRight: string;
  dragTop: (e: React.MouseEvent) => void;
  dragBottom: (e: React.MouseEvent) => void;
  dragLeft: (e: React.MouseEvent) => void;
  dragRight: (e: React.MouseEvent) => void;
}

export default function MarginsOverlay(v: MarginsOverlayProps) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: `${v.pgPadTop}px`,
          left: '0',
          right: '0',
          height: '0',
          borderTop: '1px dashed var(--acc,#3E5C76)',
          pointerEvents: 'none',
          zIndex: '5',
        }}
      />
      <div
        onMouseDown={v.dragTop}
        title="Drag to set top margin"
        style={{
          position: 'absolute',
          top: `${v.pgPadTop}px`,
          left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'auto',
          cursor: 'ns-resize',
          background: 'var(--acc,#3E5C76)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: '600',
          padding: '3px 8px',
          borderRadius: '999px',
          zIndex: '6',
          whiteSpace: 'nowrap',
        }}
      >
        Top {v.mTop}&quot;
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: `${v.pgPadBottom}px`,
          left: '0',
          right: '0',
          height: '0',
          borderTop: '1px dashed var(--acc,#3E5C76)',
          pointerEvents: 'none',
          zIndex: '5',
        }}
      />
      <div
        onMouseDown={v.dragBottom}
        title="Drag to set bottom margin"
        style={{
          position: 'absolute',
          bottom: `${v.pgPadBottom}px`,
          left: '50%',
          transform: 'translate(-50%,50%)',
          pointerEvents: 'auto',
          cursor: 'ns-resize',
          background: 'var(--acc,#3E5C76)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: '600',
          padding: '3px 8px',
          borderRadius: '999px',
          zIndex: '6',
          whiteSpace: 'nowrap',
        }}
      >
        Bottom {v.mBottom}&quot;
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${v.pgPadLeft}px`,
          top: '0',
          bottom: '0',
          width: '0',
          borderLeft: '1px dashed var(--acc,#3E5C76)',
          pointerEvents: 'none',
          zIndex: '5',
        }}
      />
      <div
        onMouseDown={v.dragLeft}
        title="Drag to set left margin"
        style={{
          position: 'absolute',
          left: `${v.pgPadLeft}px`,
          top: `calc(${v.pgPadTop}px / 2)`,
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'auto',
          cursor: 'ew-resize',
          background: 'var(--acc,#3E5C76)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: '600',
          padding: '3px 8px',
          borderRadius: '999px',
          zIndex: '6',
          whiteSpace: 'nowrap',
        }}
      >
        Left {v.mLeft}&quot;
      </div>
      <div
        style={{
          position: 'absolute',
          right: `${v.pgPadRight}px`,
          top: '0',
          bottom: '0',
          width: '0',
          borderLeft: '1px dashed var(--acc,#3E5C76)',
          pointerEvents: 'none',
          zIndex: '5',
        }}
      />
      <div
        onMouseDown={v.dragRight}
        title="Drag to set right margin"
        style={{
          position: 'absolute',
          right: `${v.pgPadRight}px`,
          top: `calc(${v.pgPadTop}px / 2)`,
          transform: 'translate(50%,-50%)',
          pointerEvents: 'auto',
          cursor: 'ew-resize',
          background: 'var(--acc,#3E5C76)',
          color: '#fff',
          fontSize: '10px',
          fontWeight: '600',
          padding: '3px 8px',
          borderRadius: '999px',
          zIndex: '6',
          whiteSpace: 'nowrap',
        }}
      >
        Right {v.mRight}&quot;
      </div>
    </>
  );
}
