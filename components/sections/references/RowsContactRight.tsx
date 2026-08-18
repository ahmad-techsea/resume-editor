function RowsContactRight() {
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
        style={{
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'baseline',
        }}
      >
        <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>
          <span style={{ fontWeight: '600' }}>Jordan Patel,</span> Director of Engineering,
          Fieldstone Labs
        </div>
        <div style={{ fontSize: '11px', color: '#3E5C76', flex: 'none' }}>
          jordan.patel@fieldstone.dev
        </div>
      </div>
      <div
        style={{
          marginTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'baseline',
        }}
      >
        <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>
          <span style={{ fontWeight: '600' }}>Alicia Gomez,</span> Engineering Manager, Copperline
          Software
        </div>
        <div style={{ fontSize: '11px', color: '#3E5C76', flex: 'none' }}>+1 (415) 555-0148</div>
      </div>
    </div>
  );
}

export default Object.assign(RowsContactRight, {
  templateId: '8c',
  templateLabel: 'Rows, contact right',
});
