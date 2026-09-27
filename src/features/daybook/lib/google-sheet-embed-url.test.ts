import { describe, expect, it } from 'vitest';

import { toGoogleSheetEmbedUrl } from './google-sheet-embed-url';

const SHEET_ID = '1VBztOh9QMr-UOeQfxtE6XrhsIoUE0NwdkAUnBT0e9bA';

describe('toGoogleSheetEmbedUrl', () => {
  it('converts a share link into the editable sheet URL', () => {
    expect(
      toGoogleSheetEmbedUrl(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`),
    ).toBe(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`);
  });

  it('keeps a numeric gid', () => {
    expect(
      toGoogleSheetEmbedUrl(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=42&usp=sharing`,
      ),
    ).toBe(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing&gid=42`);
  });

  it('rejects empty, malformed, and non-Google URLs', () => {
    expect(toGoogleSheetEmbedUrl('')).toBeNull();
    expect(toGoogleSheetEmbedUrl('   ')).toBeNull();
    expect(toGoogleSheetEmbedUrl('not a url')).toBeNull();
    expect(toGoogleSheetEmbedUrl('http://docs.google.com/spreadsheets/d/abc/edit')).toBeNull();
    expect(toGoogleSheetEmbedUrl('https://evil.example/spreadsheets/d/abc/edit')).toBeNull();
    expect(toGoogleSheetEmbedUrl('https://docs.google.com/document/d/abc/edit')).toBeNull();
  });
});
