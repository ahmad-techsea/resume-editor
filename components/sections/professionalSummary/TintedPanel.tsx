function TintedPanel() {
  return (
    <div className="dv-card">
      <div
        style={{
          background: 'color-mix(in oklab,#3E5C76 5%,#fff)',
          borderRadius: '8px',
          padding: '15px 17px',
        }}
      >
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: '700',
            letterSpacing: '.13em',
            color: '#3E5C76',
          }}
        >
          SUMMARY
        </div>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '13px',
            lineHeight: '1.6',
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

export default Object.assign(TintedPanel, {
  templateId: '1d',
  templateLabel: 'Tinted panel',
});
