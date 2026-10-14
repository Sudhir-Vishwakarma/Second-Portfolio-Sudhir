import { submitContact, EMPTY_FORM, FALLBACK_ERROR } from './contact';

const form = { ...EMPTY_FORM, name: 'A', email: 'a@b.co', subject: 'job', message: 'hi' };
const fakeFetch = (status: number, body: unknown, throws = false) =>
  (jest.fn(async () => {
    if (throws) throw new Error('offline');
    return { ok: status < 400, status, json: async () => body } as Response;
  }) as unknown) as typeof fetch;

test('posts JSON to /api/contact and reports success', async () => {
  const f = fakeFetch(200, { ok: true });
  await expect(submitContact(form, f)).resolves.toEqual({ ok: true });
  expect(f).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST', body: JSON.stringify(form) }));
});

test('surfaces the server error message', async () => {
  await expect(submitContact(form, fakeFetch(400, { error: 'Please fill in all fields with a valid email.' })))
    .resolves.toEqual({ ok: false, error: 'Please fill in all fields with a valid email.' });
});

test('falls back to a friendly message on network failure or empty body', async () => {
  await expect(submitContact(form, fakeFetch(0, {}, true))).resolves.toEqual({ ok: false, error: FALLBACK_ERROR });
  await expect(submitContact(form, fakeFetch(500, {}))).resolves.toEqual({ ok: false, error: FALLBACK_ERROR });
});
