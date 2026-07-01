import { useMemo, useState } from 'react';
import { Search, CheckCircle2, XCircle } from 'lucide-react';
import AdminSectionCard from './AdminSectionCard';
import EmptyState from '../shared/EmptyState';

const ExamResultsManager = ({ examResults = [], onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredResults = useMemo(() => {
    return (examResults || []).filter((attempt) => {
      const query = search.trim().toLowerCase();
      const studentName = attempt.student?.full_name?.toLowerCase() || '';
      const examTitle = attempt.exam?.title?.toLowerCase() || '';
      const gradeLabel = `${attempt.student?.grade_level || ''}`;
      const status = attempt.score >= (attempt.total_questions || 1) * 0.5 ? 'passed' : 'failed';

      const matchesSearch =
        query === '' ||
        studentName.includes(query) ||
        examTitle.includes(query) ||
        gradeLabel.includes(query);

      const matchesStatus =
        statusFilter === 'all' || statusFilter === status;

      return matchesSearch && matchesStatus;
    });
  }, [examResults, search, statusFilter]);

  return (
    <AdminSectionCard className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-right">
        <div>
          <h3 className="text-xl font-bold text-white">نتائج امتحانات الطلبة</h3>
          <p className="mt-1 text-sm text-gray-400">
            قائمة المحاولات مع نقاط الطالب وحالة النجاح لكل امتحان.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-2xl bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
            >
              تحديث
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1.5fr_0.75fr]">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="ابحث عن طالب أو امتحان"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pr-11 pl-4 text-white outline-none focus:border-[#D4AF37]/40"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#D4AF37]/40"
        >
          <option value="all" className="bg-[#0B1120]">كل النتائج</option>
          <option value="passed" className="bg-[#0B1120]">ناجح</option>
          <option value="failed" className="bg-[#0B1120]">راسب</option>
        </select>
      </div>

      {filteredResults.length === 0 ? (
        <EmptyState title="لا توجد نتائج" description="جرّب تعديل البحث أو الفلاتر." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 p-2">
          <table className="min-w-full text-right text-sm text-gray-200">
            <thead>
              <tr className="text-xs uppercase text-gray-400">
                <th className="whitespace-nowrap px-4 py-3">الطالب</th>
                <th className="whitespace-nowrap px-4 py-3">الصف</th>
                <th className="whitespace-nowrap px-4 py-3">الامتحان</th>
                <th className="whitespace-nowrap px-4 py-3">التاريخ</th>
                <th className="whitespace-nowrap px-4 py-3">النقاط</th>
                <th className="whitespace-nowrap px-4 py-3">النسبة</th>
                <th className="whitespace-nowrap px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredResults.map((attempt) => {
                const studentName = attempt.student?.full_name || 'غير معروف';
                const studentPhone = attempt.student?.phone || '—';
                const examTitle = attempt.exam?.title || '—';
                const examScope = attempt.exam?.scope_type || 'عام';
                const score = attempt.score ?? 0;
                const total = attempt.total_questions || 0;
                const percent = total > 0 ? Math.round((score / total) * 100) : 0;
                const passed = percent >= 50;
                const submittedAt = attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString('ar-EG', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }) : '-';

                return (
                  <tr key={attempt.id} className="bg-white/5">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">{studentName}</div>
                      <div className="text-xs text-gray-400">{studentPhone}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-300">{attempt.student?.grade_level || '—'}</td>
                    <td className="px-4 py-4 text-gray-300">
                      <div className="font-semibold text-white">{examTitle}</div>
                      <div className="text-xs text-gray-400">{examScope}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-300">{submittedAt}</td>
                    <td className="px-4 py-4 text-gray-300">{score} / {total}</td>
                    <td className="px-4 py-4 text-gray-300">{percent}%</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${passed ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/15 text-red-300 border border-red-500/20'}`}>
                        {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {passed ? 'ناجح' : 'راسب'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminSectionCard>
  );
};

export default ExamResultsManager;
