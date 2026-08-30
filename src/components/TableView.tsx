import React, { useState } from 'react';
import {
  ArrowUpDown,
  Download,
  Search,
  ExternalLink,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpRight,
} from 'lucide-react';
import { CalendarDay, CalendarCategory, CalendarSystem } from '../types';
import { CATEGORIES, isCCMeeting } from '../data/categories';
import { flattenCalendarEvents, generateCSV, downloadFile, getGoogleCalendarUrl } from '../utils/exporter';
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


interface TableViewProps {
  days: CalendarDay[];
  calendarSystem: CalendarSystem;
  selectedCategories: Record<CalendarCategory, boolean>;
  searchQuery: string;
  onSelectDay: (day: CalendarDay) => void;
  todayIso: string;
}

export const TableView: React.FC<TableViewProps> = ({
  days,
  calendarSystem,
  selectedCategories,
  searchQuery,
  onSelectDay,
  todayIso,
}) => {
  const isHebrew = calendarSystem === 'hebrew';
  const [sortField, setSortField] = useState<'date' | 'category' | 'title'>('date');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const pageSize = 25;

  const flatEvents = React.useMemo(() => {
    let list = flattenCalendarEvents(days, selectedCategories, searchQuery);

    if (selectedMonthFilter !== 'ALL') {
      if (isHebrew) {
        list = list.filter((ev) => (ev.hebrewMonthKey || `${ev.hebrewYear}-${ev.hebrewMonth}`) === selectedMonthFilter);
      } else {
        list = list.filter((ev) => `${ev.year}-${ev.month}` === selectedMonthFilter);
      }
    }

    list.sort((a, b) => {
      if (sortField === 'date') {
        return sortAsc
          ? a.isoDate.localeCompare(b.isoDate)
          : b.isoDate.localeCompare(a.isoDate);
      } else if (sortField === 'category') {
        return sortAsc
          ? a.categoryName.localeCompare(b.categoryName)
          : b.categoryName.localeCompare(a.categoryName);
      } else {
        return sortAsc
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

    return list;
  }, [days, selectedCategories, searchQuery, sortField, sortAsc, selectedMonthFilter, isHebrew]);

  // Jump to today's page in table
  const handleGoToToday = () => {
    setSelectedMonthFilter('ALL');
    const todayIndex = flatEvents.findIndex((e) => e.isoDate === todayIso);
    if (todayIndex !== -1) {
      const page = Math.floor(todayIndex / pageSize) + 1;
      setCurrentPage(page);
    } else {
      const todayDay = days.find((d) => d.isoDate === todayIso);
      if (todayDay) onSelectDay(todayDay);
    }
  };

  // Extract list of months for filter dropdown
  const monthOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const d of days) {
      if (isHebrew) {
        const key = d.hebrewMonthKey || `${d.hebrewYear}-${d.hebrewMonth}`;
        if (!map.has(key)) {
          map.set(key, `${d.hebrewMonth} ${d.hebrewYearHebrew || ''} (${d.hebrewMonthEn} ${d.hebrewYear})`);
        }
      } else {
        const key = `${d.year}-${d.month}`;
        if (!map.has(key)) {
          map.set(key, `${d.englishDate.split(' ')[1]} ${d.year}`);
        }
      }
    }
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [days, isHebrew]);

  const totalPages = Math.ceil(flatEvents.length / pageSize) || 1;
  const paginatedEvents = flatEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: 'date' | 'category' | 'title') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExportFilteredCSV = () => {
    const csv = generateCSV(flatEvents);
    downloadFile(csv, `tzivos-hashem-filtered-events-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4" id="table-view-container">
      {/* Table Toolbar - Light Blue Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#dde8f6] p-4 rounded-2xl border border-[#b8cee8] shadow-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#15265c]">Events Spreadsheet Grid</h2>
          <p className="text-xs text-slate-600">
            {flatEvents.length} events found • Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Today Button */}
          <button
            onClick={handleGoToToday}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#15265c] rounded-xl text-xs font-bold border border-amber-300 hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
            title="Jump to Today in events spreadsheet"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Go to Today</span>
          </button>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-semibold hidden sm:inline">Filter Month:</span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => {
                setSelectedMonthFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-semibold bg-[#edf5fd] border border-[#b8cee8] rounded-xl px-2.5 py-1.5 text-[#15265c] focus:outline-none focus:ring-2 focus:ring-[#15265c] shadow-2xs"
            >
              <option value="ALL" className="bg-[#dde8f6] text-[#15265c]">All Months ({monthOptions.length})</option>
              {monthOptions.map((opt) => (
                <option key={opt.key} value={opt.key} className="bg-[#dde8f6] text-[#15265c]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportFilteredCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#edf5fd] hover:bg-[#d8e8f8] text-[#15265c] rounded-xl text-xs font-semibold border border-[#b8cee8] transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#15265c]" />
            <span>Download CSV ({flatEvents.length})</span>
          </button>
        </div>
      </div>

      {/* Table Container - Light Blue Card */}
      <div className="bg-[#dde8f6] rounded-2xl border border-[#b8cee8] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#cce0f5] border-b border-[#b8cee8] text-[#15265c] uppercase tracking-wider font-bold">
              <tr>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-[#bed6f1] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{isHebrew ? 'תאריך עברי / English' : 'English Date / Hebrew'}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Day / Parsha</th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3.5 px-3 cursor-pointer hover:bg-[#d5e4f7] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Category & Sub</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3.5 px-4 cursor-pointer hover:bg-[#d5e4f7] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Event Details</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-3">Time (EST)</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c8d8ee]/60 bg-[#edf4fc]">
              {paginatedEvents.map((ev, idx) => {
                const isToday = ev.isoDate === todayIso;
                const cat = CATEGORIES[ev.category];
                const day = days.find((d) => d.isoDate === ev.isoDate);
                const gcalUrl = day
                  ? getGoogleCalendarUrl(day, {
                      id: `tbl-${idx}`,
                      category: ev.category,
                      subCategory: ev.subCategory,
                      title: ev.title,
                      rawText: ev.rawText,
                      time: ev.time,
                      isGlobal: ev.isGlobal,
                    })
                  : '#';

                return (
                  <tr
                    key={`${ev.isoDate}-${ev.category}-${idx}`}
                    className={`transition-colors cursor-pointer group ${
                      isToday
                        ? 'bg-[#fae29c] hover:bg-[#f5d985] border-l-4 border-l-amber-500'
                        : 'hover:bg-[#e2eefa]'
                    }`}
                    onClick={() => day && onSelectDay(day)}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        {isToday && (
                          <span className="text-[9px] font-extrabold text-stone-950 bg-amber-500 px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <span className="relative flex h-1.5 w-1.5 items-center justify-center">
                              <span className="animate-subtle-pulse absolute inline-flex h-full w-full rounded-full bg-white"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                            </span>
                            <span>TODAY</span>
                          </span>
                        )}
                        {isHebrew ? (
                          <div className={`font-bold font-hebrew text-sm ${isToday ? 'text-[#15265c] font-extrabold' : 'text-[#15265c]'}`}>{ev.hebrewDate}</div>
                        ) : (
                          <div className={`font-bold ${isToday ? 'text-[#15265c] font-extrabold' : 'text-[#15265c]'}`}>{ev.englishDate} {ev.year}</div>
                        )}
                      </div>
                      <div className={`text-[11px] ${isToday ? 'text-amber-900 font-semibold' : 'text-slate-500'} ${isHebrew ? '' : 'font-hebrew'}`}>
                        {isHebrew ? `${ev.englishDate} ${ev.year}` : ev.hebrewDate}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-[#15265c] font-semibold">{ev.dayOfWeek}</div>
                      {ev.parsha && ev.dayOfWeek === 'Shabbos' && (
                        <div
                          className="text-[10px] sm:text-[10.5px] font-bold font-hebrew text-[#15265c] bg-[#c3d9f3] px-1.5 py-0.5 rounded border border-[#a4c4ea] inline-flex items-center gap-1 shadow-2xs mt-0.5"
                          title={`Parshas ${ev.parsha}`}
                        >
                          <TorahIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#15265c] shrink-0" />
                          <span>{ev.hideParshaPrefix ? ev.parsha : `פרשת ${ev.parsha}`}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {(() => {
                        const isCC = isCCMeeting(ev);
                        return (
                          <div className="flex flex-col gap-0.5">
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md w-fit"
                              style={{
                                backgroundColor: `${cat?.color || '#555'}20`,
                                color: cat?.color || '#333',
                                border: `1px solid ${cat?.color || '#555'}40`,
                              }}
                            >
                              {isCC ? (
                                <>
                                  <MeetingIcon
                                    size={15}
                                    className="shrink-0"
                                  />
                                  <ChidonIcon
                                    size={12}
                                    color="#d97706"
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
                                  size={17}
                                  className="shrink-0 -my-0.5"
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
                              ) : (
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: cat?.color }}
                                />
                              )}
                              {isCC ? 'Meetings & Chidon' : (cat?.name || ev.subCategory)}
                            </span>
                            {ev.subCategory && (isCC ? false : (cat?.name && ev.subCategory.toLowerCase().trim() !== cat.name.toLowerCase().trim())) && (
                              <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                                {ev.subCategory}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900 leading-snug">
                      <div>{ev.title}</div>
                      {ev.shadingLevel && (
                        <span className="inline-block mt-0.5 text-[9px] bg-[#e1ecfa] text-[#15265c] px-1.5 py-0.2 rounded font-semibold border border-[#c8d8ee]">
                          {ev.shadingLevel}
                        </span>
                      )}
                      {ev.isGlobal && (
                        <span className="inline-block ml-1 mt-0.5 text-[9px] bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
                          Global
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {ev.time ? (
                        <span className="inline-flex items-center gap-1 font-medium text-violet-900 bg-violet-100 px-2 py-0.5 rounded border border-violet-200">
                          {ev.time}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">All Day</span>
                      )}
                    </td>

                    <td
                      className="py-3 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {ev.link && (
                          <a
                            href={ev.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#15265c] hover:bg-[#1e3a8a] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
                            title={`Open ${ev.buttonText || ev.title}`}
                          >
                            <span>{ev.buttonText || 'Open Link'}</span>
                            <ArrowUpRight className="w-3 h-3 text-amber-300 shrink-0" />
                          </a>
                        )}
                        <a
                          href={gcalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e1ecfa] hover:bg-[#d5e4f7] text-[#15265c] border border-[#c8d8ee] font-medium transition-colors shadow-2xs text-xs"
                          title="Add to Google Calendar"
                        >
                          <CalendarIcon className="w-3 h-3 text-[#15265c]" />
                          <span>Add to Cal</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                    No events match your current filter settings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-[#cce0f5] border-t border-[#b8cee8]">
            <div className="text-xs text-slate-600">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, flatEvents.length)} of {flatEvents.length} events
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg border border-[#b8cee8] bg-[#edf5fd] hover:bg-[#d8e8f8] disabled:opacity-30 disabled:pointer-events-none text-[#15265c] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold px-2 text-[#15265c]">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg border border-[#b8cee8] bg-[#edf5fd] hover:bg-[#d8e8f8] disabled:opacity-30 disabled:pointer-events-none text-[#15265c] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
