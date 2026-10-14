import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import ClassicApp from './ClassicApp';
import { CLASSIC_HASH, classicSectionFor, detectEnv, shouldUseClassic } from './routing/mode';
import { ErrorBoundary } from './routing/ErrorBoundary';

const Multiverse = lazy(() => import('./multiverse/Multiverse'));

const App: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [failed, setFailed] = useState(false);
  const forcedClassic = useMemo(() => shouldUseClassic(detectEnv()), []);

  useEffect(() => {
    const onNav = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, []);

  if (forcedClassic || failed || hash === CLASSIC_HASH) {
    return <ClassicApp initialSection={classicSectionFor(hash)} />;
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
