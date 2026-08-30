import { CalendarCategory, CategoryInfo, CalendarEvent } from '../types';

export const CATEGORIES: Record<CalendarCategory, CategoryInfo> = {
  chidon: {
    id: 'chidon',
    name: 'Chidon 5787',
    hebrewName: 'חידון המצוות',
    description: 'KHK Program, Shipments, Registration, Curriculum Tests, Trips, and CC Meetings',
    color: '#b48a18', // Gold
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-950',
    subCategories: [
      'KHK Program & Tests',
      'Shipments & Materials',
      'Registration & Enrollment',
      'Trips & Special Events',
      'Chidon Tests & Curriculum',
      'Chidon Coordinator Meeting',
    ],
  },
  hachayol_battlefront: {
    id: 'hachayol_battlefront',
    name: 'Hachayol & Battlefront',
    hebrewName: 'החייל ודו״ח',
    description: 'Hachayol Magazine and Battlefront Report release dates and issues',
    color: '#0d9488', // Teal
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    textColor: 'text-teal-950',
    subCategories: ['Hachayol Issue', 'Battlefront Report'],
  },
  rallies: {
    id: 'rallies',
    name: 'Rallies & Global Rallies',
    hebrewName: 'ראלי צבאות ה׳',
    description: 'Tzivos Hashem Live Rallies and Global Broadcasts',
    color: '#e11d48', // Rose
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-950',
    subCategories: ['Rally', 'Global Rally'],
  },
  meetings: {
    id: 'meetings',
    name: 'Meetings (BC & CC)',
    hebrewName: 'אסיפות מפקדים',
    description: 'Base Commander (9:00 PM / 1:00 PM) & Chidon Coordinator (9:30 PM / 1:30 PM)',
    color: '#7c3aed', // Violet
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    textColor: 'text-violet-950',
    subCategories: ['Base Commander Meeting', 'Chidon Coordinator Meeting'],
  },
  promotion_ceremony: {
    id: 'promotion_ceremony',
    name: 'Promotion Ceremony',
    hebrewName: 'טקסי עלייה בדרגות',
    description: 'Monthly Promotion ceremonies for earned ranks',
    color: '#0284c7', // Sky Blue
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    textColor: 'text-sky-950',
    subCategories: ['Promotion Ceremony'],
  },
  yomei_depagra: {
    id: 'yomei_depagra',
    name: 'Yomei Depagra & Chassidishe Dates',
    hebrewName: 'יומי דפגרא וחב״ד',
    description: 'Chabad Chassidishe anniversaries, Yomim Tovim, and special dates',
    color: '#b45309', // Warm Ochre
    bgColor: 'bg-amber-100/70',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-950',
    subCategories: ['Yomei Depagra'],
  },
  niggunim: {
    id: 'niggunim',
    name: 'Niggun of the Week',
    hebrewName: 'ניגון השבוע',
    description: 'Weekly Parsha Niggun of Tzivos Hashem',
    color: '#4f46e5', // Indigo
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-950',
    subCategories: ['Niggun of the Week'],
  },
  raffle_5m: {
    id: 'raffle_5m',
    name: '5M Weekly Raffles',
    hebrewName: 'הגרלות שבועיות 5M',
    description: 'Weekly mission cycle (Start, Thursday Deadline, Winner Announcements)',
    color: '#d70a25', // 5M Crimson Red
    bgColor: 'bg-red-50/90',
    borderColor: 'border-red-300',
    textColor: 'text-red-950',
    subCategories: [
      '5M Raffle Mission Start',
      '5M Raffle Mission End',
      '5M Winners Announced',
    ],
  },
raffle_60m: {
  id: 'raffle_60m',
  name: '60M Grand Raffles',
  hebrewName: 'הגרלות ענק 60M',
  description: 'Quarterly 3-month cycle grand raffles (Starts & Ends)',
  color: '#f59e0b', // Warm Sunny Yellow
  bgColor: 'bg-yellow-200/80',
  borderColor: 'border-yellow-500',
  textColor: 'text-yellow-950',
  subCategories: ['60M Raffle Starts', '60M Raffle Ends'],
},
  shabbos_mevorchim: {
    id: 'shabbos_mevorchim',
    name: 'Shabbos Mevorchim & Data Due',
    hebrewName: 'שבת מברכים ודו״ח',
    description: 'Shabbos Mevorchim dates and monthly point submission deadlines',
    color: '#1a1c96', // Dark blue
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-950',
    subCategories: ['Shabbos Mevorchim', 'Shabbos Mevorchim Data Due'],
  },
  cp: {
    id: 'cp',
    name: 'Connection Point',
    hebrewName: 'תכנית Connection Point',
    description: 'Senior (5-8) Lessons & Rallies, and Foundations / Junior Episodes',
    color: '#c026d3', // Fuchsia
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-300',
    textColor: 'text-fuchsia-950',
    subCategories: ['Senior (5-8)', 'Foundations/Junior'],
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CalendarCategory[];

export const DEFAULT_SELECTED_CATEGORIES: Record<CalendarCategory, boolean> = {
  chidon: true,
  hachayol_battlefront: true,
  rallies: true,
  meetings: true,
  promotion_ceremony: true,
  yomei_depagra: true,
  niggunim: true,
  raffle_5m: true,
  raffle_60m: true,
  shabbos_mevorchim: true,
  cp: true,
};

/**
 * Returns true if an event is a Chidon Coordinator (CC) meeting.
 * CC meetings belong to both the 'meetings' and 'chidon' categories.
 */
export function isCCMeeting(ev: CalendarEvent): boolean {
  if (ev.categories && ev.categories.includes('meetings') && ev.categories.includes('chidon')) {
    return true;
  }
  const sub = (ev.subCategory || '').toLowerCase();
  const title = (ev.title || '').toLowerCase();
  const raw = (ev.rawText || '').toLowerCase();
  const isMeetingCat = ev.category === 'meetings' || ev.category === 'chidon' || ev.categories?.includes('meetings');
  return (
    isMeetingCat &&
    (sub.includes('chidon coordinator') ||
      title.includes('chidon coordinator') ||
      raw.startsWith('cc:') ||
      raw.startsWith('cc '))
  );
}

/**
 * Determines whether an event should be visible given the current category filters.
 * For CC meetings, visible if EITHER 'meetings' OR 'chidon' is selected.
 */
export function isEventVisibleByCategories(
  ev: CalendarEvent,
  selectedCategories: Record<CalendarCategory, boolean>
): boolean {
  if (isCCMeeting(ev)) {
    return !!(selectedCategories.meetings || selectedCategories.chidon);
  }
  if (ev.categories && ev.categories.length > 0) {
    return ev.categories.some((cat) => selectedCategories[cat]);
  }
  return !!selectedCategories[ev.category];
}

