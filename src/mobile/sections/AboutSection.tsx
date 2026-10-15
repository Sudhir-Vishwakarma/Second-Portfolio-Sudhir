import React, { useEffect, useState } from 'react';
import { aboutSummary, certifications, education } from '../../data/portfolio';
import { CertificateSource, resolveCertificateSource } from '../../data/certificateSource';
import { SectionHeading } from '../SectionHeading';
import { Sheet } from '../Sheet';
import { OriginSystem } from '../objects/OriginSystem';
import { ViewToggle } from '../objects/ViewToggle';
import { useViewMode } from '../objects/useViewMode';
import { SectionProps } from './registry';

const CertificateViewer: React.FC<{ index: number }> = ({ index }) => {
  const cert = certifications[index];
  const [source, setSource] = useState<CertificateSource | null>(null);
  useEffect(() => {
    let alive = true;
    resolveCertificateSource(cert).then((s) => alive && setSource(s));
    return () => {
      alive = false;
    };
  }, [cert]);
  return (
    <div className="mb-cert-viewer">
      <h3>{cert.title}</h3>
      <img src={cert.image} alt={`${cert.title} certificate`} />
      {source?.kind === 'pdf' && (
        <a className="mb-btn" href={source.url} target="_blank" rel="noopener noreferrer">Open PDF</a>
      )}
    </div>
  );
};

export const AboutSection: React.FC<SectionProps> = () => {
  const [openCert, setOpenCert] = useState<number | null>(null);
  const [mode, setMode] = useViewMode('about');
  return (
    <div>
      <SectionHeading kicker="About" title="About Me" />
      <p className="mb-card mb-text" data-reveal>{aboutSummary}</p>

      <ViewToggle mode={mode} onChange={setMode} label="About" />
      {mode === 'orbit' ? (
        <OriginSystem onViewCert={setOpenCert} />
      ) : (
        <>
      <h3 className="mb-h3" data-reveal>Education</h3>
      <ol className="mb-timeline">
        {education.map((e) => (
          <li key={e.years} data-reveal>
            <span className="mb-timeline__years">{e.years}</span>
            <strong>{e.title}</strong>
            <span className="mb-timeline__place">{e.school}</span>
          </li>
        ))}
      </ol>

      <h3 className="mb-h3" id="certifications" data-reveal>Certifications</h3>
      <ul className="mb-certs">
        {certifications.map((c, i) => (
          <li key={c.title} className="mb-card mb-cert" data-reveal>
            <div>
              <strong>{c.title}</strong>
              <span>{c.provider}</span>
            </div>
            <button className="mb-btn mb-btn--ghost" onClick={() => setOpenCert(i)}>View</button>
          </li>
        ))}
      </ul>
        </>
      )}

      <Sheet
        open={openCert !== null}
        onClose={() => setOpenCert(null)}
        label={openCert !== null ? certifications[openCert].title : 'Certificate'}
        variant="full"
      >
        {openCert !== null && <CertificateViewer index={openCert} />}
      </Sheet>
    </div>
  );
};
