function MonogramBlock() {
  return (
    <div className="dv-card" style={{ width: '430px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            flex: 'none',
            background: '#3E5C76',
            borderRadius: '8px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontSize: '17px',
            fontWeight: '700',
            letterSpacing: '.02em',
          }}
        >
          MC
        </div>
        <div>
          <div
            style={{
              fontSize: '21px',
              fontWeight: '700',
              letterSpacing: '-.01em',
              color: '#26231F',
              lineHeight: '1.15',
            }}
          >
            Maya Chen
          </div>
          <div style={{ fontSize: '12.5px', color: '#6B665E', marginTop: '2px' }}>
            Senior Software Engineer
          </div>
        </div>
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

export default Object.assign(MonogramBlock, {
  templateId: '2e',
  templateLabel: 'Monogram block',
});
