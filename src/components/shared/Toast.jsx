import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const toastStyles = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-300',
    boxClass: 'border-emerald-500/20 bg-emerald-500/10',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-red-300',
    boxClass: 'border-red-500/20 bg-red-500/10',
  },
  info: {
    icon: Info,
    iconClass: 'text-sky-300',
    boxClass: 'border-sky-500/20 bg-sky-500/10',
  },
};

const Toast = ({ toast, onClose }) => {
  const variant = toastStyles[toast.type] || toastStyles.info;
  const Icon = variant.icon;

  return (
    <div
      className={`w-full max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur-xl text-white ${variant.boxClass}`}
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onClose(toast.id)}
          className="mt-0.5 text-gray-300 hover:text-white transition"
        >
          <X size={16} />
        </button>

        <div className={`mt-0.5 ${variant.iconClass}`}>
          <Icon size={18} />
        </div>

        <div className="flex-1 text-right">
          <h4 className="font-bold text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="mt-1 text-xs leading-6 text-gray-200">{toast.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast;