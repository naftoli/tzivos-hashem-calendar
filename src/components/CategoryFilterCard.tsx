import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, SlidersHorizontal, BookOpen } from 'lucide-react';
import { CalendarCategory } from '../types';
import { CATEGORIES, CATEGORY_SUBCATEGORIES, CATEGORY_KEYS } from '../data/categories';
import { BookNumberIcon } from './BookNumberIcon';
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
  contests_sales: ['Contests &', 'Sales'],
};

interface CategoryFilterCardProps {
  categoryKey: CalendarCategory;
  isSelected: boolean;
  count?: number;
  onToggleCategory: (cat: CalendarCategory) => void;
  selectedSubCategories?: Record<string, boolean>;
  onToggleSubCategory?: (subCat: string) => void;
}

export const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  categoryKey,
  isSelected,
  count = 0,
  onToggleCategory,
  selectedSubCategories = {},
  onToggleSubCategory,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const catInfo = CATEGORIES[categoryKey];
  const subCategories = CATEGORY_SUBCATEGORIES[categoryKey] || [];
  const lines = CATEGORY_LINES[categoryKey] || [catInfo?.name || categoryKey];

  const limmudBooks = [1, 2, 3, 4, 5];

  // Compute card index in CATEGORY_KEYS
  const cardIndex = CATEGORY_KEYS.indexOf(categoryKey);

  // Check if dropdown trigger should be visible (> 1 subcategory or is chidon with books)
  const hasMultipleSubCategories = subCategories.length > 1 || categoryKey === 'chidon';

  // Close dropdown if main category gets unchecked
  useEffect(() => {
    if (!isSelected) {
      setIsDropdownOpen(false);
    }
  }, [isSelected]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Responsive 2x2 Overlay Positioning Logic across Breakpoints
  const getOverlayPositionClasses = () => {
    const isMobileRight = cardIndex % 2 === 1;
    const isMobileBottom = cardIndex >= 4;

    const isSmRight = cardIndex % 3 === 2;
    const isSmBottom = cardIndex >= 6;

    const isMdRight = cardIndex % 4 >= 2;
    const isMdBottom = cardIndex >= 4;

    const isLgRight = cardIndex % 6 === 5;
    const isLgBottom = cardIndex >= 6;

    const horizontalClasses = `
      ${isMobileRight ? 'right-0 left-auto' : 'left-0 right-auto'}
      ${isSmRight ? 'sm:right-0 sm:left-auto' : 'sm:left-0 sm:right-auto'}
      ${isMdRight ? 'md:right-0 md:left-auto' : 'md:left-0 md:right-auto'}
      ${isLgRight ? 'lg:right-0 lg:left-auto' : 'lg:left-0 lg:right-auto'}
    `.trim();

    const verticalClasses = `
      ${isMobileBottom ? 'bottom-0 top-auto' : 'top-0 bottom-auto'}
      ${isSmBottom ? 'sm:bottom-0 sm:top-auto' : 'sm:top-0 sm:bottom-auto'}
      ${isMdBottom ? 'md:bottom-0 md:top-auto' : 'md:top-0 md:bottom-auto'}
      ${isLgBottom ? 'lg:bottom-0 lg:top-auto' : 'lg:top-0 lg:bottom-auto'}
    `.trim();

    return `${horizontalClasses} ${verticalClasses}`;
  };

  const renderCategoryIcon = () => {
    switch (categoryKey) {
      case 'chidon':
        return <ChidonIcon size={20} color={catInfo?.color} className="w-5 h-5" />;
      case 'hachayol_battlefront':
        return <HachayolIcon size={20} color={catInfo?.color} className="w-5 h-5" />;
      case 'raffle_5m':
        return <FiveMIcon size={20} className="w-5 h-5" />;
      case 'raffle_60m':
        return <SixtyMIcon size={30} className="w-[30px] h-[30px] -my-0.5" />;
      case 'niggunim':
        return <NiggunIcon size={20} color={catInfo?.color} className="w-5 h-5" />;
      case 'yomei_depagra':
        return <YomeiDepagraIcon size={20} color={catInfo?.color} className="w-5 h-5" />;
      case 'shabbos_mevorchim':
        return <ShabbosMevorchimIcon size={20} color={catInfo?.color} className="w-5 h-5" />;
      case 'rallies':
        return <GlobalRallyIcon size={22} className="w-[22px] h-[22px] -my-0.5" />;
      case 'meetings':
        return <MeetingIcon size={22} className="w-[22px] h-auto" />;
      case 'cp':
        return <CpIcon size={26} className="w-[26px] h-auto -my-1" />;
      case 'promotion_ceremony':
        return <PromotionCeremonyIcon size={26} className="w-[26px] h-auto -my-1" />;
      default:
        return (
          <div
            className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-black/10"
            style={{ backgroundColor: catInfo?.color || '#15265c' }}
          />
        );
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative flex flex-col items-center justify-between p-2.5 rounded-xl text-center transition-all border group min-h-[110px] sm:min-h-[115px] select-none ${
        isSelected
          ? 'bg-[#f5f9fe] border-[#b4cae8] shadow-xs ring-1 ring-[#c8d8ee]'
          : 'bg-[#e1ecfa]/60 opacity-60 border-[#c8d8ee] hover:opacity-90 hover:bg-[#e1ecfa] hover:border-[#b4cae8]'
      }`}
    >
      {/* Top Row: Icon + Count */}
      <button
        type="button"
        className="w-full flex items-center justify-between gap-1.5 cursor-pointer bg-transparent border-0 p-0 text-left"
        onClick={() => onToggleCategory(categoryKey)}
      >
        <div className="w-6 h-6 shrink-0 flex items-center justify-center">
          {renderCategoryIcon()}
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#d2e2f6] text-[#15265c] font-bold border border-[#c8d8ee] leading-none">
          {count}
        </span>
      </button>

      {/* Middle Row: Label Lines */}
      <button
        type="button"
        className="flex-1 flex flex-col items-center justify-center py-1 text-center w-full cursor-pointer bg-transparent border-0 p-0"
        onClick={() => onToggleCategory(categoryKey)}
      >
        {lines.map((line, idx) => (
          <span
            key={idx}
            className="font-semibold text-[11px] sm:text-[11.5px] leading-[14px] text-[#15265c] text-center select-none"
          >
            {line}
          </span>
        ))}
      </button>

      {/* Bottom Row: Checkbox + Conditional Subcategory Trigger */}
      <div className="w-full flex items-center justify-between pt-1 border-t border-[#c8d8ee]/50 mt-1">
        <button
          type="button"
          onClick={() => onToggleCategory(categoryKey)}
          className={`w-4 h-4 rounded flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
            isSelected
              ? 'bg-[#15265c] text-white shadow-2xs'
              : 'border border-[#c8d8ee] bg-white'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {hasMultipleSubCategories && (
          <button
            type="button"
            disabled={!isSelected}
            onClick={() => isSelected && setIsDropdownOpen((prev) => !prev)}
            className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all shadow-2xs ${
              !isSelected
                ? 'opacity-30 border-[#c8d8ee] bg-slate-200 text-slate-400 cursor-not-allowed'
                : isDropdownOpen
                ? 'bg-[#15265c] text-white border-[#15265c] cursor-pointer'
                : 'bg-[#e1ecfa] hover:bg-[#d5e4f7] text-[#15265c] border-[#c8d8ee] cursor-pointer'
            }`}
            title={isSelected ? 'Configure subcategories & books' : 'Enable main category first'}
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* 2x2 GRID OVERLAY PANEL */}
      {isDropdownOpen && isSelected && hasMultipleSubCategories && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className={`absolute ${getOverlayPositionClasses()} z-50 bg-[#f5f9fe] backdrop-blur-md rounded-xl border-2 border-[#15265c] p-2.5 shadow-2xl flex flex-col justify-between text-left animate-in fade-in zoom-in-95 duration-150 w-[calc(200%+0.5rem)] h-[calc(200%+0.5rem)]`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#c8d8ee] pb-1 mb-1 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-[#15265c] uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {categoryKey === 'chidon' ? 'Subcategories & Books' : 'Subcategories'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(false)}
              className="p-1 rounded-lg bg-[#e1ecfa] hover:bg-[#d5e4f7] text-[#15265c] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[160px] pr-0.5 flex-1">
            {/* SECTION 1: Standard Subcategories */}
            <div>
              {categoryKey === 'chidon' && (
                <div className="text-[8.5px] font-extrabold uppercase text-[#15265c]/70 tracking-wider mb-1">
                  Subcategories
                </div>
              )}
              <div className="space-y-0.5">
                {subCategories.map((subCat) => {
                  const isSubActive = selectedSubCategories[subCat] !== false;

                  return (
                    <button
                      type="button"
                      key={subCat}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (onToggleSubCategory) {
                          onToggleSubCategory(subCat);
                        }
                      }}
                      className="w-full flex items-center justify-between gap-1 p-1 rounded-lg hover:bg-[#e1ecfa] cursor-pointer text-[9.5px] font-medium text-[#15265c] transition-colors text-left"
                    >
                      <span className="truncate min-w-0 leading-tight">
                        {subCat}
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                          isSubActive
                            ? 'bg-[#15265c] border-[#15265c] text-white'
                            : 'bg-white border-[#c8d8ee]'
                        }`}
                      >
                        {isSubActive && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Icon-Only Horizontal Row for Chidon Books 1 to 5 */}
            {categoryKey === 'chidon' && (
              <div className="pt-1.5 border-t border-[#c8d8ee]">
                <div className="text-[8.5px] font-extrabold uppercase text-[#15265c]/70 tracking-wider mb-1 flex items-center gap-1">
                  <BookOpen className="w-2.5 h-2.5 text-amber-600" />
                  <span>Individual Limmud Books (1-5)</span>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {limmudBooks.map((num) => {
                    const bookKey = `Book ${num}`;
                    const isBookActive = selectedSubCategories[bookKey] === true;

                    return (
                      <button
                        type="button"
                        key={bookKey}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (onToggleSubCategory) {
                            onToggleSubCategory(bookKey);
                          }
                        }}
                        className={`p-1 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                          isBookActive
                            ? 'bg-[#15265c] border-[#15265c] shadow-xs ring-1 ring-amber-400'
                            : 'bg-white border-[#c8d8ee] hover:bg-[#e1ecfa]'
                        }`}
                        title={`Toggle Book ${num} card in calendar views`}
                      >
                        <BookNumberIcon
                          number={num}
                          size={16}
                          color={isBookActive ? '#fcd34d' : '#b48a18'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsDropdownOpen(false)}
            className="mt-1 w-full py-1 rounded-lg bg-[#15265c] hover:bg-[#1e3a8a] text-white text-[9.5px] font-bold transition-all text-center shadow-2xs cursor-pointer shrink-0"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};