function TintedPanels() {
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
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginTop: '11px',
        }}
      >
        <div
          style={{
            background: 'color-mix(in oklab,#3E5C76 5%,#fff)',
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
            Engineering Excellence Award
          </div>
          <div style={{ fontSize: '11px', color: '#6B665E', marginTop: '4px' }}>
            Fieldstone Labs · 2024
          </div>
        </div>
        <div
          style={{
            background: 'color-mix(in oklab,#3E5C76 5%,#fff)',
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
            Best Demo, ReactConf Hackathon
          </div>
          <div style={{ fontSize: '11px', color: '#6B665E', marginTop: '4px' }}>
            ReactConf · 2019
          </div>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(TintedPanels, {
  templateId: '6d',
  templateLabel: 'Tinted panels',
});
