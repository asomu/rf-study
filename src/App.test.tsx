import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { ROADMAP_TRACKS } from './content/roadmap'
import { DEFAULT_PARAMETERS } from './domain/pvt/profile'
import { ProgressProvider } from './state/progress'

function renderRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ProgressProvider><App /></ProgressProvider>
    </MemoryRouter>,
  )
}

describe('RF Study Lab roadmap home', () => {
  beforeEach(() => window.localStorage.clear())

  it('shows every roadmap track on the home page', async () => {
    renderRoute('/')
    expect(await screen.findByRole('heading', { level: 1, name: /RF Study Lab/ })).toBeInTheDocument()
    for (const track of ROADMAP_TRACKS) {
      expect(screen.getByRole('heading', { level: 2, name: new RegExp(track.title) })).toBeInTheDocument()
    }
  })

  it('opens each ready roadmap item as a real page, not the home', async () => {
    const readyItems = ROADMAP_TRACKS.flatMap((track) => track.items).filter((item) => item.status === 'ready')
    expect(readyItems.length).toBeGreaterThan(0)
    for (const item of readyItems) {
      const view = renderRoute(item.href!)
      if (item.href!.startsWith('/bench/')) {
        expect(await screen.findByRole('heading', { level: 2, name: '쓰루 실습' })).toBeInTheDocument()
      } else {
        expect(await screen.findByLabelText('GSM Burst PvT 학습 단계')).toBeInTheDocument()
      }
      view.unmount()
    }
  })

  it('sends unknown routes to the roadmap home', async () => {
    renderRoute('/no-such-page')
    expect(await screen.findByRole('heading', { level: 1, name: /RF Study Lab/ })).toBeInTheDocument()
  })

  it('links from the module shell back to the roadmap', async () => {
    const user = userEvent.setup()
    renderRoute('/modules/gsm-pvt/learn')
    await user.click(await screen.findByRole('link', { name: /로드맵/ }))
    expect(await screen.findByRole('heading', { level: 1, name: /RF Study Lab/ })).toBeInTheDocument()
  })
})

describe('RF Study Lab bench practice', () => {
  beforeEach(() => window.localStorage.clear())

  it('shows the five sections of a bench item', async () => {
    renderRoute('/bench/connection-safety')
    expect(await screen.findByRole('heading', { level: 1, name: /연결과 안전/ })).toBeInTheDocument()
    for (const name of ['원리', '설정 값의 의미', '쓰루 실습', 'SCPI 커맨드', '테스트 프로그램 관점']) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument()
    }
  })

  it('keeps a measured value after the page is opened again', async () => {
    const user = userEvent.setup()
    const first = renderRoute('/bench/connection-safety')
    const field = (await screen.findAllByLabelText(/실측/))[0]
    await user.type(field, '-21.3')
    first.unmount()

    renderRoute('/bench/connection-safety')
    expect((await screen.findAllByLabelText(/실측/))[0]).toHaveValue('-21.3')
  })

  it('recovers from corrupt bench records', async () => {
    window.localStorage.setItem('rf-study:bench:v1', '{bad-json')
    renderRoute('/bench/connection-safety')
    expect(await screen.findByRole('heading', { level: 1, name: /연결과 안전/ })).toBeInTheDocument()
    expect((await screen.findAllByLabelText(/실측/))[0]).toHaveValue('')
  })

  it('opens bench item 02 and keeps its records apart from item 01', async () => {
    const user = userEvent.setup()
    const first = renderRoute('/bench/connection-safety')
    await user.type((await screen.findAllByLabelText(/실측/))[0], 'item-one')
    first.unmount()

    renderRoute('/bench/cw-marker')
    expect(await screen.findByRole('heading', { level: 1, name: /CW 출력과 marker/ })).toBeInTheDocument()
    expect((await screen.findAllByLabelText(/실측/))[0]).toHaveValue('')
  })

  it('sends an unknown bench item to the roadmap home', async () => {
    renderRoute('/bench/no-such-item')
    expect(await screen.findByRole('heading', { level: 1, name: /RF Study Lab/ })).toBeInTheDocument()
  })
})

describe('RF Study Lab learning flow', () => {
  beforeEach(() => window.localStorage.clear())

  it('answers a concept check and persists the evidence', async () => {
    const user = userEvent.setup()
    renderRoute('/modules/gsm-pvt/learn')
    expect(await screen.findByRole('heading', { name: /BURST를/ })).toBeInTheDocument()

    const question = screen.getByText('0 dBc와 0 dBm은 같은 전력인가요?').closest('article')
    expect(question).not.toBeNull()
    await user.click(question!.querySelectorAll('button')[1])
    expect(screen.getByText(/정확합니다/)).toBeInTheDocument()
    expect(window.localStorage.getItem('rf-study:v1')).toContain('"units":true')
  })

  it('requires a prediction before evaluating changed parameters', async () => {
    const user = userEvent.setup()
    renderRoute('/modules/gsm-pvt/lab')
    const runButton = await screen.findByRole('button', { name: /예측을 제출하고 실행/ })
    expect(runButton).toBeDisabled()

    const overshoot = screen.getByLabelText('Turn-on overshoot', { selector: 'input[type="number"]' })
    fireEvent.change(overshoot, { target: { value: '2.8' } })
    expect(screen.getByText(/TRACE ARMED/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /PLATEAU/ }))
    expect(runButton).toBeEnabled()
    await user.click(runButton)
    expect(screen.getByText(/예측이 trace의 첫 결과와 일치합니다/)).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('첫 결과 region'), 'early-settling')
    await user.selectOptions(screen.getByLabelText('worst region'), 'early-settling')
    await user.click(screen.getByRole('button', { name: '판정 기록' }))
    expect(screen.getAllByText('교육용 마스크 이탈').length).toBeGreaterThan(0)
  })

  it('recovers safely from invalid stored progress', async () => {
    window.localStorage.setItem('rf-study:v1', '{bad-json')
    renderRoute('/modules/gsm-pvt/review')
    expect(screen.getByText(/안전하게 초기화했습니다/)).toBeInTheDocument()
    expect(await screen.findByText('아직 저장된 진단이 없습니다.')).toBeInTheDocument()
  })

  it('rejects stored parameters outside the model range before rendering', async () => {
    window.localStorage.setItem('rf-study:v1', JSON.stringify({
      version: 2,
      visitedSteps: [],
      predictions: { correct: 0, total: 0 },
      judgments: { correct: 0, total: 0 },
      challengeResults: {},
      conceptChecks: {},
      completedChallenges: [],
      teachBackComplete: false,
      lastParameters: { ...DEFAULT_PARAMETERS, overshootDb: 99 },
      lastEvaluation: null,
      lastResponse: null,
    }))
    renderRoute('/modules/gsm-pvt/review')
    expect(screen.getByText(/범위 또는 형식이 올바르지 않아 안전하게 초기화했습니다/)).toBeInTheDocument()
    expect(await screen.findByText('아직 저장된 진단이 없습니다.')).toBeInTheDocument()
  })
})
