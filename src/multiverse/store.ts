import create from 'zustand';
import { STEPS, isWarp, universeIndex, universeOf } from './journey';

export type Modal = { kind: 'cv' } | { kind: 'details'; step?: number } | { kind: 'certificate'; index: number } | { kind: 'project'; index: number };
export type MoveKind = 'glide' | 'warp';

/** Ignore input this long after arriving (absorbs trackpad inertia). */
export const SETTLE_MS = 400;

export interface JourneyState {
  step: number;
  moving: boolean;
  moveKind: MoveKind;
  arrivedAt: number;
  cameraUniverse: number;
  modal: Modal | null;
  beamAt: number;
  booted: boolean;
  /** Tapped 3D object showing its info card (e.g. 'moon-2', 'skill-5', 'cert-1'). */
  picked: string | null;
  go: (dir: 1 | -1, now?: number) => void;
  jump: (target: number, now?: number) => void;
  arrive: (now?: number) => void;
  setCameraUniverse: (n: number) => void;
  openModal: (m: Modal) => void;
  closeModal: () => void;
  fireBeam: (now?: number) => void;
  setBooted: () => void;
  pick: (id: string | null) => void;
  reset: (step: number) => void;
}

const clampStep = (i: number) => Math.max(0, Math.min(STEPS.length - 1, i));

export const useJourney = create<JourneyState>((set, get) => ({
  step: 0,
  moving: false,
  moveKind: 'glide',
  arrivedAt: -Infinity,
  cameraUniverse: 0,
  modal: null,
  beamAt: -Infinity,
  booted: false,
  picked: null,

  go: (dir, now = performance.now()) => {
    const s = get();
    if (s.modal) return;
    s.jump(s.step + dir, now);
  },

  jump: (target, now = performance.now()) => {
    const s = get();
    const to = clampStep(target);
    if (s.moving || to === s.step || now - s.arrivedAt < SETTLE_MS) return;
    set({ step: to, moving: true, moveKind: isWarp(s.step, to) ? 'warp' : 'glide', modal: null, picked: null });
  },

  arrive: (now = performance.now()) => {
    if (get().moving) set({ moving: false, arrivedAt: now });
  },

  setCameraUniverse: (n) => {
    if (get().cameraUniverse !== n) set({ cameraUniverse: n });
  },

  openModal: (m) => set({ modal: m }),
  closeModal: () => set({ modal: null }),
  fireBeam: (now = performance.now()) => set({ beamAt: now }),
  setBooted: () => set({ booted: true }),
  pick: (id) => set({ picked: id !== null && get().picked === id ? null : id }),

  reset: (step) => {
    const to = clampStep(step);
    set({
      step: to,
      moving: false,
      moveKind: 'glide',
      arrivedAt: -Infinity,
      cameraUniverse: universeIndex(universeOf(to)),
      modal: null,
      booted: false,
      picked: null,
    });
  },
}));
