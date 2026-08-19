function GroupedColumns() {
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '92px 1fr',
          gap: '8px 14px',
          marginTop: '11px',
          alignItems: 'baseline',
        }}
      >
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: '700',
            letterSpacing: '.1em',
            color: '#9A948A',
          }}
        >
          LANGUAGES
        </div>
        <div style={{ fontSize: '12.5px', color: '#3B3833', lineHeight: '1.7' }}>
          TypeScript, JavaScript, Python
        </div>
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: '700',
            letterSpacing: '.1em',
            color: '#9A948A',
          }}
        >
          FRAMEWORKS
        </div>
        <div style={{ fontSize: '12.5px', color: '#3B3833', lineHeight: '1.7' }}>
          React, Node.js, GraphQL
        </div>
        <div
          style={{
            fontSize: '10.5px',
            fontWeight: '700',
            letterSpacing: '.1em',
            color: '#9A948A',
          }}
        >
          PRACTICES
        </div>
        <div style={{ fontSize: '12.5px', color: '#3B3833', lineHeight: '1.7' }}>
          Design systems, Accessibility, CI/CD
        </div>
      </div>
    </div>
  );
}

export default Object.assign(GroupedColumns, {
  templateId: '7c',
  templateLabel: 'Grouped rows',
});
