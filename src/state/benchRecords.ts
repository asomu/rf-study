import { useCallback, useState } from 'react'
import { z } from 'zod'

const STORAGE_KEY = 'rf-study:bench:v1'

const entrySchema = z.object({
  prediction: z.string().max(500).optional(),
  measured: z.string().max(500).optional(),
})
const recordsSchema = z.record(z.string(), z.record(z.string(), entrySchema))

export type BenchEntry = z.infer<typeof entrySchema>
type BenchRecords = z.infer<typeof recordsSchema>

function readRecords(): BenchRecords {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = recordsSchema.safeParse(JSON.parse(raw))
    if (parsed.success) return parsed.data
  } catch {
    // fall through to a clean slate
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage unavailable; keep working in memory
  }
  return {}
}

function writeRecords(records: BenchRecords) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // storage unavailable; the page still works for this visit
  }
}

export function useBenchRecords(itemId: string) {
  const [entries, setEntries] = useState<Record<string, BenchEntry>>(() => readRecords()[itemId] ?? {})

  const update = useCallback((stepId: string, field: keyof BenchEntry, value: string) => {
    setEntries((current) => {
      const next = { ...current, [stepId]: { ...current[stepId], [field]: value } }
      writeRecords({ ...readRecords(), [itemId]: next })
      return next
    })
  }, [itemId])

  return { entries, update }
}
