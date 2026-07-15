import { PARAMETER_DEFINITIONS } from '../domain/pvt/profile'
import type { PvTParameters } from '../domain/pvt/types'

interface ParameterPanelProps {
  values: PvTParameters
  onChange: (key: keyof PvTParameters, value: number) => void
  onReset: () => void
  onUndo: () => void
  canUndo: boolean
}

export function ParameterPanel({ values, onChange, onReset, onUndo, canUndo }: ParameterPanelProps) {
  return (
    <section className="parameter-panel" aria-labelledby="parameter-title">
      <div className="panel-title-row">
        <div>
          <span className="eyebrow">CONTROL BANK</span>
          <h2 id="parameter-title">PARAMETERS</h2>
        </div>
        <span className="bank-id">A–07</span>
      </div>
      <div className="parameter-list">
        {PARAMETER_DEFINITIONS.map((definition) => (
          <label className="parameter-control" key={definition.key}>
            <span className="parameter-label">
              <strong>{definition.shortLabel}</strong>
              <em>{definition.label}</em>
            </span>
            <span className="control-row">
              <input
                type="range"
                aria-label={`${definition.label} slider`}
                min={definition.min}
                max={definition.max}
                step={definition.step}
                value={values[definition.key]}
                onChange={(event) => onChange(definition.key, Number(event.target.value))}
                aria-describedby={`${definition.key}-help`}
              />
              <span className="numeric-input">
                <input
                  type="number"
                  aria-label={definition.label}
                  min={definition.min}
                  max={definition.max}
                  step={definition.step}
                  value={values[definition.key]}
                  onChange={(event) => onChange(definition.key, Number(event.target.value))}
                />
                <i>{definition.unit}</i>
              </span>
            </span>
            <small id={`${definition.key}-help`}>{definition.explanation}</small>
          </label>
        ))}
      </div>
      <div className="panel-actions">
        <button className="button-secondary" type="button" onClick={onUndo} disabled={!canUndo}>이전 실험</button>
        <button className="button-ghost" type="button" onClick={onReset}>기준 파형으로 복원</button>
      </div>
    </section>
  )
}
