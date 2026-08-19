function CompactOneLiners() {
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
        EDUCATION
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'baseline',
          padding: '9px 0',
          borderBottom: '1px solid #F0EDE7',
        }}
      >
        <div style={{ fontSize: '13px', color: '#2E2B26' }}>
          <span style={{ fontWeight: '600' }}>B.S. Computer Science,</span> University of Washington
        </div>
        <div style={{ fontSize: '11.5px', color: '#6B665E', flex: 'none' }}>2014 – 2018</div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'baseline',
          padding: '9px 0',
        }}
      >
        <div style={{ fontSize: '13px', color: '#2E2B26' }}>
          <span style={{ fontWeight: '600' }}>A.S. Mathematics,</span> Seattle Central College
        </div>
        <div style={{ fontSize: '11.5px', color: '#6B665E', flex: 'none' }}>2012 – 2014</div>
      </div>
    </div>
  );
}

export default Object.assign(CompactOneLiners, {
  templateId: '3b',
  templateLabel: 'Compact one-liners',
});
