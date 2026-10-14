import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { UNIVERSE_ORDER } from './universePager';
import { UniversePager, useUniversePager } from './useUniversePager';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let pager: UniversePager;
const Harness: React.FC = () => {
  pager = useUniversePager(0, false);
  return null;
};

let host: HTMLDivElement;
let root: Root;
let clock = 0;

/** Advance fake timers and the performance.now stub together. */
const advance = (ms: number) =>
  act(async () => {
    clock += ms;
    jest.advanceTimersByTime(ms);
  });
const travel = (...args: Parameters<UniversePager['travelTo']>) =>
  act(async () => {
    pager.travelTo(...args);
  });
const pop = (id: string) =>
  act(async () => {
    window.history.replaceState({ mbUniverse: id }, '', `#${id}`);
    window.dispatchEvent(new PopStateEvent('popstate', { state: { mbUniverse: id } }));
  });
const jump = async (to: number) => {
  await travel(to);
  await advance(1200);
};

beforeEach(async () => {
  jest.useFakeTimers('modern');
  clock = 1000;
  jest.spyOn(performance, 'now').mockImplementation(() => clock);
  window.history.replaceState(null, '', '/');
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => {
    root.render(<Harness />);
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('a jump swaps at 750 ms, pushes history, and settles at 1200 ms', async () => {
  const before = window.history.length;
  await travel(1);
  expect(pager.viewState).toBe('leaving');
  await advance(749);
  expect(pager.index).toBe(0);
  await advance(1);
  expect(pager.index).toBe(1);
  expect(window.location.hash).toBe('#about');
  expect(window.history.length).toBe(before + 1);
  await advance(450);
  expect(pager.viewState).toBe('active');
});

test('Back before the swap travels to the popped universe without pushing the target', async () => {
  await jump(1);
  await jump(2);
  await travel(4);
  await advance(300);
  await pop('about');
  await advance(1300); // black hole flight (1600 ms) lands on projects (no push), then replays Back
  expect(pager.index).toBe(4);
  await advance(1600); // the replay 4 -> 1 is also a black hole jump
  expect(pager.index).toBe(1);
  expect(window.location.hash).toBe('#about');
  expect(pager.viewState).toBe('active');
});

test('two pops in one flight replay only the last target', async () => {
  await jump(1);
  await jump(2);
  await travel(4);
  await advance(200);
  await pop('about');
  await advance(100);
  await pop('home');
  await advance(1000); // flight lands on projects
  expect(pager.index).toBe(4);
  await advance(1200); // replay of the last pop only
  expect(pager.index).toBe(0);
  expect(window.location.hash).toBe('#home');
  await advance(2000);
  expect(pager.index).toBe(0);
});

test('gesture travel is ignored for 400 ms after a jump lands', async () => {
  await jump(1);
  await advance(100);
  await travel(2, { source: 'gesture' });
  await advance(1300);
  expect(pager.index).toBe(1);
  await advance(400);
  await travel(2, { source: 'gesture' });
  await advance(1200);
  expect(pager.index).toBe(2);
});

test('a popstate for a sheet entry is ignored', async () => {
  await jump(1);
  await act(async () => {
    window.history.pushState({ mbSheet: true }, '', '#about');
    window.dispatchEvent(new PopStateEvent('popstate', { state: { mbSheet: true } }));
  });
  expect(pager.viewState).toBe('active');
  await advance(1500);
  expect(pager.index).toBe(1);
});

test('keyboard/nav travel does nothing while a sheet is open, but history travel still works', async () => {
  await jump(1);
  const sheet = document.createElement('div');
  sheet.className = 'mb-sheet';
  await act(async () => {
    document.body.appendChild(sheet);
    window.history.pushState({ mbSheet: true }, '', '#about');
  });
  await travel(3);
  expect(pager.viewState).toBe('active');
  await advance(1500);
  expect(pager.index).toBe(1);
  expect(window.history.state).toEqual({ mbSheet: true });
  await travel(0, { push: false, source: 'history' });
  await advance(1200);
  expect(pager.index).toBe(0);
  expect(UNIVERSE_ORDER[0]).toBe('home');
  sheet.remove();
});

test('Forward onto a closed sheet entry does not lock travel', async () => {
  await jump(1);
  // The sheet was closed with Back, then Forward re-entered its { mbSheet } entry: no sheet is in the DOM.
  await act(async () => {
    window.history.pushState({ mbSheet: true }, '', '#about');
    window.dispatchEvent(new PopStateEvent('popstate', { state: { mbSheet: true } }));
  });
  await jump(3);
  expect(pager.index).toBe(3);
  expect(window.location.hash).toBe('#work');
});

test('far jumps use the black hole timeline; neighbours keep hyperspeed', async () => {
  await travel(5);
  expect(pager.jumpKind).toBe('blackhole');
  expect(pager.warpRef.current.kind).toBe('blackhole');
  await advance(799);
  expect(pager.index).toBe(0);
  await advance(1);
  expect(pager.index).toBe(5);
  expect(window.location.hash).toBe('#contact');
  await advance(799);
  expect(pager.viewState).toBe('arriving');
  await advance(1);
  expect(pager.viewState).toBe('active');
  await travel(4);
  expect(pager.jumpKind).toBe('hyperspeed');
  expect(pager.warpRef.current.kind).toBe('hyperspeed');
  await advance(750);
  expect(pager.index).toBe(4);
});

test('map jumps use the black hole even to a neighbour', async () => {
  await travel(1, { via: 'map' });
  expect(pager.jumpKind).toBe('blackhole');
  await advance(1600);
  expect(pager.index).toBe(1);
  expect(pager.viewState).toBe('active');
});

test('travel input during a black hole jump is ignored', async () => {
  await travel(5);
  await advance(300);
  await travel(2);
  await advance(1300);
  expect(pager.index).toBe(5);
  await advance(1000);
  expect(pager.index).toBe(5);
});
