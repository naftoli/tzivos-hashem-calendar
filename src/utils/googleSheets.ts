import { CalendarDay } from '../types';
import { parseCSVToCalendarDays } from './csvParser';
import { INITIAL_CALENDAR_DAYS } from '../data/calendarData';

export const DEFAULT_PUBLISHED_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTdBNVSvD3QTautgFuDNFtnC0Y8xbcoHNmQ7zerwjhN2lv9kuwbsdZU9XdNXl_lNPqIIvIoU7OnGirK/pub?gid=0&single=true&output=csv';

export const STORAGE_KEYS = {
  SHEET_URL: 'tzivos_hashem_google_sheet_url',
  LAST_SYNCED: 'tzivos_hashem_last_synced_time',
  CACHED_DAYS: 'tzivos_hashem_cached_calendar_days',
  AUTO_SYNC_ENABLED: 'tzivos_hashem_auto_sync_enabled',
};

/**
 * Converts a Google Sheets URL (edit link, publish link, or ID) into a direct CSV export URL.
 */
export function normalizeGoogleSheetUrl(inputUrl: string): string {
  const trimmed = inputUrl.trim();
  if (!trimmed) return DEFAULT_PUBLISHED_SHEET_CSV_URL;

  // Direct CSV URL
  if (trimmed.endsWith('.csv') || trimmed.includes('output=csv') || trimmed.includes('format=csv')) {
    return trimmed;
  }

  // Published to web link: https://docs.google.com/spreadsheets/d/e/2PACX-.../pubhtml or /pub
  const pubMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch) {
    const pubId = pubMatch[1];
    // Check if there is a gid
    const gidMatch = trimmed.match(/[?&]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '&gid=0';
    return `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?${gidParam}&single=true&output=csv`;
  }

  // Standard Google Sheet URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/...
  const standardMatch = trimmed.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (standardMatch) {
    const sheetId = standardMatch[1];
    const gidMatch = trimmed.match(/[#?&]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
  }

  // If it's just the alphanumeric spreadsheet ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return `https://docs.google.com/spreadsheets/d/${trimmed}/export?format=csv`;
  }

  return trimmed;
}

export interface SyncResult {
  success: boolean;
  data?: CalendarDay[];
  error?: string;
  timestamp?: string;
  totalEvents?: number;
  totalDays?: number;
}

/**
 * Fetches the CSV content from Google Sheets directly via browser fetch API, then parses it.
 * Appends cache-busting timestamp and cache: 'no-store' to ensure freshness on every reload.
 */
export async function fetchAndParseGoogleSheet(sheetUrl?: string): Promise<SyncResult> {
  const target = sheetUrl?.trim() || DEFAULT_PUBLISHED_SHEET_CSV_URL;
  const exportUrl = normalizeGoogleSheetUrl(target);

  let csvText = '';
  let lastError: Error | null = null;

  // Direct client-side fetch with cache-busting
  try {
    const directUrl = `${exportUrl}${exportUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
    const directRes = await fetch(directUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'text/csv,text/plain,*/*',
      },
    });

    if (directRes.ok) {
      csvText = await directRes.text();
    } else {
      lastError = new Error(`HTTP ${directRes.status} ${directRes.statusText}`);
    }
  } catch (err: any) {
    lastError = err;
  }

  if (!csvText) {
    return {
      success: false,
      error: `Could not fetch Google Sheet CSV data. Ensure sheet is published ("File > Share > Publish to web > CSV"). Details: ${lastError?.message || 'Network error'}`,
    };
  }

  // Check if Google returned an HTML login page instead of CSV
  if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html')) {
    return {
      success: false,
      error: 'Google Sheet returned an HTML sign-in page. Please make sure the sheet is published to web ("File > Share > Publish to web > CSV") or shared as "Anyone with the link can view".',
    };
  }

  // Parse CSV
  const parseRes = parseCSVToCalendarDays(csvText);
  if (!parseRes.success || !parseRes.data || parseRes.data.length === 0) {
    return {
      success: false,
      error: parseRes.error || 'Failed to parse Google Sheet CSV data structure.',
    };
  }

  const now = new Date().toISOString();
  const totalEvents = parseRes.data.reduce((sum, d) => sum + d.events.length, 0);

  // Save to localStorage cache
  try {
    localStorage.setItem(STORAGE_KEYS.CACHED_DAYS, JSON.stringify(parseRes.data));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNCED, now);
    localStorage.setItem(STORAGE_KEYS.SHEET_URL, target);
  } catch (storageErr) {
    console.warn('Unable to persist calendar to localStorage', storageErr);
  }

  return {
    success: true,
    data: parseRes.data,
    timestamp: now,
    totalDays: parseRes.data.length,
    totalEvents,
  };
}

/**
 * Loads cached calendar days from localStorage, falling back to INITIAL_CALENDAR_DAYS.
 */
export function getInitialCalendarDays(): CalendarDay[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.CACHED_DAYS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load cached calendar days', e);
  }
  return INITIAL_CALENDAR_DAYS;
}

export function getSavedSheetUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEET_URL);
    return saved || DEFAULT_PUBLISHED_SHEET_CSV_URL;
  } catch {
    return DEFAULT_PUBLISHED_SHEET_CSV_URL;
  }
}

export function getSavedLastSyncedTime(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
  } catch {
    return null;
  }
}
