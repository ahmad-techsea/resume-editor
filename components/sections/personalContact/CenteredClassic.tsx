function CenteredClassic() {
  return (
    <div className="dv-card" style={{ width: '430px' }}>
      <div
        style={{ textAlign: 'center', borderBottom: '1px solid #E6E2DA', paddingBottom: '14px' }}
      >
        <div
          style={{
            fontSize: '21px',
            fontWeight: '700',
            letterSpacing: '.09em',
            textTransform: 'uppercase',
            color: '#26231F',
          }}
        >
          Maya Chen
        </div>
        <div
          style={{
            fontSize: '12.5px',
            color: '#3E5C76',
            fontWeight: '600',
            marginTop: '3px',
            letterSpacing: '.04em',
          }}
        >
          Senior Software Engineer
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '4px 10px',
            marginTop: '9px',
            fontSize: '11.5px',
            color: '#6B665E',
          }}
        >
          <span>hello@mayachen.dev</span>
          <span style={{ color: '#C9C4BB' }}>|</span>
          <span>+1 (415) 555-0192</span>
          <span style={{ color: '#C9C4BB' }}>|</span>
          <span>San Francisco, CA</span>
        </div>
      </div>
    </div>
  );
}

export default Object.assign(CenteredClassic, {
  templateId: '2b',
  templateLabel: 'Centered classic',
});
