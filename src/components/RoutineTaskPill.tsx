import React from 'react';
import { ListTodo, ArrowUpRight } from 'lucide-react';
import { DayRoutineItem } from '../data/dayDescriptions';

interface Props {
  item: DayRoutineItem;
  variant?: 'grid' | 'week';
}

export const RoutineTaskPill: React.FC<Props> = ({ item, variant = 'grid' }) => {
  if (variant === 'week') {
    return (
      <div className="bg-[#cde0f7] border border-[#9ec1e8] rounded-xl p-2.5 space-y-1 shadow-2xs text-xs my-1 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-[#15265c] text-[11px]">
            <ListTodo className="w-3 h-3 text-amber-700 shrink-0" />
            <span>Daily Task</span>
          </div>

          {item.action && (
            <a
              href={item.action.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded-md bg-[#15265c] hover:bg-[#1e3a8a] text-amber-300 transition-all shadow-2xs shrink-0"
              title={item.action.label || 'Open Link'}
            >
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="text-[11.5px] font-medium text-slate-800 leading-snug pr-1">
          {item.text}
        </div>
      </div>
    );
  }

  // Month & Year Grid Pill View
  return (
    <div
      className="text-[8.5px] sm:text-[9px] leading-tight px-1.5 py-1 rounded-lg border flex items-start justify-between gap-1.5 font-semibold shadow-2xs bg-[#cde0f7] text-[#15265c] border-[#9ec1e8] min-w-0"
      title={`Routine Task: ${item.text}`}
    >
      <div className="flex items-start gap-1 min-w-0 flex-1">
        <ListTodo className="w-2.5 h-2.5 text-amber-700 shrink-0 mt-0.5" />
        <span className="leading-snug whitespace-normal break-words">{item.text}</span>
      </div>

      {item.action && (
        <a
          href={item.action.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-0.5 rounded bg-[#15265c] hover:bg-[#1e3a8a] text-amber-300 transition-all shrink-0 cursor-pointer"
          title={item.action.label || 'Open Link'}
        >
          <ArrowUpRight className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  );
};