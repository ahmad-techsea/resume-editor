function CardPair() {
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
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '11px' }}
      >
        <div style={{ border: '1px solid #E6E2DA', borderRadius: '8px', padding: '11px 12px' }}>
          <div
            style={{ fontSize: '12.5px', fontWeight: '600', color: '#2E2B26', lineHeight: '1.4' }}
          >
            B.S. Computer Science
          </div>
          <div style={{ fontSize: '11.5px', color: '#6B665E', marginTop: '3px' }}>
            University of Washington
          </div>
          <div style={{ fontSize: '11px', color: '#9A948A', marginTop: '5px' }}>2014 – 2018</div>
        </div>
        <div style={{ border: '1px solid #E6E2DA', borderRadius: '8px', padding: '11px 12px' }}>
          <div
            style={{ fontSize: '12.5px', fontWeight: '600', color: '#2E2B26', lineHeight: '1.4' }}
          >
            A.S. Mathematics
          </div>
          <div style={{ fontSize: '11.5px', color: '#6B665E', marginTop: '3px' }}>
            Seattle Central College
          </div>
          <div style={{ fontSize: '11px', color: '#9A948A', marginTop: '5px' }}>2012 – 2014</div>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(CardPair, {
  templateId: '3d',
  templateLabel: 'Card pair',
});
