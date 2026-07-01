import { LayoutDashboard, Users, BookOpen, PlaySquare, FileText, BarChart3, CreditCard } from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'students', label: 'إدارة الطلاب', icon: Users },
  { id: 'plans', label: 'الباقات والاشتراكات', icon: CreditCard },
  { id: 'units', label: 'إدارة الوحدات', icon: BookOpen },
  { id: 'lessons', label: 'إدارة الدروس', icon: PlaySquare },
  { id: 'exams', label: 'الامتحانات', icon: FileText },
  { id: 'examResults', label: 'نتائج الامتحانات', icon: BarChart3 },
];

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-full lg:w-[300px] rounded-[32px] border border-[#D4AF37]/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.95),rgba(5,7,10,0.95))] backdrop-blur-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-8 border-b border-white/10 pb-6">
        <span className="inline-flex items-center rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-4 py-1 text-xs font-semibold text-[#D4AF37]">
          لوحة الأستاذ
        </span>

        <h1 className="mt-4 text-3xl font-black text-white font-amiri">بَيان</h1>
        <p className="mt-2 text-sm leading-7 text-gray-400">
          إدارة المنصة التعليمية والطلاب والوحدات والدروس من مكان واحد بشكل منظم واحترافي.
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-right transition-all duration-300 ${
                active
                  ? 'border-[#D4AF37]/30 bg-[#D4AF37]/12 text-white shadow-[0_0_30px_rgba(212,175,55,0.08)]'
                  : 'border-transparent bg-white/[0.03] text-gray-300 hover:border-white/10 hover:bg-white/[0.05]'
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                  active
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                }`}
              >
                <Icon size={20} />
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
