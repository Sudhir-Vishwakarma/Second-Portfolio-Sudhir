import React, { useEffect, useState } from 'react';
import { certifications } from '../../../data/portfolio';
import { CertificateSource, resolveCertificateSource } from '../certificateSource';

export const CertificateModal: React.FC<{ index: number }> = ({ index }) => {
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
    <div className="mv-doc">
      <div className="mv-doc__head">
        <h3>{cert.title}</h3>
      </div>
      {!source && <p className="mv-text">Loading…</p>}
      {source?.kind === 'pdf' && <iframe className="mv-doc__frame" src={source.url} title={cert.title} />}
      {source?.kind === 'image' && <img className="mv-doc__img" src={source.url} alt={`${cert.title} certificate`} />}
    </div>
  );
};
