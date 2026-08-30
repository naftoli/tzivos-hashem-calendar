import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Sparkles,
  Link2,
} from 'lucide-react';
import { DEFAULT_PUBLISHED_SHEET_CSV_URL } from '../utils/googleSheets';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSyncing: boolean;
  lastSyncedTime: string | null;
  totalDays: number;
  totalEvents: number;
  onSync: (sheetUrl?: string) => Promise<void>;
  currentSheetUrl: string;
}

export const SheetSyncModal: React.FC<SheetSyncModalProps> = ({
  isOpen,
  onClose,
  isSyncing,
  lastSyncedTime,
  totalDays,
  totalEvents,
  onSync,
  currentSheetUrl,
}) => {
  const [customUrl, setCustomUrl] = useState(currentSheetUrl || DEFAULT_PUBLISHED_SHEET_CSV_URL);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCustomUrl(currentSheetUrl || DEFAULT_PUBLISHED_SHEET_CSV_URL);
      setFeedback(null);
    }
  }, [isOpen, currentSheetUrl]);

  if (!isOpen) return null;

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Never';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' (' + d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    } catch {
      return isoString;
    }
  };

  const handleTriggerSync = async () => {
    setFeedback(null);
    try {
      await onSync(customUrl.trim());
      setFeedback({ message: 'Successfully updated from Google Sheets!', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err?.message || 'Sync failed. Please verify sheet permissions.', type: 'error' });
    }
  };

  const handleResetDefault = () => {
    setCustomUrl(DEFAULT_PUBLISHED_SHEET_CSV_URL);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      id="sheet-sync-modal-overlay"
    >
      <div
        className="bg-[#edf4fc] rounded-2xl border border-[#c8d8ee] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#e1ecfa] text-[#15265c] p-5 flex items-start justify-between border-b border-[#c8d8ee]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#15265c] flex items-center gap-2">
                Google Sheets Live Sync
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Connected to the Tzivos Hashem 5787 Master Calendar Sheet.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-[#d5e4f7] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-slate-800 text-xs bg-[#edf4fc]">
          {/* Sync Stats Banner */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#e1ecfa] border border-[#c8d8ee] rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Total Days</div>
              <div className="text-base font-bold text-[#15265c] mt-0.5 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                {totalDays}
              </div>
            </div>

            <div className="bg-[#e1ecfa] border border-[#c8d8ee] rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Total Events</div>
              <div className="text-base font-bold text-[#15265c] mt-0.5 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                {totalEvents}
              </div>
            </div>

            <div className="bg-[#e1ecfa] border border-[#c8d8ee] rounded-xl p-3 text-center">
              <div className="text-[11px] text-slate-500 font-medium">Last Synced</div>
              <div className="text-xs font-bold text-emerald-800 mt-1 flex items-center justify-center gap-1 truncate">
                <Clock className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span className="truncate">{lastSyncedTime ? formatTime(lastSyncedTime) : 'Ready'}</span>
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Sheet URL Input / View */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#15265c] flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-amber-600" />
                Published Google Sheet CSV URL
              </label>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-[11px] text-[#15265c] hover:underline font-semibold cursor-pointer"
              >
                Reset Default
              </button>
            </div>
            <input
              type="text"
              value={customUrl ?? ''}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
              className="w-full px-3 py-2 bg-[#f5f9fe] border border-[#c8d8ee] rounded-xl text-xs text-[#15265c] font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15265c]"
            />
          </div>

          {/* How It Works Notice */}
          <div className="p-3 bg-[#e1ecfa] rounded-xl border border-[#c8d8ee] text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-[#15265c] flex items-center gap-1.5">
              <span>💡 How Google Sheet changes take effect:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                Whenever you edit the spreadsheet, Google publishes changes automatically.
              </li>
              <li>
                Click <strong className="text-[#15265c]">"Sync Now"</strong> at any time to immediately pull all updated dates, events, times, and categories.
              </li>
              <li>
                The calendar also automatically updates when returning to this tab.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#e1ecfa] p-4 border-t border-[#c8d8ee] flex items-center justify-between gap-2">
          <a
            href="https://docs.google.com/spreadsheets/d/e/2PACX-1vTdBNVSvD3QTautgFuDNFtnC0Y8xbcoHNmQ7zerwjhN2lv9kuwbsdZU9XdNXl_lNPqIIvIoU7OnGirK/pubhtml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#15265c] hover:underline font-medium"
          >
            <span>View Live Google Sheet</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#d5e4f7] hover:text-[#15265c] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
