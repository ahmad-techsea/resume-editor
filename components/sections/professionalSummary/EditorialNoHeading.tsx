function EditorialNoHeading() {
  return (
    <div className="dv-card">
      <p
        style={{
          margin: '0',
          padding: '14px 0',
          borderTop: '1px solid #E6E2DA',
          borderBottom: '1px solid #E6E2DA',
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#26231F',
          textWrap: 'pretty',
        }}
      >
        Software engineer with 8 years of experience building web applications and developer tools —
        design systems, performance, and mentoring.
      </p>
    </div>
  );
}

export default Object.assign(EditorialNoHeading, {
  templateId: '1c',
  templateLabel: 'Editorial, no heading',
});
