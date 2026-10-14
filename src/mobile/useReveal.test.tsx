import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useReveal } from './useReveal';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const Harness: React.FC<{ onReady: (add: () => void) => void }> = ({ onReady }) => {
  const root = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(['a']);
  useReveal(root);
  onReady(() => setItems((xs) => [...xs, `x${xs.length}`]));
  return (
    <div ref={root}>
      {items.map((i) => (
        <p key={i} data-reveal>{i}</p>
      ))}
    </div>
  );
};

test('reveals initial and late-added items (no IntersectionObserver)', async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  let add: () => void = () => {};
  await act(async () => {
    createRoot(host).render(<Harness onReady={(fn) => (add = fn)} />);
  });
  expect(host.querySelectorAll('[data-reveal].is-revealed')).toHaveLength(1);
  await act(async () => add());
  await act(async () => {}); // let the MutationObserver callback run
  expect(host.querySelectorAll('[data-reveal]')).toHaveLength(2);
  expect(host.querySelectorAll('[data-reveal]:not(.is-revealed)')).toHaveLength(0);
});
