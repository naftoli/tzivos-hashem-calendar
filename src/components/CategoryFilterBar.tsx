import React, { useEffect, useRef } from 'react';
import {
  Filter,
  RotateCcw,
  CheckCheck,
  X,
  ListTodo
} from 'lucide-react';
import { CalendarCategory, CalendarDay } from '../types';
import { CATEGORY_KEYS } from '../data/categories';
import { CategoryFilterCard as IndividualCard } from './CategoryFilterCard';
import { TorahIcon } from './TorahIcon'; // <-- Add TorahIcon import here

interface CategoryFilterBarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: Record<CalendarCategory, boolean>;
  onToggleCategory: (cat: CalendarCategory) => void;
  selectedSubCategories?: Record<string, boolean>;
  onToggleSubCategory?: (subCat: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  calendarDays: CalendarDay[];
  showParsha: boolean;
  onToggleShowParsha: () => void;
  showRoutines: boolean;
  onToggleShowRoutines: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  isOpen,
  onClose,
  selectedCategories = {} as Record<CalendarCategory, boolean>,
  onToggleCategory,
  selectedSubCategories = {},
  onToggleSubCategory,
  onSelectAll,
  onClearAll,
  calendarDays = [],
  showParsha,
  onToggleShowParsha,
  showRoutines,
  onToggleShowRoutines,
  triggerRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

    if (!Array.isArray(calendarDays)) return counts;

    for (const day of calendarDays) {
      if (!day || !Array.isArray(day.events)) continue;
      for (const ev of day.events) {
        if (!ev) continue;
        if (ev.categories && Array.isArray(ev.categories) && ev.categories.length > 0) {
          for (const cat of ev.categories) {
            if (counts[cat] !== undefined) {
              counts[cat]++;
            }
          }
        } else if (ev.category && counts[ev.category] !== undefined) {
          counts[ev.category]++;
        }
      }
    }
    return counts;
  }, [calendarDays]);

  const activeCount = Object.values(selectedCategories).filter(Boolean).length;
  const isAllSelected = activeCount === CATEGORY_KEYS.length;
  const isNoneSelected = activeCount === 0;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (modalRef.current && modalRef.current.contains(target)) {
        return;
      }
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
      <div
        className="fixed inset-0 bg-[#15265c]/40 backdrop-blur-[2px] z-40 animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        id="category-filter-bar"
        className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-1.5rem)] sm:w-[94vw] max-w-[880px] max-h-[85vh] overflow-y-auto bg-[#edf4fc] border-2 border-[#b4cae8] rounded-2xl shadow-2xl p-3.5 sm:p-5 animate-in fade-in zoom-in-95 duration-150 text-[#15265c]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#c8d8ee] relative pr-9 sm:pr-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center">
              <Filter className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-[#15265c]">Filter Events</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#e1ecfa] text-[#15265c] font-semibold border border-[#c8d8ee]">
              {activeCount} of {CATEGORY_KEYS.length} active
            </span>
          </div>

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

{/* Parsha Toggle Pill */}
<label
  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all select-none shadow-2xs ${
    showParsha
      ? 'bg-[#15265c] text-white border-[#15265c]'
      : 'bg-[#e1ecfa] text-[#15265c] border-[#c8d8ee] hover:bg-[#d5e4f7]'
  }`}
  title="Toggle Parsha badge visibility"
>
  <input
    type="checkbox"
    checked={Boolean(showParsha)}
    onChange={onToggleShowParsha}
    className="sr-only"
  />
  <TorahIcon className={`w-3.5 h-3.5 shrink-0 ${showParsha ? 'text-amber-300' : 'text-[#15265c]'}`} />
  <span>Parsha</span>
</label>

{/* Routine Tasks Toggle Pill */}
<label
  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all select-none shadow-2xs ${
    showRoutines
      ? 'bg-[#15265c] text-white border-[#15265c]'
      : 'bg-[#e1ecfa] text-[#15265c] border-[#c8d8ee] hover:bg-[#d5e4f7]'
  }`}
  title="Toggle daily routine task cards visibility"
>
  <input
    type="checkbox"
    checked={Boolean(showRoutines)}
    onChange={onToggleShowRoutines}
    className="sr-only"
  />
  <ListTodo className={`w-3.5 h-3.5 shrink-0 ${showRoutines ? 'text-amber-300' : 'text-amber-700'}`} />
  <span>Routine Tasks</span>
</label>

            <button
              onClick={onClose}
              className="absolute right-0 top-0 sm:static sm:right-auto sm:top-auto w-7 h-7 rounded-lg bg-[#e1ecfa] hover:bg-[#d5e4f7] text-[#15265c] border border-[#c8d8ee] flex items-center justify-center transition-colors cursor-pointer ml-0.5 sm:ml-1"
              title="Close filters"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-3">
          {CATEGORY_KEYS.map((catKey) => (
            <IndividualCard
              key={catKey}
              categoryKey={catKey}
              isSelected={!!selectedCategories[catKey]}
              count={categoryCounts[catKey] || 0}
              onToggleCategory={onToggleCategory}
              selectedSubCategories={selectedSubCategories}
              onToggleSubCategory={onToggleSubCategory}
            />
          ))}
        </div>
      </div>
    </>
  );
};

// Export alias so any file importing CategoryFilterCard from CategoryFilterBar won't break
export const CategoryFilterCard = CategoryFilterBar;