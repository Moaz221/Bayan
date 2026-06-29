import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentLayout from '../components/Student/StudentLayout';
import StudentHome from '../components/Student/StudentHome';
import StudentUnits from '../components/Student/StudentUnits';
import StudentExams from '../components/Student/StudentExams';
import StudentProfile from '../components/Student/StudentProfile';
import LoadingScreen from '../components/shared/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { getUnitsWithAccess, getStudentExams } from '../lib/student';

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [units, setUnits] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [unitsData, examsData] = await Promise.all([
          getUnitsWithAccess(profile),
          getStudentExams(profile),
        ]);
        setUnits(unitsData);
        setExams(examsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile]);

  if (loading) return <LoadingScreen text="جاري تحميل محتواك..." />;

  return (
    <StudentLayout>
      <Routes>
        <Route index element={<StudentHome units={units} exams={exams} profile={profile} />} />
        <Route path="units/*" element={<StudentUnits units={units} profile={profile} />} />
        <Route path="exams/*" element={<StudentExams exams={exams} profile={profile} />} />
        <Route path="profile" element={<StudentProfile profile={profile} />} />
      </Routes>
    </StudentLayout>
  );
};

export default StudentDashboard;