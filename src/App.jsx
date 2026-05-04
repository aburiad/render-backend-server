import AppShell from '@/components/shared/AppShell'
import AdminDashboard from '@/pages/AdminDashboard'
import AuthCallback from '@/pages/AuthCallback'
import Dashboard from '@/pages/Dashboard'
import ExamPortal from '@/pages/ExamPortal'
import Login from '@/pages/Login'
import OmrPreview from '@/pages/OmrPreview'
import PaperEditor from '@/pages/PaperEditor'
import PapersList from '@/pages/PapersList'
import PaymentFail from '@/pages/PaymentFail'
import PaymentSuccess from '@/pages/PaymentSuccess'
import PDFPreview from '@/pages/PDFPreview'
import Pricing from '@/pages/Pricing'
import QuestionBank from '@/pages/QuestionBank'
import Register from '@/pages/Register'
import Results from '@/pages/Results'
import ScanUpload from '@/pages/ScanUpload'
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
          <Route path="pricing" element={<Pricing />} />
          <Route path="payment/success" element={<PaymentSuccess />} />
          <Route path="payment/fail" element={<PaymentFail />} />
          <Route
            path="admin"
            element={<AdminRoute><AdminDashboard /></AdminRoute>}
          />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}
