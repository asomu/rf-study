import { describe, expect, it } from 'vitest'
import { ROADMAP_TRACKS } from '../roadmap'
import { BENCH_ITEMS, BENCH_SOURCES, getBenchItem } from './index'

describe('bench items', () => {
  it('keeps item ids unique', () => {
    const ids = BENCH_ITEMS.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps step ids unique within each item', () => {
    for (const item of BENCH_ITEMS) {
      const ids = item.steps.map((step) => step.id)
      expect(new Set(ids).size, item.id).toBe(ids.length)
    }
  })

  it('cites a known source for every SCPI command', () => {
    for (const item of BENCH_ITEMS) {
      for (const row of item.scpi) expect(Object.keys(BENCH_SOURCES), `${item.id}: ${row.command}`).toContain(row.source)
    }
  })

  it('fills every section of every item', () => {
    for (const item of BENCH_ITEMS) {
      expect(item.principle.length, item.id).toBeGreaterThan(0)
      expect(item.settings.length, item.id).toBeGreaterThan(0)
      expect(item.steps.length, item.id).toBeGreaterThan(0)
      expect(item.scpi.length, item.id).toBeGreaterThan(0)
      expect(item.testProgram.length, item.id).toBeGreaterThan(0)
    }
  })

  it('links every bench item from a ready roadmap entry', () => {
    const readyHrefs = ROADMAP_TRACKS.flatMap((track) => track.items).filter((item) => item.status === 'ready').map((item) => item.href)
    for (const item of BENCH_ITEMS) expect(readyHrefs, item.id).toContain(`/bench/${item.id}`)
  })

  it('returns undefined for an unknown item id', () => {
    expect(getBenchItem('no-such-item')).toBeUndefined()
  })
})
