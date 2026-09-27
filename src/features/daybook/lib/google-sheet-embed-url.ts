const SPREADSHEET_PATH = /^\/spreadsheets\/d\/([a-zA-Z0-9-_]+)(?:\/|$)/;

/** Turns a Google Sheets link into the editable /edit URL used by the sheet UI. */
export function toGoogleSheetEmbedUrl(raw: string | undefined | null): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' || url.hostname !== 'docs.google.com') return null;

  const match = url.pathname.match(SPREADSHEET_PATH);
  const spreadsheetId = match?.[1];
  if (!spreadsheetId) return null;

  const embed = new URL(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  embed.searchParams.set('usp', 'sharing');
  const gid = url.searchParams.get('gid');
  if (gid && /^\d+$/.test(gid)) embed.searchParams.set('gid', gid);

  return embed.toString();
}
