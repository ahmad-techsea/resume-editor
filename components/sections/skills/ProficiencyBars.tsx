function ProficiencyBars() {
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
        SKILLS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '12px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>TypeScript</div>
          <div style={{ height: '5px', background: '#F0EDE7', borderRadius: '99px' }}>
            <div
              style={{ width: '92%', height: '100%', background: '#3E5C76', borderRadius: '99px' }}
            ></div>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>React</div>
          <div style={{ height: '5px', background: '#F0EDE7', borderRadius: '99px' }}>
            <div
              style={{ width: '88%', height: '100%', background: '#3E5C76', borderRadius: '99px' }}
            ></div>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>Node.js</div>
          <div style={{ height: '5px', background: '#F0EDE7', borderRadius: '99px' }}>
            <div
              style={{ width: '74%', height: '100%', background: '#3E5C76', borderRadius: '99px' }}
            ></div>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '110px 1fr',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>GraphQL</div>
          <div style={{ height: '5px', background: '#F0EDE7', borderRadius: '99px' }}>
            <div
              style={{ width: '62%', height: '100%', background: '#3E5C76', borderRadius: '99px' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(ProficiencyBars, {
  templateId: '7d',
  templateLabel: 'Proficiency bars',
});
