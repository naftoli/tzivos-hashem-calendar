export type CalendarCategory =
  | 'chidon'
  | 'hachayol_battlefront'
  | 'rallies'
  | 'meetings'
  | 'promotion_ceremony'
  | 'yomei_depagra'
  | 'niggunim'
  | 'raffle_5m'
  | 'raffle_60m'
  | 'shabbos_mevorchim'
  | 'cp'
  | 'contests_sales';

export interface CalendarEvent {
  id: string;
  category: CalendarCategory;
  categories?: CalendarCategory[];
  subCategory: string;
  title: string;
  shortTitle?: string;
  link?: string;
  buttonText?: string;
  rawText: string;
  time?: string; // e.g. "9:00 PM"
  isGlobal?: boolean;
  shadingLevel?: string; // "LIGHT" | "DARK" etc.
  // Chidon Limmud Tags
  bookNumber?: number;     // 1, 2, 3, 4, or 5
  rangeValue?: string;     // e.g. "100 - 200"
  hideFromGrid?: boolean;  // Hides from Month & Year view grids
  hideFromList?: boolean;  // Hides from Table & Agenda views
}

export interface CalendarDay {
  isoDate: string; // "YYYY-MM-DD"
  year: number; // Gregorian year e.g. 2026 or 2027
  month: number; // 1-12
  day: number; // 1-31
  dayOfWeek: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Shabbos';
  hebrewDate: string; // e.g. "כו אב", "א תשרי", "יט כסלו"
  hebrewDay: string; // e.g. "כו", "א", "יט"
  hebrewDayNum: number; // e.g. 26, 1, 19
  hebrewMonth: string; // e.g. "אב", "אלול", "תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר א", "אדר ב", "ניסן", "אייר", "סיון", "תמוז"
  hebrewMonthEn: string; // e.g. "Tishrei", "Marcheshvan", "Kislev", etc.
  hebrewYear: number; // 5786 or 5787
  hebrewYearHebrew: string; // "ה׳תשפ״ו" or "ה׳תשפ״ז"
  hebrewMonthKey: string; // e.g. "5787-תשרי"
  hebrewMonthIndex: number; // 0..14 sequential index
  englishDate: string; // e.g. "9 August"
  parsha: string; // e.g. "שופטים"
  hideParshaPrefix?: boolean; // true if YT is specified in the sheet
  events: CalendarEvent[];
  rawRow?: string[];
}

export type CalendarSystem = 'hebrew' | 'gregorian';

export interface CategoryInfo {
  id: CalendarCategory;
  name: string;
  hebrewName?: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  subCategories: string[];
}

export type CalendarViewType = 'year' | 'month' | 'week' | 'agenda' | 'table';

export interface FilterState {
  searchQuery: string;
  selectedCategories: Record<CalendarCategory, boolean>;
  selectedSubCategories: Record<string, boolean>;
  onlyYomeiDepagraShading?: 'ALL' | 'LIGHT' | 'DARK';
  showParsha: boolean;
}

export interface HebrewMonthMeta {
  key: string;
  hebrewMonth: string;
  hebrewMonthEn: string;
  hebrewYear: number;
  hebrewYearHebrew: string;
  label: string;
  labelHebrew: string;
  totalDays: number;
  startDate: string;
  endDate: string;
}

