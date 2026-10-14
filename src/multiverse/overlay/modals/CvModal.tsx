import React from 'react';
import { profile } from '../../../data/portfolio';

export const CvModal: React.FC = () => (
  <div className="mv-doc">
    <div className="mv-doc__head">
      <h3>My Resume</h3>
      <a className="mv-btn" href={profile.cvUrl} download={profile.cvDownloadName}>Download PDF</a>
    </div>
    <iframe className="mv-doc__frame" src={`${profile.cvUrl}#toolbar=1&navpanes=0&scrollbar=1`} title="Resume" />
  </div>
);
