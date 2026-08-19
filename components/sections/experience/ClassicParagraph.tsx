function ClassicParagraph() {
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
          marginTop: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2E2B26' }}>
          Senior Software Engineer
        </div>
        <div style={{ fontSize: '11.5px', color: '#6B665E', flex: 'none' }}>Mar 2022 – Present</div>
      </div>
      <div style={{ fontSize: '12.5px', color: '#6B665E', marginTop: '2px' }}>Fieldstone Labs</div>
      <p
        style={{
          margin: '6px 0 0',
          fontSize: '12.5px',
          lineHeight: '1.58',
          color: '#3B3833',
          textWrap: 'pretty',
        }}
      >
        Lead engineer on the design systems team. Built a component library used across four
        products and drove the migration to TypeScript.
      </p>
    </div>
  );
}

export default Object.assign(ClassicParagraph, {
  templateId: '4a',
  templateLabel: 'Classic paragraph (current)',
});
