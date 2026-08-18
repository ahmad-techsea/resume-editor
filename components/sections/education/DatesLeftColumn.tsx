function DatesLeftColumn() {
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
          display: 'grid',
          gridTemplateColumns: '104px 1fr',
          gap: '8px 14px',
          marginTop: '11px',
        }}
      >
        <div style={{ fontSize: '11.5px', color: '#9A948A', paddingTop: '1px' }}>2014 – 2018</div>
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#2E2B26' }}>
            B.S. Computer Science
          </div>
          <div style={{ fontSize: '12px', color: '#6B665E' }}>University of Washington</div>
        </div>
        <div style={{ fontSize: '11.5px', color: '#9A948A', paddingTop: '1px' }}>2012 – 2014</div>
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#2E2B26' }}>
            A.S. Mathematics
          </div>
          <div style={{ fontSize: '12px', color: '#6B665E' }}>Seattle Central College</div>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(DatesLeftColumn, {
  templateId: '3e',
  templateLabel: 'Dates in left column',
});
