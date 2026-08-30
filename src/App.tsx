import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CalendarDay, CalendarCategory, CalendarSystem, CalendarViewType } from './types';
import { getGregorianMonths, getHebrewMonths, getTodayIso } from './data/calendarData';
import { CATEGORY_KEYS } from './data/categories';
import { Header } from './components/Header';
import { YearView } from './components/YearView';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { AgendaView } from './components/AgendaView';
import { TableView } from './components/TableView';
import { ExportModal } from './components/ExportModal';
import { SheetSyncModal } from './components/SheetSyncModal';
import { flattenCalendarEvents } from './utils/exporter';
import {
  getInitialCalendarDays,
  fetchAndParseGoogleSheet,
  getSavedLastSyncedTime,
  getSavedSheetUrl,
  STORAGE_KEYS,
} from './utils/googleSheets';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { 
  DEFAULT_SUBCATEGORIES_STATE, 
  isEventVisibleByCategories 
} from './data/categories';

export default function App() {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>(() => getInitialCalendarDays());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(() => getSavedLastSyncedTime());
  const [sheetUrl, setSheetUrl] = useState<string>(() => getSavedSheetUrl());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  const [view, setView] = useState<CalendarViewType>('month');
  const [calendarSystem, setCalendarSystem] = useState<CalendarSystem>('hebrew'); // Default to Hebrew view
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // Oct 2026 (Tishrei 5787)
  const [currentHebrewMonthKey, setCurrentHebrewMonthKey] = useState<string>('5787-Tishrei');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [showParsha, setShowParsha] = useState<boolean>(true);
  const [showRoutines, setShowRoutines] = useState<boolean>(true); // <-- Added Routine Tasks toggle state
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 1. Existing Category State
  const [selectedCategories, setSelectedCategories] = useState<Record<CalendarCategory, boolean>>(() => {
    const initial = {} as Record<CalendarCategory, boolean>;
    CATEGORY_KEYS.forEach((cat) => {
      initial[cat] = true;
    });
    return initial;
  });

  // 2. Subcategory State (Defaults 'Limmud Schedule' to false)
  const [selectedSubCategories, setSelectedSubCategories] = useState<Record<string, boolean>>(
    DEFAULT_SUBCATEGORIES_STATE
  );

  // Toggle Handler for Major Categories
  const handleToggleCategory = useCallback((cat: CalendarCategory) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  }, []);

  // Toggle Handler for Subcategories (Robust boolean flip logic with useCallback)
  const handleToggleSubCategory = useCallback((subCat: string) => {
    setSelectedSubCategories((prev) => {
      const isCurrentlyActive =
        prev[subCat] !== undefined
          ? prev[subCat]
          : subCat !== 'Limmud Schedule';

      return {
        ...prev,
        [subCat]: !isCurrentlyActive,
      };
    });
  }, []);

  const handleSelectAllCategories = useCallback(() => {
    const all = {} as Record<CalendarCategory, boolean>;
    CATEGORY_KEYS.forEach((k) => {
      all[k] = true;
    });
    setSelectedCategories(all);
  }, []);

  const handleClearAllCategories = useCallback(() => {
    const none = {} as Record<CalendarCategory, boolean>;
    CATEGORY_KEYS.forEach((k) => {
      none[k] = false;
    });
    setSelectedCategories(none);
  }, []);

  const availableMonths = useMemo(() => getGregorianMonths(calendarDays), [calendarDays]);
  const hebrewMonths = useMemo(() => getHebrewMonths(calendarDays), [calendarDays]);
  const todayIso = useMemo(() => getTodayIso(), []);

  // Sync Google Sheet function
  const handleSyncSheet = useCallback(async (targetUrl?: string, isSilent = false) => {
    setIsSyncing(true);
    try {
      const urlToFetch = targetUrl || sheetUrl;
      const res = await fetchAndParseGoogleSheet(urlToFetch);

      if (res.success && res.data && res.data.length > 0) {
        setCalendarDays(res.data);
        if (res.timestamp) setLastSyncedTime(res.timestamp);
        if (targetUrl) setSheetUrl(targetUrl);

        if (!isSilent) {
          setSyncToast({
            message: `Spreadsheet Synced! Updated ${res.totalEvents || 0} events across ${res.totalDays || 0} days.`,
            type: 'success',
          });
          setTimeout(() => setSyncToast(null), 4000);
        }
      } else {
        if (!isSilent) {
          setSyncToast({
            message: res.error || 'Failed to sync with Google Sheets.',
            type: 'error',
          });
          setTimeout(() => setSyncToast(null), 5000);
        }
      }
    } catch (err: any) {
      if (!isSilent) {
        setSyncToast({
          message: err?.message || 'Error connecting to Google Sheets.',
          type: 'error',
        });
        setTimeout(() => setSyncToast(null), 5000);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [sheetUrl]);

  // Initial live sync on mount
  useEffect(() => {
    handleSyncSheet(undefined, true);

    // Auto re-sync on tab focus if > 20s passed
    const handleFocus = () => {
      const last = localStorage.getItem(STORAGE_KEYS.LAST_SYNCED);
      if (!last || Date.now() - new Date(last).getTime() > 20000) {
        handleSyncSheet(undefined, true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [handleSyncSheet]);

  // Jump to Today
  const handleGoToToday = () => {
    const today = calendarDays.find((d) => d.isoDate === todayIso);
    if (today) {
      setCurrentYear(today.year);
      setCurrentMonth(today.month);
      if (today.hebrewMonthKey) {
        setCurrentHebrewMonthKey(today.hebrewMonthKey);
      }
      setSyncToast({ message: `Navigated to Today (${today.hebrewDate})`, type: 'success' });
      setTimeout(() => setSyncToast(null), 3000);
    } else {
      // Default to start of school year
      setCurrentYear(2026);
      setCurrentMonth(9);
      setCurrentHebrewMonthKey('5787-Tishrei');
    }
  };

  const totalFilteredEvents = useMemo(() => {
    return flattenCalendarEvents(calendarDays, selectedCategories, searchQuery, selectedSubCategories).length;
  }, [calendarDays, selectedCategories, searchQuery, selectedSubCategories]);

  const totalAllEvents = useMemo(() => {
    return calendarDays.reduce((sum, d) => sum + d.events.length, 0);
  }, [calendarDays]);

  return (
    <div className="min-h-screen bg-[#364d96] text-white flex flex-col selection:bg-[#394a7a] selection:text-white">
      {/* Top Header */}
      <Header
        view={view}
        onViewChange={setView}
        calendarSystem={calendarSystem}
        onCalendarSystemChange={setCalendarSystem}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenExport={() => setIsExportOpen(true)}
        totalFilteredEvents={totalFilteredEvents}
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
        selectedSubCategories={selectedSubCategories}
        onToggleSubCategory={handleToggleSubCategory}
        onSelectAllCategories={handleSelectAllCategories}
        onClearAllCategories={handleClearAllCategories}
        calendarDays={calendarDays}
        showParsha={showParsha}
        onToggleShowParsha={() => setShowParsha(!showParsha)}
        showRoutines={showRoutines}
        onToggleShowRoutines={() => setShowRoutines(!showRoutines)}
        isSyncing={isSyncing}
        lastSyncedTime={lastSyncedTime}
        onSync={() => handleSyncSheet(undefined, false)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Sync Toast Notification */}
      {syncToast && (
        <div
          id="sync-toast"
          className={`fixed bottom-5 right-5 z-50 p-3.5 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
            syncToast.type === 'success'
              ? 'bg-[#2c3c6d] text-white border-[#394a7a]'
              : 'bg-rose-950/90 text-rose-100 border-rose-800'
          }`}
        >
          {syncToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{syncToast.message}</span>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-12">
        {view === 'year' && (
          <YearView
            calendarSystem={calendarSystem}
            days={calendarDays}
            availableMonths={availableMonths}
            hebrewMonths={hebrewMonths}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
            searchQuery={searchQuery}
            showParsha={showParsha}
            showRoutines={showRoutines}
            onSelectDay={() => {}}
            todayIso={todayIso}
            onGoToToday={handleGoToToday}
          />
        )}

        {view === 'month' && (
          <MonthView
            calendarSystem={calendarSystem}
            days={calendarDays}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onNavigateMonth={(y, m) => {
              setCurrentYear(y);
              setCurrentMonth(m);
            }}
            availableMonths={availableMonths}
            currentHebrewMonthKey={currentHebrewMonthKey}
            onNavigateHebrewMonth={setCurrentHebrewMonthKey}
            hebrewMonths={hebrewMonths}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
            searchQuery={searchQuery}
            showParsha={showParsha}
            showRoutines={showRoutines}
            onSelectDay={() => {}}
            todayIso={todayIso}
            onGoToToday={handleGoToToday}
          />
        )}

        {view === 'week' && (
          <WeekView
            days={calendarDays}
            calendarSystem={calendarSystem}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
            searchQuery={searchQuery}
            showParsha={showParsha}
            showRoutines={showRoutines}
            onSelectDay={() => {}}
            todayIso={todayIso}
          />
        )}

        {view === 'agenda' && (
          <AgendaView
            days={calendarDays}
            calendarSystem={calendarSystem}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
            searchQuery={searchQuery}
            onSelectDay={() => {}}
            todayIso={todayIso}
          />
        )}

        {view === 'table' && (
          <TableView
            days={calendarDays}
            calendarSystem={calendarSystem}
            selectedCategories={selectedCategories}
            selectedSubCategories={selectedSubCategories}
            searchQuery={searchQuery}
            onSelectDay={() => {}}
            todayIso={todayIso}
          />
        )}
      </main>

      {/* Google Sheets Sync / Configuration Modal */}
      <SheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isSyncing={isSyncing}
        lastSyncedTime={lastSyncedTime}
        totalDays={calendarDays.length}
        totalEvents={totalAllEvents}
        onSync={handleSyncSheet}
        currentSheetUrl={sheetUrl}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        days={calendarDays}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
    </div>
  );
}