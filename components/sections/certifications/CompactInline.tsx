function CompactInline() {
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
        CERTIFICATIONS
      </div>
      <div style={{ marginTop: '10px', fontSize: '12.5px', lineHeight: '1.85', color: '#3B3833' }}>
        <div>
          <span style={{ fontWeight: '600' }}>AWS Certified Solutions Architect – Associate</span> —
          Amazon Web Services · 2024
        </div>
        <div>
          <span style={{ fontWeight: '600' }}>Professional Cloud Architect</span> — Google Cloud ·
          2023
        </div>
        <div>
          <span style={{ fontWeight: '600' }}>Certified Kubernetes Administrator</span> — CNCF ·
          2022
        </div>
      </div>
    </div>
  );
}

export default Object.assign(CompactInline, {
  templateId: '5c',
  templateLabel: 'Compact inline',
});
