import rawData from './calendarData.json';
import { CalendarDay, HebrewMonthMeta } from '../types';

export const INITIAL_CALENDAR_DAYS: CalendarDay[] = rawData as CalendarDay[];

export function getGregorianMonths(days: CalendarDay[]): { year: number; month: number; label: string }[] {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const map = new Map<string, { year: number; month: number; label: string }>();
  
  for (const day of days) {
    const key = `${day.year}-${day.month}`;
    if (!map.has(key)) {
      map.set(key, {
        year: day.year,
        month: day.month,
        label: `${monthNames[day.month - 1]} ${day.year}`,
      });
    }
  }
  
  return Array.from(map.values());
}

export function getHebrewMonths(days: CalendarDay[]): HebrewMonthMeta[] {
  const map = new Map<string, HebrewMonthMeta>();
  
  for (const day of days) {
    const key = day.hebrewMonthKey || `${day.hebrewYear}-${day.hebrewMonth}`;
    if (!map.has(key)) {
      const label = `${day.hebrewMonthEn} ${day.hebrewYear}`;
      const labelHebrew = `${day.hebrewMonth} ${day.hebrewYearHebrew || ''}`.trim();
      
      map.set(key, {
        key,
        hebrewMonth: day.hebrewMonth,
        hebrewMonthEn: day.hebrewMonthEn,
        hebrewYear: day.hebrewYear,
        hebrewYearHebrew: day.hebrewYearHebrew || '',
        label,
        labelHebrew,
        totalDays: 1,
        startDate: day.isoDate,
        endDate: day.isoDate,
      });
    } else {
      const existing = map.get(key)!;
      existing.totalDays += 1;
      existing.endDate = day.isoDate;
    }
  }
  
  return Array.from(map.values());
}

// Backwards compatibility alias
export const getMonthsInYear = getGregorianMonths;

export function getTodayIso(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function findTodayDay(days: CalendarDay[]): CalendarDay | undefined {
  const todayIso = getTodayIso();
  return days.find((d) => d.isoDate === todayIso);
}

