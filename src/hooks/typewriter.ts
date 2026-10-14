import { useEffect, useState } from 'react';

export const TYPE_MS = 100;
export const DELETE_MS = 50;
export const HOLD_MS = 2000;

export interface TypewriterState { wordIndex: number; text: string; deleting: boolean }

const wordAt = (s: TypewriterState, words: readonly string[]) => words[s.wordIndex % words.length];

export function nextTypewriterState(s: TypewriterState, words: readonly string[]): TypewriterState {
  const word = wordAt(s, words);
  if (!s.deleting && s.text === word) return { ...s, deleting: true };
  if (s.deleting && s.text === '') return { wordIndex: (s.wordIndex + 1) % words.length, text: '', deleting: false };
  if (s.deleting) return { ...s, text: s.text.slice(0, -1) };
  return { ...s, text: word.slice(0, s.text.length + 1) };
}

/** How long to wait before applying nextTypewriterState to `s`. */
export function typewriterDelay(s: TypewriterState, words: readonly string[]): number {
  if (!s.deleting && s.text === wordAt(s, words)) return HOLD_MS;
  return s.deleting ? DELETE_MS : TYPE_MS;
}

/** `words` must be a stable (module-level) array. */
export function useTypewriter(words: readonly string[]): string {
  const [state, setState] = useState<TypewriterState>({ wordIndex: 0, text: '', deleting: false });
  useEffect(() => {
    const t = setTimeout(() => setState((prev) => nextTypewriterState(prev, words)), typewriterDelay(state, words));
    return () => clearTimeout(t);
  }, [state, words]);
  return state.text;
}
