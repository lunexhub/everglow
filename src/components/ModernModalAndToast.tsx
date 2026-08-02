import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, ShieldAlert, Sparkles, Trash2, Bell } from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'success' | 'warning' | 'info';

export interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  variant: ConfirmationVariant;
  onConfirm: () => void;
}

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface GlobalConfirmationModalProps {
  modal: ConfirmationModalState;
  onClose: () => void;
}

export const GlobalConfirmationModal: React.FC<GlobalConfirmationModalProps> = ({ modal, onClose }) => {
  if (!modal.isOpen) return null;

  const getIcon = () => {
    switch (modal.variant) {
      case 'danger':
        return <Trash2 className="w-6 h-6 text-rose-600" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'info':
      default:
        return <Sparkles className="w-6 h-6 text-[#8B6508]" />;
    }
  };

  const getBadgeBg = () => {
    switch (modal.variant) {
      case 'danger':
        return 'bg-rose-100 border-rose-200';
      case 'success':
        return 'bg-emerald-100 border-emerald-200';
      case 'warning':
        return 'bg-amber-100 border-amber-200';
      case 'info':
      default:
        return 'bg-amber-100 border-amber-300';
    }
  };

  const getConfirmButtonBtn = () => {
    switch (modal.variant) {
      case 'danger':
        return 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-600/30';
      case 'success':
        return 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-600/30';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/30';
      case 'info':
      default:
        return 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-slate-950 shadow-lg shadow-amber-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-pink-200 p-6 space-y-5 relative my-auto animate-scale-up">
        {/* Top Header Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${getBadgeBg()} shrink-0`}>
              {getIcon()}
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#8B6508] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                Everglow Security
              </span>
              <h3 className="text-base font-extrabold font-brand-serif text-slate-900 mt-1 leading-tight">
                {modal.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Content */}
        <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 text-xs text-slate-700 leading-relaxed font-medium">
          {modal.message}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              modal.onConfirm();
            }}
            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${getConfirmButtonBtn()}`}
          >
            {modal.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 lg:left-auto lg:right-6 lg:top-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const getToastStyles = () => {
          switch (toast.type) {
            case 'error':
              return 'bg-slate-900 border-rose-500/80 text-rose-300 shadow-rose-950/40';
            case 'warning':
              return 'bg-slate-900 border-amber-400/80 text-amber-300 shadow-amber-950/40';
            case 'info':
              return 'bg-slate-900 border-sky-400/80 text-sky-300 shadow-sky-950/40';
            case 'success':
            default:
              return 'bg-slate-900 border-emerald-400/80 text-emerald-300 shadow-emerald-950/40';
          }
        };

        const getToastIcon = () => {
          switch (toast.type) {
            case 'error':
              return <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />;
            case 'warning':
              return <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />;
            case 'info':
              return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
            case 'success':
            default:
              return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          }
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 transition-all duration-300 animate-slide-in ${getToastStyles()}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {getToastIcon()}
              <div className="min-w-0">
                {toast.title && (
                  <h4 className="text-xs font-bold text-white leading-tight truncate">
                    {toast.title}
                  </h4>
                )}
                <p className="text-[11px] font-medium leading-snug line-clamp-2">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
