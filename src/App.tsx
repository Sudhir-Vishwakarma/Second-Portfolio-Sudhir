import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import ClassicApp from './ClassicApp';
import { CLASSIC_HASH, chooseMode, classicSectionFor, detectEnv } from './routing/mode';
import { ErrorBoundary } from './routing/ErrorBoundary';

const Multiverse = lazy(() => import('./multiverse/Multiverse'));

const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [failed, setFailed] = useState(false);
  // Device capability is decided once; only #classic is hash-driven.
  const deviceMode = useMemo(() => chooseMode(detectEnv(), ''), []);

  useEffect(() => {
    const onNav = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, []);

  const mode = failed || hash === CLASSIC_HASH ? 'classic' : deviceMode;

  if (mode === 'classic') {
    // The multiverse moves the hash without hashchange events, so a fallback reads the live URL.
    const sectionHash = failed && hash !== CLASSIC_HASH ? window.location.hash : hash;
    return <ClassicApp initialSection={classicSectionFor(sectionHash)} />;
  }

  return (
    <ErrorBoundary onError={() => setFailed(true)}>
      <Suspense fallback={<div className="mv-boot" />}>
        <Multiverse onFail={() => setFailed(true)} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
