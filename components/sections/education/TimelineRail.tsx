function TimelineRail() {
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
        EDUCATION
      </div>
      <div
        style={{
          marginTop: '12px',
          borderLeft: '2px solid #E6E2DA',
          paddingLeft: '16px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '-5px',
            top: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#3E5C76',
          }}
        ></div>
        <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#2E2B26' }}>
          B.S. Computer Science
        </div>
        <div style={{ fontSize: '12px', color: '#6B665E', marginTop: '1px' }}>
          University of Washington · Sep 2014 – Jun 2018
        </div>
      </div>
      <div
        style={{
          marginTop: '14px',
          borderLeft: '2px solid #E6E2DA',
          paddingLeft: '16px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '-5px',
            top: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#3E5C76',
          }}
        ></div>
        <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#2E2B26' }}>
          A.S. Mathematics
        </div>
        <div style={{ fontSize: '12px', color: '#6B665E', marginTop: '1px' }}>
          Seattle Central College · 2012 – 2014
        </div>
      </div>
    </div>
  );
}

export default Object.assign(TimelineRail, {
  templateId: '3c',
  templateLabel: 'Timeline rail',
});
