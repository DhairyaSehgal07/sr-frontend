import { describe, expect, it } from 'vitest';

import type { AuthUser } from '@/features/auth/types';
import { env } from '@/lib/env';

import { pdfIssuerFromUser } from './pdf-issuer';

const user = {
  coldStorageId: {
    name: 'Sri Ram Farms',
    address: '  V.P.O Uggi  ',
    imageUrl: 'https://cdn.example/logo.jpg',
    jpgaNumber: ' 01083 ',
    tagline: '  Producers of Top Quality Potatoes of Punjab  ',
    contactNumbers: '',
  },
} as AuthUser;

describe('pdfIssuerFromUser', () => {
  it('uses the cold storage name', () => {
    expect(pdfIssuerFromUser(user).name).toBe('Sri Ram Farms');
  });

  it('trims letterhead fields and leaves empty ones blank', () => {
    expect(pdfIssuerFromUser(user)).toEqual({
      name: 'Sri Ram Farms',
      address: 'V.P.O Uggi',
      logoUrl: 'https://cdn.example/logo.jpg',
      jpgaNumber: '01083',
      tagline: 'Producers of Top Quality Potatoes of Punjab',
      contactNumbers: '',
    });
  });

  it('resolves a relative logo against the API origin', () => {
    const issuer = pdfIssuerFromUser({
      coldStorageId: {
        name: 'Sri Ram Farms',
        imageUrl: '/uploads/logo.jpg',
      },
    } as AuthUser);

    const origin = new URL(env.apiBaseUrl, 'http://localhost').origin;
    expect(issuer.logoUrl).toBe(`${origin}/uploads/logo.jpg`);
  });

  it('returns blanks when there is no session', () => {
    expect(pdfIssuerFromUser(null)).toEqual({
      name: '',
      address: '',
      logoUrl: '',
      jpgaNumber: '',
      tagline: '',
      contactNumbers: '',
    });
  });
});
