import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })))
const ChallengePage = lazy(() => import('./pages/ChallengePage').then((module) => ({ default: module.ChallengePage })))
const LabPage = lazy(() => import('./pages/LabPage').then((module) => ({ default: module.LabPage })))
const LearnPage = lazy(() => import('./pages/LearnPage').then((module) => ({ default: module.LearnPage })))
const ReviewPage = lazy(() => import('./pages/ReviewPage').then((module) => ({ default: module.ReviewPage })))

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('RF Study Lab render failure', error, info)
  }

  render() {
    if (this.state.failed) {
      return <main className="fatal-error"><span>SYSTEM HOLD</span><h1>학습 화면을 표시하지 못했습니다.</h1><p>페이지를 새로고침해 주세요. 저장된 진행도는 브라우저에 유지됩니다.</p><button onClick={() => window.location.reload()}>새로고침</button></main>
    }
    return this.props.children
  }
}

const routeLoading = <div className="route-loading" role="status">SIGNAL PATH LOADING…</div>

function ModuleLayout() {
  return (
    <AppShell>
      <Suspense fallback={routeLoading}><Outlet /></Suspense>
    </AppShell>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Suspense fallback={routeLoading}><HomePage /></Suspense>} />
        <Route path="/modules/gsm-pvt" element={<ModuleLayout />}>
          <Route index element={<Navigate replace to="learn" />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="lab" element={<LabPage />} />
          <Route path="challenge" element={<ChallengePage />} />
          <Route path="review" element={<ReviewPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </ErrorBoundary>
  )
}
