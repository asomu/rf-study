import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TracePoint, Violation } from '../domain/pvt/types'

interface PvTChartProps {
  trace: TracePoint[]
  baseline?: TracePoint[]
  violations?: Violation[]
  compact?: boolean
}

const regionNames: Record<string, string> = {
  'pre-burst': 'PRE',
  'ramp-up': 'RAMP ↑',
  'early-settling': 'SETTLE',
  plateau: 'PLATEAU',
  'ramp-down': 'RAMP ↓',
  'post-burst': 'POST',
}

export function PvTChart({ trace, baseline, violations = [], compact = false }: PvTChartProps) {
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const data = trace.map((point, index) => ({
    ...point,
    baselineDbc: baseline?.[index]?.powerDbc,
  }))
  const significantIndices = new Set([0, trace.length - 1])
  trace.forEach((_, index) => {
    if (index % 100 === 0) significantIndices.add(index)
  })
  trace
    .map((point, index) => ({ point, index }))
    .sort((left, right) => left.point.marginDb - right.point.marginDb)
    .slice(0, 24)
    .forEach(({ index }) => significantIndices.add(index))
  const significant = [...significantIndices].sort((a, b) => a - b).map((index) => trace[index])

  return (
    <section
      className={`chart-frame ${compact ? 'is-compact' : ''}`}
      aria-labelledby="pvt-chart-title"
      data-motion={reducedMotion ? 'reduced' : 'full'}
    >
      <div className="chart-head">
        <div>
          <span className="eyebrow">TRACE / 01</span>
          <h2 id="pvt-chart-title">POWER vs TIME</h2>
        </div>
        <div className="chart-legend-text" aria-hidden="true">
          <span className="legend-trace">SIMULATED TRACE</span>
          <span className="legend-mask">EDU UPPER / LOWER</span>
        </div>
      </div>

      <div className="chart-canvas" role="img" aria-label="GSM burst 교육용 simulated 상대 전력 trace와 upper/lower mask">
        <div className="mask-direct-labels" aria-hidden="true">
          <span>UPPER MASK</span>
          <span>LOWER MASK</span>
        </div>
        <ResponsiveContainer width="100%" height={compact ? 300 : 430} minWidth={280}>
          <ComposedChart data={data} margin={{ top: 18, right: 22, bottom: 12, left: 4 }}>
            <CartesianGrid stroke="#27383b" strokeDasharray="2 7" vertical={false} />
            <XAxis
              type="number"
              dataKey="timeUs"
              domain={[-32, 575]}
              ticks={[-20, 0, 100, 200, 300, 400, 500, 543, 563]}
              tick={{ fill: '#90a4a6', fontSize: 11 }}
              axisLine={{ stroke: '#405256' }}
              tickLine={false}
              label={{ value: 'TIME / µs', position: 'insideBottomRight', offset: -6, fill: '#90a4a6', fontSize: 10 }}
            />
            <YAxis
              domain={[-70, 5]}
              ticks={[-60, -45, -30, -15, 0]}
              tick={{ fill: '#90a4a6', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'POWER / dBc', angle: -90, position: 'insideLeft', fill: '#90a4a6', fontSize: 10 }}
            />
            <Tooltip
              cursor={{ stroke: '#ece4d2', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ background: '#ece4d2', border: '0', borderRadius: 2, color: '#172024', fontSize: 12 }}
              labelFormatter={(value) => `${Number(value).toFixed(1)} µs`}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  powerDbc: 'Trace',
                  baselineDbc: 'Baseline',
                  upperMaskDbc: 'Upper mask',
                  lowerMaskDbc: 'Lower mask',
                  marginDb: 'Margin',
                }
                return [`${Number(value).toFixed(2)} dBc`, labels[String(name)] ?? String(name)]
              }}
            />
            <Legend content={() => null} />
            <ReferenceLine
              x={0}
              stroke="#55676a"
              strokeDasharray="3 5"
              label={{ value: 'REF START', fill: '#90a4a6', fontSize: 8, position: 'insideTopRight' }}
            />
            <ReferenceLine
              x={542.8}
              stroke="#55676a"
              strokeDasharray="3 5"
              label={{ value: 'REF END', fill: '#90a4a6', fontSize: 8, position: 'insideTopLeft' }}
            />
            {violations.map((violation, index) => (
              <ReferenceArea
                key={`${violation.startUs}-${index}`}
                x1={violation.startUs}
                x2={Math.max(violation.endUs, violation.startUs + 1)}
                fill="#ff6b5d"
                fillOpacity={0.2}
                stroke="#ff6b5d"
                strokeOpacity={0.45}
              />
            ))}
            {baseline && (
              <Line
                type="monotone"
                dataKey="baselineDbc"
                name="baselineDbc"
                stroke="#809296"
                strokeWidth={1.4}
                strokeDasharray="2 5"
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            )}
            <Line type="linear" dataKey="upperMaskDbc" name="upperMaskDbc" stroke="#f4b942" strokeWidth={1.4} strokeDasharray="7 5" dot={false} isAnimationActive={false} />
            <Line type="linear" dataKey="lowerMaskDbc" name="lowerMaskDbc" stroke="#f4b942" strokeWidth={1.4} strokeDasharray="7 5" dot={false} isAnimationActive={false} connectNulls={false} />
            <Line type="linear" dataKey="marginDb" name="marginDb" stroke="transparent" strokeOpacity={0} dot={false} activeDot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="powerDbc" name="powerDbc" stroke="#5ed5c3" strokeWidth={2.2} dot={false} isAnimationActive={!compact && !reducedMotion} animationDuration={650} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {violations.length > 0 && (
        <div className="violation-strip" role="status">
          <strong><span aria-hidden="true">▲</span> MASK EXCURSION</strong>
          <span>{violations.map((violation) => regionNames[violation.region]).join(' · ')}</span>
        </div>
      )}

      <details className="data-table-toggle">
        <summary>차트 핵심 데이터 표로 보기</summary>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Time (µs)</th><th>Trace (dBc)</th><th>Upper</th><th>Lower</th><th>Margin</th></tr></thead>
            <tbody>
              {significant.map((point) => (
                <tr key={point.timeUs} className={point.marginDb < 0 ? 'is-fail' : ''}>
                  <td>{point.timeUs.toFixed(1)}</td>
                  <td>{point.powerDbc.toFixed(2)}</td>
                  <td>{point.upperMaskDbc.toFixed(2)}</td>
                  <td>{point.lowerMaskDbc?.toFixed(2) ?? '—'}</td>
                  <td>{Number.isFinite(point.marginDb) ? point.marginDb.toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}
