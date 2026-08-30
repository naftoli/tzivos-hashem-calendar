import { CalendarEvent } from '../types';

export function isHachayolIssue(ev: CalendarEvent): boolean {
  if (ev.category !== 'hachayol_battlefront') return false;
  if (ev.subCategory === 'Battlefront Report') return false;
  if (ev.title.toLowerCase().includes('battlefront')) return false;
  return (
    ev.subCategory === 'Hachayol Issue' ||
    ev.title.toLowerCase().includes('hachayol')
  );
}

export function is5MWinnerAnnounced(ev: CalendarEvent): boolean {
  if (ev.category !== 'raffle_5m') return false;
  const sub = (ev.subCategory || '').toLowerCase();
  const title = (ev.title || '').toLowerCase();
  return (
    sub.includes('winner') ||
    sub.includes('announced') ||
    title.includes('winner') ||
    title.includes('announced')
  );
}

export const get5MLabel = (ev: CalendarEvent): string => {
  const sub = (ev.subCategory || '').toLowerCase();
  const title = (ev.title || '').toLowerCase();
  if (sub.includes('start') || title.includes('starts')) {
    return 'Week Starts';
  }
  if (sub.includes('end') || sub.includes('deadline') || title.includes('ends')) {
    return 'Week Ends';
  }
  if (sub.includes('winner') || sub.includes('announced') || title.includes('winner')) {
    return 'Winners Announced';
  }
  return '5M Mission';
};

export const get5MPrize = (ev: CalendarEvent): string => {
  if (ev.shortTitle && ev.shortTitle.trim()) {
    return ev.shortTitle.trim();
  }
  if (ev.rawText && ev.rawText.trim()) {
    return ev.rawText.trim();
  }
  return ev.title.replace(/^5M\s*[^:]*:\s*/i, '').trim() || ev.title;
};

export type DisplayEventRow =
  | { type: 'single'; event: CalendarEvent }
  | { type: 'hachayol_pair'; events: [CalendarEvent, CalendarEvent] }
  | { type: 'five_m_winners_group'; events: CalendarEvent[] };

export function groupEventsForCardDisplay(events: CalendarEvent[]): DisplayEventRow[] {
  const rows: DisplayEventRow[] = [];
  const handled5MIds = new Set<string>();

  // Check if there are multiple 5M winner events in this day
  const all5MWinners = events.filter(is5MWinnerAnnounced);
  const shouldGroup5M = all5MWinners.length > 1;

  let i = 0;
  while (i < events.length) {
    const ev = events[i];

    if (is5MWinnerAnnounced(ev)) {
      if (shouldGroup5M) {
        if (!handled5MIds.has(ev.id)) {
          // Push all 5M winners as one multi-line group
          rows.push({ type: 'five_m_winners_group', events: all5MWinners });
          all5MWinners.forEach((w) => handled5MIds.add(w.id));
        }
        i++;
        continue;
      }
    }

    if (isHachayolIssue(ev)) {
      const hBatch: CalendarEvent[] = [];
      while (i < events.length && isHachayolIssue(events[i])) {
        hBatch.push(events[i]);
        i++;
      }
      for (let j = 0; j < hBatch.length; j += 2) {
        if (j + 1 < hBatch.length) {
          rows.push({ type: 'hachayol_pair', events: [hBatch[j], hBatch[j + 1]] });
        } else {
          rows.push({ type: 'single', event: hBatch[j] });
        }
      }
    } else {
      rows.push({ type: 'single', event: ev });
      i++;
    }
  }
  return rows;
}
