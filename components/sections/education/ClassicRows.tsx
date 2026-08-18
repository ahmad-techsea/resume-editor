function ClassicRows() {
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
          marginTop: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2E2B26' }}>
          B.S. Computer Science
        </div>
        <div style={{ fontSize: '11.5px', color: '#6B665E', flex: 'none' }}>
          Sep 2014 – Jun 2018
        </div>
      </div>
      <div style={{ fontSize: '12.5px', color: '#6B665E', marginTop: '2px' }}>
        University of Washington
      </div>
      <div
        style={{
          marginTop: '5px',
          fontSize: '12.5px',
          lineHeight: '1.55',
          color: '#3B3833',
          display: 'flex',
          gap: '7px',
        }}
      >
        <span style={{ color: '#3E5C76' }}>•</span>Dean’s List, six quarters — graduated with honors
      </div>
    </div>
  );
}

export default Object.assign(ClassicRows, {
  templateId: '3a',
  templateLabel: 'Classic rows (current)',
});
