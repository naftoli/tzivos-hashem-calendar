import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Calendar as CalendarIcon,
  X,
  ListTodo,
  ArrowUpRight,
} from 'lucide-react';
import { CalendarDay, CalendarEvent, CalendarCategory, CalendarSystem, HebrewMonthMeta } from '../types';
import { CATEGORIES, isCCMeeting, isEventVisibleByCategories } from '../data/categories';
import { getDayRoutine } from '../data/dayDescriptions';
import { DayDescriptionSection } from './DayDescriptionSection';
import { RoutineTaskPill } from './RoutineTaskPill';
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
import { getMivtzaSubtitles } from '../data/mivtzaData';

import {
  groupEventsForCardDisplay,
  get5MLabel,
  get5MPrize,
} from '../utils/hachayolGrouping';

interface MonthViewProps {
  calendarSystem: CalendarSystem;
  days: CalendarDay[];
  currentYear: number;
  currentMonth: number; // 1-12
  onNavigateMonth: (year: number, month: number) => void;
  availableMonths: { year: number; month: number; label: string }[];
  currentHebrewMonthKey: string;
  onNavigateHebrewMonth: (key: string) => void;
  hebrewMonths: HebrewMonthMeta[];
  selectedCategories: Record<CalendarCategory, boolean>;
  selectedSubCategories?: Record<string, boolean>;
  searchQuery: string;
  showParsha: boolean;
  showRoutines?: boolean;
  onSelectDay: (day: CalendarDay) => void;
  todayIso: string;
  onGoToToday: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbos'];
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Shab'];
const WEEKDAY_TINY = ['S', 'M', 'T', 'W', 'T', 'F', 'ש'];
const WEEKDAY_NAMES_HEBREW = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export const MonthView: React.FC<MonthViewProps> = ({
  calendarSystem,
  days,
  currentYear,
  currentMonth,
  onNavigateMonth,
  availableMonths,
  currentHebrewMonthKey,
  onNavigateHebrewMonth,
  hebrewMonths,
  selectedCategories,
  selectedSubCategories,
  searchQuery,
  showParsha,
  showRoutines = true,
  onSelectDay,
  todayIso,
  onGoToToday,
}) => {
  const isHebrewMode = calendarSystem === 'hebrew';

  // --- Sync to current month on initial mount ---
  useEffect(() => {
    const todayDay = days.find((d) => d.isoDate === todayIso);
    if (todayDay) {
      if (isHebrewMode && todayDay.hebrewMonthKey) {
        if (todayDay.hebrewMonthKey !== currentHebrewMonthKey) {
          onNavigateHebrewMonth(todayDay.hebrewMonthKey);
        }
      } else if (!isHebrewMode) {
        if (todayDay.year !== currentYear || todayDay.month !== currentMonth) {
          onNavigateMonth(todayDay.year, todayDay.month);
        }
      }
    }
  }, [todayIso, days, isHebrewMode]);

  // --- Navigation State ---
  const currentGregIdx = availableMonths.findIndex(
    (m) => m.year === currentYear && m.month === currentMonth
  );
  const canGoPrevGreg = currentGregIdx > 0;
  const canGoNextGreg = currentGregIdx >= 0 && currentGregIdx < availableMonths.length - 1;

  const currentHebIdx = hebrewMonths.findIndex(
    (m) => m.key === currentHebrewMonthKey
  );
  const safeHebIdx = currentHebIdx !== -1 ? currentHebIdx : 2;
  const activeHebrewMonth = hebrewMonths[safeHebIdx] || hebrewMonths[0];

  const canGoPrevHeb = safeHebIdx > 0;
  const canGoNextHeb = safeHebIdx < hebrewMonths.length - 1;

  const handlePrev = () => {
    if (isHebrewMode) {
      if (canGoPrevHeb) {
        onNavigateHebrewMonth(hebrewMonths[safeHebIdx - 1].key);
      }
    } else {
      if (canGoPrevGreg) {
        const prev = availableMonths[currentGregIdx - 1];
        onNavigateMonth(prev.year, prev.month);
      }
    }
  };

  const handleNext = () => {
    if (isHebrewMode) {
      if (canGoNextHeb) {
        onNavigateHebrewMonth(hebrewMonths[safeHebIdx + 1].key);
      }
    } else {
      if (canGoNextGreg) {
        const next = availableMonths[currentGregIdx + 1];
        onNavigateMonth(next.year, next.month);
      }
    }
  };

  const monthDays = React.useMemo(() => {
    if (isHebrewMode) {
      return days.filter(
        (d) => (d.hebrewMonthKey || `${d.hebrewYear}-${d.hebrewMonth}`) === (activeHebrewMonth?.key || currentHebrewMonthKey)
      );
    }
    return days.filter((d) => d.year === currentYear && d.month === currentMonth);
  }, [days, isHebrewMode, activeHebrewMonth?.key, currentHebrewMonthKey, currentYear, currentMonth]);

  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);

  const filterEvents = (events: CalendarEvent[], day: CalendarDay) => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((ev) => {
      if (!isEventVisibleByCategories(ev, selectedCategories, selectedSubCategories)) return false;
      if (!query) return true;
      return (
        ev.title.toLowerCase().includes(query) ||
        (ev.subCategory && ev.subCategory.toLowerCase().includes(query)) ||
        day.hebrewDate.toLowerCase().includes(query) ||
        day.englishDate.toLowerCase().includes(query) ||
        day.parsha.toLowerCase().includes(query)
      );
    });
  };

  const gridRows = React.useMemo(() => {
    if (monthDays.length === 0) return [];
    const firstDay = monthDays[0];
    const leadingCount = WEEKDAY_NAMES.indexOf(firstDay.dayOfWeek);

    const allSlots: (CalendarDay | null)[] = [];
    for (let i = 0; i < leadingCount; i++) {
      allSlots.push(null);
    }
    for (const d of monthDays) {
      allSlots.push(d);
    }
    while (allSlots.length % 7 !== 0) {
      allSlots.push(null);
    }

    const rows: (CalendarDay | null)[][] = [];
    for (let i = 0; i < allSlots.length; i += 7) {
      rows.push(allSlots.slice(i, i + 7));
    }
    return rows;
  }, [monthDays]);

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDayIso((prev) => (prev === day.isoDate ? null : day.isoDate));
    onSelectDay(day);
  };

  const selectedDayObj = React.useMemo(() => {
    if (!selectedDayIso) return null;
    return days.find((d) => d.isoDate === selectedDayIso) || null;
  }, [days, selectedDayIso]);

  const activeHebrewMonthName = activeHebrewMonth?.hebrewMonthEn || activeHebrewMonth?.hebrewMonth || '';
  const mivtzaItems = getMivtzaSubtitles(activeHebrewMonthName);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-8 space-y-3 sm:space-y-3.5" id="month-view-container">
      {/* Month Navigation Bar */}
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#dde8f6] p-3.5 sm:p-4 rounded-2xl border border-[#b8cee8] shadow-md">
        
        {/* Left Group: Controls & Titles */}
        <div className="flex items-center gap-3 min-w-0 shrink">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={isHebrewMode ? !canGoPrevHeb : !canGoPrevGreg}
                id="prev-month-btn"
                className="flex-1 sm:flex-none p-2 sm:p-2 rounded-xl border border-[#b8cee8] bg-[#edf5fd] hover:bg-[#d8e8f8] text-[#15265c] disabled:opacity-30 disabled:pointer-events-none transition-colors touch-manipulation cursor-pointer flex items-center justify-center shadow-2xs"
                title={isHebrewMode ? 'Previous Hebrew Month' : 'Previous Month'}
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 text-[#15265c]" />
              </button>
              
              {/* Corrected Desktop Today Button */}
              <button
                onClick={onGoToToday}
                id="month-today-quick-btn"
                className="hidden sm:flex px-2.5 py-1.5 sm:py-2 rounded-xl border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-[#15265c] text-xs font-bold transition-all touch-manipulation items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Jump to Today's date"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block"></span>
                <span>Today</span>
              </button>

              <button
                onClick={handleNext}
                disabled={isHebrewMode ? !canGoNextHeb : !canGoNextGreg}
                id="next-month-btn"
                className="flex-1 sm:flex-none p-2 sm:p-2 rounded-xl border border-[#b8cee8] bg-[#edf5fd] hover:bg-[#d8e8f8] text-[#15265c] disabled:opacity-30 disabled:pointer-events-none transition-colors touch-manipulation cursor-pointer flex items-center justify-center shadow-2xs"
                title={isHebrewMode ? 'Next Hebrew Month' : 'Next Month'}
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4 text-[#15265c]" />
              </button>
            </div>

            {/* Corrected Mobile Today Button */}
            <button
              onClick={onGoToToday}
              id="month-today-quick-btn-mobile"
              className="sm:hidden w-full py-1 px-2 rounded-lg border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-[#15265c] text-[11px] font-bold transition-all touch-manipulation flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              title="Jump to Today's date"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 inline-block"></span>
              <span>Today</span>
            </button>
          </div>

          <div className="min-w-0 shrink">
            {isHebrewMode ? (
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-[#15265c] font-hebrew truncate">
                    {activeHebrewMonth?.hebrewMonth} {activeHebrewMonth?.hebrewYearHebrew}
                  </h2>
                  <span className="text-xs font-semibold text-[#15265c] bg-[#cce0f5] border border-[#b8cee8] px-2 py-0.5 rounded-md shrink-0">
                    {activeHebrewMonth?.hebrewMonthEn} {activeHebrewMonth?.hebrewYear}
                  </span>
                </div>
                {monthDays.length > 0 && (
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 truncate whitespace-nowrap">
                    {monthDays[0]?.englishDate} {monthDays[0]?.year} – {monthDays[monthDays.length - 1]?.englishDate} {monthDays[monthDays.length - 1]?.year} • {monthDays.length} Days
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-bold tracking-tight text-[#15265c]">
                    {MONTH_NAMES[currentMonth - 1]} {currentYear}
                  </h2>
                  <span className="text-xs font-semibold text-[#15265c] bg-[#cce0f5] px-2 py-0.5 rounded-md border border-[#b8cee8]">
                    5787
                  </span>
                </div>
                {monthDays.length > 0 && (
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 truncate whitespace-nowrap">
                    <bdi>{monthDays[0]?.hebrewDate} – {monthDays[monthDays.length - 1]?.hebrewDate}</bdi> • {monthDays.length} Days
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {isHebrewMode && mivtzaItems.length > 0 && (
          <div className="hidden lg:flex flex-col items-center justify-center text-center bg-gradient-to-r from-amber-500/[7%] to-amber-600/[15%] border border-amber-400/[35%] rounded-xl px-3.5 py-1.5 shadow-2xs shrink-0 whitespace-nowrap ml-auto xl:ml-0 xl:absolute xl:left-1/2 xl:-translate-x-1/2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center justify-center gap-1">
              Mivtza of the Month
            </span>
            <div className="text-xs font-bold text-[#15265c] leading-tight mt-0.5 text-center">
              {mivtzaItems.length === 1 ? (
                <span>{mivtzaItems[0]}</span>
              ) : mivtzaItems.join(' & ').length <= 28 ? (
                <span>{mivtzaItems.join(' and ')}</span>
              ) : (
                <div className="flex flex-col items-center text-[10px] leading-snug text-center">
                  <span>{mivtzaItems[0]}</span>
                  <span>{mivtzaItems[1]}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <label htmlFor="month-select-dropdown" className="text-xs text-slate-600 font-semibold hidden md:inline shrink-0">
            {isHebrewMode ? 'Jump to Month:' : 'Jump to:'}
          </label>

          {isHebrewMode ? (
            <select
              id="month-select-dropdown"
              value={activeHebrewMonth?.key || currentHebrewMonthKey}
              onChange={(e) => onNavigateHebrewMonth(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold bg-[#edf5fd] border border-[#b8cee8] rounded-xl px-3 py-1.5 text-[#15265c] focus:outline-none focus:ring-2 focus:ring-[#15265c] font-hebrew shadow-2xs"
            >
              {hebrewMonths.map((m) => (
                <option key={m.key} value={m.key} className="bg-[#dde8f6] text-[#15265c]">
                  {m.hebrewMonth} {m.hebrewYearHebrew} ({m.hebrewMonthEn} {m.hebrewYear}) - {m.totalDays}d
                </option>
              ))}
            </select>
          ) : (
            <select
              id="month-select-dropdown"
              value={`${currentYear}-${currentMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number);
                onNavigateMonth(y, m);
              }}
              className="w-full sm:w-auto text-xs font-semibold bg-[#edf5fd] border border-[#b8cee8] rounded-xl px-3 py-1.5 text-[#15265c] focus:outline-none focus:ring-2 focus:ring-[#15265c] shadow-2xs"
            >
              {availableMonths.map((m) => (
                <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`} className="bg-[#dde8f6] text-[#15265c]">
                  {m.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Calendar Grid Box Container */}
      <div className="bg-[#dde8f6] rounded-2xl border border-[#b8cee8] p-2 sm:p-3 shadow-md space-y-1 sm:space-y-1.5">
        
        {/* 1. Weekday Column Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.25 text-center">
          {WEEKDAY_NAMES.map((dow, i) => (
            <div
              key={dow}
              className="py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs bg-[#15265c] text-white border border-[#253b7a]"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="hidden md:inline">{dow}</span>
                <span className="hidden sm:inline md:hidden">{WEEKDAY_SHORT[i]}</span>
                <span className="sm:hidden text-xs">{WEEKDAY_TINY[i]}</span>
                {isHebrewMode && (
                  <span className="hidden sm:inline text-[10px] text-blue-200 font-hebrew font-normal">
                    ({WEEKDAY_NAMES_HEBREW[i]})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Routine Task Cards Under Header Row */}
        {showRoutines && (
          <div className="hidden sm:grid grid-cols-7 gap-1 sm:gap-1.25 text-left mb-1">
            {WEEKDAY_NAMES.map((dow) => {
              const routine = getDayRoutine(dow, selectedSubCategories);
              if (!routine || routine.items.length === 0) {
                return <div key={`empty-routine-${dow}`} className="min-h-0" />;
              }

              return (
                <div key={`header-routine-${dow}`} className="space-y-1">
                  {routine.items.map((item, idx) => (
                    <RoutineTaskPill key={`routine-card-${idx}`} item={item} variant="grid" />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Days Grid */}
        <div className="space-y-1 sm:space-y-1.25">
          {gridRows.map((row, rowIdx) => (
            <div key={`row-${rowIdx}`} className="grid grid-cols-7 gap-1 sm:gap-1.25">
              {row.map((day, colIdx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${rowIdx}-${colIdx}`}
                      className="min-h-[56px] sm:min-h-[135px] bg-[#dce8f7]/50 rounded-xl sm:rounded-2xl border border-dashed border-[#b8cee8] p-1 sm:p-2 opacity-40"
                    />
                  );
                }

                const visibleEvents = filterEvents(day.events, day);
                const isToday = day.isoDate === todayIso;
                const isYomeiDepagra = day.events.some((e) => e.category === 'yomei_depagra');
                const hasMeeting = day.events.some((e) => e.category === 'meetings');
                const hasGlobalRally = day.events.some((e) => e.isGlobal);
                const isSelected = selectedDayIso === day.isoDate;

                return (
                  <div
                    key={day.isoDate}
                    id={`day-cell-${day.isoDate}`}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-[56px] sm:min-h-[135px] rounded-xl sm:rounded-2xl border p-1.5 sm:p-2 flex flex-col justify-between cursor-pointer transition-all touch-manipulation relative group shadow-2xs ${
                      isToday
                        ? 'ring-2 ring-amber-500 border-amber-500 bg-[#fae29c] shadow-md'
                        : isSelected
                        ? 'ring-2 ring-[#15265c] border-[#15265c] bg-[#b5cfee] shadow-md'
                        : 'bg-[#d2e2f6] border-[#b4cae8] hover:bg-[#c5dbf4] hover:border-[#9ec1e8] hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                        {isHebrewMode ? (
                          <div className="flex sm:flex-row flex-col sm:items-baseline gap-0 sm:gap-1 leading-tight">
                            <span
                              className={`text-sm sm:text-base font-bold font-hebrew transition-colors ${
                                isToday
                                  ? 'text-[#15265c] font-extrabold'
                                  : isSelected
                                  ? 'text-[#15265c] font-extrabold'
                                  : 'text-[#15265c] group-hover:text-[#1e3a8a]'
                              }`}
                            >
                              {day.hebrewDay || day.hebrewDate.split(' ')[0]}
                            </span>
                            <span
                              className={`text-[9px] sm:text-[10px] font-medium ${
                                isToday ? 'text-amber-900 font-semibold' : 'text-slate-500'
                              }`}
                            >
                              {day.englishDate.split(' ')[0]}
                              <span className="hidden sm:inline"> {day.englishDate.split(' ')[1]?.slice(0, 3)}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex sm:flex-row flex-col sm:items-baseline gap-0 sm:gap-1 leading-tight">
                            <span
                              className={`text-sm sm:text-base font-bold transition-colors ${
                                isToday
                                  ? 'text-[#15265c] font-extrabold'
                                  : isSelected
                                  ? 'text-[#15265c] font-extrabold'
                                  : 'text-[#15265c] group-hover:text-[#1e3a8a]'
                              }`}
                            >
                              {day.day}
                            </span>
                            <span
                              className={`text-[9px] sm:text-[10px] font-medium font-hebrew truncate ${
                                isToday ? 'text-amber-900 font-semibold' : 'text-slate-500'
                              }`}
                            >
                              <span>{day.hebrewDay || day.hebrewDate.split(' ')[0]}</span>
                              <span className="hidden sm:inline"> {day.hebrewMonth}</span>
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                          {isToday && (
                            <span
                              title="Today"
                              className="relative flex items-center justify-center w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 rounded bg-amber-500 shadow-2xs"
                            >
                              <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                                <span className="animate-subtle-pulse absolute inline-flex h-full w-full rounded-full bg-white"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                              </span>
                            </span>
                          )}
                          {hasGlobalRally && (
                            <span title="Global Rally Broadcast" className="text-rose-600">
                              <GlobalRallyIcon size={14} className="shrink-0" />
                            </span>
                          )}
                          {hasMeeting && (
                            <span title="Meetings (BC & CC)" className="flex items-center">
                              <MeetingIcon size={12} className="shrink-0" />
                            </span>
                          )}
                        </div>
                      </div>

                      {showParsha && day.parsha && day.dayOfWeek === 'Shabbos' && (
                        <div
                          className="text-[9px] sm:text-[10.5px] font-bold font-hebrew text-[#15265c] bg-[#c3d9f3] px-1 sm:px-1.5 py-0.5 rounded border border-[#a4c4ea] truncate mb-1 text-center shadow-2xs flex items-center justify-center gap-1"
                          title={`Parshas ${day.parsha}`}
                        >
                          <TorahIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#15265c] shrink-0" />
                          <span className="truncate">
                            {day.hideParshaPrefix ? day.parsha : `פרשת ${day.parsha}`}
                          </span>
                        </div>
                      )}

                      {/* Mobile view dots */}
                      <div className="sm:hidden flex items-center justify-center gap-1 mt-1 flex-wrap">
                        {visibleEvents.slice(0, 3).map((ev) => {
                          const cat = CATEGORIES[ev.category];
                          if (isCCMeeting(ev)) {
                            return (
                              <span key={ev.id} className="inline-flex items-center gap-0.5 shrink-0 drop-shadow-2xs">
                                <MeetingIcon size={12} className="shrink-0" />
                                <ChidonIcon size={10} color="#d97706" className="shrink-0" />
                              </span>
                            );
                          }
                          if (ev.category === 'chidon') {
                            return <ChidonIcon key={ev.id} size={10} color={cat?.color || '#d97706'} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'hachayol_battlefront') {
                            return <HachayolIcon key={ev.id} size={11} color={cat?.color || '#0f766e'} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'raffle_5m') {
                            return <FiveMIcon key={ev.id} size={11} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'raffle_60m') {
                            return <SixtyMIcon key={ev.id} size={16} className="shrink-0 drop-shadow-2xs -my-1 -mx-0.5" />;
                          }
                          if (ev.category === 'niggunim') {
                            return <NiggunIcon key={ev.id} size={11} color={cat?.color || '#4f46e5'} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'yomei_depagra') {
                            return <YomeiDepagraIcon key={ev.id} size={11} color={cat?.color || '#b45309'} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'shabbos_mevorchim') {
                            return <ShabbosMevorchimIcon key={ev.id} size={11} color={cat?.color || '#6366f1'} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'meetings') {
                            return <MeetingIcon key={ev.id} size={13} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'rallies' && ev.isGlobal) {
                            return <GlobalRallyIcon key={ev.id} size={13} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'cp') {
                            return <CpIcon key={ev.id} size={13} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'promotion_ceremony') {
                            return <PromotionCeremonyIcon key={ev.id} size={13} className="shrink-0 drop-shadow-2xs" />;
                          }
                          return (
                            <span
                              key={ev.id}
                              className="w-1.5 h-1.5 rounded-full shrink-0 shadow-2xs"
                              style={{ backgroundColor: cat?.color || '#15265c' }}
                              title={ev.title}
                            />
                          );
                        })}
                        {visibleEvents.length > 3 && (
                          <span className="text-[8px] font-bold text-slate-600 leading-none">
                            +{visibleEvents.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Desktop view event badges */}
                      {(() => {
                        const eventRows = groupEventsForCardDisplay(visibleEvents);
                        const rowsToDisplay = eventRows.slice(0, 3);
                        const displayedCount = rowsToDisplay.reduce(
                          (acc, r) =>
                            acc +
                            (r.type === 'hachayol_pair'
                              ? 2
                              : r.type === 'five_m_winners_group'
                              ? r.events.length
                              : 1),
                          0
                        );
                        const remainingCount = visibleEvents.length - displayedCount;

                        const render5MWinnersGroup = (events: CalendarEvent[]) => {
                          const firstEv = events[0];
                          const cat = CATEGORIES[firstEv.category];
                          return (
                            <div
                              key={`5m-group-${firstEv.id}`}
                              className={`text-[9px] leading-tight px-1.5 py-0.5 rounded border flex flex-col font-medium shadow-2xs min-w-0 ${
                                cat
                                  ? `${cat.bgColor} ${cat.textColor} ${cat.borderColor}`
                                  : 'bg-red-50 text-red-950 border-red-300'
                              }`}
                              title={events.map((ev) => ev.title).join('\n')}
                            >
                              <div className="flex items-center gap-1 font-bold truncate leading-tight">
                                <FiveMIcon size={12.5} className="shrink-0" />
                                <span className="truncate">Winners Announced</span>
                              </div>
                              <div className="flex flex-col gap-0 leading-tight">
                                {events.map((ev) => {
                                  const prize = get5MPrize(ev);
                                  if (!prize) return null;
                                  return (
                                    <div
                                      key={ev.id}
                                      className="text-[8px] opacity-90 truncate pl-3.5 font-normal leading-tight"
                                    >
                                      {prize}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        };

                        const renderEventBadge = (ev: CalendarEvent, isPair = false) => {
                          const cat = CATEGORIES[ev.category];
                          const isShabbosMevorchimOnShabbos =
                            ev.category === 'shabbos_mevorchim' &&
                            (ev.subCategory === 'Shabbos Mevorchim' ||
                              (day.dayOfWeek === 'Shabbos' &&
                                !ev.subCategory?.toLowerCase().includes('due') &&
                                !ev.title.toLowerCase().includes('due')));

                          if (isShabbosMevorchimOnShabbos) {
                            return (
                              <div
                                key={ev.id}
                                className={`text-[8px] sm:text-[9.5px] font-bold font-hebrew leading-tight px-1 sm:px-1.5 py-0.5 rounded border truncate flex items-center justify-center gap-1 text-center shadow-2xs min-w-0 ${
                                  cat
                                    ? `${cat.bgColor} ${cat.textColor} ${cat.borderColor}`
                                    : 'bg-blue-50 text-blue-950 border-blue-300'
                                }`}
                                title={`${ev.title}${ev.shortTitle && ev.shortTitle !== ev.title ? ` (${ev.shortTitle})` : ''} (${cat?.name || ''})`}
                              >
                                <ShabbosMevorchimIcon size={13} color={cat?.color || '#6366f1'} className="shrink-0" />
                                <span className="truncate">{ev.shortTitle || ev.title}</span>
                              </div>
                            );
                          }
                          if (ev.category === 'promotion_ceremony') {
                            return (
                              <div
                                key={ev.id}
                                className={`text-[9px] leading-tight px-1.5 py-0.5 rounded border flex flex-col font-medium shadow-2xs min-w-0 ${
                                  cat
                                    ? `${cat.bgColor} ${cat.textColor} ${cat.borderColor}`
                                    : 'bg-[#edf4fc] text-[#15265c] border-[#c8d8ee]'
                                }`}
                                title={`${ev.title}${ev.shortTitle && ev.shortTitle !== ev.title ? ` (${ev.shortTitle})` : ''} (${cat?.name || ''})`}
                              >
                                <div className="flex items-center gap-1 font-bold truncate leading-tight">
                                  <PromotionCeremonyIcon size={14} className="shrink-0 relative top-[1px] -mx-1" />
                                  <span className="truncate -my-2 mx-[3px]">Promotion Ceremony</span>
                                </div>
                                <div className="text-[8px] opacity-90 truncate pl-3.5 font-normal leading-tight -mx-0.5">
                                  {ev.shortTitle || ev.title}
                                </div>
                              </div>
                            );
                          }

                          const is5M = ev.category === 'raffle_5m';
                          if (is5M) {
                            const label = get5MLabel(ev);
                            const prize = get5MPrize(ev);
                            return (
                              <div
                                key={ev.id}
                                className={`text-[9px] leading-tight px-1.5 py-0.5 rounded border flex flex-col font-medium shadow-2xs min-w-0 ${
                                  cat
                                    ? `${cat.bgColor} ${cat.textColor} ${cat.borderColor}`
                                    : 'bg-red-50 text-red-950 border-red-300'
                                }`}
                                title={`${ev.title}${ev.shortTitle && ev.shortTitle !== ev.title ? ` (${ev.shortTitle})` : ''} (${cat?.name || ''})`}
                              >
                                <div className="flex items-center gap-1 font-bold truncate leading-tight">
                                  <FiveMIcon size={12.5} className="shrink-0" />
                                  <span className="truncate">{label}</span>
                                </div>
                                {prize && (
                                  <div className="text-[8px] opacity-90 truncate pl-3.5 font-normal leading-tight">
                                    {prize}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          const isCC = isCCMeeting(ev);

                          return (
                            <div
                              key={ev.id}
                              className={`text-[8.5px] sm:text-[9.5px] leading-tight ${isPair ? 'px-1' : 'px-1.5'} py-0.5 rounded border truncate flex items-center gap-1 font-medium shadow-2xs min-w-0 ${
                                cat
                                  ? `${cat.bgColor} ${cat.textColor} ${cat.borderColor}`
                                  : 'bg-[#edf4fc] text-[#15265c] border-[#c8d8ee]'
                              }`}
                              title={`${ev.title}${ev.shortTitle && ev.shortTitle !== ev.title ? ` (${ev.shortTitle})` : ''} (${isCC ? 'Meetings & Chidon' : (cat?.name || '')})`}
                            >
                              {isCC ? (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <MeetingIcon size={14} className="shrink-0" />
                                  <ChidonIcon size={11} color="#b48a18" className="shrink-0" />
                                </div>
                              ) : ev.category === 'chidon' ? (
                                <ChidonIcon size={12} color="#b48a18" className="shrink-0" />
                              ) : ev.category === 'hachayol_battlefront' ? (
                                <HachayolIcon size={13} color={cat?.color || '#0f766e'} className="shrink-0" />
                              ) : ev.category === 'raffle_5m' ? (
                                <FiveMIcon size={13} className="shrink-0" />
                              ) : ev.category === 'raffle_60m' ? (
                                <SixtyMIcon size={17} className="shrink-0 -my-1" />
                              ) : ev.category === 'niggunim' ? (
                                <NiggunIcon size={13} color={cat?.color || '#4f46e5'} className="shrink-0" />
                              ) : ev.category === 'yomei_depagra' ? (
                                <YomeiDepagraIcon size={13} color={cat?.color || '#b45309'} className="shrink-0" />
                              ) : ev.category === 'shabbos_mevorchim' ? (
                                <ShabbosMevorchimIcon size={13} color={cat?.color || '#6366f1'} className="shrink-0" />
                              ) : ev.category === 'meetings' ? (
                                <MeetingIcon size={15} className="shrink-0" />
                              ) : ev.category === 'rallies' && ev.isGlobal ? (
                                <GlobalRallyIcon size={15} className="shrink-0 -my-1 -mx-0.5" />
                              ) : ev.category === 'cp' ? (
                                <CpIcon size={16} className="shrink-0 -my-1 -mx-0.5" />
                              ) : (
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: cat?.color || '#555' }}
                                />
                              )}
                              <span className="truncate">{ev.shortTitle || ev.title}</span>
                            </div>
                          );
                        };

                        return (
                          <div className="hidden sm:block space-y-1 mt-0.5">
                            {rowsToDisplay.map((row, rowIdx) => {
                              if (row.type === 'single') {
                                return (
                                  <div key={row.event.id || rowIdx} className="w-full">
                                    {renderEventBadge(row.event, false)}
                                  </div>
                                );
                              }
                              if (row.type === 'five_m_winners_group') {
                                return (
                                  <div key={`5m-group-row-${rowIdx}`} className="w-full">
                                    {render5MWinnersGroup(row.events)}
                                  </div>
                                );
                              }
                              return (
                                <div key={`h-pair-${rowIdx}`} className="grid grid-cols-2 gap-1 w-full">
                                  {row.events.map((ev) => (
                                    <div key={ev.id} className="min-w-0">
                                      {renderEventBadge(ev, true)}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}

                            {remainingCount > 0 && (
                              <div className="text-[8.5px] font-semibold text-[#15265c] bg-[#e1ecfa] hover:bg-[#d5e4f7] px-1 py-0.2 rounded text-center transition-colors border border-[#c8d8ee]">
                                +{remainingCount} more
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {isYomeiDepagra && (
                      <div className="text-[7.5px] sm:text-[8.5px] text-amber-800 font-semibold truncate pt-0.5 border-t border-[#c8d8ee]/50 mt-0.5 font-hebrew flex items-center justify-center sm:justify-start gap-1">
                        <YomeiDepagraIcon size={12} color="#b45309" />
                        <span className="hidden sm:inline">יומא דפגרא</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Popup Details Card */}
      {selectedDayObj && (
        <div
          id="month-date-popup-card"
          className="hidden sm:flex fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-[350px] sm:w-[430px] max-w-[calc(100vw-2rem)] max-h-[80vh] flex-col bg-[#dde8f6]/98 border-2 border-[#9ec1e8] shadow-2xl rounded-2xl overflow-hidden backdrop-blur-lg animate-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center justify-between gap-2 p-3 sm:p-3.5 bg-[#15265c] text-white border-b border-[#253b7a] shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold font-hebrew text-amber-300">
                  {selectedDayObj.hebrewDate}
                </span>
                <span className="text-xs text-blue-200 font-semibold">
                  • {selectedDayObj.englishDate} {selectedDayObj.year}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-blue-300">
                <span>{selectedDayObj.dayOfWeek}</span>
                {selectedDayObj.parsha && (
                  <span className="font-hebrew text-amber-200">
                    ({selectedDayObj.hideParshaPrefix ? selectedDayObj.parsha : `פרשת ${selectedDayObj.parsha}`})
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedDayIso(null)}
              className="p-1.5 rounded-lg bg-[#253b7a] hover:bg-[#344f9c] text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close date details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(80vh-65px)] space-y-3.5 text-[#15265c]">
            <DayDescriptionSection 
              day={selectedDayObj} 
              selectedCategories={selectedCategories}
              selectedSubCategories={selectedSubCategories}
            />
          </div>
        </div>
      )}

      {/* Mobile Below-Calendar Section */}
      {selectedDayObj && (
        <div className="sm:hidden mt-4 bg-[#b5cfee] border-2 border-[#15265c] rounded-2xl p-4 shadow-xl animate-in fade-in duration-200 text-slate-800">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#9ec1e8] mb-3">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedDayObj.isoDate === todayIso && (
                  <span className="text-[10px] font-extrabold text-stone-950 bg-amber-400 px-1.5 py-0.2 rounded shadow-xs flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                      <span className="animate-subtle-pulse absolute inline-flex h-full w-full rounded-full bg-stone-950"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-stone-950/70"></span>
                    </span>
                    <span>TODAY</span>
                  </span>
                )}
                <span className="text-xs uppercase tracking-wider font-bold text-[#15265c]">
                  {selectedDayObj.dayOfWeek}
                </span>
                {selectedDayObj.parsha && (
                  <span
                    className="text-[11px] font-bold font-hebrew text-[#15265c] bg-[#c3d9f3] px-2 py-0.5 rounded border border-[#a4c4ea] inline-flex items-center gap-1 shadow-2xs"
                    title={`Parshas ${selectedDayObj.parsha}`}
                  >
                    <TorahIcon className="w-3 h-3 text-[#15265c] shrink-0" />
                    <span>{selectedDayObj.hideParshaPrefix ? selectedDayObj.parsha : `פרשת ${selectedDayObj.parsha}`}</span>
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5 mt-1">
                <h3 className="text-base font-bold text-[#15265c] font-hebrew">
                  {selectedDayObj.hebrewDate}
                </h3>
                <span className="text-xs text-slate-600">
                  • {selectedDayObj.englishDate} {selectedDayObj.year}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedDayIso(null)}
              className="p-1.5 rounded-lg bg-[#9ec1e8] hover:bg-[#8eb4df] text-[#15265c] border border-[#8eb4df] transition-colors cursor-pointer shrink-0"
              title="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <DayDescriptionSection 
            day={selectedDayObj} 
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
          />
        </div>
      )}
    </div>
  );
};