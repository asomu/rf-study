# M<n> Review — <Module Name>

**Spec:** [SPEC.md](SPEC.md)
**Reviewed:** <date>
**Verdict:** Pass | Pass with follow-ups | Blocked

Review once, when the module is feature-complete. Ask an independent reviewer (another session or person) to check the spec against the running app.

## Checklist

### Model and tests

- [ ] `npm run check` passes (unit/component tests and build)
- [ ] Golden scenarios assert expected pass/fail, region, and boundary
- [ ] Invalid input is rejected before simulation

### Learning flow

- [ ] Prediction is recorded before the result is revealed
- [ ] Repeated attempts overwrite rather than inflate evidence
- [ ] Teach-back requires explicit confirmation

### Persistence

- [ ] Stored progress is validated; corrupt records reset safely; schema migrations covered

### UI and accessibility

- [ ] `npm run test:e2e` passes
- [ ] No page-level overflow at 1440, 768, 375 px
- [ ] Zero axe serious/critical violations on every route
- [ ] Keyboard-only operation; reduced motion respected

### Deployable output

- [ ] `npm run test:smoke` passes against production `dist`
- [ ] GitHub Actions deploy succeeds

### Content and boundary

- [ ] Charts declare units, reference, and model status
- [ ] No conformance-verdict language for educational results

## Findings Fixed During Review

| Severity | Finding | Fix |
| --- | --- | --- |

## Learner-content Assessment

## Follow-ups
