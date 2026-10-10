import type { AuthUser } from '@/features/auth/types';
import { env } from '@/lib/env';

export type PdfIssuer = {
  name: string;
  address: string;
  logoUrl: string;
  jpgaNumber: string;
  tagline: string;
  contactNumbers: string;
};

function trimField(value: string | number | null | undefined): string {
  if (value == null) return '';
  return String(value).trim();
}

function absoluteLogoUrl(url: string): string {
  if (!url || /^(https?:|data:|blob:)/i.test(url)) return url;

  const apiOrigin = new URL(env.apiBaseUrl, 'http://localhost').origin;
  return new URL(url, apiOrigin).href;
}

export function pdfIssuerFromUser(user: AuthUser | null | undefined): PdfIssuer {
  const coldStorage = user?.coldStorageId;

  return {
    name: trimField(coldStorage?.name),
    address: trimField(coldStorage?.address),
    logoUrl: absoluteLogoUrl(trimField(coldStorage?.imageUrl)),
    jpgaNumber: trimField(coldStorage?.jpgaNumber),
    tagline: trimField(coldStorage?.tagline),
    contactNumbers: trimField(coldStorage?.contactNumbers),
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read logo'));
    reader.readAsDataURL(blob);
  });
}

/** Embed the cold-storage logo so react-pdf can paint it without a cross-origin fetch. */
export async function withEmbeddedLogo(issuer: PdfIssuer): Promise<PdfIssuer> {
  const logoUrl = issuer.logoUrl;
  if (!logoUrl || logoUrl.startsWith('data:')) return issuer;

  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return issuer;
    const dataUrl = await blobToDataUrl(await response.blob());
    return dataUrl ? { ...issuer, logoUrl: dataUrl } : issuer;
  } catch {
    return issuer;
  }
}
