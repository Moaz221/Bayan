import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ text = 'جاري التحميل...' }) => {
  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl border border-[#D4AF37]/20 bg-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.15)]">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </div>
        <p className="text-sm text-gray-300">{text}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
