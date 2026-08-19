function TimelineRail() {
  return (
    <div className="dv-card">
      <div
        style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '.14em',
          color: '#3E5C76',
          borderBottom: '1px solid #E6E2DA',
          paddingBottom: '5px',
        }}
      >
        EXPERIENCE
      </div>
      <div
        style={{
          marginTop: '12px',
          borderLeft: '2px solid #E6E2DA',
          paddingLeft: '16px',
          position: 'relative',
          paddingBottom: '14px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '-5px',
            top: '3px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#3E5C76',
          }}
        ></div>
        <div style={{ fontSize: '11px', color: '#9A948A' }}>Mar 2022 – Present</div>
        <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#2E2B26', marginTop: '1px' }}>
          Senior Software Engineer · Fieldstone Labs
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '12.5px', lineHeight: '1.55', color: '#3B3833' }}>
          Lead engineer on the design systems team; mentor three engineers.
        </p>
      </div>
      <div style={{ borderLeft: '2px solid #E6E2DA', paddingLeft: '16px', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: '-5px',
            top: '3px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            border: '2px solid #3E5C76',
            background: '#fff',
            boxSizing: 'border-box',
          }}
        ></div>
        <div style={{ fontSize: '11px', color: '#9A948A' }}>Jul 2018 – Feb 2022</div>
        <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#2E2B26', marginTop: '1px' }}>
          Software Engineer · Copperline Software
        </div>
      </div>
    </div>
  );
}

export default Object.assign(TimelineRail, {
  templateId: '4c',
  templateLabel: 'Timeline rail',
});
