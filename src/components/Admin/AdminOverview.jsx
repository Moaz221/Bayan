import AdminSectionCard from './AdminSectionCard';
import { Users, BookOpen, FileText } from 'lucide-react';

const AdminOverview = ({ studentsCount = 0, unitsCount = 0, lessonsCount = 0 }) => (
  <section id="overview" className="admin-overview space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm text-gray-400">نظرة عامة سريعة</p>
        <h2 className="text-3xl font-semibold text-white">إحصائيات الإدارة</h2>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <AdminSectionCard
        title="الطلاب النشطين"
        value={studentsCount}
        subtitle="طلاب مسجلين ومفعّلين"
        icon={Users}
      />
      <AdminSectionCard
        title="الوحدات"
        value={unitsCount}
        subtitle="وحدات تعليمية متاحة"
        icon={BookOpen}
      />
      <AdminSectionCard
        title="الدروس"
        value={lessonsCount}
        subtitle="دروس منشورة أو قيد النشر"
        icon={FileText}
      />
    </div>
  </section>
);

export default AdminOverview;
