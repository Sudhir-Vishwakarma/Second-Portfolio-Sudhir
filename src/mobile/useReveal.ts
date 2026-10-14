import { RefObject, useEffect } from 'react';

/** Adds `is-revealed` to [data-reveal] descendants as they scroll in, including nodes rendered later. */
export function useReveal(rootRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reveal = (el: Element) => el.classList.add('is-revealed');
    const io =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  reveal(e.target);
                  io?.unobserve(e.target);
                }
              }),
            { threshold: 0.15 }
          );
    const track = (el: Element) => {
      if (el.classList.contains('is-revealed')) return;
      if (io) io.observe(el);
      else reveal(el);
    };
    root.querySelectorAll('[data-reveal]').forEach(track);
    const mo = new MutationObserver((records) =>
      records.forEach((r) =>
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches('[data-reveal]')) track(n);
          n.querySelectorAll('[data-reveal]').forEach(track);
        })
      )
    );
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io?.disconnect();
      mo.disconnect();
    };
  }, [rootRef]);
}
