function BoldHookDetail() {
  return (
    <div className="dv-card">
      <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#26231F', lineHeight: '1.4' }}>
        Frontend architecture, design systems, and developer tools.
      </div>
      <p
        style={{
          margin: '6px 0 0',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#6B665E',
          textWrap: 'pretty',
        }}
      >
        8 years of experience; led frontend for products serving 2M+ users. Focused on performance,
        accessibility, and mentoring.
      </p>
    </div>
  );
}

export default Object.assign(BoldHookDetail, {
  templateId: '1e',
  templateLabel: 'Bold hook + detail',
});
