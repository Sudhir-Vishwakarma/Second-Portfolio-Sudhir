import React, { useEffect, useRef, useState } from 'react';

export interface ContactForm { name: string; email: string; subject: string; message: string }
export const EMPTY_FORM: ContactForm = { name: '', email: '', subject: '', message: '' };
export const FALLBACK_ERROR = 'Could not send your message. Please email me directly.';

export type ContactResult = { ok: true } | { ok: false; error: string };

export async function submitContact(form: ContactForm, fetchImpl: typeof fetch = fetch): Promise<ContactResult> {
  try {
    const res = await fetchImpl('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (data && data.error) || FALLBACK_ERROR };
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export function useContactForm(onSent?: () => void) {
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(toastTimer.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return; // a second submit while sending is ignored
    inFlight.current = true;
    setSending(true);
    setError('');
    const result = await submitContact(form);
    inFlight.current = false;
    if (!mounted.current) {
      // unmounted mid-send: no state or timers to touch, but still report the send
      if (result.ok) onSent?.();
      return;
    }
    setSending(false);
    if (result.ok) {
      setShowToast(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowToast(false), 4000);
      setForm(EMPTY_FORM);
      onSent?.();
    } else {
      setError(result.error);
    }
  };

  return { form, sending, error, showToast, handleChange, handleSubmit };
}
