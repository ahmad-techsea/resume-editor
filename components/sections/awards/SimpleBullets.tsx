function SimpleBullets() {
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
          marginTop: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          fontSize: '12.5px',
          lineHeight: '1.55',
          color: '#3B3833',
        }}
      >
        <div style={{ display: 'flex', gap: '7px' }}>
          <span style={{ color: '#3E5C76' }}>•</span>
          <span>
            <span style={{ fontWeight: '600' }}>Engineering Excellence Award,</span> Fieldstone Labs
            (2024)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          <span style={{ color: '#3E5C76' }}>•</span>
          <span>
            <span style={{ fontWeight: '600' }}>Best Demo,</span> ReactConf Hackathon (2019)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          <span style={{ color: '#3E5C76' }}>•</span>
          <span>
            <span style={{ fontWeight: '600' }}>Dean’s List,</span> six quarters, University of
            Washington
          </span>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(SimpleBullets, {
  templateId: '6c',
  templateLabel: 'Simple bullets',
});
