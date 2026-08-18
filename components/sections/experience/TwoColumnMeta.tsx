function TwoColumnMeta() {
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
        EXPERIENCE
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '128px 1fr',
          gap: '14px',
          marginTop: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#2E2B26' }}>
            Fieldstone Labs
          </div>
          <div style={{ fontSize: '11px', color: '#9A948A', marginTop: '2px', lineHeight: '1.5' }}>
            Mar 2022 –<br />
            Present
          </div>
        </div>
        <div>
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#2E2B26' }}>
            Senior Software Engineer
          </div>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '12.5px',
              lineHeight: '1.55',
              color: '#3B3833',
              textWrap: 'pretty',
            }}
          >
            Lead engineer on the design systems team. Built a component library adopted across four
            products.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(TwoColumnMeta, {
  templateId: '4e',
  templateLabel: 'Two-column meta',
});
