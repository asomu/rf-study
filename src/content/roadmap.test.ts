import { describe, expect, it } from 'vitest'
import { ROADMAP_TRACKS, roadmapSummary } from './roadmap'

describe('roadmap data', () => {
  const items = ROADMAP_TRACKS.flatMap((track) => track.items)

  it('numbers the nine tracks in order', () => {
    expect(ROADMAP_TRACKS.map((track) => track.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('keeps item ids unique across tracks', () => {
    const ids = items.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every ready item a link and no planned item a link', () => {
    for (const item of items) {
      if (item.status === 'ready') expect(item.href, item.id).toMatch(/^\/modules\//)
      if (item.status === 'planned') expect(item.href, item.id).toBeUndefined()
    }
  })

  it('places the M1 lab in the GSM track and the measurement track', () => {
    const m1Tracks = ROADMAP_TRACKS.filter((track) => track.items.some((item) => item.href?.startsWith('/modules/gsm-pvt/')))
    expect(m1Tracks.map((track) => track.id)).toEqual(['signals', 'measurements'])
  })

  it('counts core and later items separately', () => {
    const summary = roadmapSummary()
    expect(summary.total).toBe(items.length)
    expect(summary.later).toBe(ROADMAP_TRACKS.find((track) => track.layer === 'later')!.items.length)
    expect(summary.ready).toBe(items.filter((item) => item.status === 'ready').length)
  })
})
