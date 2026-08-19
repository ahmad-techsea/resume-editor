function RowsDatesRight() {
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
        AWARDS &amp; ACHIEVEMENTS
      </div>
      <div
        style={{
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'baseline',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#2E2B26' }}>
            Engineering Excellence Award
          </div>
          <div style={{ fontSize: '11.5px', color: '#6B665E' }}>
            Fieldstone Labs — top honor across 120 engineers
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: '#9A948A', flex: 'none' }}>2024</div>
      </div>
      <div
        style={{
          marginTop: '9px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'baseline',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#2E2B26' }}>
            Best Demo, ReactConf Hackathon
          </div>
          <div style={{ fontSize: '11.5px', color: '#6B665E' }}>
            Built a live accessibility linter in 24 hours
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: '#9A948A', flex: 'none' }}>2019</div>
      </div>
    </div>
  );
}

export default Object.assign(RowsDatesRight, {
  templateId: '6b',
  templateLabel: 'Rows, dates right',
});
