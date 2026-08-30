import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Search,
  X,
  Table as TableIcon,
  ListFilter,
  CalendarDays,
  CalendarRange,
  Columns3,
  Filter,
  ChevronDown,
  RefreshCw,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import { CalendarViewType, CalendarSystem, CalendarCategory, CalendarDay } from '../types';
import { CATEGORY_KEYS } from '../data/categories';
import { TzivosHashemLogo } from './TzivosHashemLogo';
import { CategoryFilterCard } from './CategoryFilterBar';

interface HeaderProps {
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  calendarSystem: CalendarSystem;
  onCalendarSystemChange: (sys: CalendarSystem) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenExport: () => void;
  totalFilteredEvents: number;
  selectedCategories: Record<CalendarCategory, boolean>;
  onToggleCategory: (cat: CalendarCategory) => void;
  selectedSubCategories?: Record<string, boolean>; // <-- ADD THIS
  onToggleSubCategory?: (subCat: string) => void;   // <-- ADD THIS
  onSelectAllCategories: () => void;
  onClearAllCategories: () => void;
  calendarDays: CalendarDay[];
  showParsha: boolean;
  onToggleShowParsha: () => void;
  showRoutines: boolean;
  onToggleShowRoutines: () => void;
  isSyncing?: boolean;
  lastSyncedTime?: string | null;
  onSync?: () => void;
  onOpenSyncModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  view,
  onViewChange,
  calendarSystem,
  onCalendarSystemChange,
  searchQuery,
  onSearchChange,
  onOpenExport,
  totalFilteredEvents,
  selectedCategories,
  onToggleCategory,
  selectedSubCategories,
  onToggleSubCategory,
  onSelectAllCategories,
  onClearAllCategories,
  calendarDays,
  showParsha,
  onToggleShowParsha,
  showRoutines,
  onToggleShowRoutines,
  isSyncing = false,
  lastSyncedTime = null,
  onSync,
  onOpenSyncModal,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCategoryCount = Object.values(selectedCategories).filter(Boolean).length;
  const isFiltered = activeCategoryCount < CATEGORY_KEYS.length;


  return (
    <header className="bg-[#15265c] border-b border-[#2c3c6d] sticky top-0 z-30 shadow-md" id="app-header">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#2c3c6d]/80 border border-[#394a7a] flex items-center justify-center shadow-sm shrink-0 p-1 overflow-hidden">
              <TzivosHashemLogo size={40} className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
                <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  Tzivos Hashem Calendar
                </h1>
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-[#2c3c6d] text-[#b1c0dd] border border-[#394a7a] shrink-0 whitespace-nowrap">
                  5787 • ה׳תשפ״ז
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#b1c0dd] whitespace-nowrap">
                <span>Aug 2026 – Sep 2027</span>
                <span>•</span>
                <span>{totalFilteredEvents} events visible</span>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            

            {/* View Switcher Tabs */}
            <div className="flex items-center bg-[#2c3c6d] p-0.5 rounded-lg border border-[#394a7a] shrink-0" id="view-mode-selector">
              <button
                id="view-year-btn"
                onClick={() => onViewChange('year')}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                  view === 'year'
                    ? 'bg-[#394a7a] text-white shadow-xs font-semibold'
                    : 'text-[#b1c0dd] hover:text-white hover:bg-[#394a7a]/40'
                }`}
                title="Year View (Scrollable Months)"
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Year</span>
              </button>
              <button
                id="view-month-btn"
                onClick={() => onViewChange('month')}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                  view === 'month'
                    ? 'bg-[#394a7a] text-white shadow-xs font-semibold'
                    : 'text-[#b1c0dd] hover:text-white hover:bg-[#394a7a]/40'
                }`}
                title="Month View"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Month</span>
              </button>
              <button
                id="view-week-btn"
                onClick={() => onViewChange('week')}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                  view === 'week'
                    ? 'bg-[#394a7a] text-white shadow-xs font-semibold'
                    : 'text-[#b1c0dd] hover:text-white hover:bg-[#394a7a]/40'
                }`}
                title="Week View"
              >
                <Columns3 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Week</span>
              </button>
              <button
                id="view-agenda-btn"
                onClick={() => onViewChange('agenda')}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                  view === 'agenda'
                    ? 'bg-[#394a7a] text-white shadow-xs font-semibold'
                    : 'text-[#b1c0dd] hover:text-white hover:bg-[#394a7a]/40'
                }`}
                title="Agenda View"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Agenda</span>
              </button>
              <button
                id="view-table-btn"
                onClick={() => onViewChange('table')}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                  view === 'table'
                    ? 'bg-[#394a7a] text-white shadow-xs font-semibold'
                    : 'text-[#b1c0dd] hover:text-white hover:bg-[#394a7a]/40'
                }`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Table</span>
              </button>
            </div>

            {/* Filter Toggle Button & Anchored Dropdown Card */}
            <div className="relative shrink-0">
              <button
                ref={filterBtnRef}
                id="filter-toggle-btn"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border shadow-xs cursor-pointer ${
                  isFilterOpen
                    ? 'bg-[#394a7a] text-white border-[#b1c0dd]'
                    : isFiltered
                    ? 'bg-[#394a7a] text-amber-300 border-amber-400/60'
                    : 'bg-[#2c3c6d] hover:bg-[#394a7a] text-[#b1c0dd] hover:text-white border-[#394a7a]'
                }`}
                title="Toggle category filters"
              >
                <Filter className={`w-3.5 h-3.5 ${isFiltered ? 'text-amber-400' : 'text-[#b1c0dd]'}`} />
                <span>Filters</span>
                <span
                  className={`text-[9.5px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isFiltered
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-[#15265c] text-[#b1c0dd] border border-[#394a7a]'
                  }`}
                >
                  {activeCategoryCount}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#b1c0dd] transition-transform duration-150 ${
                    isFilterOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Anchored Filter Card Popover */}
              <CategoryFilterCard
  isOpen={isFilterOpen}
  onClose={() => setIsFilterOpen(false)}
  selectedCategories={selectedCategories}
  onToggleCategory={onToggleCategory}
  selectedSubCategories={selectedSubCategories}
  onToggleSubCategory={onToggleSubCategory}    
  onSelectAll={onSelectAllCategories}
  onClearAll={onClearAllCategories}
  calendarDays={calendarDays}
  showParsha={showParsha}
  onToggleShowParsha={onToggleShowParsha}
  showRoutines={showRoutines}
  onToggleShowRoutines={onToggleShowRoutines} 
  triggerRef={filterBtnRef}
/>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-44 lg:w-52 order-last lg:order-none mt-1 sm:mt-0">
              <Search className="w-3.5 h-3.5 text-[#b1c0dd] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="event-search-input"
                type="text"
                value={searchQuery ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search events, Parsha..."
                className="w-full pl-8 pr-7 py-1 sm:py-1.5 text-xs bg-[#2c3c6d] border border-[#394a7a] rounded-lg text-white placeholder:text-[#b1c0dd]/60 focus:outline-none focus:ring-2 focus:ring-[#b1c0dd] focus:border-[#b1c0dd] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#b1c0dd] hover:text-white cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Calendar System Switcher (Hebrew vs Gregorian) */}
            <div className="flex items-center bg-[#2c3c6d] p-0.5 rounded-lg border border-[#394a7a] shadow-2xs shrink-0" id="calendar-system-selector">
              <button
                id="system-hebrew-btn"
                onClick={() => onCalendarSystemChange('hebrew')}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  calendarSystem === 'hebrew'
                    ? 'bg-[#394a7a] text-white shadow-xs'
                    : 'text-[#b1c0dd] hover:text-white hover:bg-[#394a7a]/50'
                }`}
                title="Display by Jewish/Hebrew months (Tishrei, Cheshvan, Kislev...)"
              >
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] sm:rounded-[4px] bg-[#15265c]/80 border border-[#394a7a] flex items-center justify-center font-serif text-[10px] sm:text-[11px] font-bold leading-none text-[#b1c0dd] select-none shadow-2xs">
                  א
                </span>
                <span>Hebrew</span>
              </button>
              <button
                id="system-gregorian-btn"
                onClick={() => onCalendarSystemChange('gregorian')}
                className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  calendarSystem === 'gregorian'
                    ? 'bg-[#394a7a] text-white shadow-xs'
                    : 'text-[#b1c0dd] hover:text-white hover:bg-[#394a7a]/50'
                }`}
                title="Display by Gregorian months (August, September, October...)"
              >
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[3px] sm:rounded-[4px] bg-[#15265c]/80 border border-[#394a7a] flex items-center justify-center font-serif text-[9px] sm:text-[10px] font-bold tracking-tight leading-none text-[#b1c0dd] select-none shadow-2xs">
                  A
                </span>
                <span>English</span>
              </button>
            </div>
            {/* Settings Gear Dropdown Menu */}
<div className="relative shrink-0" ref={settingsRef}>
  <button
    id="settings-toggle-btn"
    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
    className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold transition-all border shadow-xs cursor-pointer flex items-center justify-center ${
      isSettingsOpen
        ? 'bg-[#394a7a] text-white border-[#b1c0dd]'
        : 'bg-[#2c3c6d] hover:bg-[#394a7a] text-[#b1c0dd] hover:text-white border-[#394a7a]'
    }`}
    title="Calendar Settings & Tools"
  >
    <Settings className={`w-4 h-4 transition-transform duration-200 ${isSettingsOpen ? 'rotate-90 text-white' : ''}`} />
  </button>

  {/* Dropdown Card */}
  {isSettingsOpen && (
<div className="absolute left-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-[#edf4fc] border-2 border-[#b4cae8] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#15265c] space-y-1">
      {/* 1. Sync Sheet Action */}
<button
  onClick={async (e) => {
    e.stopPropagation(); // Prevents menu closure or event bubbling
    if (onSync && !isSyncing) {
      await onSync();
    }
  }}
  disabled={isSyncing}
  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#e1ecfa] hover:bg-[#d5e4f7] text-[#15265c] font-semibold text-xs transition-colors border border-[#c8d8ee] cursor-pointer disabled:opacity-50"
>
  <div className="flex items-center gap-2">
    <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
    <span>{isSyncing ? 'Syncing...' : 'Sync Sheet'}</span>
  </div>
  <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
</button>

      {/* 2. Sheet Settings Details */}
      {onOpenSyncModal && (
        <button
          onClick={() => {
            setIsSettingsOpen(false);
            onOpenSyncModal();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#e1ecfa] hover:bg-[#d5e4f7] text-[#15265c] font-semibold text-xs transition-colors border border-[#c8d8ee] cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sheet Details</span>
        </button>
      )}

      {/* Divider */}
      <div className="h-px bg-[#c8d8ee] my-1" />

      {/* 3. Export Calendar */}
      <button
        onClick={() => {
          setIsSettingsOpen(false);
          onOpenExport();
        }}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#15265c] hover:bg-[#1e3a8a] text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-amber-300" />
        <span>Export Calendar</span>
      </button>
    </div>
  )}
</div>

          </div>
        </div>
      </div>
    </header>
  );
};
