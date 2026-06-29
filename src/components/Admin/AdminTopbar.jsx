import { LogOut, ShieldCheck } from 'lucide-react';
import { signOutUser } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const AdminTopbar = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    await signOutUser();
    navigate('/auth');
  };

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-2xl font-black text-white">مرحبًا بك في لوحة الإدارة</h2>
        <p className="mt-2 text-sm text-gray-400">
          {profile?.full_name || 'الأستاذ'} — يمكنك إدارة الطلاب والمحتوى من هنا بسهولة.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <ShieldCheck size={18} />
          صلاحية مدير
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 transition hover:bg-red-500/15"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
};

export default AdminTopbar;