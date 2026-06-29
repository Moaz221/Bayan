import { User, Phone, GraduationCap, CreditCard, Calendar, Shield } from 'lucide-react';

const GRADE_LABELS = { 1: 'الصف الأول الثانوي', 2: 'الصف الثاني الثانوي', 3: 'الصف الثالث الثانوي' };
const SUB_LABELS = { monthly: 'شهري', term: 'ترم', yearly: 'سنوي', final_review: 'مراجعة نهائية' };
const STATUS_CONFIG = {
  active: { label: 'نشط', class: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
  pending: { label: 'قيد الانتظار', class: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
  expired: { label: 'منتهي', class: 'bg-red-500/15 text-red-300 border-red-500/20' },
  cancelled: { label: 'ملغي', class: 'bg-gray-500/15 text-gray-300 border-gray-500/20' },
};

const StudentProfile = ({ profile }) => {
  const status = STATUS_CONFIG[profile?.subscription_status || 'pending'];

  const infoItems = [
    { icon: User, label: 'الاسم الكامل', value: profile?.full_name },
    { icon: GraduationCap, label: 'الصف الدراسي', value: GRADE_LABELS[profile?.grade_level] },
    { icon: Phone, label: 'رقم الهاتف', value: profile?.phone || 'غير محدد' },
  ];

  const subItems = [
    { icon: CreditCard, label: 'نوع الاشتراك', value: SUB_LABELS[profile?.subscription_type] || 'لا يوجد' },
    {
      icon: Shield,
      label: 'حالة الاشتراك',
      value: (
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${status.class}`}>
          {status.label}
        </span>
      ),
    },
    {
      icon: Calendar,
      label: 'بداية الاشتراك',
      value: profile?.subscription_start
        ? new Date(profile.subscription_start).toLocaleDateString('ar-EG')
        : 'غير محدد',
    },
    {
      icon: Calendar,
      label: 'نهاية الاشتراك',
      value: profile?.subscription_end
        ? new Date(profile.subscription_end).toLocaleDateString('ar-EG')
        : 'غير محدد',
    },
  ];

  return (
    <div className="space-y-5" dir="rtl">
      <h2 className="text-xl font-bold text-white">حسابي الشخصي</h2>

      {/* البيانات الشخصية */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="mb-4 font-bold text-[#D4AF37]">البيانات الشخصية</h3>
        <div className="space-y-4">
          {infoItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                <span className="text-sm text-white">{item.value}</span>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs">{item.label}</span>
                  <Icon size={16} className="text-[#D4AF37]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* بيانات الاشتراك */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="mb-4 font-bold text-[#D4AF37]">بيانات الاشتراك</h3>
        <div className="space-y-4">
          {subItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-4 py-3">
                <div>{item.value}</div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs">{item.label}</span>
                  <Icon size={16} className="text-[#D4AF37]" />
                </div>
              </div>
            );
          })}
        </div>

        {profile?.notes && (
          <div className="mt-4 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-4 text-right">
            <p className="text-xs text-[#D4AF37] font-bold mb-1">ملاحظات الأستاذ:</p>
            <p className="text-sm text-gray-300">{profile.notes}</p>
          </div>
        )}
      </div>

      {/* تواصل للاشتراك */}
      {profile?.subscription_status !== 'active' && (
        <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 p-5 text-right">
          <p className="font-bold text-[#D4AF37]">هل تريد الاشتراك؟</p>
          <p className="mt-1 text-sm text-gray-400">تواصل مع الأستاذ عبر واتساب لتفعيل اشتراكك</p>
          <button
            onClick={() => window.open('https://wa.me/2010XXXXXXXX', '_blank')}
            className="mt-3 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1da851]"
          >
            تواصل عبر واتساب
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;