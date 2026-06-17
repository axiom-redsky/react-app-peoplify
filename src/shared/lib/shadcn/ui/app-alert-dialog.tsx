import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

type AppAlertDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  onOpenChange: (open: boolean) => void;
};

export function AppAlertDialog({
  open,
  title,
  message,
  confirmText,
  onOpenChange,
}: AppAlertDialogProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[4px]"
        /*onClick={() => onOpenChange(false)}*/
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="app-alert-dialog-title"
        aria-describedby="app-alert-dialog-message"
        className="relative z-10 w-[360px] max-w-[calc(100vw-32px)] rounded-xl border border-red-500/35 bg-[#302e4f] p-6 text-white shadow-2xl shadow-black/50"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="닫기"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-lg font-bold text-red-400">
          !
        </div>

        <h2
          id="app-alert-dialog-title"
          className="text-lg font-bold text-white"
        >
          {title}
        </h2>

        <p
          id="app-alert-dialog-message"
          className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300"
        >
          {message}
        </p>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 min-w-[72px] rounded-md bg-[#6c5ce7] px-5 text-sm font-semibold text-white hover:bg-[#7c6df0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6c5ce7]/40"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}