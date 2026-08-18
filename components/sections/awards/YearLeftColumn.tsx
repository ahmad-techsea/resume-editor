function YearLeftColumn() {
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
        AWARDS
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '44px 1fr',
          gap: '9px 12px',
          marginTop: '11px',
          fontSize: '12.5px',
        }}
      >
        <div
          style={{
            color: '#3E5C76',
            fontWeight: '700',
            fontSize: '11.5px',
            paddingTop: '1px',
          }}
        >
          2024
        </div>
        <div>
          <span style={{ fontWeight: '600', color: '#2E2B26' }}>Engineering Excellence Award</span>
          <span style={{ color: '#6B665E' }}> — Fieldstone Labs</span>
        </div>
        <div
          style={{
            color: '#3E5C76',
            fontWeight: '700',
            fontSize: '11.5px',
            paddingTop: '1px',
          }}
        >
          2019
        </div>
        <div>
          <span style={{ fontWeight: '600', color: '#2E2B26' }}>
            Best Demo, ReactConf Hackathon
          </span>
        </div>
        <div
          style={{
            color: '#3E5C76',
            fontWeight: '700',
            fontSize: '11.5px',
            paddingTop: '1px',
          }}
        >
          2018
        </div>
        <div>
          <span style={{ fontWeight: '600', color: '#2E2B26' }}>Dean’s Medal finalist</span>
          <span style={{ color: '#6B665E' }}> — University of Washington</span>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(YearLeftColumn, {
  templateId: '6a',
  templateLabel: 'Year in left column',
});
