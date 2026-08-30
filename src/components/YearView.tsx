import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  X,
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

interface YearViewProps {
  calendarSystem: CalendarSystem;
  days: CalendarDay[];
  availableMonths: { year: number; month: number; label: string }[];
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

export const YearView: React.FC<YearViewProps> = ({
  calendarSystem,
  days,
  availableMonths,
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
  const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);
  const [activeMonthKey, setActiveMonthKey] = useState<string>(
    isHebrewMode ? (hebrewMonths[2]?.key || hebrewMonths[0]?.key || '') : `${availableMonths[1]?.year || 2026}-${availableMonths[1]?.month || 9}`
  );
  const [headerHeight, setHeaderHeight] = useState<number>(64);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0);
  const [isOverMonthBox, setIsOverMonthBox] = useState<boolean>(false);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.getElementById('app-header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    const headerEl = document.getElementById('app-header');
    let resizeObserver: ResizeObserver | null = null;
    if (headerEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateHeaderHeight());
      resizeObserver.observe(headerEl);
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

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

  const monthsData = useMemo(() => {
    if (isHebrewMode) {
      return hebrewMonths.map((hm, idx) => {
        const mDays = days.filter(
          (d) => (d.hebrewMonthKey || `${d.hebrewYear}-${d.hebrewMonth}`) === hm.key
        );

        const leadingCount = mDays.length > 0 ? WEEKDAY_NAMES.indexOf(mDays[0].dayOfWeek) : 0;
        const allSlots: (CalendarDay | null)[] = [];
        for (let i = 0; i < leadingCount; i++) {
          allSlots.push(null);
        }
        for (const d of mDays) {
          allSlots.push(d);
        }
        while (allSlots.length % 7 !== 0) {
          allSlots.push(null);
        }

        return {
          id: hm.key,
          index: idx,
          titlePrimary: `${hm.hebrewMonth} ${hm.hebrewYearHebrew}`,
          titleSecondary: `${hm.hebrewMonthEn} ${hm.hebrewYear}`,
          dateRange:
            mDays.length > 0
              ? `${mDays[0]?.englishDate} ${mDays[0]?.year} – ${mDays[mDays.length - 1]?.englishDate} ${mDays[mDays.length - 1]?.year}`
              : '',
          daysCount: mDays.length,
          slots: allSlots,
          days: mDays,
        };
      });
    }

    return availableMonths.map((gm, idx) => {
      const mDays = days.filter((d) => d.year === gm.year && d.month === gm.month);
      const leadingCount = mDays.length > 0 ? WEEKDAY_NAMES.indexOf(mDays[0].dayOfWeek) : 0;
      const allSlots: (CalendarDay | null)[] = [];
      for (let i = 0; i < leadingCount; i++) {
        allSlots.push(null);
      }
      for (const d of mDays) {
        allSlots.push(d);
      }
      while (allSlots.length % 7 !== 0) {
        allSlots.push(null);
      }

      return {
        id: `${gm.year}-${gm.month}`,
        index: idx,
        titlePrimary: `${MONTH_NAMES[gm.month - 1]} ${gm.year}`,
        titleSecondary: '5787',
        dateRange:
          mDays.length > 0
            ? `${mDays[0]?.hebrewDate} – ${mDays[mDays.length - 1]?.hebrewDate}`
            : '',
        daysCount: mDays.length,
        slots: allSlots,
        days: mDays,
      };
    });
  }, [isHebrewMode, hebrewMonths, availableMonths, days]);

  useEffect(() => {
    const idx = monthsData.findIndex((m) => m.id === activeMonthKey);
    if (idx !== -1) {
      setCurrentMonthIndex(idx);
    } else if (monthsData.length > 0) {
      setCurrentMonthIndex(0);
      setActiveMonthKey(monthsData[0].id);
    }
  }, [activeMonthKey, monthsData]);

  useEffect(() => {
    const handleScroll = () => {
      const stickyContainer = document.getElementById('year-sticky-header');
      if (!stickyContainer || monthsData.length === 0) return;

      const stickyRect = stickyContainer.getBoundingClientRect();
      const stickyBottom = stickyRect.bottom;
      const stickyTop = stickyRect.top;
      const targetY = stickyBottom + 30;

      let foundOverMonth = false;
      let activeIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < monthsData.length; i++) {
        const el = document.getElementById(`year-month-box-${monthsData[i].id}`);
        if (!el) continue;
        const rect = el.getBoundingClientRect();

        if (rect.top <= stickyBottom + 5 && rect.bottom >= stickyTop) {
          foundOverMonth = true;
        }

        if (rect.top <= targetY && rect.bottom >= targetY) {
          activeIdx = i;
          minDistance = 0;
        } else if (minDistance !== 0) {
          const dist = rect.top > targetY ? rect.top - targetY : targetY - rect.bottom;
          if (dist < minDistance) {
            minDistance = dist;
            activeIdx = i;
          }
        }
      }

      setIsOverMonthBox(foundOverMonth);
      if (monthsData[activeIdx]) {
        setCurrentMonthIndex(activeIdx);
        setActiveMonthKey(monthsData[activeIdx].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [monthsData]);

  const scrollToMonth = (monthId: string) => {
    const element = document.getElementById(`year-month-box-${monthId}`);
    if (element) {
      const yOffset = -(headerHeight + 90);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handlePrevMonthJump = () => {
    const currentIdx = monthsData.findIndex((m) => m.id === activeMonthKey);
    if (currentIdx > 0) {
      scrollToMonth(monthsData[currentIdx - 1].id);
    }
  };

  const handleNextMonthJump = () => {
    const currentIdx = monthsData.findIndex((m) => m.id === activeMonthKey);
    if (currentIdx < monthsData.length - 1 && currentIdx >= 0) {
      scrollToMonth(monthsData[currentIdx + 1].id);
    }
  };

  const handleScrollToToday = () => {
    onGoToToday();
    const todayEl = document.getElementById(`year-day-cell-${todayIso}`);
    if (todayEl) {
      todayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedDayIso(todayIso);
    } else {
      const todayDay = days.find((d) => d.isoDate === todayIso);
      if (todayDay) {
        const monthKey = isHebrewMode
          ? todayDay.hebrewMonthKey || `${todayDay.hebrewYear}-${todayDay.hebrewMonth}`
          : `${todayDay.year}-${todayDay.month}`;
        scrollToMonth(monthKey);
        setTimeout(() => {
          const el = document.getElementById(`year-day-cell-${todayIso}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setSelectedDayIso(todayIso);
          }
        }, 300);
      }
    }
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDayIso((prev) => (prev === day.isoDate ? null : day.isoDate));
    onSelectDay(day);
  };

  const selectedDayObj = useMemo(() => {
    if (!selectedDayIso) return null;
    return days.find((d) => d.isoDate === selectedDayIso) || null;
  }, [days, selectedDayIso]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-2.5 pb-20 space-y-3" id="year-view-container">
      {/* Sticky Bar Area */}
      <div
        id="year-sticky-header"
        className="sticky z-20 space-y-1.5 pb-1 pointer-events-none transition-[top] duration-100"
        style={{ top: `${headerHeight}px` }}
      >
        <div className="pointer-events-auto flex items-center justify-between gap-2 bg-[#dde8f6]/95 backdrop-blur-md px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#b8cee8] shadow-md">
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handlePrevMonthJump}
              id="year-prev-month-btn"
              className="p-1 sm:p-1.5 rounded-lg border border-[#b8cee8] bg-[#edf5fd] hover:bg-[#d8e8f8] text-[#15265c] transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
              title="Scroll to previous month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#15265c]" />
            </button>
            <button
              onClick={handleScrollToToday}
              id="year-today-quick-btn"
              className="flex px-2 py-1 rounded-lg border border-amber-300 hover:border-amber-400 bg-amber-50 hover:bg-amber-100 text-[#15265c] text-[11px] sm:text-xs font-bold transition-all items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Scroll to Today's date"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Today</span>
            </button>
            <button
              onClick={handleNextMonthJump}
              id="year-next-month-btn"
              className="p-1 sm:p-1.5 rounded-lg border border-[#b8cee8] bg-[#edf5fd] hover:bg-[#d8e8f8] text-[#15265c] transition-colors cursor-pointer flex items-center justify-center shadow-2xs"
              title="Scroll to next month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#15265c]" />
            </button>
          </div>

          <div className="flex-1 flex justify-center items-center px-1 overflow-hidden min-w-0">
            <div
              className="h-8 overflow-hidden relative w-full max-w-lg sm:max-w-xl md:max-w-2xl"
              id="year-header-month-roller"
            >
              <div
                className="transition-transform duration-300 ease-out flex flex-col items-center w-full absolute top-0 left-0"
                style={{
                  transform: `translateY(-${currentMonthIndex * 32}px)`,
                }}
              >
                {monthsData.map((m) => {
                  const monthMivtzaItems = isHebrewMode ? getMivtzaSubtitles(m.titleSecondary || m.titlePrimary) : [];
                  const hasMivtza = monthMivtzaItems.length > 0;

                  return (
                    <div
                      key={m.id}
                      className="h-8 relative flex items-center justify-center px-2 w-full shrink-0"
                    >
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap min-w-0">
                        <span className="text-xs sm:text-sm font-extrabold text-[#15265c] font-hebrew tracking-tight">
                          {m.titlePrimary}
                        </span>
                        {m.titleSecondary && (
                          <span className="hidden sm:inline-block text-[10px] sm:text-[11px] font-semibold text-[#15265c] bg-[#cce0f5] border border-[#b8cee8] px-1.5 py-0.5 rounded shrink-0">
                            {m.titleSecondary}
                          </span>
                        )}
                      </div>

                      {hasMivtza && (
                        <div className="hidden lg:flex flex-col items-center justify-center text-center bg-gradient-to-r from-amber-500/[7%] to-amber-600/[15%] border border-amber-400/[35%] rounded-lg px-2 py-0.5 shadow-2xs shrink-0 whitespace-nowrap absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-amber-800 text-center">
                            Mivtza of the Month
                          </span>
                          <div className="text-[10px] font-bold text-[#15265c] leading-tight text-center">
                            <span>{monthMivtzaItems.join(' and ')}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor="year-month-select" className="text-[11px] text-slate-600 font-semibold hidden lg:inline">
              Jump:
            </label>
            <select
              id="year-month-select"
              value={activeMonthKey}
              onChange={(e) => scrollToMonth(e.target.value)}
              className="text-[11px] sm:text-xs font-semibold bg-[#edf5fd] border border-[#b8cee8] rounded-lg px-2 py-1 text-[#15265c] focus:outline-none focus:ring-2 focus:ring-[#15265c] shadow-2xs cursor-pointer max-w-[130px] sm:max-w-none truncate"
            >
              {monthsData.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#dde8f6] text-[#15265c]">
                  {m.titlePrimary}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Floating Weekday Header + Desktop Routine Tasks Bar */}
        <div
          id="year-floating-weekdays"
          className="pointer-events-auto relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 space-y-1"
        >
          <div
            className="absolute inset-0 bg-[#dde8f6]/95 backdrop-blur-md rounded-xl border border-[#b8cee8] shadow-md pointer-events-none transition-all duration-300"
            style={{
              maskImage: isOverMonthBox
                ? 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)'
                : 'none',
              WebkitMaskImage: isOverMonthBox
                ? 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)'
                : 'none',
            }}
          />

          <div className="relative z-10 grid grid-cols-7 gap-1 sm:gap-1.25 text-center">
            {WEEKDAY_NAMES.map((dow, i) => (
              <div
                key={dow}
                className="py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs bg-[#15265c] text-white border border-[#253b7a]"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="hidden md:inline">{dow}</span>
                  <span className="hidden sm:inline md:hidden">{WEEKDAY_SHORT[i]}</span>
                  <span className="sm:hidden text-xs">{WEEKDAY_TINY[i]}</span>
                  {isHebrewMode && (
                    <span className="hidden sm:inline text-[9.5px] text-blue-200 font-hebrew font-normal">
                      ({WEEKDAY_NAMES_HEBREW[i]})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Routine Tasks Row Under Floating Weekday Headers */}
          {showRoutines && (
            <div className="relative z-10 hidden sm:grid grid-cols-7 gap-1 sm:gap-1.25 text-left pt-1">
              {WEEKDAY_NAMES.map((dow) => {
                const routine = getDayRoutine(dow, selectedSubCategories);
                if (!routine || routine.items.length === 0) {
                  return <div key={`empty-yr-routine-${dow}`} className="min-h-0" />;
                }

                return (
                  <div key={`yr-header-routine-${dow}`} className="space-y-1">
                    {routine.items.map((item, idx) => (
                      <RoutineTaskPill key={`yr-routine-card-${idx}`} item={item} variant="grid" />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sequential Months List in Separate Outer Boxes */}
      <div className="space-y-5 sm:space-y-6 pt-1">
        {monthsData.map((month) => (
          <div
            key={month.id}
            id={`year-month-box-${month.id}`}
            className="bg-[#dde8f6] rounded-2xl border border-[#b8cee8] p-3 sm:p-4 shadow-md space-y-2.5 scroll-mt-28"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#b8cee8] pb-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#15265c] font-hebrew">
                  {month.titlePrimary}
                </h3>
                {month.titleSecondary && (
                  <span className="text-[11px] sm:text-xs font-semibold text-[#15265c] bg-[#cce0f5] border border-[#b8cee8] px-2 py-0.5 rounded-md">
                    {month.titleSecondary}
                  </span>
                )}
                {month.dateRange && (
                  <span className="text-[11px] sm:text-xs text-slate-600 hidden sm:inline">
                    • {month.dateRange}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-[#edf5fd] px-2 py-0.5 rounded-md border border-[#b8cee8] shrink-0">
                {month.daysCount} Days
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-1.25">
              {month.slots.map((day, slotIdx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${month.id}-${slotIdx}`}
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
                    id={`year-day-cell-${day.isoDate}`}
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
                            <span
                              title="Global Live Broadcast"
                              className="flex items-center justify-center w-3.5 h-3.5 rounded bg-[#3c83bd] text-white shadow-2xs"
                            >
                              <GlobalRallyIcon size={12} className="shrink-0" />
                            </span>
                          )}
                          {isYomeiDepagra && (
                            <span
                              title="Yoma D'Pagra (Chassidishe Date)"
                              className="flex items-center justify-center w-3.5 h-3.5 rounded bg-[#15265c] text-[#fef08a] shadow-2xs"
                            >
                              <YomeiDepagraIcon size={10} color="#fef08a" />
                            </span>
                          )}
                          {hasMeeting && (
                            <span
                              title="Meetings (BC & CC)"
                              className="flex items-center justify-center w-3.5 h-3.5 rounded bg-gradient-to-r via-[#3c83bd] shadow-2xs [background-image:linear-gradient(to_right,#15265c,#3c83bd)]"
                            >
                              <MeetingIcon size={12} className="shrink-0" />
                            </span>
                          )}
                        </div>
                      </div>

                      {showParsha && day.dayOfWeek === 'Shabbos' && day.parsha && (
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

                      {/* Desktop Event Badges */}
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
                              className={`text-[8.5px] sm:text-[9px] leading-tight ${isPair ? 'px-1' : 'px-1.5'} py-0.5 rounded border truncate flex items-center gap-1 font-medium shadow-2xs min-w-0 ${
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
                                <ChidonIcon size={12} className="shrink-0" color="#b48a18" />
                              ) : ev.category === 'hachayol_battlefront' ? (
                                <HachayolIcon size={13} className="shrink-0" color={cat?.color || '#0f766e'} />
                              ) : ev.category === 'raffle_5m' ? (
                                <FiveMIcon size={13} className="shrink-0" />
                              ) : ev.category === 'raffle_60m' ? (
                                <SixtyMIcon size={16} className="shrink-0 -my-0.5" />
                              ) : ev.category === 'niggunim' ? (
                                <NiggunIcon size={13} className="shrink-0" color={cat?.color || '#4f46e5'} />
                              ) : ev.category === 'yomei_depagra' ? (
                                <YomeiDepagraIcon size={13} className="shrink-0" color={cat?.color || '#b45309'} />
                              ) : ev.category === 'shabbos_mevorchim' ? (
                                <ShabbosMevorchimIcon size={13} className="shrink-0" color={cat?.color || '#6366f1'} />
                              ) : ev.category === 'meetings' ? (
                                <MeetingIcon size={15} className="shrink-0" />
                              ) : ev.category === 'rallies' && ev.isGlobal ? (
                                <GlobalRallyIcon size={15} className="shrink-0 -my-1 -mx-0.5" />
                              ) : ev.category === 'cp' ? (
                                <CpIcon size={16} className="shrink-0 -my-1 -mx-0.5" />
                              ) : (
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: cat?.color || '#3b82f6' }}
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
                              <div className="text-[8px] font-bold text-[#15265c] px-1">
                                +{remainingCount} more
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Mobile Event Indicator Dots */}
                      <div className="sm:hidden flex flex-wrap gap-1 mt-1">
                        {visibleEvents.slice(0, 4).map((ev) => {
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
                            return <ChidonIcon key={ev.id} size={10} color="#d97706" className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'hachayol_battlefront') {
                            return <HachayolIcon key={ev.id} size={11} color={cat?.color || '#0f766e'} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'raffle_5m') {
                            return <FiveMIcon key={ev.id} size={11} className="shrink-0 drop-shadow-2xs" />;
                          }
                          if (ev.category === 'raffle_60m') {
                            return <SixtyMIcon key={ev.id} size={14} className="shrink-0 drop-shadow-2xs" />;
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
                              className="w-2 h-2 rounded-full shadow-2xs shrink-0"
                              style={{ backgroundColor: cat?.color || '#3b82f6' }}
                              title={ev.title}
                            />
                          );
                        })}
                        {visibleEvents.length > 4 && (
                          <span className="text-[8px] font-bold text-[#15265c] leading-none">
                            +{visibleEvents.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sm:hidden flex items-center justify-between mt-0.5">
                      {visibleEvents.length > 0 ? (
                        <span className="text-[8px] font-bold text-[#15265c]">
                          {visibleEvents.length} ev
                        </span>
                      ) : (
                        <span />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Popup Card */}
      {selectedDayObj && (
        <div
          id="year-date-popup-card"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-[350px] sm:w-[430px] max-w-[calc(100vw-2rem)] max-h-[80vh] flex flex-col bg-[#dde8f6]/98 border-2 border-[#9ec1e8] shadow-2xl rounded-2xl overflow-hidden backdrop-blur-lg animate-in slide-in-from-bottom-4 duration-200"
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
            <DayDescriptionSection day={selectedDayObj} />
          </div>
        </div>
      )}
    </div>
  );
};