import React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { CalendarDay, CalendarCategory, CalendarSystem } from '../types';
import { CATEGORIES, isCCMeeting } from '../data/categories';
import { flattenCalendarEvents, getGoogleCalendarUrl } from '../utils/exporter';
import { ChidonIcon } from './ChidonIcon';
import { HachayolIcon } from './HachayolIcon';
import { FiveMIcon } from './FiveMIcon';
import { SixtyMIcon } from './SixtyMIcon';
import { NiggunIcon } from './NiggunIcon';
import { YomeiDepagraIcon } from './YomeiDepagraIcon';
import { ShabbosMevorchimIcon } from './ShabbosMevorchimIcon';
import { GlobalRallyIcon } from './GlobalRallyIcon';
import { MeetingIcon } from './MeetingIcon';
import { TorahIcon } from './TorahIcon';
import { CpIcon } from './CpIcon';
import { PromotionCeremonyIcon } from './PromotionCeremonyIcon';

interface AgendaViewProps {
  days: CalendarDay[];
  calendarSystem: CalendarSystem;
  selectedCategories: Record<CalendarCategory, boolean>;
  selectedSubCategories?: Record<string, boolean>;
  searchQuery: string;
  onSelectDay: (day: CalendarDay) => void;
  todayIso: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const AgendaView: React.FC<AgendaViewProps> = ({
  days,
  calendarSystem,
  selectedCategories,
  selectedSubCategories,
  searchQuery,
  onSelectDay,
  todayIso,
}) => {
  const isHebrew = calendarSystem === 'hebrew';

  const scrollToToday = () => {
    const el = document.getElementById('agenda-item-today');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      const todayDay = days.find((d) => d.isoDate === todayIso);
      if (todayDay) {
        onSelectDay(todayDay);
      }
    }
  };

  // Group days by Month (Respects both Category & Subcategory/Book filters)
  const flatEvents = React.useMemo(() => {
    return flattenCalendarEvents(days, selectedCategories, searchQuery, selectedSubCategories);
  }, [days, selectedCategories, searchQuery, selectedSubCategories]);

  // Group flat events by Month string (Hebrew or Gregorian)
  const groupedByMonth = React.useMemo(() => {
    const map = new Map<string, { label: string; subLabel?: string; events: typeof flatEvents }>();

    for (const ev of flatEvents) {
      if (isHebrew) {
        const monthKey = ev.hebrewMonthKey || `${ev.hebrewYear}-${ev.hebrewMonth}`;
        if (!map.has(monthKey)) {
          map.set(monthKey, {
            label: `חודש ${ev.hebrewMonth} ${ev.hebrewYearHebrew || ''}`.trim(),
            subLabel: `${ev.hebrewMonthEn} ${ev.hebrewYear}`,
            events: [],
          });
        }
        map.get(monthKey)!.events.push(ev);
      } else {
        const monthKey = `${MONTH_NAMES[ev.month - 1]} ${ev.year}`;
        if (!map.has(monthKey)) {
          map.set(monthKey, {
            label: monthKey,
            events: [],
          });
        }
        map.get(monthKey)!.events.push(ev);
      }
    }
    return map;
  }, [flatEvents, isHebrew]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6" id="agenda-view-container">
      {/* Header Summary - Light Blue Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#dde8f6] p-4 rounded-2xl border border-[#b8cee8] shadow-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#15265c]">
            Agenda & Schedule Feed ({isHebrew ? 'לוח עברי' : 'Gregorian'})
          </h2>
          <p className="text-xs text-slate-600">
            Showing {flatEvents.length} events across {groupedByMonth.size} {isHebrew ? 'Hebrew' : ''} months
          </p>
        </div>

        <button
          onClick={scrollToToday}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#15265c] border border-amber-300 hover:border-amber-400 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer shadow-2xs"
          title="Scroll or view today's events"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Go to Today</span>
        </button>
      </div>

      {/* Month sections */}
      {Array.from(groupedByMonth.entries()).map(([monthKey, section]) => (
        <div key={monthKey} className="space-y-2.5">
          {/* Month Header Banner */}
          <div className="sticky top-16 z-10 bg-[#dde8f6]/95 backdrop-blur-xs py-2.5 px-4 rounded-xl border border-[#b8cee8] flex items-center justify-between shadow-xs">
            <div className="flex items-baseline gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider text-[#15265c] ${isHebrew ? 'font-hebrew text-sm' : ''}`}>
                {section.label}
              </span>
              {section.subLabel && (
                <span className="text-xs font-semibold text-[#15265c] bg-[#cce0f5] border border-[#b8cee8] px-2 py-0.5 rounded-md">
                  {section.subLabel}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-600 font-semibold font-mono">
              {section.events.length} events
            </span>
          </div>

          {/* Events in month - Light Blue Cards */}
          <div className="space-y-2">
            {section.events.map((ev, index) => {
              const isToday = ev.isoDate === todayIso;
              const cat = CATEGORIES[ev.category];
              const correspondingDay = days.find((d) => d.isoDate === ev.isoDate);
              const gcalUrl = correspondingDay
                ? getGoogleCalendarUrl(correspondingDay, {
                    id: `agenda-${index}`,
                    category: ev.category,
                    subCategory: ev.subCategory,
                    title: ev.title,
                    rawText: ev.rawText,
                    time: ev.time,
                    isGlobal: ev.isGlobal,
                  })
                : '#';

              return (
                <div
                  key={`${ev.isoDate}-${ev.category}-${index}`}
                  id={isToday ? 'agenda-item-today' : undefined}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                    isToday
                      ? 'bg-[#fae29c] border-2 border-amber-500 ring-2 ring-amber-400/40 shadow-md'
                      : 'bg-[#d2e2f6] border-[#b4cae8] hover:bg-[#c5dbf4] hover:shadow-md hover:border-[#9ec1e8]'
                  }`}
                >
                  {/* Left: Date info */}
                  <div
                    onClick={() => correspondingDay && onSelectDay(correspondingDay)}
                    className="flex items-start sm:items-center gap-3 cursor-pointer shrink-0"
                  >
                    <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center text-center shadow-2xs ${
                      isToday ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold' : 'bg-[#bfd8f5] border-[#a0c2e8]'
                    }`}>
                      <span className={`text-[10px] uppercase font-bold leading-none ${isToday ? 'text-stone-950' : 'text-slate-500'}`}>
                        {ev.dayOfWeek.slice(0, 3)}
                      </span>
                      {isHebrew ? (
                        <span className={`text-sm font-bold leading-tight font-hebrew ${isToday ? 'text-stone-950' : 'text-[#15265c]'}`}>
                          {ev.hebrewDay || ev.hebrewDate.split(' ')[0]}
                        </span>
                      ) : (
                        <span className={`text-base font-extrabold leading-tight ${isToday ? 'text-stone-950' : 'text-[#15265c]'}`}>
                          {ev.day}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isToday && (
                          <span className="text-[10px] font-extrabold text-stone-950 bg-amber-500 px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                              <span className="animate-subtle-pulse absolute inline-flex h-full w-full rounded-full bg-white"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                            </span>
                            <span>TODAY</span>
                          </span>
                        )}
                        <span className={`text-xs font-bold font-hebrew ${isToday ? 'text-[#15265c] font-extrabold' : 'text-[#15265c]'}`}>
                          {ev.hebrewDate}
                        </span>
                        {ev.parsha && ev.dayOfWeek === 'Shabbos' && (
                          <span
                            className="text-[10px] sm:text-[10.5px] font-bold font-hebrew text-[#15265c] bg-[#c3d9f3] px-1.5 py-0.5 rounded border border-[#a4c4ea] inline-flex items-center gap-1 shadow-2xs"
                            title={`Parshas ${ev.parsha}`}
                          >
                            <TorahIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#15265c] shrink-0" />
                            <span>{ev.hideParshaPrefix ? ev.parsha : `פרשת ${ev.parsha}`}</span>
                          </span>
                        )}
                      </div>
                      <span className={`text-xs ${isToday ? 'text-amber-900 font-semibold' : 'text-slate-500'}`}>{ev.englishDate} {ev.year}</span>
                    </div>
                  </div>

                  {/* Middle: Event Title & Category */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${cat?.color || '#555'}20`,
                          color: cat?.color || '#333',
                          border: `1px solid ${cat?.color || '#555'}40`,
                        }}
                      >
                        {isCCMeeting(ev) ? (
                          <>
                            <MeetingIcon
                              size={15}
                              className="shrink-0"
                            />
                            <ChidonIcon
                              size={12}
                              color={'#b48a18'}
                              className="shrink-0"
                            />
                          </>
                        ) : ev.category === 'chidon' ? (
                          <ChidonIcon
                            size={12}
                            color={cat?.color || '#d97706'}
                            className="shrink-0"
                          />
                        ) : ev.category === 'hachayol_battlefront' ? (
                          <HachayolIcon
                            size={14}
                            color={cat?.color || '#0f766e'}
                            className="shrink-0"
                          />
                        ) : ev.category === 'raffle_5m' ? (
                          <FiveMIcon
                            size={13}
                            className="shrink-0"
                          />
                        ) : ev.category === 'raffle_60m' ? (
                          <SixtyMIcon
                            size={18}
                            className="shrink-0"
                          />
                        ) : ev.category === 'niggunim' ? (
                          <NiggunIcon
                            size={14}
                            color={cat?.color || '#4f46e5'}
                            className="shrink-0"
                          />
                        ) : ev.category === 'yomei_depagra' ? (
                          <YomeiDepagraIcon
                            size={14}
                            color={cat?.color || '#b45309'}
                            className="shrink-0"
                          />
                        ) : ev.category === 'shabbos_mevorchim' ? (
                          <ShabbosMevorchimIcon
                            size={14}
                            color={cat?.color || '#6366f1'}
                            className="shrink-0"
                          />
                        ) : ev.category === 'meetings' ? (
                          <MeetingIcon
                            size={16}
                            className="shrink-0"
                          />
                        ) : ev.category === 'rallies' && ev.isGlobal ? (
                          <GlobalRallyIcon
                            size={16}
                            className="shrink-0"
                          />
                        ) : ev.category === 'cp' ? (
                          <CpIcon
                            size={16}
                            className="shrink-0"
                          />
                        ) : ev.category === 'promotion_ceremony' ? (
                          <PromotionCeremonyIcon
                            size={16}
                            className="shrink-0"
                          />
                        ) : (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cat?.color }}
                          />
                        )}
                        {ev.subCategory}
                      </span>

                      {ev.time && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-900 bg-violet-100 px-1.5 py-0.5 rounded border border-violet-200">
                          <Clock className="w-2.5 h-2.5 text-violet-600" />
                          {ev.time} EST
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {ev.title}
                    </h3>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#c8d8ee] flex-wrap">
                    {ev.link && (
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15265c] hover:bg-[#1e3a8a] text-white border border-[#15265c] text-xs font-semibold shadow-xs transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
                        title={`Open ${ev.buttonText || ev.title}`}
                      >
                        <span>{ev.buttonText || 'Open Link'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      </a>
                    )}
                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#15265c] hover:text-[#1e3a8a] bg-[#e1ecfa] hover:bg-[#d5e4f7] border border-[#c8d8ee] transition-colors shadow-2xs"
                      title="Add this event to Google Calendar"
                    >
                      <CalendarIcon className="w-3 h-3 text-[#15265c]" />
                      <span>Google Cal</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {flatEvents.length === 0 && (
        <div className="text-center py-16 bg-[#edf4fc] rounded-2xl border border-[#c8d8ee] p-8 space-y-2 shadow-md">
          <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-[#15265c]">No events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try enabling more categories or clearing your search filters to view events.
          </p>
        </div>
      )}
    </div>
  );
};