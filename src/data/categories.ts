import { CalendarCategory, CategoryInfo, CalendarEvent } from '../types';

// Map each major category to its distinct subcategories
export const CATEGORY_SUBCATEGORIES: Record<CalendarCategory, string[]> = {
  chidon: ['KHK Tests', 'Shipping and Orders', 'Registration & Enrollment', 'Trips & Events', 'Limmud & Tests', 'CC Meetings', 'Limmud Schedule'],
  hachayol_battlefront: ['Hachayol Magazines', 'Battlefront Report'],
  raffle_5m: ['5M Raffle Mission Start', '5M Raffle Mission End', '5M Winners Announced'],
  raffle_60m: ['60M Raffle Starts', '60M Raffle Ends'],
  niggunim: ['Niggun of the Week'],
  yomei_depagra: ['Yomei Depagra'],
  shabbos_mevorchim: ['Shabbos Mevorchim', 'Shabbos Mevorchim Data Due'],
  meetings: ['BC Meetings', 'CC Meetings'],
  rallies: ['Rallies', 'Global Rallies'],
  cp: ['Senior (5-8)', 'Foundations/Junior'],
  promotion_ceremony: ['Promotion Ceremonies'],
  contests_sales: ['Contests', 'Sales']
};

// Default state: 'Limmud Schedule' is ON by default, Book 1-5 toggles are OFF by default
export const DEFAULT_SUBCATEGORIES_STATE: Record<string, boolean> = {
  'Limmud Schedule': true, // Side-by-side module visible by default
  'Book 1': false,         // Individual book cards hidden from main views by default
  'Book 2': false,
  'Book 3': false,
  'Book 4': false,
  'Book 5': false,
  'Chidon Test': true,
  'Chidon Meeting': true,
  'Chidon Review': true,
  'Hachayol Issue': true,
  'Battlefront Report': true,
  'Mission Review': true,
  '5M Drawing': true,
  '5M Deadline': true,
  '5M Winners': true,
  '60M Drawing': true,
  '60M Deadline': true,
  'Niggun Review': true,
  'Niggun Audio Release': true,
  'Farbrengen': true,
  'Special Limmud': true,
  'Shabbos Mevorchim': true,
  'Tehillim Deadline': true,
  'Base Commander Meeting': true,
  'City Commander Meeting': true,
  'Global Rally Broadcast': true,
  'Local Rally': true,
  'CP Rally': true,
  'CP Assignment': true,
  'Rank Advancement': true,
  'Ceremony Stream': true,
};

export const CATEGORIES: Record<CalendarCategory, CategoryInfo> = {
  chidon: {
    id: 'chidon',
    name: 'Chidon 5787',
    hebrewName: 'חידון המצוות',
    description: 'KHK Program, Shipments, Registration, Curriculum Tests, Trips, and CC Meetings',
    color: '#b48a18', // Gold
    bgColor: 'bg-[#faf6e8]',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-950',
    subCategories: [
      'KHK Tests',
      'Shipping and Orders',
      'Registration & Enrollment',
      'Trips & Events',
      'Limmud & Tests',
      'CC Meetings',
      'Limmud Schedule',
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
    subCategories: ['Hachayol Magazine', 'Battlefront Report'],
  },
  rallies: {
    id: 'rallies',
    name: 'Tzivos Hashem Rallies',
    hebrewName: 'ראלי צבאות ה׳',
    description: 'Tzivos Hashem Live Rallies and Global Broadcasts',
    color: '#e11d48', // Rose
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    textColor: 'text-rose-950',
    subCategories: ['Rallies', 'Global Rallies'],
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
    name: 'Yomei Depagra',
    hebrewName: 'יומי דפגרא',
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
    hebrewName: 'Connection Point',
    description: 'Senior (5-8) Lessons & Rallies, and Foundations / Junior Episodes',
    color: '#c026d3', // Fuchsia
    bgColor: 'bg-fuchsia-50',
    borderColor: 'border-fuchsia-300',
    textColor: 'text-fuchsia-950',
    subCategories: ['Senior (5-8)', 'Foundations/Junior'],
  },
  contests_sales: {
    id: 'contests_sales',
    name: 'Contests & Sales',
    hebrewName: 'Contests & Sales',
    description: 'Campaign contests, competitions, sales, and special offers',
    color: '#059669', // Emerald
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-950',
    subCategories: ['Contests', 'Sales'],
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
  contests_sales: true,
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

/** Unified visibility check for both parent category, subcategory, and book filters */
export const isEventVisibleByCategories = (
  event: CalendarEvent,
  selectedCategories: Record<CalendarCategory, boolean>,
  selectedSubCategories?: Record<string, boolean>
): boolean => {
  if (!event) return false;

  // 1. Format Limmud event card titles dynamically across all calendar views
  if (event.subCategory === 'Limmud Schedule' && event.bookNumber) {
    const rawRange = (event.rangeValue || event.title || '').trim();
    const isRange = rawRange.includes('-') || rawRange.includes('–');
    const unitLabel = isRange ? 'Units' : 'Unit';
    const formattedRange = rawRange.replace(/[-–]/, '–');

    const formattedTitle = `Book ${event.bookNumber}: ${unitLabel} ${formattedRange}`;
    event.title = formattedTitle;
    event.shortTitle = formattedTitle;
  }

  // 2. Check major parent category
  if (selectedCategories && selectedCategories[event.category] === false) {
    return false;
  }

  // 3. Subcategory & Book filtering logic
  if (selectedSubCategories) {
    // If the event is a Limmud Schedule event
    if (event.subCategory === 'Limmud Schedule') {
      // If the specific book is explicitly toggled ON (e.g., 'Book 1'), show its individual card
      if (event.bookNumber && selectedSubCategories[`Book ${event.bookNumber}`] === true) {
        return true;
      }
      // Otherwise, hide individual Limmud cards from standard views (module renders separately)
      return false;
    }

    // Standard subcategory visibility check for all other categories
    if (event.subCategory && selectedSubCategories[event.subCategory] === false) {
      return false;
    }
  }

  return true;
};