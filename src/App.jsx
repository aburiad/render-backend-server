import AppShell from '@/components/shared/AppShell'
import OutOfCreditModal from '@/components/shared/OutOfCreditModal'
import useAuthStore from '@/store/authStore'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

/* ─── Lazy-loaded pages (code-split chunks) ─── */
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const LearningHub = lazy(() => import('@/pages/LearningHub'))
const ExamPortal = lazy(() => import('@/pages/ExamPortal'))
const Login = lazy(() => import('@/pages/Login'))
const OmrPreview = lazy(() => import('@/pages/OmrPreview'))
const PaperEditor = lazy(() => import('@/pages/PaperEditor'))
const PapersList = lazy(() => import('@/pages/PapersList'))
const PDFPreview = lazy(() => import('@/pages/PDFPreview'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const Register = lazy(() => import('@/pages/Register'))
const Results = lazy(() => import('@/pages/Results'))
const ScanUpload = lazy(() => import('@/pages/ScanUpload'))
const SettingsAIKeys = lazy(() => import('@/pages/SettingsAIKeys'))
const NoticesList = lazy(() => import('@/pages/NoticesList'))
const NoticeEditor = lazy(() => import('@/pages/NoticeEditor'))
const NoticePreview = lazy(() => import('@/pages/NoticePreview'))
const RoutinesList = lazy(() => import('@/pages/RoutinesList'))
const RoutineEditor = lazy(() => import('@/pages/RoutineEditor'))
const RoutinePreview = lazy(() => import('@/pages/RoutinePreview'))
const TeachersList = lazy(() => import('@/pages/TeachersList'))
const TeacherSchedulePage = lazy(() => import('@/pages/TeacherSchedulePage'))

/* ─── Page loading fallback ─── */
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', color: '#64748b', fontSize: 14, fontWeight: 500,
    }}>
      লোড হচ্ছে...
    </div>
  )
}

/* ─── Route guards (unchanged) ─── */
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function RegisterRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const isHydrating = useAuthStore((s) => s.isHydrating)
  if (isHydrating) return null
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

/* ─── Prefetch common pages after login (background, non-blocking) ─── */
function usePrefetchPages() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const prefetched = useRef(false)

  useEffect(() => {
    if (isAuthenticated && !prefetched.current) {
      prefetched.current = true
      // Prefetch most-visited pages in background (low priority)
      const prefetch = () => {
        import('@/pages/Dashboard')
        import('@/pages/PapersList')
      }
      // Small delay so it doesn't compete with initial page load
      setTimeout(prefetch, 1500)
    }
  }, [isAuthenticated])
}

/* ─── App (routes unchanged, just wrapped in Suspense) ─── */
export default function App() {
  const location = useLocation()
  usePrefetchPages()

  return (
    <>
      <OutOfCreditModal />
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </AnimatePresence>
    </>
  )
}