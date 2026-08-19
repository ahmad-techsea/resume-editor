function CardGrid() {
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginTop: '11px',
        }}
      >
        <div
          style={{
            border: '1px solid #E6E2DA',
            borderRadius: '8px',
            padding: '11px 12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#2E2B26',
              lineHeight: '1.4',
            }}
          >
            AWS Solutions Architect – Associate
          </div>
          <div style={{ fontSize: '11px', color: '#9A948A', marginTop: '4px' }}>AWS · 2024</div>
        </div>
        <div
          style={{
            border: '1px solid #E6E2DA',
            borderRadius: '8px',
            padding: '11px 12px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#2E2B26',
              lineHeight: '1.4',
            }}
          >
            Professional Cloud Architect
          </div>
          <div style={{ fontSize: '11px', color: '#9A948A', marginTop: '4px' }}>
            Google Cloud · 2023
          </div>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(CardGrid, {
  templateId: '5b',
  templateLabel: 'Card grid',
});
