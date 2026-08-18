function QuoteEndorsement() {
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
        REFERENCES
      </div>
      <p
        style={{
          margin: '11px 0 0',
          fontSize: '13.5px',
          lineHeight: '1.6',
          color: '#26231F',
          textWrap: 'pretty',
        }}
      >
        “Maya raises the bar for every team she joins — the rare engineer who owns quality end to
        end.”
      </p>
      <div style={{ marginTop: '7px', fontSize: '11.5px', color: '#6B665E' }}>
        Jordan Patel, Director of Engineering, Fieldstone Labs ·{' '}
        <span style={{ color: '#3E5C76' }}>jordan.patel@fieldstone.dev</span>
      </div>
    </div>
  );
}

export default Object.assign(QuoteEndorsement, {
  templateId: '8d',
  templateLabel: 'Quote endorsement',
});
