import { Link, Navigate, useParams } from 'react-router-dom'
import { BENCH_SOURCES, SG_SA_SERIES, SG_SA_SETUP, getBenchItem, type BenchItem } from '../content/bench'
import type { BenchStep } from '../content/bench/types'
import { useBenchRecords, type BenchEntry } from '../state/benchRecords'

function StepRecord({ step, entry, onChange }: { step: BenchStep; entry: BenchEntry | undefined; onChange: (field: keyof BenchEntry, value: string) => void }) {
  if (!step.record) return null
  const unit = step.record.unit ? ` (${step.record.unit})` : ''
  return (
    <div className="bench-record">
      {step.record.predict && (
        <label>
          <span>예측{unit}</span>
          <input
            id={`${step.id}-prediction`}
            value={entry?.prediction ?? ''}
            onChange={(event) => onChange('prediction', event.target.value)}
            aria-label={`예측: ${step.record.label}`}
          />
        </label>
      )}
      <label>
        <span>실측{unit}</span>
        <input
          id={`${step.id}-measured`}
          value={entry?.measured ?? ''}
          onChange={(event) => onChange('measured', event.target.value)}
          aria-label={`실측: ${step.record.label}`}
        />
      </label>
      <p className="bench-record-label">{step.record.label}</p>
    </div>
  )
}

function BenchContent({ item }: { item: BenchItem }) {
  const { entries, update } = useBenchRecords(item.id)
  const usedSources = [...new Set(item.scpi.map((row) => row.source))]

  return (
    <div className="bench">
      <header className="bench-header">
        <div className="bench-header-inner">
          <Link to="/" className="bench-back"><span aria-hidden="true">←</span> 로드맵</Link>
          <span className="bench-kicker">{item.series ?? SG_SA_SERIES} · {String(item.number).padStart(2, '0')}</span>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
          <p className="bench-bench-line">{item.setup ?? SG_SA_SETUP}</p>
        </div>
      </header>

      <main id="main-content" className="bench-main">
        <section aria-labelledby="bench-principle">
          <h2 id="bench-principle">원리</h2>
          {item.principle.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section aria-labelledby="bench-settings">
          <h2 id="bench-settings">설정 값의 의미</h2>
          <div className="bench-scroll">
            <table>
              <thead><tr><th>설정</th><th>바꾸는 것</th><th>기본값</th><th>흔한 실수</th></tr></thead>
              <tbody>
                {item.settings.map((row) => (
                  <tr key={row.name}><th scope="row">{row.name}</th><td>{row.effect}</td><td>{row.defaultValue}</td><td>{row.pitfall}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="bench-steps">
          <h2 id="bench-steps">쓰루 실습</h2>
          <p className="bench-note">예측 칸이 있는 단계는 측정 전에 먼저 적습니다. 입력한 값은 이 브라우저에 저장됩니다.</p>
          <ol className="bench-steps">
            {item.steps.map((step) => (
              <li key={step.id} className="bench-step">
                <h3>{step.title}</h3>
                <ul>{step.actions.map((action) => <li key={action}>{action}</li>)}</ul>
                <StepRecord step={step} entry={entries[step.id]} onChange={(field, value) => update(step.id, field, value)} />
                {step.check && <p className="bench-check"><strong>확인</strong> {step.check}</p>}
              </li>
            ))}
          </ol>
          {item.script && (
            <p className="bench-note">같은 순서를 스크립트로: <code>python3 -m {item.script.replace(/^bench\//, '').replace(/\.py$/, '').replace(/\//g, '.')}</code> (bench/ 폴더에서, 기본은 dry-run)</p>
          )}
        </section>

        <section aria-labelledby="bench-scpi">
          <h2 id="bench-scpi">SCPI 커맨드</h2>
          <div className="bench-scroll">
            <table>
              <thead><tr><th>커맨드</th><th>장비</th><th>용도</th><th>출처</th></tr></thead>
              <tbody>
                {item.scpi.map((row) => (
                  <tr key={`${row.instrument}-${row.command}`}>
                    <td><code>{row.command}</code></td><td>{row.instrument}</td><td>{row.purpose}</td><td>[{usedSources.indexOf(row.source) + 1}]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ol className="bench-sources">
            {usedSources.map((source) => <li key={source}>{BENCH_SOURCES[source]}</li>)}
          </ol>
        </section>

        <section aria-labelledby="bench-test-program">
          <h2 id="bench-test-program">테스트 프로그램 관점</h2>
          <ul className="bench-points">{item.testProgram.map((point) => <li key={point}>{point}</li>)}</ul>
        </section>
      </main>
    </div>
  )
}

export function BenchPage() {
  const { itemId } = useParams()
  const item = getBenchItem(itemId)
  if (!item) return <Navigate replace to="/" />
  return <BenchContent key={item.id} item={item} />
}
