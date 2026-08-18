function CommaList() {
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
      <p style={{ margin: '10px 0 0', fontSize: '13px', lineHeight: '1.62', color: '#3B3833' }}>
        TypeScript, React, Node.js, GraphQL, design systems, accessibility, performance profiling,
        CI/CD
      </p>
    </div>
  );
}

export default Object.assign(CommaList, {
  templateId: '7a',
  templateLabel: 'Comma list (current)',
});
