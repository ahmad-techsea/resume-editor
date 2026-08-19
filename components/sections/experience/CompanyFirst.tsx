function CompanyFirst() {
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
        EXPERIENCE
      </div>
      <div
        style={{
          marginTop: '12px',
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '.11em',
          color: '#3E5C76',
        }}
      >
        FIELDSTONE LABS
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '12px',
          marginTop: '2px',
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#26231F' }}>
          Senior Software Engineer
        </div>
        <div style={{ fontSize: '11.5px', color: '#6B665E', flex: 'none' }}>Mar 2022 – Present</div>
      </div>
      <p
        style={{
          margin: '5px 0 0',
          fontSize: '12.5px',
          lineHeight: '1.58',
          color: '#3B3833',
          textWrap: 'pretty',
        }}
      >
        Lead engineer on the design systems team. Built a component library used across four
        products; mentor three engineers.
      </p>
    </div>
  );
}

export default Object.assign(CompanyFirst, {
  templateId: '4d',
  templateLabel: 'Company first',
});
