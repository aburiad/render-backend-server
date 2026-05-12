import AppShell from '@/components/shared/AppShell'
import AdminDashboard from '@/pages/AdminDashboard'
import AuthCallback from '@/pages/AuthCallback'
import Dashboard from '@/pages/Dashboard'
import LearningHub from '@/pages/LearningHub'
import ExamPortal from '@/pages/ExamPortal'
import Login from '@/pages/Login'
import OmrPreview from '@/pages/OmrPreview'
import PaperEditor from '@/pages/PaperEditor'
import PapersList from '@/pages/PapersList'
import PDFPreview from '@/pages/PDFPreview'
import Pricing from '@/pages/Pricing'
import QuestionBank from '@/pages/QuestionBank'
import Register from '@/pages/Register'
import Results from '@/pages/Results'
import ScanUpload from '@/pages/ScanUpload'
import SettingsAIKeys from '@/pages/SettingsAIKeys'
import NoticesList from '@/pages/NoticesList'
import NoticeEditor from '@/pages/NoticeEditor'
import NoticePreview from '@/pages/NoticePreview'
import RoutinesList from '@/pages/RoutinesList'
import RoutineEditor from '@/pages/RoutineEditor'
import RoutinePreview from '@/pages/RoutinePreview'
import TeachersList from '@/pages/TeachersList'
import TeacherSchedulePage from '@/pages/TeacherSchedulePage'
import useAuthStore from '@/store/authStore'
import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  // Role still missing (Google OAuth user not finished onboarding) → send to role step
  if (!user?.role) return <Navigate to="/register?step=role" replace />
  return children
}

function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  if (isAuthenticated && user && !user.role) {
    return <Navigate to="/register?step=role" replace />
  }
  if (isAuthenticated && user?.role) return <Navigate to="/dashboard" replace />
  return children
}

/** Allow register while logged in (e.g. Google user finishing role) but not if already complete */
function RegisterRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  if (isAuthenticated && user?.role) return <Navigate to="/dashboard" replace />
  return children
}

function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes — no shell */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<RegisterRoute><Register /></RegisterRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/exam/:examId" element={<ExamPortal />} />

        {/* Protected routes — inside app shell (Teacher Dashboard) */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="papers" element={<PapersList />} />
          <Route path="papers/new" element={<PaperEditor />} />
          <Route path="papers/:id" element={<PaperEditor />} />
          <Route path="papers/:id/preview" element={<PDFPreview />} />
          <Route path="papers/:id/omr" element={<OmrPreview />} />
          <Route path="scan" element={<ScanUpload />} />
          <Route path="bank" element={<QuestionBank />} />
          <Route path="results" element={<Results />} />
          <Route path="notices" element={<NoticesList />} />
          <Route path="notices/new" element={<NoticeEditor />} />
          <Route path="notices/:id" element={<NoticeEditor />} />
          <Route path="notices/:id/preview" element={<NoticePreview />} />
          <Route path="routines" element={<RoutinesList />} />
          <Route path="routines/new" element={<RoutineEditor />} />
          <Route path="routines/teachers" element={<TeachersList />} />
          <Route path="routines/teachers/:name" element={<TeacherSchedulePage />} />
          <Route path="routines/:id" element={<RoutineEditor />} />
          <Route path="routines/:id/preview" element={<RoutinePreview />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="learning" element={<LearningHub />} />
          <Route path="settings" element={<Navigate to="/settings/ai-keys" replace />} />
          <Route path="settings/ai-keys" element={<SettingsAIKeys />} />
          <Route
            path="admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}
