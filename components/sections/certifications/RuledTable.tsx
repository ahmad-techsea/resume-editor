function RuledTable() {
  return (
    <div className="dv-card" style={{ width: '430px' }}>
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
        CERTIFICATIONS
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '0 16px',
          marginTop: '5px',
          fontSize: '12.5px',
        }}
      >
        <div
          style={{
            padding: '8px 0',
            borderBottom: '1px solid #F0EDE7',
            fontWeight: '600',
            color: '#2E2B26',
          }}
        >
          AWS Solutions Architect – Associate
        </div>
        <div style={{ padding: '8px 0', borderBottom: '1px solid #F0EDE7', color: '#6B665E' }}>
          AWS
        </div>
        <div style={{ padding: '8px 0', borderBottom: '1px solid #F0EDE7', color: '#9A948A' }}>
          2024
        </div>
        <div
          style={{
            padding: '8px 0',
            borderBottom: '1px solid #F0EDE7',
            fontWeight: '600',
            color: '#2E2B26',
          }}
        >
          Professional Cloud Architect
        </div>
        <div style={{ padding: '8px 0', borderBottom: '1px solid #F0EDE7', color: '#6B665E' }}>
          Google Cloud
        </div>
        <div style={{ padding: '8px 0', borderBottom: '1px solid #F0EDE7', color: '#9A948A' }}>
          2023
        </div>
        <div style={{ padding: '8px 0', fontWeight: '600', color: '#2E2B26' }}>
          Certified Kubernetes Administrator
        </div>
        <div style={{ padding: '8px 0', color: '#6B665E' }}>CNCF</div>
        <div style={{ padding: '8px 0', color: '#9A948A' }}>2022</div>
      </div>
    </div>
  );
}

export default Object.assign(RuledTable, {
  templateId: '5e',
  templateLabel: 'Ruled table',
});
