import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  open,
  title = 'تأكيد الإجراء',
  description = 'هل أنت متأكد من تنفيذ هذا الإجراء؟',
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  danger = false,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22 }}
          >
            <div
              className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#0B1120]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
              dir="rtl"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${danger ? 'bg-red-500/10' : 'bg-[#D4AF37]/10'}`}>
                  <AlertTriangle className={danger ? 'text-red-300' : 'text-[#D4AF37]'} size={22} />
                </div>

                <div className="text-right">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-400">{description}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/10"
                >
                  {cancelText}
                </button>

                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
                    danger
                      ? 'bg-red-500/15 text-red-300 hover:bg-red-500/20'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black'
                  }`}
                >
                  {loading ? 'جاري التنفيذ...' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;