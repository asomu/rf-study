import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'

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

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell>
        <Suspense fallback={<div className="route-loading" role="status">SIGNAL PATH LOADING…</div>}>
          <Routes>
            <Route path="/modules/gsm-pvt/learn" element={<LearnPage />} />
            <Route path="/modules/gsm-pvt/lab" element={<LabPage />} />
            <Route path="/modules/gsm-pvt/challenge" element={<ChallengePage />} />
            <Route path="/modules/gsm-pvt/review" element={<ReviewPage />} />
            <Route path="*" element={<Navigate replace to="/modules/gsm-pvt/learn" />} />
          </Routes>
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  )
}
