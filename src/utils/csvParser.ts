import { CalendarDay, CalendarEvent } from '../types';

const HEB_NUMERAL_MAP: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
  'יא': 11, 'יב': 12, 'יג': 13, 'יד': 14, 'טו': 15, 'טז': 16, 'יז': 17, 'יח': 18, 'יט': 19,
  'כ': 20, 'כא': 21, 'כב': 22, 'כג': 23, 'כד': 24, 'כה': 25, 'כו': 26, 'כז': 27, 'כח': 28, 'כט': 29, 'ל': 30,
};

const HEBREW_MONTH_NAMES_EN: Record<string, string> = {
  'אב': 'Menachem Av',
  'אלול': 'Elul',
  'תשרי': 'Tishrei',
  'חשון': 'Marcheshvan',
  'כסלו': 'Kislev',
  'טבת': 'Teves',
  'שבט': 'Shevat',
  'אדר א': 'Adar I',
  'אדר ב': 'Adar II',
  'ניסן': 'Nissan',
  'אייר': 'Iyar',
  'סיון': 'Sivan',
  'תמוז': 'Tammuz',
};

const DAYS_OF_WEEK = new Set([
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'shabbos', 'shabbat'
]);

function isDayRow(row: string[] | undefined): boolean {
  if (!row || row.length === 0) return false;
  const col0 = (row[0] || '').trim().toLowerCase();
  const col2 = (row[2] || '').trim();
  if (DAYS_OF_WEEK.has(col0)) return true;
  if (col2 && /^\d+\s+[A-Za-z]+/i.test(col2)) return true;
  return false;
}

function splitCommaList(str: string | undefined): string[] {
  if (!str) return [];
  return str.split(',').map((s) => s.trim());
}

function getColData(
  mainRow: string[],
  subRows: string[][],
  colIndex: number
): { text: string; shortTitle?: string; link?: string; buttonText?: string; rawShortTitle?: string; rawLink?: string; rawButtonText?: string } {
  const text = (mainRow[colIndex] || '').trim();
  if (!text) return { text: '' };

  // Sub-row 0: shorter text (for month calendar view when cards are not expanded)
  const rawShort = subRows[0]?.[colIndex]?.trim();
  const shortTitle = rawShort && rawShort.length > 0 ? rawShort : undefined;

  // Sub-row 1: link (for expanded view)
  const rawLink = subRows[1]?.[colIndex]?.trim();
  const link = rawLink && rawLink.length > 0 ? rawLink : undefined;

  // Sub-row 2: text for button with link
  const rawButtonText = subRows[2]?.[colIndex]?.trim();
  const buttonText = rawButtonText && rawButtonText.length > 0 ? rawButtonText : undefined;

  return {
    text,
    shortTitle,
    link,
    buttonText,
    rawShortTitle: rawShort,
    rawLink,
    rawButtonText,
  };
}

export function parseCSVToCalendarDays(csvText: string): { success: boolean; data?: CalendarDay[]; error?: string } {
  try {
    const rows = parseRawCSV(csvText);
    if (rows.length < 3) {
      return { success: false, error: 'CSV file is too short or missing header rows.' };
    }

    const monthMap: Record<string, number> = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };

    let currentYear = 2026;
    let prevMonthIndex = 7; // August
    let hebYear = 5786;
    let hebMonthIndex = 0;
    let lastHebMonth = '';

    const calendarDays: CalendarDay[] = [];
    let eventIdCounter = 1;

    for (let r = 2; r < rows.length; r++) {
      const row = rows[r];
      if (!row || !isDayRow(row)) continue;

      // Collect any sub-rows belonging to this day (up to the next day row)
      const subRows: string[][] = [];
      while (r + 1 < rows.length && !isDayRow(rows[r + 1])) {
        r++;
        subRows.push(rows[r]);
      }

      const dayOfWeek = (row[0] || '').trim() as any;
      const hebrewDate = (row[1] || '').trim();
      const englishDateStr = (row[2] || '').trim();
      const parsha = (row[3] || '').trim();

      // Check if sub-rows under column D (index 3) specify "YT"
      const hasYT = subRows.some((sr) => (sr[3] || '').trim().toUpperCase() === 'YT');

      const parts = englishDateStr.split(' ');
      const dayStr = parts[0];
      const monthName = parts.slice(1).join(' ').toLowerCase();

      const mIndex = monthMap[monthName] !== undefined ? monthMap[monthName] : 0;
      if (mIndex < prevMonthIndex) {
        currentYear++;
      }
      prevMonthIndex = mIndex;

      const dayNum = parseInt(dayStr, 10) || 1;
      const mm = String(mIndex + 1).padStart(2, '0');
      const dd = String(dayNum).padStart(2, '0');
      const isoDate = `${currentYear}-${mm}-${dd}`;

      // Hebrew Date handling
      const hebParts = hebrewDate.split(/\s+/);
      const hebDayRaw = hebParts[0] || '';
      const hebMonth = hebParts.slice(1).join(' ');
      const cleanDayStr = hebDayRaw.replace(/["'\u05F4\u05F3]/g, '').trim();
      const hebDayNum = HEB_NUMERAL_MAP[cleanDayStr] || 1;

      if (hebMonth === 'תשרי' && hebYear === 5786) {
        hebYear = 5787;
      }

      if (lastHebMonth !== hebMonth) {
        if (lastHebMonth !== '') {
          hebMonthIndex++;
        }
        lastHebMonth = hebMonth;
      }

      const hebMonthEn = HEBREW_MONTH_NAMES_EN[hebMonth] || hebMonth;
      const hebMonthKey = `${hebYear}-${hebMonth}`;
      const hebYearHebrew = hebYear === 5786 ? 'ה׳תשפ״ו' : 'ה׳תשפ״ז';

      const events: CalendarEvent[] = [];

      // 1. Chidon 5787
      const khk = getColData(row, subRows, 5);
      if (khk.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'chidon',
          subCategory: 'KHK Program & Tests',
          title: khk.text,
          shortTitle: khk.shortTitle,
          link: khk.link,
          buttonText: khk.buttonText,
          rawText: khk.text,
        });
      }

      const shipments = getColData(row, subRows, 6);
      if (shipments.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'chidon',
          subCategory: 'Shipments & Materials',
          title: shipments.text,
          shortTitle: shipments.shortTitle,
          link: shipments.link,
          buttonText: shipments.buttonText,
          rawText: shipments.text,
        });
      }

      const reg = getColData(row, subRows, 7);
      if (reg.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'chidon',
          subCategory: 'Registration & Enrollment',
          title: reg.text,
          shortTitle: reg.shortTitle,
          link: reg.link,
          buttonText: reg.buttonText,
          rawText: reg.text,
        });
      }

      const trips1 = getColData(row, subRows, 8);
      if (trips1.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'chidon',
          subCategory: 'Trips & Special Events',
          title: trips1.text,
          shortTitle: trips1.shortTitle,
          link: trips1.link,
          buttonText: trips1.buttonText,
          rawText: trips1.text,
        });
      }

      const trips2 = getColData(row, subRows, 9);
      if (trips2.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'chidon',
          subCategory: 'Trips & Special Events',
          title: trips2.text,
          shortTitle: trips2.shortTitle,
          link: trips2.link,
          buttonText: trips2.buttonText,
          rawText: trips2.text,
        });
      }

      const chidonCurriculum = getColData(row, subRows, 10);
      if (chidonCurriculum.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'chidon',
          subCategory: 'Chidon Tests & Curriculum',
          title: chidonCurriculum.text,
          shortTitle: chidonCurriculum.shortTitle,
          link: chidonCurriculum.link,
          buttonText: chidonCurriculum.buttonText,
          rawText: chidonCurriculum.text,
        });
      }

      // 2. Hachayol & Battlefront Report
      const hachayol = getColData(row, subRows, 12);
      if (hachayol.text) {
        const issues = splitCommaList(hachayol.text).filter(Boolean);
        const shortTitles = splitCommaList(hachayol.rawShortTitle);
        const links = splitCommaList(hachayol.rawLink);
        const buttonTexts = splitCommaList(hachayol.rawButtonText);

        issues.forEach((issue, idx) => {
          let itemShortTitle: string | undefined = undefined;
          if (shortTitles.length > idx && shortTitles[idx]) {
            itemShortTitle = shortTitles[idx];
          } else if (shortTitles.length === 1 && shortTitles[0]) {
            itemShortTitle = issues.length > 1 ? `${shortTitles[0]} #${issue}` : shortTitles[0];
          }

          let itemLink: string | undefined = undefined;
          if (links.length > idx && links[idx]) {
            itemLink = links[idx];
          } else if (links.length === 1 && links[0]) {
            itemLink = links[0];
          }

          let itemBtnText: string | undefined = undefined;
          if (buttonTexts.length > idx && buttonTexts[idx]) {
            itemBtnText = buttonTexts[idx];
          } else if (buttonTexts.length === 1 && buttonTexts[0]) {
            itemBtnText = buttonTexts[0];
          }

          events.push({
            id: `ev-${eventIdCounter++}`,
            category: 'hachayol_battlefront',
            subCategory: 'Hachayol Issue',
            title: `Hachayol Issue #${issue}`,
            shortTitle: itemShortTitle,
            link: itemLink,
            buttonText: itemBtnText,
            rawText: `Hachayol Issue #${issue}`,
          });
        });
      }

      const bfr = getColData(row, subRows, 13);
      if (bfr.text) {
        const issues = splitCommaList(bfr.text).filter(Boolean);
        const shortTitles = splitCommaList(bfr.rawShortTitle);
        const links = splitCommaList(bfr.rawLink);
        const buttonTexts = splitCommaList(bfr.rawButtonText);

        issues.forEach((issue, idx) => {
          let itemShortTitle: string | undefined = undefined;
          if (shortTitles.length > idx && shortTitles[idx]) {
            itemShortTitle = shortTitles[idx];
          } else if (shortTitles.length === 1 && shortTitles[0]) {
            itemShortTitle = issues.length > 1 ? `${shortTitles[0]} #${issue}` : shortTitles[0];
          }

          let itemLink: string | undefined = undefined;
          if (links.length > idx && links[idx]) {
            itemLink = links[idx];
          } else if (links.length === 1 && links[0]) {
            itemLink = links[0];
          }

          let itemBtnText: string | undefined = undefined;
          if (buttonTexts.length > idx && buttonTexts[idx]) {
            itemBtnText = buttonTexts[idx];
          } else if (buttonTexts.length === 1 && buttonTexts[0]) {
            itemBtnText = buttonTexts[0];
          }

          events.push({
            id: `ev-${eventIdCounter++}`,
            category: 'hachayol_battlefront',
            subCategory: 'Battlefront Report',
            title: `Battlefront Report #${issue}`,
            shortTitle: itemShortTitle,
            link: itemLink,
            buttonText: itemBtnText,
            rawText: `Battlefront Report #${issue}`,
          });
        });
      }

      // 3. Rallies
      const isGlobal = (row[15] || '').trim().toLowerCase().includes('global') || (subRows[0]?.[15] || '').trim().toLowerCase().includes('global');
      const rally = getColData(row, subRows, 16);
      if (rally.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'rallies',
          subCategory: isGlobal ? 'Global Rally' : 'Rally',
          title: isGlobal ? `Global Rally: ${rally.text}` : `Rally: ${rally.text}`,
          shortTitle: rally.shortTitle,
          link: rally.link,
          buttonText: rally.buttonText,
          rawText: rally.text,
          isGlobal,
        });
      }

      // 4. Meetings
      const bcMeeting = getColData(row, subRows, 18);
      if (bcMeeting.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'meetings',
          subCategory: 'Base Commander Meeting',
          title: `Base Commander Meeting (${bcMeeting.text} EST)`,
          shortTitle: bcMeeting.shortTitle,
          link: bcMeeting.link,
          buttonText: bcMeeting.buttonText,
          time: bcMeeting.text,
          rawText: `BC: ${bcMeeting.text}`,
        });
      }

      const ccMeeting = getColData(row, subRows, 19);
      if (ccMeeting.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'meetings',
          categories: ['meetings', 'chidon'],
          subCategory: 'Chidon Coordinator Meeting',
          title: `Chidon Coordinator Meeting (${ccMeeting.text} EST)`,
          shortTitle: ccMeeting.shortTitle,
          link: ccMeeting.link,
          buttonText: ccMeeting.buttonText,
          time: ccMeeting.text,
          rawText: `CC: ${ccMeeting.text}`,
        });
      }

      // 5. Promotion Ceremony
      const promo = getColData(row, subRows, 21);
      if (promo.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'promotion_ceremony',
          subCategory: 'Promotion Ceremony',
          title: promo.text,
          shortTitle: promo.shortTitle,
          link: promo.link,
          buttonText: promo.buttonText,
          rawText: promo.text,
        });
      }

      // 6. Yomei Depagra
      const yomeiDate = getColData(row, subRows, 23);
      const shading = (row[24] || '').trim() || (subRows[0]?.[24] || '').trim();
      if (yomeiDate.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'yomei_depagra',
          subCategory: 'Yomei Depagra',
          title: yomeiDate.text,
          shortTitle: yomeiDate.shortTitle,
          link: yomeiDate.link,
          buttonText: yomeiDate.buttonText,
          rawText: yomeiDate.text,
          shadingLevel: shading,
        });
      }

      // 7. Niggunim
      const niggun = getColData(row, subRows, 26);
      if (niggun.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'niggunim',
          subCategory: 'Niggun of the Week',
          title: niggun.text,
          shortTitle: niggun.shortTitle,
          link: niggun.link,
          buttonText: niggun.buttonText,
          rawText: niggun.text,
        });
      }

      // 8. 5M Raffles
      const m5Start = getColData(row, subRows, 28);
      if (m5Start.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'raffle_5m',
          subCategory: '5M Raffle Mission Start',
          title: `5M Mission Starts: ${m5Start.text}`,
          shortTitle: m5Start.shortTitle,
          link: m5Start.link,
          buttonText: m5Start.buttonText,
          rawText: m5Start.text,
        });
      }

      const m5End = getColData(row, subRows, 29);
      if (m5End.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'raffle_5m',
          subCategory: '5M Raffle Mission End',
          title: `5M Mission Ends: ${m5End.text}`,
          shortTitle: m5End.shortTitle,
          link: m5End.link,
          buttonText: m5End.buttonText,
          rawText: m5End.text,
        });
      }

      const win1 = getColData(row, subRows, 30);
      if (win1.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'raffle_5m',
          subCategory: '5M Winners Announced',
          title: `5M Winners Announced: ${win1.text}`,
          shortTitle: win1.shortTitle,
          link: win1.link,
          buttonText: win1.buttonText,
          rawText: win1.text,
        });
      }

      const win2 = getColData(row, subRows, 31);
      if (win2.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'raffle_5m',
          subCategory: '5M Winners Announced',
          title: `5M Winners Announced: ${win2.text}`,
          shortTitle: win2.shortTitle,
          link: win2.link,
          buttonText: win2.buttonText,
          rawText: win2.text,
        });
      }

      const win3 = getColData(row, subRows, 32);
      if (win3.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'raffle_5m',
          subCategory: '5M Winners Announced',
          title: `5M Winners Announced: ${win3.text}`,
          shortTitle: win3.shortTitle,
          link: win3.link,
          buttonText: win3.buttonText,
          rawText: win3.text,
        });
      }

      // 9. 60M Raffle
      const m60Starts = getColData(row, subRows, 34);
      if (m60Starts.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'raffle_60m',
          subCategory: '60M Raffle Starts',
          title: m60Starts.text,
          shortTitle: m60Starts.shortTitle,
          link: m60Starts.link,
          buttonText: m60Starts.buttonText,
          rawText: m60Starts.text,
        });
      }

      const m60Ends = getColData(row, subRows, 35);
      if (m60Ends.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'raffle_60m',
          subCategory: '60M Raffle Ends',
          title: m60Ends.text,
          shortTitle: m60Ends.shortTitle,
          link: m60Ends.link,
          buttonText: m60Ends.buttonText,
          rawText: m60Ends.text,
        });
      }

      // 10. Shabbos Mevorchim
      const smDate = getColData(row, subRows, 37);
      if (smDate.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'shabbos_mevorchim',
          subCategory: 'Shabbos Mevorchim',
          title: `שבת מברכים ${smDate.text}`,
          shortTitle: smDate.shortTitle,
          link: smDate.link,
          buttonText: smDate.buttonText,
          rawText: smDate.text,
        });
      }

      const smDue = getColData(row, subRows, 38);
      if (smDue.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'shabbos_mevorchim',
          subCategory: 'Shabbos Mevorchim Data Due',
          title: `Shabbos Mevorchim Data Due: ${smDue.text}`,
          shortTitle: smDue.shortTitle,
          link: smDue.link,
          buttonText: smDue.buttonText,
          rawText: smDue.text,
        });
      }

      // 11. CP
      const cpSenior = getColData(row, subRows, 40);
      if (cpSenior.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'cp',
          subCategory: 'Senior (5-8)',
          title: `CP Senior (5-8): ${cpSenior.text}`,
          shortTitle: cpSenior.shortTitle,
          link: cpSenior.link,
          buttonText: cpSenior.buttonText,
          rawText: cpSenior.text,
        });
      }

      const cpJunior = getColData(row, subRows, 41);
      if (cpJunior.text) {
        events.push({
          id: `ev-${eventIdCounter++}`,
          category: 'cp',
          subCategory: 'Foundations/Junior',
          title: `CP Junior: ${cpJunior.text}`,
          shortTitle: cpJunior.shortTitle,
          link: cpJunior.link,
          buttonText: cpJunior.buttonText,
          rawText: cpJunior.text,
        });
      }

      calendarDays.push({
        isoDate,
        year: currentYear,
        month: mIndex + 1,
        day: dayNum,
        dayOfWeek,
        hebrewDate,
        hebrewDay: hebDayRaw,
        hebrewDayNum: hebDayNum,
        hebrewMonth: hebMonth,
        hebrewMonthEn: hebMonthEn,
        hebrewYear: hebYear,
        hebrewYearHebrew: hebYearHebrew,
        hebrewMonthKey: hebMonthKey,
        hebrewMonthIndex: hebMonthIndex,
        englishDate: englishDateStr,
        parsha,
        hideParshaPrefix: hasYT ? true : undefined,
        rawRow: row,
        events,
      });
    }

    // Propagate hideParshaPrefix across the week:
    // If Shabbos of a week (or any day in that week) has YT under column D (parsha),
    // mark all days in that week with hideParshaPrefix = true.
    let currentWeek: CalendarDay[] = [];
    for (let i = 0; i < calendarDays.length; i++) {
      const d = calendarDays[i];
      currentWeek.push(d);
      if (d.dayOfWeek === 'Shabbos' || i === calendarDays.length - 1) {
        const weekHasYT = currentWeek.some((day) => day.hideParshaPrefix);
        if (weekHasYT) {
          for (const day of currentWeek) {
            day.hideParshaPrefix = true;
          }
        }
        currentWeek = [];
      }
    }

    // Also propagate to any days sharing the same Yom Tov parsha name
    const yomTovParshas = new Set(
      calendarDays.filter((d) => d.hideParshaPrefix && d.parsha).map((d) => d.parsha)
    );
    for (const d of calendarDays) {
      if (d.parsha && yomTovParshas.has(d.parsha)) {
        d.hideParshaPrefix = true;
      }
    }

    return { success: true, data: calendarDays };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to parse CSV file.' };
  }
}

function parseRawCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let curr = '';

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        curr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(curr);
      curr = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') i++;
      row.push(curr);
      rows.push(row);
      row = [];
      curr = '';
    } else {
      curr += c;
    }
  }

  if (curr || row.length > 0) {
    row.push(curr);
    rows.push(row);
  }

  return rows;
}
