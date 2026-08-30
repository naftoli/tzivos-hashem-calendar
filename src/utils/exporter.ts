import { CalendarDay, CalendarCategory, CalendarEvent } from '../types';
import { CATEGORIES, isEventVisibleByCategories, isCCMeeting } from '../data/categories';

export interface FlatCalendarRecord {
  isoDate: string;
  year: number;
  month: number;
  day: number;
  dayOfWeek: string;
  hebrewDate: string;
  hebrewDay?: string;
  hebrewDayNum?: number;
  hebrewMonth?: string;
  hebrewMonthEn?: string;
  hebrewYear?: number;
  hebrewYearHebrew?: string;
  hebrewMonthKey?: string;
  englishDate: string;
  parsha: string;
  hideParshaPrefix?: boolean;
  link?: string;
  buttonText?: string;
  shortTitle?: string;
  category: CalendarCategory;
  categoryName: string;
  subCategory: string;
  title: string;
  rawText: string;
  time?: string;
  shadingLevel?: string;
  isGlobal?: boolean;
}

export function flattenCalendarEvents(
  days: CalendarDay[],
  selectedCategories: Record<CalendarCategory, boolean>,
  searchQuery: string = ''
): FlatCalendarRecord[] {
  const records: FlatCalendarRecord[] = [];
  const query = searchQuery.trim().toLowerCase();

  for (const day of days) {
    for (const ev of day.events) {
      if (!isEventVisibleByCategories(ev, selectedCategories)) continue;

      if (query) {
        const matches =
          ev.title.toLowerCase().includes(query) ||
          ev.subCategory.toLowerCase().includes(query) ||
          day.hebrewDate.toLowerCase().includes(query) ||
          (day.hebrewMonth && day.hebrewMonth.toLowerCase().includes(query)) ||
          (day.hebrewMonthEn && day.hebrewMonthEn.toLowerCase().includes(query)) ||
          day.parsha.toLowerCase().includes(query) ||
          day.englishDate.toLowerCase().includes(query);
        if (!matches) continue;
      }

      const isCC = isCCMeeting(ev);

      records.push({
        isoDate: day.isoDate,
        year: day.year,
        month: day.month,
        day: day.day,
        dayOfWeek: day.dayOfWeek,
        hebrewDate: day.hebrewDate,
        hebrewDay: day.hebrewDay,
        hebrewDayNum: day.hebrewDayNum,
        hebrewMonth: day.hebrewMonth,
        hebrewMonthEn: day.hebrewMonthEn,
        hebrewYear: day.hebrewYear,
        hebrewYearHebrew: day.hebrewYearHebrew,
        hebrewMonthKey: day.hebrewMonthKey,
        englishDate: day.englishDate,
        parsha: day.parsha,
        hideParshaPrefix: day.hideParshaPrefix,
        link: ev.link,
        buttonText: ev.buttonText,
        shortTitle: ev.shortTitle,
        category: ev.category,
        categoryName: isCC ? 'Meetings & Chidon' : (CATEGORIES[ev.category]?.name || ev.category),
        subCategory: ev.subCategory,
        title: ev.title,
        rawText: ev.rawText,
        time: ev.time,
        shadingLevel: ev.shadingLevel,
        isGlobal: ev.isGlobal,
      });
    }
  }

  return records;
}

/**
 * Generate standard CSV formatted content
 */
export function generateCSV(records: FlatCalendarRecord[]): string {
  const headers = [
    'Date (ISO)',
    'English Date',
    'Hebrew Date',
    'Day of Week',
    'Parsha',
    'Category',
    'Subcategory',
    'Event Title',
    'Time (EST)',
    'Shading / Special Notes',
  ];

  const escapeCSV = (val: string | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  const rows = records.map((r) => [
    escapeCSV(r.isoDate),
    escapeCSV(r.englishDate),
    escapeCSV(r.hebrewDate),
    escapeCSV(r.dayOfWeek),
    escapeCSV(r.parsha),
    escapeCSV(r.categoryName),
    escapeCSV(r.subCategory),
    escapeCSV(r.title),
    escapeCSV(r.time || ''),
    escapeCSV(r.shadingLevel || (r.isGlobal ? 'Global Rally' : '')),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Generate iCalendar (.ics) for Google Calendar, Apple Calendar, Outlook
 */
export function generateICalendar(records: FlatCalendarRecord[], calendarName = 'Tzivos Hashem 5787 Schedule'): string {
  const pad = (n: number) => String(n).padStart(2, '0');

  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tzivos Hashem//Interactive Calendar 5787//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:America/New_York',
  ];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const cleanDate = r.isoDate.replace(/-/g, ''); // "YYYYMMDD"
    const uid = `th-5787-${cleanDate}-${i}-${Math.abs(hashString(r.title))}@tzivoshashem.org`;

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${uid}`);
    icsLines.push(`DTSTAMP:${dtstamp}`);

    // If event has a specific time (e.g. 9:00 PM EST, 1:00 PM EST)
    if (r.time && (r.time.includes('PM') || r.time.includes('AM'))) {
      const { startHour, startMinute, endHour, endMinute } = parseTimeStringTo24h(r.time);
      const startIsoTime = `${cleanDate}T${pad(startHour)}${pad(startMinute)}00`;
      const endIsoTime = `${cleanDate}T${pad(endHour)}${pad(endMinute)}00`;
      icsLines.push(`DTSTART;TZID=America/New_York:${startIsoTime}`);
      icsLines.push(`DTEND;TZID=America/New_York:${endIsoTime}`);
    } else {
      // All day event
      icsLines.push(`DTSTART;VALUE=DATE:${cleanDate}`);
      // In iCal, all day end is the next day
      const nextDay = getNextDayIso(r.isoDate).replace(/-/g, '');
      icsLines.push(`DTEND;VALUE=DATE:${nextDay}`);
    }

    icsLines.push(`SUMMARY:${escapeICalText(r.title)}`);
    
    let description = r.categoryName && r.subCategory && r.categoryName.toLowerCase().trim() !== r.subCategory.toLowerCase().trim()
      ? `Category: ${r.categoryName} (${r.subCategory})`
      : `Category: ${r.categoryName || r.subCategory}`;
    if (r.hebrewDate) description += `\\nHebrew Date: ${r.hebrewDate}`;
    if (r.parsha) description += `\\nParsha: ${r.parsha}`;
    if (r.time) description += `\\nTime: ${r.time} (New York / EST)`;
    if (r.shadingLevel) description += `\\nNote: ${r.shadingLevel}`;
    if (r.isGlobal) description += `\\nGlobal Broadcast`;

    icsLines.push(`DESCRIPTION:${description}`);
    icsLines.push(`CATEGORIES:${escapeICalText(r.categoryName)}`);
    icsLines.push('STATUS:CONFIRMED');
    icsLines.push('END:VEVENT');
  }

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

/**
 * Generate a single Google Calendar direct URL
 */
export function getGoogleCalendarUrl(day: CalendarDay, event: CalendarEvent): string {
  const cleanDate = day.isoDate.replace(/-/g, '');
  let datesParam = `${cleanDate}/${getNextDayIso(day.isoDate).replace(/-/g, '')}`;

  if (event.time && (event.time.includes('PM') || event.time.includes('AM'))) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const { startHour, startMinute, endHour, endMinute } = parseTimeStringTo24h(event.time);
    // Format YYYYMMDDTHHMMSS
    datesParam = `${cleanDate}T${pad(startHour)}${pad(startMinute)}00/${cleanDate}T${pad(endHour)}${pad(endMinute)}00`;
  }

  const catName = CATEGORIES[event.category]?.name || event.category;
  let details = event.subCategory && catName && event.subCategory.toLowerCase().trim() !== catName.toLowerCase().trim()
    ? `Category: ${catName} (${event.subCategory})`
    : `Category: ${catName || event.subCategory}`;
  if (day.hebrewDate) details += `\nHebrew Date: ${day.hebrewDate}`;
  if (day.parsha) details += `\nParsha: ${day.parsha}`;
  if (event.time) details += `\nTime: ${event.time} (EST)`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: datesParam,
    details: details,
    ctz: 'America/New_York',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function parseTimeStringTo24h(timeStr: string): { startHour: number; startMinute: number; endHour: number; endMinute: number } {
  // e.g. "9:00 PM", "9:30 PM", "1:00 PM", "1:30 PM"
  const isPM = timeStr.toUpperCase().includes('PM');
  const clean = timeStr.replace(/PM|AM/gi, '').trim();
  const [hStr, mStr] = clean.split(':');
  let hour = parseInt(hStr || '0', 10);
  const min = parseInt(mStr || '0', 10);

  if (isPM && hour < 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  // Assume 30 min duration
  let endHour = hour;
  let endMin = min + 30;
  if (endMin >= 60) {
    endHour += 1;
    endMin -= 60;
  }

  return { startHour: hour, startMinute: min, endHour, endMinute: endMin };
}

function getNextDayIso(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function escapeICalText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
