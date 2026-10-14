import { Certification } from '../../data/portfolio';

export interface CertificateSource { kind: 'pdf' | 'image'; url: string }

/** Use the PDF only if it really exists (dev servers answer unknown paths with index.html). */
export async function resolveCertificateSource(cert: Certification, fetchImpl: typeof fetch = fetch): Promise<CertificateSource> {
  const image: CertificateSource = { kind: 'image', url: cert.image };
  if (!cert.pdf) return image;
  try {
    const res = await fetchImpl(cert.pdf, { method: 'HEAD' });
    const type = res.headers.get('content-type') || '';
    return res.ok && type.includes('pdf') ? { kind: 'pdf', url: cert.pdf } : image;
  } catch {
    return image;
  }
}
