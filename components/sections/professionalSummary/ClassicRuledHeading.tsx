function ClassicRuledHeading() {
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
        SUMMARY
      </div>
      <p
        style={{
          margin: '10px 0 0',
          fontSize: '13.5px',
          lineHeight: '1.62',
          color: '#3B3833',
          textWrap: 'pretty',
        }}
      >
        Software engineer with 8 years of experience building web applications and developer tools.
        Led frontend architecture for products serving 2M+ users, with a focus on design systems and
        performance.
      </p>
    </div>
  );
}

export default Object.assign(ClassicRuledHeading, {
  templateId: '1a',
  templateLabel: 'Classic ruled heading',
});
