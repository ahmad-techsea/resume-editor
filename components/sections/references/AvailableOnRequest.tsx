function AvailableOnRequest() {
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
      <div
        style={{
          marginTop: '12px',
          textAlign: 'center',
          fontSize: '12.5px',
          color: '#6B665E',
          padding: '6px 0 2px',
        }}
      >
        References available upon request.
      </div>
    </div>
  );
}

export default Object.assign(AvailableOnRequest, {
  templateId: '8b',
  templateLabel: 'Available on request',
});
