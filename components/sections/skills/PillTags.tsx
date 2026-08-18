function PillTags() {
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '11px' }}>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '4px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          TypeScript
        </span>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '4px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          React
        </span>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '4px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          Node.js
        </span>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '4px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          GraphQL
        </span>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '4px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          Design systems
        </span>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '4px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          Accessibility
        </span>
        <span
          style={{
            border: '1px solid #D8D4CC',
            borderRadius: '999px',
            padding: '4px 11px',
            fontSize: '11.5px',
            color: '#3B3833',
          }}
        >
          CI/CD
        </span>
      </div>
    </div>
  );
}

export default Object.assign(PillTags, {
  templateId: '7b',
  templateLabel: 'Pill tags',
});
