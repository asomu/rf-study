# Phase 1 UI Spec — GSM Burst / PvT Lab

**Status:** Validated implementation baseline
**Aesthetic:** Industrial RF bench × annotated engineering notebook
**Primary viewport:** Desktop 1440×900
**Secondary viewports:** Tablet 768×1024, Mobile 375×812

## Experience Structure

Routes:

- `/modules/gsm-pvt/learn`
- `/modules/gsm-pvt/lab`
- `/modules/gsm-pvt/challenge`
- `/modules/gsm-pvt/review`

The global shell keeps module identity, phase progress, and the educational-model warning visible. The current route is reflected in the URL and keyboard-focus order.

## Layout

### Desktop

- 228 px navigation rail.
- Flexible central workspace with the plot as the focal point.
- 320 px control/diagnosis rail in Lab and Challenge.
- Reading pages use a maximum 760 px measure inside the workspace.

### Tablet

- Navigation becomes a compact top rail.
- Chart stays full width; controls move below in two columns.

### Mobile

- Single-column order: chart/reference → controls → prediction/run → first/worst judgment → verdict/reasoning.
- Controls use full-width labelled inputs; no precision interaction depends on dragging.
- The plot may use internal horizontal scrolling only when required, with a data-table alternative.

## Design Tokens

| Role | Token |
| --- | --- |
| Instrument background | `#0b1113` |
| Raised panel | `#131c1f` |
| Notebook surface | `#ece4d2` |
| Primary ink | `#172024` |
| Signal teal | `#5ed5c3` |
| Mask amber | `#f4b942` |
| Failure coral | `#ff6b5d` |
| Muted steel | `#809296` |

- Display/label face: IBM Plex Mono.
- Reading face: Chivo.
- Numeric values use tabular numerals.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Radius is restrained: 2 px controls, 6 px panels, full circles only for status lamps.

## Components

- `AppShell`: navigation, route stepper, model warning, save status.
- `ConceptDiagram`: accessible Frame → Slot → Burst hierarchy.
- `PvTChart`: trace, optional baseline, upper/lower mask, violation bands, tooltip, data table.
- `ParameterPanel`: labelled range and number inputs, unit, reset, undo.
- `PredictionGate`: records a prediction before revealing updated evaluation.
- `JudgmentPanel`: records first-result and worst-region reading after the trace is revealed and before the explanation appears.
- `DiagnosisPanel`: verdict, first violation, worst margin, ranked causes.
- `ChallengeCard`: symptom, diagnosis options, evidence options, rationale feedback.
- `ProgressMatrix`: concept, prediction, judgment, diagnosis, teach-back evidence.
- `TeachingSnapshot`: print-ready chart, parameters, verdict, explanation prompt.
- `TargetedConceptReview`: shows explanations for diagnostic concepts previously answered incorrectly.

## Copy Contract

- Primary action: `예측을 제출하고 실행`
- Reveal action: `결과와 원인 보기`
- Reset: `기준 파형으로 복원`
- Pass: `교육용 마스크 통과`
- Fail: `교육용 마스크 이탈`
- Warning: `이 결과는 학습용 근사이며 적합성 판정이 아닙니다.`
- Empty review: `아직 저장된 진단이 없습니다. Lab에서 첫 실험을 완료해 보세요.`
- Storage recovery: `저장된 학습 기록을 읽을 수 없어 안전하게 초기화했습니다.`

## Chart Contract

- Both axes always show units.
- Pass/fail never relies on color alone.
- Upper and lower mask use amber dashed lines with direct labels.
- Violations use coral bands plus a text list below the plot.
- Baseline comparison uses a muted dotted line.
- Tooltip contains time, trace power, applicable mask, and margin.
- Screen readers receive a summary and an expandable table of significant points.

## Interaction States

- Initial: baseline trace and concept hint visible.
- Dirty parameters: chart preview is hidden until prediction is submitted.
- Evaluated: result, margin, and causes appear together.
- Undo: restores the previous evaluated parameter set.
- Invalid input: inline error with valid range and preserved prior result.
- Challenge correct/incorrect: both show rationale; incorrect does not block progression.
- Completed: Review route and Teaching Snapshot become primary actions.

## Accessibility

- WCAG 2.2 AA contrast target.
- Complete keyboard operation and visible focus.
- Minimum 44×44 px primary pointer targets on mobile.
- `prefers-reduced-motion` removes sweep and reveal animations.
- Status uses text/icon/pattern in addition to color.
- SVG has a text alternative and the same core data is available as HTML.

## UI Acceptance

- All four routes work directly and on refresh.
- No viewport has page-level horizontal overflow.
- Lab can be completed with keyboard only.
- A learner can identify the verdict and first violation without opening a tooltip.
- Print view fits Teaching Snapshot on one A4 landscape page.
