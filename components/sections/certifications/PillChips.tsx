function PillChips() {
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '11px' }}>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '5px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          AWS Solutions Architect <span style={{ color: '#9A948A' }}>· 2024</span>
        </span>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '5px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          GCP Cloud Architect <span style={{ color: '#9A948A' }}>· 2023</span>
        </span>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '5px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          CKA <span style={{ color: '#9A948A' }}>· 2022</span>
        </span>
      </div>
    </div>
  );
}

export default Object.assign(PillChips, {
  templateId: '5d',
  templateLabel: 'Pill chips',
});
