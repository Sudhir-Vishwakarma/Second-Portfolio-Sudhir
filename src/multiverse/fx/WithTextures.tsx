import React, { Suspense } from 'react';

interface Props { fallback: React.ReactNode; children: React.ReactNode }

class TextureBoundary extends React.Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // A missing or blocked image: keep the procedural look instead of failing the whole scene.
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Renders `fallback` while the children's textures load, and permanently if one fails. */
export const WithTextures: React.FC<Props> = ({ fallback, children }) => (
  <TextureBoundary fallback={fallback}>
    <Suspense fallback={fallback}>{children}</Suspense>
  </TextureBoundary>
);
