import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminTopbar from '../components/Admin/AdminTopbar';
import AdminOverview from '../components/Admin/AdminOverview';
import ExamsManager from '../components/Admin/ExamsManager';
import StudentsTable from '../components/Admin/StudentsTable';
import UnitsManager from '../components/Admin/UnitsManager';
import LessonsManager from '../components/Admin/LessonsManager';
import PlansManager from '../components/Admin/PlansManager';
import AdminSectionCard from '../components/Admin/AdminSectionCard';
import LoadingScreen from '../components/shared/LoadingScreen';
import { 
  getAdminStats, 
  getAllLessons, 
  getAllStudents, 
  getAllUnits, 
  getAllPlans, 
  getAllExams 
} from '../lib/admin'; // ✅ هنا `..` مرة واحدة
import '../styles/admin.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [plans, setPlans] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, studentsData, unitsData, lessonsData, plansData, examsData] = await Promise.all([
        getAdminStats(),
        getAllStudents(),
        getAllUnits(),
        getAllLessons(),
        getAllPlans(),
        getAllExams(),
      ]);

      setStats(statsData);
      setStudents(studentsData);
      setUnits(unitsData);
      setLessons(lessonsData);
      setPlans(plansData);
      setExams(examsData);
    } catch (error) {
      console.error(error);
      alert(error.message || 'حدث خطأ أثناء تحميل بيانات لوحة الإدارة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />; // ✅ بدون props
      case 'students':
        return <StudentsTable students={students} onRefresh={loadDashboardData} />;
      case 'units':
        return <UnitsManager units={units} onRefresh={loadDashboardData} />;
      case 'lessons':
        return <LessonsManager lessons={lessons} units={units} onRefresh={loadDashboardData} />;
      case 'exams':
        return <ExamsManager exams={exams} units={units} lessons={lessons} onRefresh={loadDashboardData} />;
      case 'plans':
        return <PlansManager plans={plans} units={units} onRefresh={loadDashboardData} />;
      case 'payments':
        return (
          <AdminSectionCard className="p-8 text-right">
            <h3 className="text-2xl font-bold text-white">المدفوعات والتفعيل</h3>
            <p className="mt-3 text-sm leading-7 text-gray-400">
              لاحقًا سنضيف قسمًا واضحًا لتتبع التحويلات اليدوية وتفعيل الاشتراكات ومددها بسهولة.
            </p>
          </AdminSectionCard>
        );
      default:
        return <AdminOverview />;
    }
  };

  if (loading && !stats) {
    return <LoadingScreen text="جاري تحميل لوحة الإدارة..." />;
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white relative overflow-hidden" dir="rtl">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] islamic-bg" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(29,78,216,0.12),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <main className="order-2 lg:order-1">
            <AdminTopbar />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          <div className="order-1 lg:order-2">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;