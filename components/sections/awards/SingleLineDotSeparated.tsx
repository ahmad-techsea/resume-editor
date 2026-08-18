function SingleLineDotSeparated() {
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
        AWARDS
      </div>
      <p
        style={{
          margin: '10px 0 0',
          fontSize: '12.5px',
          lineHeight: '1.7',
          color: '#3B3833',
          textWrap: 'pretty',
        }}
      >
        Engineering Excellence Award (2024) <span style={{ color: '#C9C4BB' }}>·</span> Best Demo,
        ReactConf Hackathon (2019) <span style={{ color: '#C9C4BB' }}>·</span> Dean’s List, six
        quarters
      </p>
    </div>
  );
}

export default Object.assign(SingleLineDotSeparated, {
  templateId: '6e',
  templateLabel: 'Single line, dot-separated',
});
