function DotRatings() {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>TypeScript</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>React</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#E6E2DA' }}
            ></span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>Node.js</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#E6E2DA' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#E6E2DA' }}
            ></span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12.5px', color: '#2E2B26' }}>GraphQL</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3E5C76' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#E6E2DA' }}
            ></span>
            <span
              style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#E6E2DA' }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(DotRatings, {
  templateId: '7e',
  templateLabel: 'Dot ratings',
});
