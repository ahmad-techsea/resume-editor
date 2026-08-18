function AccentBanner() {
  return (
    <div className="dv-card" style={{ width: '430px', padding: '0' }}>
      <div style={{ background: '#3E5C76', padding: '18px 26px 16px' }}>
        <div
          style={{
            fontSize: '22px',
            fontWeight: '700',
            letterSpacing: '-.01em',
            color: '#fff',
            lineHeight: '1.15',
          }}
        >
          Maya Chen
        </div>
        <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.78)', marginTop: '3px' }}>
          Senior Software Engineer
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 8px',
          padding: '11px 26px 16px',
          fontSize: '11.5px',
          color: '#4C4841',
        }}
      >
        <span>hello@mayachen.dev</span>
        <span style={{ color: '#C9C4BB' }}>·</span>
        <span>+1 (415) 555-0192</span>
        <span style={{ color: '#C9C4BB' }}>·</span>
        <span>San Francisco, CA</span>
      </div>
    </div>
  );
}

export default Object.assign(AccentBanner, {
  templateId: '2d',
  templateLabel: 'Accent banner',
});
