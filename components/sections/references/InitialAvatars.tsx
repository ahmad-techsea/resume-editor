function InitialAvatars() {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
        <div style={{ display: 'flex', gap: '11px', alignItems: 'center' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              flex: 'none',
              borderRadius: '50%',
              background: 'color-mix(in oklab,#3E5C76 12%,#fff)',
              color: '#3E5C76',
              fontSize: '12px',
              fontWeight: '700',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            JP
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#2E2B26' }}>
              Jordan Patel — Director of Engineering, Fieldstone Labs
            </div>
            <div style={{ fontSize: '11px', color: '#6B665E', marginTop: '1px' }}>
              jordan.patel@fieldstone.dev · +1 (415) 555-0117
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '11px', alignItems: 'center' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              flex: 'none',
              borderRadius: '50%',
              background: 'color-mix(in oklab,#3E5C76 12%,#fff)',
              color: '#3E5C76',
              fontSize: '12px',
              fontWeight: '700',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            AG
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#2E2B26' }}>
              Alicia Gomez — Engineering Manager, Copperline Software
            </div>
            <div style={{ fontSize: '11px', color: '#6B665E', marginTop: '1px' }}>
              alicia.gomez@copperline.io · +1 (415) 555-0148
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(InitialAvatars, {
  templateId: '8e',
  templateLabel: 'Initial avatars',
});
