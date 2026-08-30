import React from 'react';
import { CalendarEvent, CalendarCategory } from '../types';
import { ChidonIcon } from './ChidonIcon';
import { BookNumberIcon } from './BookNumberIcon';

interface Props {
  events: CalendarEvent[];
  selectedCategories?: Record<CalendarCategory, boolean>;
  selectedSubCategories?: Record<string, boolean>;
  variant?: 'dayDescription' | 'weekView';
}

/** Parses raw unit text into structured data */
function parseUnitData(val: string): { isRange: boolean; label: string; raw: string; charLength: number } {
  const cleanVal = val.trim();
  if (!cleanVal) return { isRange: false, label: '', raw: '', charLength: 0 };

  const isRange = cleanVal.includes('-') || cleanVal.includes('–');
  const label = isRange ? 'UNITS' : 'UNIT';
  const formattedRaw = cleanVal.replace(/[-–]/, '–');

  return { isRange, label, raw: formattedRaw, charLength: formattedRaw.length };
}

export const ChidonLimmudSchedule: React.FC<Props> = ({
  events,
  selectedCategories,
  selectedSubCategories,
  variant = 'dayDescription',
}) => {
  // 1. Hide the entire module if the parent 'chidon' category or 'Limmud Schedule' subcategory is turned OFF
  if (selectedCategories?.chidon === false) return null;
  if (selectedSubCategories && selectedSubCategories['Limmud Schedule'] === false) return null;

  // 2. Get ALL Limmud Schedule events for this day (ALWAYS shows all books 1-5, ignore Book 1-5 toggles here)
  const limmudEvents = (events || []).filter((e) => e.subCategory === 'Limmud Schedule');

  if (limmudEvents.length === 0) return null;

  // Helper JSX for rendering Day Description side-by-side cards
  const renderDayDescriptionCards = () => (
    <>
      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-950">
        <ChidonIcon size={14} color="#b48a18" className="shrink-0" />
        <span className="truncate">Limmud Schedule</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 w-full">
        {limmudEvents.map((ev) => {
          const rawRange = ev.rangeValue || ev.title;
          const { label, raw } = parseUnitData(rawRange);

          return (
            <div
              key={ev.id}
              className="@container flex flex-col items-center justify-center bg-white border border-amber-300/70 rounded-xl px-1 py-1.5 text-center shadow-2xs min-w-0"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <BookNumberIcon number={ev.bookNumber || 1} size={15} color="#b48a18" />
                <span className="hidden @[40px]:inline text-[9.5px] font-bold text-amber-900 uppercase tracking-tight whitespace-nowrap">
                  Book {ev.bookNumber}
                </span>
              </div>

              <span className="text-[8px] font-extrabold text-amber-800/80 tracking-wider leading-none mb-0.5">
                {label}
              </span>

              <span className="text-[11px] font-black text-[#15265c] font-mono leading-none whitespace-nowrap">
                {raw}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );

  // Helper JSX for rendering Week View stacked rows
  const renderWeekViewRows = () => (
    <>
      <div className="flex items-start gap-1 text-[11px] font-black uppercase tracking-wider text-amber-950 leading-tight">
        <ChidonIcon size={14} color="#b48a18" className="shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span>Limmud</span>
          <span>Schedule</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1 w-full">
        {limmudEvents.map((ev) => {
          const rawRange = ev.rangeValue || ev.title;
          const { isRange, raw, charLength } = parseUnitData(rawRange);
          const showUnitsPrefix = !isRange || charLength <= 4;

          return (
            <div
              key={ev.id}
              className="flex items-center justify-between bg-white border border-amber-300/70 rounded-lg px-1.5 py-1 shadow-2xs min-w-0"
            >
              <div className="flex items-center shrink-0">
                <BookNumberIcon number={ev.bookNumber || 1} size={14} color="#b48a18" />
              </div>

              <span className="text-[10px] font-black text-[#15265c] font-mono leading-none whitespace-nowrap truncate ml-1">
                {!isRange
                  ? `Unit ${raw}`
                  : showUnitsPrefix
                  ? `Units ${raw}`
                  : raw}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="bg-[#fffbeb] border border-amber-300/80 rounded-xl p-2 shadow-2xs space-y-1.5 my-1.5 w-full overflow-hidden">
      {variant === 'dayDescription' ? (
        renderDayDescriptionCards()
      ) : (
        <>
          <div className="block sm:hidden space-y-1.5">
            {renderDayDescriptionCards()}
          </div>
          <div className="hidden sm:block space-y-1.5">
            {renderWeekViewRows()}
          </div>
        </>
      )}
    </div>
  );
};