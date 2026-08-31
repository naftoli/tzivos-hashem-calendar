import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  ExternalLink,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowUpRight,
  ListTodo,
} from 'lucide-react';
import { CalendarDay, CalendarCategory, CalendarEvent, CalendarSystem } from '../types';
import { CATEGORIES, isCCMeeting, isEventVisibleByCategories } from '../data/categories';
import { getGoogleCalendarUrl } from '../utils/exporter';
import { getDayRoutine } from '../data/dayDescriptions';
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
import { ChidonLimmudSchedule } from './ChidonLimmudSchedule';
import { RoutineTaskPill } from './RoutineTaskPill';

interface WeekViewProps {
  days: CalendarDay[];
  calendarSystem: CalendarSystem;
  selectedCategories: Record<CalendarCategory, boolean>;
  selectedSubCategories?: Record<string, boolean>;
  searchQuery: string;
  showParsha: boolean;
  showRoutines?: boolean;
  onSelectDay: (day: CalendarDay) => void;
  todayIso: string;
}

const HEBREW_WEEKDAYS: Record<string, string> = {
  Sunday: 'יום ראשון',
  Monday: 'יום שני',
  Tuesday: 'יום שלישי',
  Wednesday: 'יום רביעי',
  Thursday: 'יום חמישי',
  Friday: 'יום שישי (ערש״ק)',
  Shabbos: 'שבת קודש',
};

export const WeekView: React.FC<WeekViewProps> = ({
  days,
  calendarSystem,
  selectedCategories,
  selectedSubCategories,
  searchQuery,
  showParsha,
  showRoutines = true,
  onSelectDay,
  todayIso,
}) => {
  const isHebrew = calendarSystem === 'hebrew';

  // Group days into weeks (starting on Sunday)
  const weeks = React.useMemo(() => {
    const result: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];

    for (const day of days) {
      if (day.dayOfWeek === 'Sunday' && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }
    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }
    return result;
  }, [days]);

  // Find the week that contains today
  const todayWeekIndex = React.useMemo(() => {
    const idx = weeks.findIndex((w) => w.some((d) => d.isoDate === todayIso));
    return idx !== -1 ? idx : 0;
  }, [weeks, todayIso]);

  const [currentWeekIndex, setCurrentWeekIndex] = useState(() => todayWeekIndex);

  // If today changes or on mount if todayWeekIndex is valid, allow syncing
  const handleGoToTodayWeek = () => {
    if (todayWeekIndex >= 0 && todayWeekIndex < weeks.length) {
      setCurrentWeekIndex(todayWeekIndex);
    }
  };

  const activeWeek = weeks[currentWeekIndex] || [];
  const startDay = activeWeek[0];
  const endDay = activeWeek[activeWeek.length - 1];

  // Find the primary Parsha and weekly resources link for this week
  const shabbosDay = activeWeek.find((d) => d.dayOfWeek === 'Shabbos');
  const weekParsha = shabbosDay?.parsha || activeWeek.find((d) => d.parsha)?.parsha;
  const hidePrefix = activeWeek.some((d) => d.hideParshaPrefix);
  const parshaLabel = weekParsha ? (hidePrefix ? weekParsha : `פרשת ${weekParsha}`) : '';
  const weeklyResourceUrl = shabbosDay?.weeklyResourcesUrl;

  const canGoPrev = currentWeekIndex > 0;
  const canGoNext = currentWeekIndex < weeks.length - 1;

  const filterEvents = (events: CalendarEvent[], day: CalendarDay) => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((ev) => {
      if (!isEventVisibleByCategories(ev, selectedCategories, selectedSubCategories)) return false;
      if (!query) return true;
      return (
        ev.title.toLowerCase().includes(query) ||
        (ev.subCategory && ev.subCategory.toLowerCase().includes(query)) ||
        day.hebrewDate.toLowerCase().includes(query) ||
        (day.hebrewMonth && day.hebrewMonth.toLowerCase().includes(query)) ||
        (day.hebrewMonthEn && day.hebrewMonthEn.toLowerCase().includes(query)) ||
        day.parsha.toLowerCase().includes(query)
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4" id="week-view-container">
      {/* Week Navigation Header - Light Blue Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#dde8f6] p-3.5 sm:p-4 rounded-2xl border border-[#b8cee8] shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentWeekIndex((prev) => Math.max(0, prev - 1))}
                disabled={!canGoPrev}
                id="prev-week-btn"
                className="flex-1 sm:flex-none p-2 rounded-xl border border-[#b8cee8] bg-[#edf5fd] hover:bg-[#d8e8f8] text-[#15265c] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4 text-[#15265c]" />
              </button>
              <button
                onClick={handleGoToTodayWeek}
                id="week-today-quick-btn"
                className="hidden sm:flex px-2.5 py-1.5 sm:py-2 rounded-xl border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-[#15265c] text-xs font-bold transition-all items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Go to Today's week"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Today</span>
              </button>
              <button
                onClick={() => setCurrentWeekIndex((prev) => Math.min(weeks.length - 1, prev + 1))}
                disabled={!canGoNext}
                id="next-week-btn"
                className="flex-1 sm:flex-none p-2 rounded-xl border border-[#b8cee8] bg-[#edf5fd] hover:bg-[#d8e8f8] text-[#15265c] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4 text-[#15265c]" />
              </button>
            </div>
            {/* Mobile Today Button */}
            <button
              onClick={handleGoToTodayWeek}
              id="week-today-quick-btn-mobile"
              className="sm:hidden w-full py-1 px-2 rounded-lg border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-[#15265c] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              title="Go to Today's week"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Today</span>
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isHebrew ? (
                <h2 className="text-base sm:text-xl font-bold text-[#15265c] font-hebrew">
                  {startDay?.hebrewDate} – {endDay?.hebrewDate}
                </h2>
              ) : (
                <h2 className="text-base sm:text-xl font-bold text-[#15265c]">
                  {startDay?.englishDate} – {endDay?.englishDate} {endDay?.year}
                </h2>
              )}
              {weekParsha && showParsha && (
                <span className="text-xs sm:text-sm font-bold font-hebrew text-[#15265c] bg-[#c3d9f3] px-2.5 py-0.5 rounded-lg border border-[#a4c4ea] inline-flex items-center gap-1.5 shadow-2xs">
                  <TorahIcon className="w-3.5 h-3.5 text-[#15265c] shrink-0" />
                  <span>{parshaLabel}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Week {currentWeekIndex + 1} of {weeks.length} • {isHebrew ? `${startDay?.englishDate} – ${endDay?.englishDate} ${endDay?.year}` : `${startDay?.hebrewDate} – ${endDay?.hebrewDate}`}
            </p>
          </div>
        </div>

        {/* Quick Week Select */}
        <div className="flex items-center gap-2">
          <label htmlFor="week-select" className="text-xs text-slate-600 font-semibold hidden sm:inline">
            Jump to Week:
          </label>
          <select
            id="week-select"
            value={currentWeekIndex}
            onChange={(e) => setCurrentWeekIndex(Number(e.target.value))}
            className="text-xs font-semibold bg-[#edf5fd] border border-[#b8cee8] rounded-xl px-3 py-1.5 text-[#15265c] focus:outline-none focus:ring-2 focus:ring-[#15265c] shadow-2xs"
          >
            {weeks.map((w, idx) => {
              const parshaName = w.find(d => d.parsha)?.parsha || '';
              const hidePref = w.some(d => d.hideParshaPrefix);
              const firstDay = w[0];
              const lastDay = w[w.length - 1];
              const containsToday = w.some(d => d.isoDate === todayIso);
              return (
                <option key={idx} value={idx} className="bg-[#dde8f6] text-[#15265c]">
                  {containsToday ? '★ ' : ''}Week {idx + 1}: {isHebrew ? `${firstDay?.hebrewDate} - ${lastDay?.hebrewDate}` : `${firstDay?.englishDate} - ${lastDay?.englishDate}`} {parshaName ? `(${!hidePref ? 'פרשת ' : ''}${parshaName})` : ''} {containsToday ? '(Current Week)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Dedicated Weekly Resources Banner */}
      {weeklyResourceUrl && (
        <div className="bg-[#15265c] border border-amber-400/40 rounded-2xl p-3 sm:px-4 sm:py-2.5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <TorahIcon className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold font-hebrew text-amber-300 truncate">
                {parshaLabel} • Weekly Resources
              </div>
              <p className="text-[11px] text-blue-200 truncate hidden sm:block">
                Access Hachayol and other Resources
              </p>
            </div>
          </div>

          <a
            href={weeklyResourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#15265c] text-xs font-bold font-hebrew transition-all shadow-2xs shrink-0 cursor-pointer active:scale-[0.98]"
            title={`Open ${parshaLabel} Resources`}
          >
            <span>Open {parshaLabel} Resources</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>
      )}

      {/* 7 Day Columns Grid - Light Blue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {activeWeek.map((day) => {
          const visibleEvents = filterEvents(day.events || [], day);
          const isToday = day.isoDate === todayIso;
          const isShabbos = day.dayOfWeek === 'Shabbos';
          const isYomeiDepagra = day.events.some((e) => e.category === 'yomei_depagra');
          const routine = showRoutines ? getDayRoutine(day.dayOfWeek, selectedSubCategories) : undefined;

          return (
            <div
              key={day.isoDate}
              id={`week-day-col-${day.isoDate}`}
              className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all shadow-2xs ${
                isToday
                  ? 'bg-[#fae29c] border-2 border-amber-500 ring-2 ring-amber-400/50 shadow-md'
                  : 'bg-[#d2e2f6] border-[#b4cae8]'
              }`}
            >
              <div>
                {/* Column Header */}
                <div
                  onClick={() => onSelectDay(day)}
                  className="cursor-pointer pb-2 mb-2 border-b border-[#c8d8ee] hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {isHebrew ? HEBREW_WEEKDAYS[day.dayOfWeek] || day.dayOfWeek : day.dayOfWeek}
                    </div>
                    {isToday && (
                      <span className="text-[9px] font-extrabold text-stone-950 bg-amber-500 px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                          <span className="animate-subtle-pulse absolute inline-flex h-full w-full rounded-full bg-white"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                        </span>
                        <span>TODAY</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mt-0.5">
                    {isHebrew ? (
                      <>
                        <span className={`text-base font-bold font-hebrew ${isToday ? 'text-[#15265c] font-extrabold' : 'text-[#15265c]'}`}>
                          {day.hebrewDate}
                        </span>
                        <span className={`text-xs font-medium ${isToday ? 'text-amber-900 font-semibold' : 'text-slate-500'}`}>
                          {day.englishDate}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`text-base font-extrabold ${isToday ? 'text-[#15265c] font-extrabold' : 'text-[#15265c]'}`}>
                          {day.englishDate}
                        </span>
                        <span className={`text-xs font-medium font-hebrew ${isToday ? 'text-amber-900 font-semibold' : 'text-slate-500'}`}>
                          {day.hebrewDate}
                        </span>
                      </>
                    )}
                  </div>

                  {day.parsha && day.dayOfWeek === 'Shabbos' && showParsha && (
                    <div
                      className="mt-1 text-[10px] sm:text-[11px] font-bold font-hebrew text-[#15265c] bg-[#c3d9f3] px-2 py-0.5 rounded border border-[#a4c4ea] text-center shadow-2xs flex items-center justify-center gap-1"
                      title={`Parshas ${day.parsha}`}
                    >
                      <TorahIcon className="w-3 h-3 text-[#15265c] shrink-0" />
                      <span className="truncate">{day.hideParshaPrefix ? day.parsha : `פרשת ${day.parsha}`}</span>
                    </div>
                  )}
                </div>

                {/* 1. Limmud Schedule Module */}
                <ChidonLimmudSchedule
                  events={day.events || []}
                  selectedCategories={selectedCategories}
                  selectedSubCategories={selectedSubCategories}
                  variant="weekView"
                />

                {/* 2. Routine Tasks Cards */}
                {routine && routine.items.length > 0 && (
                  <div className="space-y-1 my-1">
                    {routine.items.map((item, idx) => (
                      <RoutineTaskPill key={idx} item={item} variant="week" />
                    ))}
                  </div>
                )}

                {/* Events list in column */}
                <div className="space-y-1.5">
                  {visibleEvents.map((ev) => {
                    const cat = CATEGORIES[ev.category];
                    const gcalUrl = getGoogleCalendarUrl(day, ev);

                    return (
                      <div
                        key={ev.id}
                        className={`p-2 rounded-xl border flex flex-col justify-between gap-1 shadow-2xs ${
                          cat
                            ? `${cat.bgColor} ${cat.borderColor}`
                            : 'bg-[#edf4fc] border-[#c8d8ee]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            {isCCMeeting(ev) ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <MeetingIcon
                                  size={15}
                                  className="shrink-0"
                                />
                                <ChidonIcon
                                  size={12}
                                  color="#b48a18"
                                  className="shrink-0"
                                />
                              </div>
                            ) : ev.category === 'chidon' ? (
                              <ChidonIcon
                                size={12}
                                color="#b48a18"
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
                                size={19}
                                className="shrink-0 -my-1"
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
                                className="shrink-0 -mx"
                              />
                            ) : ev.category === 'promotion_ceremony' ? (
                              <PromotionCeremonyIcon
                                size={16}
                                className="shrink-0 -mx"
                              />
                            ) : (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: cat?.color || '#555' }}
                              />
                            )}
                          </div>
                          <div className={`text-xs font-bold ${cat?.textColor || 'text-slate-900'} leading-tight mt-0.5`}>
                            {ev.title}
                          </div>
                          {ev.time && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-600 mt-0.5">
                              <Clock className="w-2.5 h-2.5 text-slate-400" />
                              <span>{ev.time}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-black/5 flex-wrap">
                          {ev.link && (
                            <a
                              href={ev.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#15265c] hover:bg-[#1e3a8a] text-white text-[9.5px] font-semibold shadow-2xs transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
                              title={`Open ${ev.buttonText || ev.title}`}
                            >
                              <span>{ev.buttonText || 'Open Link'}</span>
                              <ArrowUpRight className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                            </a>
                          )}
                          <a
                            href={gcalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9.5px] font-semibold text-[#15265c] hover:text-[#1e3a8a] flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/60 hover:bg-white/90 border border-[#b4cae8] shadow-2xs"
                            title="Add to Google Calendar"
                          >
                            <span>Google Cal</span>
                            <ExternalLink className="w-2 h-2 text-slate-400" />
                          </a>
                        </div>
                      </div>
                    );
                  })}

                  {visibleEvents.length === 0 && (!routine || routine.items.length === 0) && (
                    <div className="py-4 text-center text-xs text-slate-400 italic">
                      No events
                    </div>
                  )}
                </div>
              </div>

              {/* Yomei Depagra indicator */}
              {isYomeiDepagra && (
                <div className="text-[10px] text-amber-800 font-semibold pt-1 border-t border-[#c8d8ee] mt-2 font-hebrew flex items-center justify-center gap-1">
                  <YomeiDepagraIcon size={12} color="#b45309" />
                  <span>יומא דפגרא</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};