import React from 'react';
import {
  ExternalLink,
  ListTodo,
  Calendar as CalendarIcon,
  Clock,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import { CalendarDay } from '../types';
import { CATEGORIES, isCCMeeting } from '../data/categories';
import { getDayRoutine } from '../data/dayDescriptions';
import { getGoogleCalendarUrl } from '../utils/exporter';
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

interface DayDescriptionSectionProps {
  day: CalendarDay;
}

export const DayDescriptionSection: React.FC<DayDescriptionSectionProps> = ({ day }) => {
  const routine = getDayRoutine(day.dayOfWeek);

  const isHachayolIssue = (ev: CalendarDay['events'][0]): boolean => {
    if (ev.category !== 'hachayol_battlefront') return false;
    if (ev.subCategory === 'Battlefront Report') return false;
    if (ev.title.toLowerCase().includes('battlefront')) return false;
    return (
      ev.subCategory === 'Hachayol Issue' ||
      ev.title.toLowerCase().includes('hachayol')
    );
  };

  type EventRenderItem =
    | { type: 'single'; event: CalendarDay['events'][0] }
    | { type: 'hachayol_group'; events: CalendarDay['events'] };

  const renderItems: EventRenderItem[] = [];
  let currentHachayolBatch: CalendarDay['events'] = [];

  for (const ev of day.events || []) {
    if (isHachayolIssue(ev)) {
      currentHachayolBatch.push(ev);
    } else {
      if (currentHachayolBatch.length > 0) {
        if (currentHachayolBatch.length === 1) {
          renderItems.push({ type: 'single', event: currentHachayolBatch[0] });
        } else {
          renderItems.push({ type: 'hachayol_group', events: currentHachayolBatch });
        }
        currentHachayolBatch = [];
      }
      renderItems.push({ type: 'single', event: ev });
    }
  }

  if (currentHachayolBatch.length > 0) {
    if (currentHachayolBatch.length === 1) {
      renderItems.push({ type: 'single', event: currentHachayolBatch[0] });
    } else {
      renderItems.push({ type: 'hachayol_group', events: currentHachayolBatch });
    }
  }

  const renderEventCard = (ev: CalendarDay['events'][0]) => {
    const cat = CATEGORIES[ev.category];
    const gcalUrl = getGoogleCalendarUrl(day, ev);

    return (
      <div
        key={ev.id}
        className={`p-3 rounded-xl border flex flex-col justify-between gap-2 text-left shadow-2xs h-full ${
          cat ? `${cat.bgColor} ${cat.borderColor}` : 'bg-[#edf4fc] border-[#b4cae8]'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap">
            {(() => {
              const isCC = isCCMeeting(ev);
              return (
                <span
                  className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${cat?.color || '#555'}20`,
                    color: cat?.color || '#333',
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
                      size={19}
                      className="shrink-0"
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
                        className="shrink-0"
                      />
                      ) : ev.category === 'promotion_ceremony' ? (
                      <PromotionCeremonyIcon
                        size={16}
                        className="shrink-0 -mx-[3px]"
                      />
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cat?.color || '#555' }}
                    />
                  )}
                  <span>
                    {isCC
                      ? 'Meetings & Chidon'
                      : (ev.subCategory && cat?.name && ev.subCategory.toLowerCase().trim() !== cat.name.toLowerCase().trim()
                        ? `${cat.name} • ${ev.subCategory}`
                        : cat?.name || ev.category)}
                  </span>
                </span>
              );
            })()}

            {ev.isGlobal && (
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200 flex items-center gap-0.5">
                <Globe className="w-2.5 h-2.5" /> Global
              </span>
            )}
          </div>

          <h5 className={`text-xs sm:text-[13px] font-bold ${cat?.textColor || 'text-slate-900'} leading-snug`}>
            {ev.title}
          </h5>

          {ev.time && (
            <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1 font-medium">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{ev.time} (New York / EST)</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 flex-wrap">
          {ev.link && (
            <a
              href={ev.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15265c] hover:bg-[#1e3a8a] text-white border border-[#15265c] text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
              title={`Open ${ev.buttonText || ev.title}`}
            >
              <span>{ev.buttonText || 'Open Link'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            </a>
          )}
          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#15265c] hover:text-[#1e3a8a] bg-[#edf4fc] hover:bg-[#e4effc] px-2 py-1 rounded border border-[#b4cae8] shadow-2xs transition-colors"
            title="Add to Google Calendar"
          >
            <CalendarIcon className="w-2.5 h-2.5 text-[#15265c]" />
            <span>Google Cal</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Daily Tasks Section (Excluded for Shabbos) */}
      {routine && (
        <div className="bg-[#cde0f7] border border-[#9ec1e8] rounded-xl p-3 sm:p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-[#9ec1e8] pb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                <ListTodo className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#15265c] tracking-tight">
                {routine.title}
              </h4>
            </div>
            <span className="text-[11px] font-hebrew text-slate-600 font-medium">
              {routine.hebrewDayName}
            </span>
          </div>

          {/* Task items & interactive buttons */}
          <div className="space-y-2 text-xs">
            {routine.items.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 bg-[#eaf3fc] hover:bg-[#f2f8fe] p-2.5 rounded-lg border border-[#a8c8ec] transition-colors shadow-2xs"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span className="text-xs sm:text-[13px] font-medium leading-snug text-slate-800 break-words">
                    {item.text}
                  </span>
                </div>

                {item.action && (
                  <div className="flex justify-end pt-1 border-t border-[#a8c8ec]/50">
                    <a
                      href={item.action.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15265c] hover:bg-[#1e3a8a] text-white border border-[#15265c] text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                      title={`Open ${item.action.label}`}
                    >
                      <span className="text-center">{item.action.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Events for this Day */}
      {day.events && day.events.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#15265c] font-bold px-0.5">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Events & Milestones ({day.events.length})</span>
            </span>
          </div>

          <div className="space-y-2">
            {renderItems.map((item, groupIdx) => {
              if (item.type === 'single') {
                return (
                  <div key={item.event.id || groupIdx}>
                    {renderEventCard(item.event)}
                  </div>
                );
              }

              const count = item.events.length;
              const isOdd = count % 2 !== 0;

              return (
                <div
                  key={`hachayol-group-${groupIdx}`}
                  className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-2 gap-2 items-stretch"
                >
                  {item.events.map((ev, evIdx) => {
                    const isLastAndOdd = isOdd && evIdx === count - 1;
                    return (
                      <div
                        key={ev.id || evIdx}
                        className={isLastAndOdd ? 'min-[450px]:col-span-2 sm:col-span-2' : 'min-[450px]:col-span-1 sm:col-span-1'}
                      >
                        {renderEventCard(ev)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : !routine ? (
        <div className="text-center py-3 text-xs text-slate-600 italic">
          No special events or deadlines scheduled for this date.
        </div>
      ) : null}
    </div>
  );
};
