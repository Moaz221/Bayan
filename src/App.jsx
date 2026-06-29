import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Home/Navbar';
import { Hero } from './components/Home/Hero';
import { Stats } from './components/Home/Stats';
import { WhyBayan } from './components/Home/WhyBayan';
import { Pricing } from './components/Home/Pricing';
import AuthPage from './pages/AuthPage';
import PendingApproval from './pages/PendingApproval';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Footer from './components/shared/Footer';
import AdminRoute from './components/shared/AdminRoute';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ToastProvider } from './components/shared/ToastProvider';
import HomeBackground from './assets/Home_Background.png'; // استيراد الصورة

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          {/* حاوية الصفحة كاملة */}
          <div className="min-h-screen relative font-readex text-white bg-[#05070A]">
            
            {/* ═══ الخلفية العامة للموقع ═══ */}
            <div className="fixed inset-0 z-[-1] w-full h-full overflow-hidden">
              
              {/* 1. الصورة الأساسية */}
              <img 
                src={HomeBackground} 
                alt="Background" 
                className="w-full h-full object-cover object-center opacity-60" // opacity 60 عشان تخفي التفاصيل اللي ممكن تعيق النص
              />

              {/* 2. طبقة تظليل (Gradient Overlay) عشان النص يبان واضح */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#07090D]/80 via-[#07090D]/60 to-[#07090D]/95" />

              {/* 3. توهج ذهبي من الجوانب (اختياري - بيعطي فخامة) */}
              <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-[#D4AF37] blur-[120px] opacity-[0.05]" />
              <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px] opacity-[0.05]" />
              
            </div>

            <Routes>
              {/* الصفحة الرئيسية */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <Hero />
                    <Stats />
                    <WhyBayan />
                    <Pricing />
                    <Footer />
                  </>
                }
              />

              {/* صفحات المصادقة */}
  <Route
    path="/auth"
    element={
      <>
        <AuthPage />
        <Footer compact />
      </>
    }
  />

  <Route
    path="/pending"
    element={
      <>
        <PendingApproval />
        <Footer compact />
      </>
    }
  />

  {/* لوحة الطالب */}
  <Route
    path="/dashboard/*"
    element={
      <ProtectedRoute>
        <StudentDashboard />
      </ProtectedRoute>
    }
  />

              {/* لوحة الأدمن */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;