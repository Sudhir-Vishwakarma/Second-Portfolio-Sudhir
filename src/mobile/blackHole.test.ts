import { BH_MS, BH_PULL_MS, BH_SWAP_MS, blackHoleFrame, jumpKind } from './blackHole';

test('timeline constants', () => {
  expect([BH_PULL_MS, BH_SWAP_MS, BH_MS]).toEqual([600, 800, 1600]);
});

test('blackHoleFrame phase boundaries', () => {
  expect(blackHoleFrame(-1)).toMatchObject({ phase: 'idle', done: false });
  expect(blackHoleFrame(0)).toMatchObject({ phase: 'pull', pull: 0, horizon: 0, flare: 0, burst: 0, mix: 0 });
  expect(blackHoleFrame(599).phase).toBe('pull');
  expect(blackHoleFrame(599).pull).toBeGreaterThan(0.99);
  expect(blackHoleFrame(600)).toMatchObject({ phase: 'collapse', pull: 1, flare: 0, mix: 0 });
  expect(blackHoleFrame(799).phase).toBe('collapse');
  expect(blackHoleFrame(799).flare).toBeGreaterThan(0.99);
  expect(blackHoleFrame(800)).toMatchObject({ phase: 'emerge', pull: 1, horizon: 1, flare: 1, burst: 1, mix: 1 });
  expect(blackHoleFrame(1599).phase).toBe('emerge');
  expect(blackHoleFrame(1599).burst).toBeLessThan(0.01);
  expect(blackHoleFrame(1599).horizon).toBe(0);
  expect(blackHoleFrame(1600)).toMatchObject({ phase: 'idle', pull: 0, horizon: 0, flare: 0, burst: 0, mix: 1, done: true });
});

test('flare peaks at the swap, mix never goes backwards, values stay in range', () => {
  let lastMix = 0;
  for (let t = 0; t <= BH_MS; t += 10) {
    const f = blackHoleFrame(t);
    expect(f.flare).toBeLessThanOrEqual(blackHoleFrame(BH_SWAP_MS).flare);
    expect(f.mix).toBeGreaterThanOrEqual(lastMix);
    lastMix = f.mix;
    [f.pull, f.horizon, f.flare, f.burst, f.mix].forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  }
  expect(blackHoleFrame(BH_SWAP_MS - 10).flare).toBeLessThan(1);
  expect(blackHoleFrame(BH_SWAP_MS + 10).flare).toBeLessThan(1);
});

test('jumpKind: map jumps and far jumps use the black hole', () => {
  expect(jumpKind({ from: 0, to: 1 })).toBe('hyperspeed');
  expect(jumpKind({ from: 3, to: 2 })).toBe('hyperspeed');
  expect(jumpKind({ from: 0, to: 2 })).toBe('blackhole');
  expect(jumpKind({ from: 5, to: 0 })).toBe('blackhole');
  expect(jumpKind({ from: 0, to: 1, via: 'map' })).toBe('blackhole');
});
