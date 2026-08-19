import '@/styles/section-templates.css';
import Link from 'next/link';
import awards from './sections/awards';
import certifications from './sections/certifications';
import education from './sections/education';
import experience from './sections/experience';
import personalContact from './sections/personalContact';
import professionalSummary from './sections/professionalSummary';
import references from './sections/references';
import skills from './sections/skills';
import type { SectionGroup } from './sections/types';

const sectionGroups: SectionGroup[] = [
  professionalSummary,
  personalContact,
  education,
  experience,
  certifications,
  awards,
  skills,
  references,
];

export default function SectionTemplates() {
  return (
    <div className="sectpl">
      <div style={{ padding: '26px 44px 10px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#26231F' }}>
          Section templates
        </div>
        <div style={{ fontSize: '12px', color: '#6B665E', marginTop: '4px' }}>
          Five styles per section. Reply with ids to apply them to the{' '}
          <Link href="/editor">inline editor</Link> — e.g. “use 2e header + 7b skills”.
        </div>
      </div>
      {sectionGroups.map((sec) => {
        const turnId = `t${sec.number}`;
        return (
          <section className="dv-turn" id={turnId} key={turnId}>
            <div className="dv-thd">
              <a className="dv-tid" href={`#${turnId}`}>
                {sec.number}
              </a>
              <span className="dv-tname">{sec.name}</span>
            </div>
            <div className="dv-opts">
              {sec.templates.map((Template) => (
                <div className="dv-opt" id={Template.templateId} key={Template.templateId}>
                  <div className="dv-olabel">
                    <a className="dv-oid" href={`#${Template.templateId}`}>
                      {Template.templateId}
                    </a>
                    {Template.templateLabel}
                  </div>
                  <Template />
                </div>
              ))}
            </div>
            <p className="dv-next">{sec.tryNode}</p>
          </section>
        );
      })}
    </div>
  );
}
