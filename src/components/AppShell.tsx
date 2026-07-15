import { useEffect, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useProgress } from '../state/progress'

const steps = [
  { slug: 'learn', label: '01', title: 'LEARN', short: 'LEARN' },
  { slug: 'lab', label: '02', title: 'LAB', short: 'LAB' },
  { slug: 'challenge', label: '03', title: 'CHALLENGE', short: 'CHAL.' },
  { slug: 'review', label: '04', title: 'REVIEW', short: 'REVIEW' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { progress, recoveryMessage, markVisited } = useProgress()
  const activeStep = location.pathname.split('/').at(-1) ?? 'learn'
  const visited = new Set(progress.visitedSteps)

  useEffect(() => markVisited(activeStep), [activeStep, markVisited])

  return (
    <div className="app-shell">
      <aside className="nav-rail" aria-label="M1 학습 단계">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">RF</span>
          <div>
            <strong>STUDY LAB</strong>
            <small>FIELD NOTE / 001</small>
          </div>
        </div>

        <div className="module-stamp">
          <span>MODULE 01</span>
          <strong>GSM BURST</strong>
          <em>POWER vs TIME</em>
        </div>

        <nav className="step-nav">
          {steps.map((step) => (
            <NavLink
              key={step.slug}
              to={`/modules/gsm-pvt/${step.slug}`}
              className={({ isActive }) => `step-link ${isActive ? 'is-active' : ''}`}
            >
              <span>{step.label}</span>
              <strong data-short={step.short}>{step.title}</strong>
              <i aria-label={visited.has(step.slug) ? '방문함' : '방문 전'}>
                {visited.has(step.slug) ? '●' : '○'}
              </i>
            </NavLink>
          ))}
        </nav>

        <div className="rail-readout" aria-label="학습 진행 요약">
          <span>CHALLENGES</span>
          <strong>{String(progress.completedChallenges.length).padStart(2, '0')} / 06</strong>
          <div className="meter"><i style={{ width: `${(progress.completedChallenges.length / 6) * 100}%` }} /></div>
        </div>

        <p className="rail-warning">
          <span aria-hidden="true">△</span>
          EDUCATIONAL MODEL<br />NOT FOR CONFORMANCE
        </p>
      </aside>

      <div className="shell-main">
        <header className="top-strip">
          <p><span>PROFILE</span> DCS 1800 · MS UL · GMSK</p>
          <p><span>REFERENCE</span> nominal plateau = 0 dBc</p>
          <p className="live-indicator"><i /> MODEL ONLINE</p>
        </header>
        {recoveryMessage && <div className="recovery-banner" role="status">{recoveryMessage}</div>}
        <main id="main-content">{children}</main>
      </div>
    </div>
  )
}
