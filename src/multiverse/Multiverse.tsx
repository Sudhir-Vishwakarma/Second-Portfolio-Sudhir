import React from 'react';
import Lab from '../lab/Lab';

// Temporary wrapper: renders the 3D prototype until the real multiverse lands (Task 8).
const Multiverse: React.FC<{ onFail: () => void }> = () => <Lab />;

export default Multiverse;
