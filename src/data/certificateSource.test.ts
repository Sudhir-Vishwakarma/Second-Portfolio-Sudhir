import { resolveCertificateSource } from './certificateSource';

const cert = { title: 'ReactJS', provider: 'Great Learning', image: '/Images/Reactjs.png', pdf: '/certificates/react.pdf' };
const head = (status: number, type: string, throws = false) =>
  (jest.fn(async () => {
    if (throws) throw new Error('offline');
    return { ok: status < 400, status, headers: { get: () => type } } as unknown as Response;
  }) as unknown) as typeof fetch;

test('no pdf configured → image, without a request', async () => {
  const f = head(200, 'application/pdf');
  await expect(resolveCertificateSource({ ...cert, pdf: undefined }, f)).resolves.toEqual({ kind: 'image', url: cert.image });
  expect(f).not.toHaveBeenCalled();
});

test('pdf exists → pdf', async () => {
  await expect(resolveCertificateSource(cert, head(200, 'application/pdf'))).resolves.toEqual({ kind: 'pdf', url: cert.pdf });
});

test('missing pdf (404, SPA html fallback, or offline) → image', async () => {
  await expect(resolveCertificateSource(cert, head(404, 'text/html'))).resolves.toEqual({ kind: 'image', url: cert.image });
  await expect(resolveCertificateSource(cert, head(200, 'text/html'))).resolves.toEqual({ kind: 'image', url: cert.image });
  await expect(resolveCertificateSource(cert, head(0, '', true))).resolves.toEqual({ kind: 'image', url: cert.image });
});
