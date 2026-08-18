function ContributionBullets() {
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
          marginTop: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2E2B26' }}>
          Senior Software Engineer
        </div>
        <div style={{ fontSize: '11.5px', color: '#6B665E', flex: 'none' }}>Mar 2022 – Present</div>
      </div>
      <div style={{ fontSize: '12.5px', color: '#6B665E', marginTop: '2px' }}>Fieldstone Labs</div>
      <div
        style={{
          marginTop: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          fontSize: '12.5px',
          lineHeight: '1.55',
          color: '#3B3833',
        }}
      >
        <div style={{ display: 'flex', gap: '7px' }}>
          <span style={{ color: '#3E5C76' }}>•</span>Built a component library adopted across four
          products
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          <span style={{ color: '#3E5C76' }}>•</span>Cut UI defect reports by 38% with visual
          regression testing
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          <span style={{ color: '#3E5C76' }}>•</span>Drove the migration of 240k lines to TypeScript
        </div>
      </div>
    </div>
  );
}

export default Object.assign(ContributionBullets, {
  templateId: '4b',
  templateLabel: 'Contribution bullets',
});
