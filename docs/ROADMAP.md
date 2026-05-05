# Roadmap

Last updated: 2026-05-05

## Roadmap Rule

The roadmap connects RF growth goals to app implementation. A feature should be added only when it supports a learning outcome or a practical RF workflow.

New ideas start in `docs/IDEA_BACKLOG.md`. Accepted ideas move here when they are ready for planning or implementation.

## Phase 1: Multi-Mode Fundamentals, Months 1-6

Goal: build strong principle-based understanding for GSM/EDGE/LTE/NR measurements and mode differences.

Learning outcomes:

- Explain GSM burst timing, PvT, Phase Error, and Frequency Error.
- Explain EDGE 8-PSK, EVM, AM-PM distortion, and ORFS.
- Explain LTE/NR EVM, ACLR, SEM, PAPR, RB allocation, and MPR/A-MPR at a practical level.
- Compare mode-specific measurement requirements.

Product outcomes:

- Documentation foundation
- GSM Burst/PvT Lab
- GSM Phase Error Lab
- EDGE IQ/EVM Lab
- Initial LTE/NR measurement comparison notes

## Phase 2: Multi-Mode Integrated Design, Months 7-12

Goal: connect mode-specific measurements to PA/FEM design trade-offs and multi-mode control.

Learning outcomes:

- Compare GSM saturated operation, EDGE backed-off linear operation, and LTE/NR APT/ET operation.
- Explain PA bias, matching, efficiency, linearity, thermal behavior, and harmonic management.
- Explain mode switching logic through GPIO/MIPI, state machines, sequencing, and glitch prevention.
- Understand EN-DC, DSDS/DSDA, coexistence, and resource sharing issues.

Product outcomes:

- Mode Switching Lab
- PA Bias/Linearity Lab
- Multi-mode coexistence case studies
- Production test flow optimizer concept

## Phase 3: Advanced Multi-Mode Innovation, Months 13-18

Goal: develop senior-level architectural judgment and future-facing RF system thinking.

Learning outcomes:

- Propose architecture options for LTE/NR-only and GSM sunset scenarios.
- Explain AI/ML use cases for DPD training, impedance tuning, thermal compensation, and yield prediction.
- Compare reconfigurable networks, ultra-wideband designs, and software-defined matching.
- Teach multi-mode RF frontend architecture to junior engineers.

Product outcomes:

- Advanced architecture notes
- Thermal/yield analysis concepts
- Teaching mode improvements
- Final portfolio-style RF learning map

## First 4-Week Execution Plan

| Week | Focus | Deliverables |
| --- | --- | --- |
| 1 | Documentation system and M1 spec | Core docs, M1 acceptance criteria, simulator model notes |
| 2 | Web app foundation | Vite/React/TypeScript app, layout shell, simulator state model |
| 3 | GSM Burst/PvT simulator | Time-domain graph, educational PvT mask, pass/fail evaluation |
| 4 | Parameter challenge and review | Challenge scenarios, explanation feedback, validation and next-module decision |

## Current Planned Feature

`GSM Burst/PvT Lab`

Purpose:

- Make GSM burst timing visible.
- Show how ramp timing, settling, overshoot, and noise affect PvT mask pass/fail.
- Train principle understanding through parameter challenges.

V1 scope:

- Educational approximation
- Single-page lab UI
- No backend
- No real measurement data import
- No full 3GPP conformance implementation
