function CardPair() {
  return (
    <div className="dv-card" style={{ width: '430px' }}>
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
        REFERENCES
      </div>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '11px' }}
      >
        <div style={{ border: '1px solid #E6E2DA', borderRadius: '8px', padding: '11px 12px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#2E2B26' }}>
            Jordan Patel
          </div>
          <div
            style={{ fontSize: '11.5px', color: '#6B665E', marginTop: '2px', lineHeight: '1.5' }}
          >
            Director of Engineering
            <br />
            Fieldstone Labs
          </div>
          <div style={{ fontSize: '11px', color: '#3E5C76', marginTop: '5px' }}>
            jordan.patel@fieldstone.dev
          </div>
        </div>
        <div style={{ border: '1px solid #E6E2DA', borderRadius: '8px', padding: '11px 12px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#2E2B26' }}>
            Alicia Gomez
          </div>
          <div
            style={{ fontSize: '11.5px', color: '#6B665E', marginTop: '2px', lineHeight: '1.5' }}
          >
            Engineering Manager
            <br />
            Copperline Software
          </div>
          <div style={{ fontSize: '11px', color: '#3E5C76', marginTop: '5px' }}>
            alicia.gomez@copperline.io
          </div>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(CardPair, {
  templateId: '8a',
  templateLabel: 'Card pair',
});
