function SideLabel() {
  return (
    <div className="dv-card">
      <div style={{ display: 'grid', gridTemplateColumns: '92px 1fr', gap: '18px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '.13em',
            color: '#3E5C76',
            paddingTop: '2px',
          }}
        >
          SUMMARY
        </div>
        <p
          style={{
            margin: '0',
            fontSize: '13.5px',
            lineHeight: '1.62',
            color: '#3B3833',
            textWrap: 'pretty',
          }}
        >
          Software engineer with 8 years of experience building web applications and developer
          tools. Led frontend architecture for products serving 2M+ users.
        </p>
      </div>
    </div>
  );
}

export default Object.assign(SideLabel, {
  templateId: '1b',
  templateLabel: 'Side label',
});
