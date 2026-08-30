import React, { useEffect, useRef } from 'react';
import {
  Check,
  Filter,
  RotateCcw,
  CheckCheck,
  X,
} from 'lucide-react';
import { CalendarCategory, CalendarDay } from '../types';
import { CATEGORIES, CATEGORY_KEYS } from '../data/categories';
import { ChidonIcon } from './ChidonIcon';
import { HachayolIcon } from './HachayolIcon';
import { FiveMIcon } from './FiveMIcon';
import { SixtyMIcon } from './SixtyMIcon';
import { NiggunIcon } from './NiggunIcon';
import { YomeiDepagraIcon } from './YomeiDepagraIcon';
import { ShabbosMevorchimIcon } from './ShabbosMevorchimIcon';
import { GlobalRallyIcon } from './GlobalRallyIcon';
import { MeetingIcon } from './MeetingIcon';
import { CpIcon } from './CpIcon';
import { PromotionCeremonyIcon } from './PromotionCeremonyIcon';

export const CATEGORY_LINES: Record<CalendarCategory, string[]> = {
  chidon: ['Chidon'],
  hachayol_battlefront: ['Hachayol &', 'Battlefront'],
  rallies: ['Rallies'],
  meetings: ['Meetings', '(BC & CC)'],
  promotion_ceremony: ['Promotion', 'Ceremony'],
  yomei_depagra: ['Yomei', "D'pagra"],
  niggunim: ['Niggun of', 'the Week'],
  raffle_5m: ['5M', 'Raffle'],
  raffle_60m: ['60M', 'Raffle'],
  shabbos_mevorchim: ['Shabbos', 'Mevorchim'],
  cp: ['Connection', 'Point'],
};

interface CategoryFilterCardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: Record<CalendarCategory, boolean>;
  onToggleCategory: (cat: CalendarCategory) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  calendarDays: CalendarDay[];
  showParsha: boolean;
  onToggleShowParsha: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  isOpen,
  onClose,
  selectedCategories,
  onToggleCategory,
  onSelectAll,
  onClearAll,
  calendarDays,
  showParsha,
  onToggleShowParsha,
  triggerRef,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Compute total counts per category in dataset
  const categoryCounts = React.useMemo(() => {
    const counts: Record<CalendarCategory, number> = {
      chidon: 0,
      hachayol_battlefront: 0,
      rallies: 0,
      meetings: 0,
      promotion_ceremony: 0,
      yomei_depagra: 0,
      niggunim: 0,
      raffle_5m: 0,
      raffle_60m: 0,
      shabbos_mevorchim: 0,
      cp: 0,
    };

    for (const day of calendarDays) {
      for (const ev of day.events) {
        if (ev.categories && ev.categories.length > 0) {
          for (const cat of ev.categories) {
            if (counts[cat] !== undefined) {
              counts[cat]++;
            }
          }
        } else if (counts[ev.category] !== undefined) {
          counts[ev.category]++;
        }
      }
    }
    return counts;
  }, [calendarDays]);

  const activeCount = Object.values(selectedCategories).filter(Boolean).length;
  const isAllSelected = activeCount === CATEGORY_KEYS.length;
  const isNoneSelected = activeCount === 0;

  // Handle escape key and outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // If clicking inside the card, do not close
      if (cardRef.current && cardRef.current.contains(target)) {
        return;
      }
      // If clicking on the trigger button, let the trigger button handle the toggle
      if (triggerRef?.current && triggerRef.current.contains(target)) {
        return;
      }
      if ((target as HTMLElement)?.closest?.('#filter-toggle-btn')) {
        return;
      }
      onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed backdrop to focus attention and make outside clicks reliable */}
      <div
        className="fixed inset-0 bg-[#15265c]/40 backdrop-blur-[2px] z-40 animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Card on Desktop & Mobile */}
      <div
        ref={cardRef}
        id="category-filter-card"
        className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-1.5rem)] sm:w-[94vw] max-w-[880px] max-h-[85vh] overflow-y-auto bg-[#edf4fc] border-2 border-[#b4cae8] rounded-2xl shadow-2xl p-3.5 sm:p-5 animate-in fade-in zoom-in-95 duration-150 text-[#15265c]"
      >
        {/* Top Header Row of Filter Card */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#c8d8ee] relative pr-9 sm:pr-0">
          {/* Left: Title & Active Count */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-[#15265c]">Filter Events</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#e1ecfa] text-[#15265c] font-semibold border border-[#c8d8ee]">
              {activeCount} of {CATEGORY_KEYS.length} active
            </span>
          </div>

          {/* Center/Right: Quick Actions & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap">
            <button
              onClick={onSelectAll}
              disabled={isAllSelected}
              id="filter-select-all-btn"
              className={`px-2 sm:px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer text-xs font-semibold ${
                isAllSelected
                  ? 'bg-[#e1ecfa] text-slate-400 border border-[#c8d8ee] opacity-60 cursor-default'
                  : 'bg-[#e1ecfa] text-[#15265c] hover:bg-[#d5e4f7] border border-[#c8d8ee] shadow-2xs'
              }`}
              title="Select all categories"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Select All</span>
            </button>

            <button
              onClick={onClearAll}
              disabled={isNoneSelected}
              id="filter-clear-all-btn"
              className="px-2 sm:px-2.5 py-1 rounded-md bg-[#e1ecfa] hover:bg-[#d5e4f7] text-[#15265c] border border-[#c8d8ee] transition-all flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-xs font-semibold shadow-2xs"
              title="Clear all category selections"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>

            <div className="h-4 w-px bg-[#c8d8ee] mx-0.5 hidden sm:block" />

            {/* Parsha switch */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 hover:text-[#15265c] select-none px-1.5 sm:px-2 py-1 rounded-md hover:bg-[#e1ecfa] transition-colors">
              <input
                type="checkbox"
                checked={showParsha}
                onChange={onToggleShowParsha}
                className="w-3.5 h-3.5 rounded border-[#c8d8ee] text-[#15265c] focus:ring-[#15265c] cursor-pointer"
              />
              <span className="font-semibold text-xs text-[#15265c]">Parsha</span>
            </label>

            {/* Close button - pinned top right on mobile, inline on desktop */}
            <button
              onClick={onClose}
              className="absolute right-0 top-0 sm:static sm:right-auto sm:top-auto w-7 h-7 rounded-lg bg-[#e1ecfa] hover:bg-[#d5e4f7] text-[#15265c] border border-[#c8d8ee] flex items-center justify-center transition-colors cursor-pointer ml-0.5 sm:ml-1"
              title="Close filters"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Cards Grid: Splits onto 2 balanced rows on desktop for comfortable viewability */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-3">
          {CATEGORY_KEYS.map((catKey) => {
            const cat = CATEGORIES[catKey];
            const isSelected = selectedCategories[catKey];
            const count = categoryCounts[catKey] || 0;
            const lines = CATEGORY_LINES[catKey] || [cat.name];

            return (
              <button
                key={catKey}
                id={`filter-cat-${catKey}`}
                onClick={() => onToggleCategory(catKey)}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl text-center transition-all border group cursor-pointer min-h-[92px] sm:min-h-[96px] ${
                  isSelected
                    ? 'bg-[#f5f9fe] border-[#b4cae8] shadow-xs ring-1 ring-[#c8d8ee]'
                    : 'bg-[#e1ecfa]/60 opacity-60 border-[#c8d8ee] hover:opacity-90 hover:bg-[#e1ecfa] hover:border-[#b4cae8]'
                }`}
              >
                {/* Card Top: Icon (Chidon / Hachayol & Battlefront / Color Circle) + Count */}
                <div className="w-full flex items-center justify-between gap-1.5">
                  {catKey === 'chidon' ? (
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                      <ChidonIcon size={20} color={cat.color} className="w-5 h-5" />
                    </div>
                  ) : catKey === 'hachayol_battlefront' ? (
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                      <HachayolIcon size={20} color={cat.color} className="w-5 h-5" />
                    </div>
                  ) : catKey === 'raffle_5m' ? (
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                      <FiveMIcon size={20} className="w-5 h-5" />
                    </div>
                  ) : catKey === 'raffle_60m' ? (
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center -my-0.5">
                      <SixtyMIcon size={30} className="w-[30px] h-[30px]" />
                    </div>
                  ) : catKey === 'niggunim' ? (
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                      <NiggunIcon size={20} color={cat.color} className="w-5 h-5" />
                    </div>
                  ) : catKey === 'yomei_depagra' ? (
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                      <YomeiDepagraIcon size={20} color={cat.color} className="w-5 h-5" />
                    </div>
                  ) : catKey === 'shabbos_mevorchim' ? (
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                      <ShabbosMevorchimIcon size={20} color={cat.color} className="w-5 h-5" />
                    </div>
                  ) : catKey === 'rallies' ? (
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center -my-0.5">
                      <GlobalRallyIcon size={22} className="w-[22px] h-[22px]" />
                    </div>
                  ) : catKey === 'meetings' ? (
                    <div className="w-6 h-5 shrink-0 flex items-center justify-center">
                      <MeetingIcon size={22} className="w-[22px] h-auto" />
                    </div>
                  ) : catKey === 'cp' ? (
                    <div className="w-7 h-7 shrink-0 flex items-center justify-center -my-1">
                      <CpIcon size={26} className="w-[26px] h-auto" />
                  </div>
                  ) : catKey === 'promotion_ceremony' ? (
                    <div className="w-7 h-7 shrink-0 flex items-center justify-center -my-1">
                      <PromotionCeremonyIcon size={26} className="w-[26px] h-auto" />
                  </div>
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-black/10"
                      style={{ backgroundColor: cat.color }}
                    />
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#d2e2f6] text-[#15265c] font-bold border border-[#c8d8ee] leading-none">
                    {count}
                  </span>
                </div>

                {/* Card Center: Split Text Lines */}
                <div className="flex-1 flex flex-col items-center justify-center py-1.5 text-center w-full">
                  {lines.map((line, idx) => (
                    <span
                      key={idx}
                      className="font-semibold text-[11px] sm:text-[11.5px] leading-[14px] text-[#15265c] text-center select-none"
                    >
                      {line}
                    </span>
                  ))}
                </div>

                {/* Card Bottom: Checkmark status indicator */}
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#15265c] text-white shadow-2xs'
                      : 'border border-[#c8d8ee] bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
