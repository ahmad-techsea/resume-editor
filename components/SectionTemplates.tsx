import Link from 'next/link';
import '@/styles/section-templates.css';

export default function SectionTemplates() {
  return (
    <div className="sectpl">
      <div style={{ padding: "26px 44px 10px" }}>
      <div style={{ fontSize: "15px", fontWeight: "700", color: "#26231F" }}>Section templates</div>
      <div style={{ fontSize: "12px", color: "#6B665E", marginTop: "4px" }}>Five styles per section. Reply with ids to apply them to the <Link href="/">inline editor</Link> — e.g. “use 2e header + 7b skills”.</div>
      </div>
      <section className="dv-turn" id="t1">
      <div className="dv-thd"><a className="dv-tid" href="#t1">1</a><span className="dv-tname">Professional summary</span></div>
      <div className="dv-opts">
      <div className="dv-opt" id="1a"><div className="dv-olabel"><a className="dv-oid" href="#1a">1a</a>Classic ruled heading</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>SUMMARY</div>
      <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: "1.62", color: "#3B3833", textWrap: "pretty" }}>Software engineer with 8 years of experience building web applications and developer tools. Led frontend architecture for products serving 2M+ users, with a focus on design systems and performance.</p>
      </div></div>
      <div className="dv-opt" id="1b"><div className="dv-olabel"><a className="dv-oid" href="#1b">1b</a>Side label</div><div className="dv-card">
      <div style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: "18px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".13em", color: "#3E5C76", paddingTop: "2px" }}>SUMMARY</div>
      <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.62", color: "#3B3833", textWrap: "pretty" }}>Software engineer with 8 years of experience building web applications and developer tools. Led frontend architecture for products serving 2M+ users.</p>
      </div>
      </div></div>
      <div className="dv-opt" id="1c"><div className="dv-olabel"><a className="dv-oid" href="#1c">1c</a>Editorial, no heading</div><div className="dv-card">
      <p style={{ margin: "0", padding: "14px 0", borderTop: "1px solid #E6E2DA", borderBottom: "1px solid #E6E2DA", fontSize: "15px", lineHeight: "1.6", color: "#26231F", textWrap: "pretty" }}>Software engineer with 8 years of experience building web applications and developer tools — design systems, performance, and mentoring.</p>
      </div></div>
      <div className="dv-opt" id="1d"><div className="dv-olabel"><a className="dv-oid" href="#1d">1d</a>Tinted panel</div><div className="dv-card">
      <div style={{ background: "color-mix(in oklab,#3E5C76 5%,#fff)", borderRadius: "8px", padding: "15px 17px" }}>
      <div style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: ".13em", color: "#3E5C76" }}>SUMMARY</div>
      <p style={{ margin: "6px 0 0", fontSize: "13px", lineHeight: "1.6", color: "#3B3833", textWrap: "pretty" }}>Software engineer with 8 years of experience building web applications and developer tools. Led frontend architecture for products serving 2M+ users.</p>
      </div>
      </div></div>
      <div className="dv-opt" id="1e"><div className="dv-olabel"><a className="dv-oid" href="#1e">1e</a>Bold hook + detail</div><div className="dv-card">
      <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#26231F", lineHeight: "1.4" }}>Frontend architecture, design systems, and developer tools.</div>
      <p style={{ margin: "6px 0 0", fontSize: "13px", lineHeight: "1.6", color: "#6B665E", textWrap: "pretty" }}>8 years of experience; led frontend for products serving 2M+ users. Focused on performance, accessibility, and mentoring.</p>
      </div></div>
      </div>
      <p className="dv-next">Try: “use <a className="dv-oid" href="#1d">1d</a> as the Summary style in the editor”.</p>
      </section>
      <section className="dv-turn" id="t2">
      <div className="dv-thd"><a className="dv-tid" href="#t2">2</a><span className="dv-tname">Personal info (header)</span></div>
      <div className="dv-opts">
      <div className="dv-opt" id="2a"><div className="dv-olabel"><a className="dv-oid" href="#2a">2a</a>Left-aligned (current)</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-.015em", color: "#26231F", lineHeight: "1.15" }}>Maya Chen</div>
      <div style={{ fontSize: "13px", color: "#6B665E", marginTop: "3px" }}>Senior Software Engineer</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px", marginTop: "12px", fontSize: "11.5px", color: "#4C4841" }}><span>hello@mayachen.dev</span><span style={{ color: "#C9C4BB" }}>·</span><span>+1 (415) 555-0192</span><span style={{ color: "#C9C4BB" }}>·</span><span>San Francisco, CA</span></div>
      </div></div>
      <div className="dv-opt" id="2b"><div className="dv-olabel"><a className="dv-oid" href="#2b">2b</a>Centered classic</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ textAlign: "center", borderBottom: "1px solid #E6E2DA", paddingBottom: "14px" }}>
      <div style={{ fontSize: "21px", fontWeight: "700", letterSpacing: ".09em", textTransform: "uppercase", color: "#26231F" }}>Maya Chen</div>
      <div style={{ fontSize: "12.5px", color: "#3E5C76", fontWeight: "600", marginTop: "3px", letterSpacing: ".04em" }}>Senior Software Engineer</div>
      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 10px", marginTop: "9px", fontSize: "11.5px", color: "#6B665E" }}><span>hello@mayachen.dev</span><span style={{ color: "#C9C4BB" }}>|</span><span>+1 (415) 555-0192</span><span style={{ color: "#C9C4BB" }}>|</span><span>San Francisco, CA</span></div>
      </div>
      </div></div>
      <div className="dv-opt" id="2c"><div className="dv-olabel"><a className="dv-oid" href="#2c">2c</a>Split: name left, contacts right</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
      <div><div style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "-.015em", color: "#26231F", lineHeight: "1.15" }}>Maya Chen</div>
      <div style={{ fontSize: "13px", color: "#6B665E", marginTop: "3px" }}>Senior Software Engineer</div></div>
      <div style={{ textAlign: "right", fontSize: "11.5px", color: "#4C4841", lineHeight: "1.7", flex: "none" }}><div>hello@mayachen.dev</div><div>+1 (415) 555-0192</div><div>San Francisco, CA</div></div>
      </div>
      </div></div>
      <div className="dv-opt" id="2d"><div className="dv-olabel"><a className="dv-oid" href="#2d">2d</a>Accent banner</div><div className="dv-card" style={{ width: "430px", padding: "0" }}>
      <div style={{ background: "#3E5C76", padding: "18px 26px 16px" }}><div style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-.01em", color: "#fff", lineHeight: "1.15" }}>Maya Chen</div>
      <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,.78)", marginTop: "3px" }}>Senior Software Engineer</div></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px", padding: "11px 26px 16px", fontSize: "11.5px", color: "#4C4841" }}><span>hello@mayachen.dev</span><span style={{ color: "#C9C4BB" }}>·</span><span>+1 (415) 555-0192</span><span style={{ color: "#C9C4BB" }}>·</span><span>San Francisco, CA</span></div>
      </div></div>
      <div className="dv-opt" id="2e"><div className="dv-olabel"><a className="dv-oid" href="#2e">2e</a>Monogram block</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "46px", height: "46px", flex: "none", background: "#3E5C76", borderRadius: "8px", display: "grid", placeItems: "center", color: "#fff", fontSize: "17px", fontWeight: "700", letterSpacing: ".02em" }}>MC</div>
      <div><div style={{ fontSize: "21px", fontWeight: "700", letterSpacing: "-.01em", color: "#26231F", lineHeight: "1.15" }}>Maya Chen</div>
      <div style={{ fontSize: "12.5px", color: "#6B665E", marginTop: "2px" }}>Senior Software Engineer</div></div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px", marginTop: "12px", fontSize: "11.5px", color: "#4C4841" }}><span>hello@mayachen.dev</span><span style={{ color: "#C9C4BB" }}>·</span><span>+1 (415) 555-0192</span><span style={{ color: "#C9C4BB" }}>·</span><span>San Francisco, CA</span></div>
      </div></div>
      </div>
      <p className="dv-next">Try: “make the editor header <a className="dv-oid" href="#2e">2e</a>” · “<a className="dv-oid" href="#2d">2d</a> but with the accent from Tweaks”.</p>
      </section>
      <section className="dv-turn" id="t3">
      <div className="dv-thd"><a className="dv-tid" href="#t3">3</a><span className="dv-tname">Education</span></div>
      <div className="dv-opts">
      <div className="dv-opt" id="3a"><div className="dv-olabel"><a className="dv-oid" href="#3a">3a</a>Classic rows (current)</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EDUCATION</div>
      <div style={{ marginTop: "11px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}><div style={{ fontSize: "14px", fontWeight: "600", color: "#2E2B26" }}>B.S. Computer Science</div><div style={{ fontSize: "11.5px", color: "#6B665E", flex: "none" }}>Sep 2014 – Jun 2018</div></div>
      <div style={{ fontSize: "12.5px", color: "#6B665E", marginTop: "2px" }}>University of Washington</div>
      <div style={{ marginTop: "5px", fontSize: "12.5px", lineHeight: "1.55", color: "#3B3833", display: "flex", gap: "7px" }}><span style={{ color: "#3E5C76" }}>•</span>Dean’s List, six quarters — graduated with honors</div>
      </div></div>
      <div className="dv-opt" id="3b"><div className="dv-olabel"><a className="dv-oid" href="#3b">3b</a>Compact one-liners</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EDUCATION</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline", padding: "9px 0", borderBottom: "1px solid #F0EDE7" }}><div style={{ fontSize: "13px", color: "#2E2B26" }}><span style={{ fontWeight: "600" }}>B.S. Computer Science,</span> University of Washington</div><div style={{ fontSize: "11.5px", color: "#6B665E", flex: "none" }}>2014 – 2018</div></div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline", padding: "9px 0" }}><div style={{ fontSize: "13px", color: "#2E2B26" }}><span style={{ fontWeight: "600" }}>A.S. Mathematics,</span> Seattle Central College</div><div style={{ fontSize: "11.5px", color: "#6B665E", flex: "none" }}>2012 – 2014</div></div>
      </div></div>
      <div className="dv-opt" id="3c"><div className="dv-olabel"><a className="dv-oid" href="#3c">3c</a>Timeline rail</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EDUCATION</div>
      <div style={{ marginTop: "12px", borderLeft: "2px solid #E6E2DA", paddingLeft: "16px", position: "relative" }}>
      <div style={{ position: "absolute", left: "-5px", top: "4px", width: "8px", height: "8px", borderRadius: "50%", background: "#3E5C76" }}></div>
      <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#2E2B26" }}>B.S. Computer Science</div>
      <div style={{ fontSize: "12px", color: "#6B665E", marginTop: "1px" }}>University of Washington · Sep 2014 – Jun 2018</div>
      </div>
      <div style={{ marginTop: "14px", borderLeft: "2px solid #E6E2DA", paddingLeft: "16px", position: "relative" }}>
      <div style={{ position: "absolute", left: "-5px", top: "4px", width: "8px", height: "8px", borderRadius: "50%", background: "#3E5C76" }}></div>
      <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#2E2B26" }}>A.S. Mathematics</div>
      <div style={{ fontSize: "12px", color: "#6B665E", marginTop: "1px" }}>Seattle Central College · 2012 – 2014</div>
      </div>
      </div></div>
      <div className="dv-opt" id="3d"><div className="dv-olabel"><a className="dv-oid" href="#3d">3d</a>Card pair</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EDUCATION</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "11px" }}>
      <div style={{ border: "1px solid #E6E2DA", borderRadius: "8px", padding: "11px 12px" }}><div style={{ fontSize: "12.5px", fontWeight: "600", color: "#2E2B26", lineHeight: "1.4" }}>B.S. Computer Science</div><div style={{ fontSize: "11.5px", color: "#6B665E", marginTop: "3px" }}>University of Washington</div><div style={{ fontSize: "11px", color: "#9A948A", marginTop: "5px" }}>2014 – 2018</div></div>
      <div style={{ border: "1px solid #E6E2DA", borderRadius: "8px", padding: "11px 12px" }}><div style={{ fontSize: "12.5px", fontWeight: "600", color: "#2E2B26", lineHeight: "1.4" }}>A.S. Mathematics</div><div style={{ fontSize: "11.5px", color: "#6B665E", marginTop: "3px" }}>Seattle Central College</div><div style={{ fontSize: "11px", color: "#9A948A", marginTop: "5px" }}>2012 – 2014</div></div>
      </div>
      </div></div>
      <div className="dv-opt" id="3e"><div className="dv-olabel"><a className="dv-oid" href="#3e">3e</a>Dates in left column</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EDUCATION</div>
      <div style={{ display: "grid", gridTemplateColumns: "104px 1fr", gap: "8px 14px", marginTop: "11px" }}>
      <div style={{ fontSize: "11.5px", color: "#9A948A", paddingTop: "1px" }}>2014 – 2018</div>
      <div><div style={{ fontSize: "13.5px", fontWeight: "600", color: "#2E2B26" }}>B.S. Computer Science</div><div style={{ fontSize: "12px", color: "#6B665E" }}>University of Washington</div></div>
      <div style={{ fontSize: "11.5px", color: "#9A948A", paddingTop: "1px" }}>2012 – 2014</div>
      <div><div style={{ fontSize: "13.5px", fontWeight: "600", color: "#2E2B26" }}>A.S. Mathematics</div><div style={{ fontSize: "12px", color: "#6B665E" }}>Seattle Central College</div></div>
      </div>
      </div></div>
      </div>
      <p className="dv-next">Try: “switch Education to <a className="dv-oid" href="#3e">3e</a>”.</p>
      </section>
      <section className="dv-turn" id="t4">
      <div className="dv-thd"><a className="dv-tid" href="#t4">4</a><span className="dv-tname">Experience</span></div>
      <div className="dv-opts">
      <div className="dv-opt" id="4a"><div className="dv-olabel"><a className="dv-oid" href="#4a">4a</a>Classic paragraph (current)</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EXPERIENCE</div>
      <div style={{ marginTop: "11px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}><div style={{ fontSize: "14px", fontWeight: "600", color: "#2E2B26" }}>Senior Software Engineer</div><div style={{ fontSize: "11.5px", color: "#6B665E", flex: "none" }}>Mar 2022 – Present</div></div>
      <div style={{ fontSize: "12.5px", color: "#6B665E", marginTop: "2px" }}>Fieldstone Labs</div>
      <p style={{ margin: "6px 0 0", fontSize: "12.5px", lineHeight: "1.58", color: "#3B3833", textWrap: "pretty" }}>Lead engineer on the design systems team. Built a component library used across four products and drove the migration to TypeScript.</p>
      </div></div>
      <div className="dv-opt" id="4b"><div className="dv-olabel"><a className="dv-oid" href="#4b">4b</a>Contribution bullets</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EXPERIENCE</div>
      <div style={{ marginTop: "11px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}><div style={{ fontSize: "14px", fontWeight: "600", color: "#2E2B26" }}>Senior Software Engineer</div><div style={{ fontSize: "11.5px", color: "#6B665E", flex: "none" }}>Mar 2022 – Present</div></div>
      <div style={{ fontSize: "12.5px", color: "#6B665E", marginTop: "2px" }}>Fieldstone Labs</div>
      <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px", fontSize: "12.5px", lineHeight: "1.55", color: "#3B3833" }}>
      <div style={{ display: "flex", gap: "7px" }}><span style={{ color: "#3E5C76" }}>•</span>Built a component library adopted across four products</div>
      <div style={{ display: "flex", gap: "7px" }}><span style={{ color: "#3E5C76" }}>•</span>Cut UI defect reports by 38% with visual regression testing</div>
      <div style={{ display: "flex", gap: "7px" }}><span style={{ color: "#3E5C76" }}>•</span>Drove the migration of 240k lines to TypeScript</div>
      </div>
      </div></div>
      <div className="dv-opt" id="4c"><div className="dv-olabel"><a className="dv-oid" href="#4c">4c</a>Timeline rail</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EXPERIENCE</div>
      <div style={{ marginTop: "12px", borderLeft: "2px solid #E6E2DA", paddingLeft: "16px", position: "relative", paddingBottom: "14px" }}>
      <div style={{ position: "absolute", left: "-5px", top: "3px", width: "8px", height: "8px", borderRadius: "50%", background: "#3E5C76" }}></div>
      <div style={{ fontSize: "11px", color: "#9A948A" }}>Mar 2022 – Present</div>
      <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#2E2B26", marginTop: "1px" }}>Senior Software Engineer · Fieldstone Labs</div>
      <p style={{ margin: "4px 0 0", fontSize: "12.5px", lineHeight: "1.55", color: "#3B3833" }}>Lead engineer on the design systems team; mentor three engineers.</p>
      </div>
      <div style={{ borderLeft: "2px solid #E6E2DA", paddingLeft: "16px", position: "relative" }}>
      <div style={{ position: "absolute", left: "-5px", top: "3px", width: "8px", height: "8px", borderRadius: "50%", border: "2px solid #3E5C76", background: "#fff", boxSizing: "border-box" }}></div>
      <div style={{ fontSize: "11px", color: "#9A948A" }}>Jul 2018 – Feb 2022</div>
      <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#2E2B26", marginTop: "1px" }}>Software Engineer · Copperline Software</div>
      </div>
      </div></div>
      <div className="dv-opt" id="4d"><div className="dv-olabel"><a className="dv-oid" href="#4d">4d</a>Company first</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EXPERIENCE</div>
      <div style={{ marginTop: "12px", fontSize: "11px", fontWeight: "700", letterSpacing: ".11em", color: "#3E5C76" }}>FIELDSTONE LABS</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginTop: "2px" }}><div style={{ fontSize: "15px", fontWeight: "700", color: "#26231F" }}>Senior Software Engineer</div><div style={{ fontSize: "11.5px", color: "#6B665E", flex: "none" }}>Mar 2022 – Present</div></div>
      <p style={{ margin: "5px 0 0", fontSize: "12.5px", lineHeight: "1.58", color: "#3B3833", textWrap: "pretty" }}>Lead engineer on the design systems team. Built a component library used across four products; mentor three engineers.</p>
      </div></div>
      <div className="dv-opt" id="4e"><div className="dv-olabel"><a className="dv-oid" href="#4e">4e</a>Two-column meta</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>EXPERIENCE</div>
      <div style={{ display: "grid", gridTemplateColumns: "128px 1fr", gap: "14px", marginTop: "12px" }}>
      <div><div style={{ fontSize: "12.5px", fontWeight: "600", color: "#2E2B26" }}>Fieldstone Labs</div><div style={{ fontSize: "11px", color: "#9A948A", marginTop: "2px", lineHeight: "1.5" }}>Mar 2022 –<br />Present</div></div>
      <div><div style={{ fontSize: "13.5px", fontWeight: "600", color: "#2E2B26" }}>Senior Software Engineer</div>
      <p style={{ margin: "4px 0 0", fontSize: "12.5px", lineHeight: "1.55", color: "#3B3833", textWrap: "pretty" }}>Lead engineer on the design systems team. Built a component library adopted across four products.</p></div>
      </div>
      </div></div>
      </div>
      <p className="dv-next">Try: “use <a className="dv-oid" href="#4b">4b</a> — it matches the new contribution bullets in the editor”.</p>
      </section>
      <section className="dv-turn" id="t5">
      <div className="dv-thd"><a className="dv-tid" href="#t5">5</a><span className="dv-tname">Certifications</span></div>
      <div className="dv-opts">
      <div className="dv-opt" id="5a"><div className="dv-olabel"><a className="dv-oid" href="#5a">5a</a>Rows, dates right</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>CERTIFICATIONS</div>
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}><div><div style={{ fontSize: "13px", fontWeight: "600", color: "#2E2B26" }}>AWS Certified Solutions Architect – Associate</div><div style={{ fontSize: "11.5px", color: "#6B665E" }}>Amazon Web Services</div></div><div style={{ fontSize: "11.5px", color: "#9A948A", flex: "none" }}>2024</div></div>
      <div style={{ marginTop: "9px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}><div><div style={{ fontSize: "13px", fontWeight: "600", color: "#2E2B26" }}>Professional Cloud Architect</div><div style={{ fontSize: "11.5px", color: "#6B665E" }}>Google Cloud</div></div><div style={{ fontSize: "11.5px", color: "#9A948A", flex: "none" }}>2023</div></div>
      </div></div>
      <div className="dv-opt" id="5b"><div className="dv-olabel"><a className="dv-oid" href="#5b">5b</a>Card grid</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>CERTIFICATIONS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "11px" }}>
      <div style={{ border: "1px solid #E6E2DA", borderRadius: "8px", padding: "11px 12px" }}><div style={{ fontSize: "12px", fontWeight: "600", color: "#2E2B26", lineHeight: "1.4" }}>AWS Solutions Architect – Associate</div><div style={{ fontSize: "11px", color: "#9A948A", marginTop: "4px" }}>AWS · 2024</div></div>
      <div style={{ border: "1px solid #E6E2DA", borderRadius: "8px", padding: "11px 12px" }}><div style={{ fontSize: "12px", fontWeight: "600", color: "#2E2B26", lineHeight: "1.4" }}>Professional Cloud Architect</div><div style={{ fontSize: "11px", color: "#9A948A", marginTop: "4px" }}>Google Cloud · 2023</div></div>
      </div>
      </div></div>
      <div className="dv-opt" id="5c"><div className="dv-olabel"><a className="dv-oid" href="#5c">5c</a>Compact inline</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>CERTIFICATIONS</div>
      <div style={{ marginTop: "10px", fontSize: "12.5px", lineHeight: "1.85", color: "#3B3833" }}>
      <div><span style={{ fontWeight: "600" }}>AWS Certified Solutions Architect – Associate</span> — Amazon Web Services · 2024</div>
      <div><span style={{ fontWeight: "600" }}>Professional Cloud Architect</span> — Google Cloud · 2023</div>
      <div><span style={{ fontWeight: "600" }}>Certified Kubernetes Administrator</span> — CNCF · 2022</div>
      </div>
      </div></div>
      <div className="dv-opt" id="5d"><div className="dv-olabel"><a className="dv-oid" href="#5d">5d</a>Pill chips</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>CERTIFICATIONS</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "11px" }}>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "5px 11px", fontSize: "11.5px", color: "#3B3833" }}>AWS Solutions Architect <span style={{ color: "#9A948A" }}>· 2024</span></span>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "5px 11px", fontSize: "11.5px", color: "#3B3833" }}>GCP Cloud Architect <span style={{ color: "#9A948A" }}>· 2023</span></span>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "5px 11px", fontSize: "11.5px", color: "#3B3833" }}>CKA <span style={{ color: "#9A948A" }}>· 2022</span></span>
      </div>
      </div></div>
      <div className="dv-opt" id="5e"><div className="dv-olabel"><a className="dv-oid" href="#5e">5e</a>Ruled table</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>CERTIFICATIONS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 16px", marginTop: "5px", fontSize: "12.5px" }}>
      <div style={{ padding: "8px 0", borderBottom: "1px solid #F0EDE7", fontWeight: "600", color: "#2E2B26" }}>AWS Solutions Architect – Associate</div><div style={{ padding: "8px 0", borderBottom: "1px solid #F0EDE7", color: "#6B665E" }}>AWS</div><div style={{ padding: "8px 0", borderBottom: "1px solid #F0EDE7", color: "#9A948A" }}>2024</div>
      <div style={{ padding: "8px 0", borderBottom: "1px solid #F0EDE7", fontWeight: "600", color: "#2E2B26" }}>Professional Cloud Architect</div><div style={{ padding: "8px 0", borderBottom: "1px solid #F0EDE7", color: "#6B665E" }}>Google Cloud</div><div style={{ padding: "8px 0", borderBottom: "1px solid #F0EDE7", color: "#9A948A" }}>2023</div>
      <div style={{ padding: "8px 0", fontWeight: "600", color: "#2E2B26" }}>Certified Kubernetes Administrator</div><div style={{ padding: "8px 0", color: "#6B665E" }}>CNCF</div><div style={{ padding: "8px 0", color: "#9A948A" }}>2022</div>
      </div>
      </div></div>
      </div>
      <p className="dv-next">Try: “add a Certifications section styled like <a className="dv-oid" href="#5a">5a</a>”.</p>
      </section>
      <section className="dv-turn" id="t6">
      <div className="dv-thd"><a className="dv-tid" href="#t6">6</a><span className="dv-tname">Awards &amp; achievements</span></div>
      <div className="dv-opts">
      <div className="dv-opt" id="6a"><div className="dv-olabel"><a className="dv-oid" href="#6a">6a</a>Year in left column</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>AWARDS</div>
      <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: "9px 12px", marginTop: "11px", fontSize: "12.5px" }}>
      <div style={{ color: "#3E5C76", fontWeight: "700", fontSize: "11.5px", paddingTop: "1px" }}>2024</div><div><span style={{ fontWeight: "600", color: "#2E2B26" }}>Engineering Excellence Award</span><span style={{ color: "#6B665E" }}> — Fieldstone Labs</span></div>
      <div style={{ color: "#3E5C76", fontWeight: "700", fontSize: "11.5px", paddingTop: "1px" }}>2019</div><div><span style={{ fontWeight: "600", color: "#2E2B26" }}>Best Demo, ReactConf Hackathon</span></div>
      <div style={{ color: "#3E5C76", fontWeight: "700", fontSize: "11.5px", paddingTop: "1px" }}>2018</div><div><span style={{ fontWeight: "600", color: "#2E2B26" }}>Dean’s Medal finalist</span><span style={{ color: "#6B665E" }}> — University of Washington</span></div>
      </div>
      </div></div>
      <div className="dv-opt" id="6b"><div className="dv-olabel"><a className="dv-oid" href="#6b">6b</a>Rows, dates right</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>AWARDS &amp; ACHIEVEMENTS</div>
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}><div><div style={{ fontSize: "13px", fontWeight: "600", color: "#2E2B26" }}>Engineering Excellence Award</div><div style={{ fontSize: "11.5px", color: "#6B665E" }}>Fieldstone Labs — top honor across 120 engineers</div></div><div style={{ fontSize: "11.5px", color: "#9A948A", flex: "none" }}>2024</div></div>
      <div style={{ marginTop: "9px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}><div><div style={{ fontSize: "13px", fontWeight: "600", color: "#2E2B26" }}>Best Demo, ReactConf Hackathon</div><div style={{ fontSize: "11.5px", color: "#6B665E" }}>Built a live accessibility linter in 24 hours</div></div><div style={{ fontSize: "11.5px", color: "#9A948A", flex: "none" }}>2019</div></div>
      </div></div>
      <div className="dv-opt" id="6c"><div className="dv-olabel"><a className="dv-oid" href="#6c">6c</a>Simple bullets</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>AWARDS</div>
      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "12.5px", lineHeight: "1.55", color: "#3B3833" }}>
      <div style={{ display: "flex", gap: "7px" }}><span style={{ color: "#3E5C76" }}>•</span><span><span style={{ fontWeight: "600" }}>Engineering Excellence Award,</span> Fieldstone Labs (2024)</span></div>
      <div style={{ display: "flex", gap: "7px" }}><span style={{ color: "#3E5C76" }}>•</span><span><span style={{ fontWeight: "600" }}>Best Demo,</span> ReactConf Hackathon (2019)</span></div>
      <div style={{ display: "flex", gap: "7px" }}><span style={{ color: "#3E5C76" }}>•</span><span><span style={{ fontWeight: "600" }}>Dean’s List,</span> six quarters, University of Washington</span></div>
      </div>
      </div></div>
      <div className="dv-opt" id="6d"><div className="dv-olabel"><a className="dv-oid" href="#6d">6d</a>Tinted panels</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>AWARDS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "11px" }}>
      <div style={{ background: "color-mix(in oklab,#3E5C76 5%,#fff)", borderRadius: "8px", padding: "11px 12px" }}><div style={{ fontSize: "12px", fontWeight: "600", color: "#2E2B26", lineHeight: "1.4" }}>Engineering Excellence Award</div><div style={{ fontSize: "11px", color: "#6B665E", marginTop: "4px" }}>Fieldstone Labs · 2024</div></div>
      <div style={{ background: "color-mix(in oklab,#3E5C76 5%,#fff)", borderRadius: "8px", padding: "11px 12px" }}><div style={{ fontSize: "12px", fontWeight: "600", color: "#2E2B26", lineHeight: "1.4" }}>Best Demo, ReactConf Hackathon</div><div style={{ fontSize: "11px", color: "#6B665E", marginTop: "4px" }}>ReactConf · 2019</div></div>
      </div>
      </div></div>
      <div className="dv-opt" id="6e"><div className="dv-olabel"><a className="dv-oid" href="#6e">6e</a>Single line, dot-separated</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>AWARDS</div>
      <p style={{ margin: "10px 0 0", fontSize: "12.5px", lineHeight: "1.7", color: "#3B3833", textWrap: "pretty" }}>Engineering Excellence Award (2024) <span style={{ color: "#C9C4BB" }}>·</span> Best Demo, ReactConf Hackathon (2019) <span style={{ color: "#C9C4BB" }}>·</span> Dean’s List, six quarters</p>
      </div></div>
      </div>
      <p className="dv-next">Try: “Awards as <a className="dv-oid" href="#6a">6a</a> with the accent color”.</p>
      </section>
      <section className="dv-turn" id="t7">
      <div className="dv-thd"><a className="dv-tid" href="#t7">7</a><span className="dv-tname">Skills</span></div>
      <div className="dv-opts">
      <div className="dv-opt" id="7a"><div className="dv-olabel"><a className="dv-oid" href="#7a">7a</a>Comma list (current)</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>SKILLS</div>
      <p style={{ margin: "10px 0 0", fontSize: "13px", lineHeight: "1.62", color: "#3B3833" }}>TypeScript, React, Node.js, GraphQL, design systems, accessibility, performance profiling, CI/CD</p>
      </div></div>
      <div className="dv-opt" id="7b"><div className="dv-olabel"><a className="dv-oid" href="#7b">7b</a>Pill tags</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>SKILLS</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "11px" }}>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "4px 11px", fontSize: "11.5px", color: "#3B3833" }}>TypeScript</span>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "4px 11px", fontSize: "11.5px", color: "#3B3833" }}>React</span>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "4px 11px", fontSize: "11.5px", color: "#3B3833" }}>Node.js</span>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "4px 11px", fontSize: "11.5px", color: "#3B3833" }}>GraphQL</span>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "4px 11px", fontSize: "11.5px", color: "#3B3833" }}>Design systems</span>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "4px 11px", fontSize: "11.5px", color: "#3B3833" }}>Accessibility</span>
      <span style={{ border: "1px solid #D8D4CC", borderRadius: "999px", padding: "4px 11px", fontSize: "11.5px", color: "#3B3833" }}>CI/CD</span>
      </div>
      </div></div>
      <div className="dv-opt" id="7c"><div className="dv-olabel"><a className="dv-oid" href="#7c">7c</a>Grouped columns</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>SKILLS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "11px" }}>
      <div><div style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: ".1em", color: "#9A948A" }}>LANGUAGES</div><div style={{ fontSize: "12.5px", color: "#3B3833", lineHeight: "1.7", marginTop: "4px" }}>TypeScript<br />JavaScript<br />Python</div></div>
      <div><div style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: ".1em", color: "#9A948A" }}>FRAMEWORKS</div><div style={{ fontSize: "12.5px", color: "#3B3833", lineHeight: "1.7", marginTop: "4px" }}>React<br />Node.js<br />GraphQL</div></div>
      <div><div style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: ".1em", color: "#9A948A" }}>PRACTICES</div><div style={{ fontSize: "12.5px", color: "#3B3833", lineHeight: "1.7", marginTop: "4px" }}>Design systems<br />Accessibility<br />CI/CD</div></div>
      </div>
      </div></div>
      <div className="dv-opt" id="7d"><div className="dv-olabel"><a className="dv-oid" href="#7d">7d</a>Proficiency bars</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>SKILLS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px", alignItems: "center" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}>TypeScript</div><div style={{ height: "5px", background: "#F0EDE7", borderRadius: "99px" }}><div style={{ width: "92%", height: "100%", background: "#3E5C76", borderRadius: "99px" }}></div></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px", alignItems: "center" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}>React</div><div style={{ height: "5px", background: "#F0EDE7", borderRadius: "99px" }}><div style={{ width: "88%", height: "100%", background: "#3E5C76", borderRadius: "99px" }}></div></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px", alignItems: "center" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}>Node.js</div><div style={{ height: "5px", background: "#F0EDE7", borderRadius: "99px" }}><div style={{ width: "74%", height: "100%", background: "#3E5C76", borderRadius: "99px" }}></div></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "12px", alignItems: "center" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}>GraphQL</div><div style={{ height: "5px", background: "#F0EDE7", borderRadius: "99px" }}><div style={{ width: "62%", height: "100%", background: "#3E5C76", borderRadius: "99px" }}></div></div></div>
      </div>
      </div></div>
      <div className="dv-opt" id="7e"><div className="dv-olabel"><a className="dv-oid" href="#7e">7e</a>Dot ratings</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>SKILLS</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}>TypeScript</div><div style={{ display: "flex", gap: "4px" }}><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span></div></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}>React</div><div style={{ display: "flex", gap: "4px" }}><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#E6E2DA" }}></span></div></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}>Node.js</div><div style={{ display: "flex", gap: "4px" }}><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#E6E2DA" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#E6E2DA" }}></span></div></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}>GraphQL</div><div style={{ display: "flex", gap: "4px" }}><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3E5C76" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#E6E2DA" }}></span><span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#E6E2DA" }}></span></div></div>
      </div>
      </div></div>
      </div>
      <p className="dv-next">Try: “make Skills editable as pills like <a className="dv-oid" href="#7b">7b</a>” · “<a className="dv-oid" href="#7c">7c</a> with my own group names”.</p>
      </section>
      <section className="dv-turn" id="t8">
      <div className="dv-thd"><a className="dv-tid" href="#t8">8</a><span className="dv-tname">References</span></div>
      <div className="dv-opts">
      <div className="dv-opt" id="8a"><div className="dv-olabel"><a className="dv-oid" href="#8a">8a</a>Card pair</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>REFERENCES</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "11px" }}>
      <div style={{ border: "1px solid #E6E2DA", borderRadius: "8px", padding: "11px 12px" }}><div style={{ fontSize: "12.5px", fontWeight: "600", color: "#2E2B26" }}>Jordan Patel</div><div style={{ fontSize: "11.5px", color: "#6B665E", marginTop: "2px", lineHeight: "1.5" }}>Director of Engineering<br />Fieldstone Labs</div><div style={{ fontSize: "11px", color: "#3E5C76", marginTop: "5px" }}>jordan.patel@fieldstone.dev</div></div>
      <div style={{ border: "1px solid #E6E2DA", borderRadius: "8px", padding: "11px 12px" }}><div style={{ fontSize: "12.5px", fontWeight: "600", color: "#2E2B26" }}>Alicia Gomez</div><div style={{ fontSize: "11.5px", color: "#6B665E", marginTop: "2px", lineHeight: "1.5" }}>Engineering Manager<br />Copperline Software</div><div style={{ fontSize: "11px", color: "#3E5C76", marginTop: "5px" }}>alicia.gomez@copperline.io</div></div>
      </div>
      </div></div>
      <div className="dv-opt" id="8b"><div className="dv-olabel"><a className="dv-oid" href="#8b">8b</a>Available on request</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>REFERENCES</div>
      <div style={{ marginTop: "12px", textAlign: "center", fontSize: "12.5px", color: "#6B665E", padding: "6px 0 2px" }}>References available upon request.</div>
      </div></div>
      <div className="dv-opt" id="8c"><div className="dv-olabel"><a className="dv-oid" href="#8c">8c</a>Rows, contact right</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>REFERENCES</div>
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}><span style={{ fontWeight: "600" }}>Jordan Patel,</span> Director of Engineering, Fieldstone Labs</div><div style={{ fontSize: "11px", color: "#3E5C76", flex: "none" }}>jordan.patel@fieldstone.dev</div></div>
      <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}><div style={{ fontSize: "12.5px", color: "#2E2B26" }}><span style={{ fontWeight: "600" }}>Alicia Gomez,</span> Engineering Manager, Copperline Software</div><div style={{ fontSize: "11px", color: "#3E5C76", flex: "none" }}>+1 (415) 555-0148</div></div>
      </div></div>
      <div className="dv-opt" id="8d"><div className="dv-olabel"><a className="dv-oid" href="#8d">8d</a>Quote endorsement</div><div className="dv-card">
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>REFERENCES</div>
      <p style={{ margin: "11px 0 0", fontSize: "13.5px", lineHeight: "1.6", color: "#26231F", textWrap: "pretty" }}>“Maya raises the bar for every team she joins — the rare engineer who owns quality end to end.”</p>
      <div style={{ marginTop: "7px", fontSize: "11.5px", color: "#6B665E" }}>Jordan Patel, Director of Engineering, Fieldstone Labs · <span style={{ color: "#3E5C76" }}>jordan.patel@fieldstone.dev</span></div>
      </div></div>
      <div className="dv-opt" id="8e"><div className="dv-olabel"><a className="dv-oid" href="#8e">8e</a>Initial avatars</div><div className="dv-card" style={{ width: "430px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".14em", color: "#3E5C76", borderBottom: "1px solid #E6E2DA", paddingBottom: "5px" }}>REFERENCES</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
      <div style={{ display: "flex", gap: "11px", alignItems: "center" }}><div style={{ width: "34px", height: "34px", flex: "none", borderRadius: "50%", background: "color-mix(in oklab,#3E5C76 12%,#fff)", color: "#3E5C76", fontSize: "12px", fontWeight: "700", display: "grid", placeItems: "center" }}>JP</div><div><div style={{ fontSize: "12.5px", fontWeight: "600", color: "#2E2B26" }}>Jordan Patel — Director of Engineering, Fieldstone Labs</div><div style={{ fontSize: "11px", color: "#6B665E", marginTop: "1px" }}>jordan.patel@fieldstone.dev · +1 (415) 555-0117</div></div></div>
      <div style={{ display: "flex", gap: "11px", alignItems: "center" }}><div style={{ width: "34px", height: "34px", flex: "none", borderRadius: "50%", background: "color-mix(in oklab,#3E5C76 12%,#fff)", color: "#3E5C76", fontSize: "12px", fontWeight: "700", display: "grid", placeItems: "center" }}>AG</div><div><div style={{ fontSize: "12.5px", fontWeight: "600", color: "#2E2B26" }}>Alicia Gomez — Engineering Manager, Copperline Software</div><div style={{ fontSize: "11px", color: "#6B665E", marginTop: "1px" }}>alicia.gomez@copperline.io · +1 (415) 555-0148</div></div></div>
      </div>
      </div></div>
      </div>
      <p className="dv-next">Try: “add References to the editor as <a className="dv-oid" href="#8a">8a</a>” · “more skills styles” · “apply <a className="dv-oid" href="#2b">2b</a> + <a className="dv-oid" href="#3e">3e</a> + <a className="dv-oid" href="#7b">7b</a>”.</p>
      </section>
    </div>
  );
}
