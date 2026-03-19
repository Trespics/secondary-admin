import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import SchoolManagement from "./pages/admin/SchoolManagement";
import ContentApproval from "./pages/admin/ContentApproval";
import SystemReports from "./pages/admin/SystemReports";
import Announcements from "./pages/admin/Announcements";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import Subjects from "./pages/admin/Subjects";
import SubjectContent from "./pages/admin/SubjectContent";
import ClassManagement from "./pages/admin/ClassManagement";
import TeacherAssignments from "./pages/admin/TeacherAssignments";
import StudentEnrollment from "./pages/admin/StudentEnrollment";
import CBCCurriculum from "./pages/admin/CBCCurriculum";
import AdminLogin from "./pages/Login";
import NotFound from "./pages/NotFound";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// import './App.css'

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/school" element={<ProtectedRoute><SchoolManagement /></ProtectedRoute>} />
              <Route path="/admin/content" element={<ProtectedRoute><ContentApproval /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute><SystemReports /></ProtectedRoute>} />
              <Route path="/admin/notifications" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
              <Route path="/admin/subjects/:id" element={<ProtectedRoute><SubjectContent /></ProtectedRoute>} />
              <Route path="/admin/classes" element={<ProtectedRoute><ClassManagement /></ProtectedRoute>} />
              <Route path="/admin/teacher-assignments" element={<ProtectedRoute><TeacherAssignments /></ProtectedRoute>} />
              <Route path="/admin/enrollment" element={<ProtectedRoute><StudentEnrollment /></ProtectedRoute>} />
              <Route path="/admin/cbc-curriculum" element={<ProtectedRoute><CBCCurriculum /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
  
export default App
