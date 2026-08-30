import React, { useState } from 'react';
import {
  X,
  Download,
  Calendar as CalendarIcon,
  FileSpreadsheet,
  Check,
  HelpCircle,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { CalendarDay, CalendarCategory } from '../types';
import { CATEGORIES, CATEGORY_KEYS } from '../data/categories';
import { flattenCalendarEvents, generateCSV, generateICalendar, downloadFile } from '../utils/exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: CalendarDay[];
  currentYear: number;
  currentMonth: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  days,
  currentYear,
  currentMonth,
}) => {
  const [selectedCats, setSelectedCats] = useState<Record<CalendarCategory, boolean>>({
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
  });

  const [exportFormat, setExportFormat] = useState<'ics' | 'csv'>('ics');
  const [dateRange, setDateRange] = useState<'all' | 'current_month'>('all');
  const [calendarTitle, setCalendarTitle] = useState('Tzivos Hashem 5787');

  if (!isOpen) return null;

  const targetDays = dateRange === 'all'
    ? days
    : days.filter((d) => d.year === currentYear && d.month === currentMonth);

  const flatEvents = flattenCalendarEvents(targetDays, selectedCats);

  const handleToggleCat = (cat: CalendarCategory) => {
    setSelectedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleSelectAll = () => {
    const updated: Record<CalendarCategory, boolean> = {} as any;
    for (const key of CATEGORY_KEYS) updated[key] = true;
    setSelectedCats(updated);
  };

  const handleClearAll = () => {
    const updated: Record<CalendarCategory, boolean> = {} as any;
    for (const key of CATEGORY_KEYS) updated[key] = false;
    setSelectedCats(updated);
  };

  const handleDownload = () => {
    if (flatEvents.length === 0) return;

    const dateStamp = new Date().toISOString().slice(0, 10);
    const cleanTitle = calendarTitle.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'tzivos-hashem';

    if (exportFormat === 'ics') {
      const ics = generateICalendar(flatEvents, calendarTitle);
      downloadFile(ics, `${cleanTitle}-${dateStamp}.ics`, 'text/calendar;charset=utf-8');
    } else {
      const csv = generateCSV(flatEvents);
      downloadFile(csv, `${cleanTitle}-${dateStamp}.csv`, 'text/csv;charset=utf-8');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      id="export-modal-overlay"
    >
      <div
        className="bg-[#edf4fc] rounded-2xl border border-[#c8d8ee] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#e1ecfa] text-[#15265c] p-5 flex items-start justify-between border-b border-[#c8d8ee]">
          <div>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold tracking-tight text-[#15265c]">
                Export Calendar Events
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select specific categories and export as Google Calendar (.ics) or CSV spreadsheet.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#d5e4f7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5 bg-[#edf4fc] text-[#15265c]">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#15265c]">
              1. Choose Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('ics')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  exportFormat === 'ics'
                    ? 'border-[#15265c] bg-[#e1ecfa] ring-2 ring-[#15265c]/30 shadow-xs'
                    : 'border-[#c8d8ee] bg-[#f5f9fe] hover:bg-[#e2eefa]'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#15265c]">Google Calendar / iCal (.ics)</div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Directly imports into Google Calendar, Apple Calendar, or Outlook.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  exportFormat === 'csv'
                    ? 'border-[#15265c] bg-[#e1ecfa] ring-2 ring-[#15265c]/30 shadow-xs'
                    : 'border-[#c8d8ee] bg-[#f5f9fe] hover:bg-[#e2eefa]'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-300">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#15265c]">CSV Table (.csv)</div>
                  <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Excel, Google Sheets, or database tabular format.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#15265c]">
              2. Date Range
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer ${dateRange === 'all' ? 'border-[#15265c] bg-[#e1ecfa] text-[#15265c]' : 'border-[#c8d8ee] bg-[#f5f9fe] text-slate-700'}`}>
                <input
                  type="radio"
                  name="daterange"
                  checked={dateRange === 'all'}
                  onChange={() => setDateRange('all')}
                  className="text-[#15265c] focus:ring-[#15265c]"
                />
                <span className="font-semibold text-[#15265c]">Full Year 5787 (All 392 Days)</span>
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer ${dateRange === 'current_month' ? 'border-[#15265c] bg-[#e1ecfa] text-[#15265c]' : 'border-[#c8d8ee] bg-[#f5f9fe] text-slate-700'}`}>
                <input
                  type="radio"
                  name="daterange"
                  checked={dateRange === 'current_month'}
                  onChange={() => setDateRange('current_month')}
                  className="text-[#15265c] focus:ring-[#15265c]"
                />
                <span className="font-semibold text-[#15265c]">Selected Month Only</span>
              </label>
            </div>
          </div>

          {/* Category Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#15265c]">
                3. Select Categories to Include
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[#15265c] hover:underline font-bold cursor-pointer"
                >
                  All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[#15265c] hover:underline font-bold cursor-pointer"
                >
                  None
                </button>
              </div>
            </div>

            {/* Checkbox grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 bg-[#e1ecfa] rounded-xl border border-[#c8d8ee]">
              {CATEGORY_KEYS.map((catKey) => {
                const cat = CATEGORIES[catKey];
                const isSelected = selectedCats[catKey];

                return (
                  <label
                    key={catKey}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                      isSelected ? 'bg-[#f5f9fe] text-[#15265c] font-semibold shadow-2xs border border-[#c8d8ee]' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleCat(catKey)}
                      className="w-3.5 h-3.5 rounded-sm border-[#c8d8ee] text-[#15265c] focus:ring-[#15265c]"
                    />
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Google Calendar Import Instructions Guide */}
          {exportFormat === 'ics' && (
            <div className="p-3 bg-[#e1ecfa] rounded-xl border border-[#c8d8ee] text-xs text-slate-600 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-[#15265c]">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                How to import into Google Calendar:
              </div>
              <ol className="list-decimal list-inside text-[11px] space-y-0.5 text-slate-600">
                <li>Click <strong className="text-[#15265c]">"Download ICS File"</strong> below.</li>
                <li>Go to <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-[#15265c] underline font-semibold">Google Calendar</a> on your computer.</li>
                <li>Click <strong className="text-[#15265c]">Settings Gear ⚙️ → Settings → Import & Export</strong>.</li>
                <li>Upload the downloaded <code className="bg-[#f5f9fe] text-[#15265c] px-1 py-0.5 rounded border border-[#c8d8ee] font-mono">.ics</code> file and select target calendar.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#e1ecfa] p-4 border-t border-[#c8d8ee] flex items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-[#15265c]">{flatEvents.length}</span> events will be exported
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#d5e4f7] hover:text-[#15265c] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={flatEvents.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#15265c] hover:bg-[#1e3a8a] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Download {exportFormat.toUpperCase()} ({flatEvents.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
