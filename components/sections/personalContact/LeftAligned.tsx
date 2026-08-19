function LeftAligned() {
  return (
    <div className="dv-card" style={{ width: '430px' }}>
      <div
        style={{
          fontSize: '26px',
          fontWeight: '700',
          letterSpacing: '-.015em',
          color: '#26231F',
          lineHeight: '1.15',
        }}
      >
        Maya Chen
      </div>
      <div style={{ fontSize: '13px', color: '#6B665E', marginTop: '3px' }}>
        Senior Software Engineer
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 8px',
          marginTop: '12px',
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

export default Object.assign(LeftAligned, {
  templateId: '2a',
  templateLabel: 'Left-aligned (current)',
});
