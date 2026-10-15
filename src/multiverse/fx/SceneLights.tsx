import React from 'react';

/**
 * The only lights in the multiverse. Rendered once at the Canvas root and once inside every
 * portal preview scene, so lit materials see one light setup everywhere and share GPU programs.
 * Only small man-made objects use these; celestial bodies are lit by their universe's star via uLightPos.
 */
export const SceneLights: React.FC = () => (
  <>
    <ambientLight intensity={0.12} />
    <directionalLight position={[12, 18, 24]} intensity={1.6} />
  </>
);
