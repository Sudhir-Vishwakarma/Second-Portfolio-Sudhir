// overlay/panels/GenericPanel.tsx — used until each universe gets its real panel
import React from 'react';
import { UNIVERSE_LABELS } from '../../journey';
import { PanelProps } from './index';

export const GenericPanel: React.FC<PanelProps> = ({ universe }) => (
  <h2 className="mv-h2">{UNIVERSE_LABELS[universe]}</h2>
);
