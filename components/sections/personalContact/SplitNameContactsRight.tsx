function SplitNameContactsRight() {
  return (
    <div className="dv-card" style={{ width: '430px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '-.015em',
              color: '#26231F',
              lineHeight: '1.15',
            }}
          >
            Maya Chen
          </div>
          <div style={{ fontSize: '13px', color: '#6B665E', marginTop: '3px' }}>
            Senior Software Engineer
          </div>
        </div>
        <div
          style={{
            textAlign: 'right',
            fontSize: '11.5px',
            color: '#4C4841',
            lineHeight: '1.7',
            flex: 'none',
          }}
        >
          <div>hello@mayachen.dev</div>
          <div>+1 (415) 555-0192</div>
          <div>San Francisco, CA</div>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(SplitNameContactsRight, {
  templateId: '2c',
  templateLabel: 'Split: name left, contacts right',
});
