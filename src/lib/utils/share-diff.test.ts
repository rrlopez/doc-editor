import { describe, expect, it } from 'vitest'

/**
 * The share diff logic used in ShareDialog.handleSave.
 * Extracted here as a pure function so it can be unit-tested without
 * mounting the full React component.
 */
function computeShareDiff(
  selected: Set<string>,
  sharedIds: Set<string>,
): { toAdd: string[]; toRemove: string[] } {
  const toAdd = [...selected].filter(id => !sharedIds.has(id))
  const toRemove = [...sharedIds].filter(id => !selected.has(id))
  return { toAdd, toRemove }
}

describe('computeShareDiff', () => {
  it('returns empty arrays when selection matches current shares exactly', () => {
    const shared = new Set(['user-1', 'user-2'])
    const selected = new Set(['user-1', 'user-2'])
    expect(computeShareDiff(selected, shared)).toEqual({ toAdd: [], toRemove: [] })
  })

  it('adds new users who were not previously shared', () => {
    const shared = new Set(['user-1'])
    const selected = new Set(['user-1', 'user-2', 'user-3'])
    const { toAdd, toRemove } = computeShareDiff(selected, shared)
    expect(toAdd).toEqual(expect.arrayContaining(['user-2', 'user-3']))
    expect(toRemove).toHaveLength(0)
  })

  it('removes users who were deselected', () => {
    const shared = new Set(['user-1', 'user-2', 'user-3'])
    const selected = new Set(['user-1'])
    const { toAdd, toRemove } = computeShareDiff(selected, shared)
    expect(toAdd).toHaveLength(0)
    expect(toRemove).toEqual(expect.arrayContaining(['user-2', 'user-3']))
  })

  it('handles adds and removes in the same operation', () => {
    const shared = new Set(['user-1', 'user-2'])
    const selected = new Set(['user-2', 'user-3'])
    const { toAdd, toRemove } = computeShareDiff(selected, shared)
    expect(toAdd).toEqual(['user-3'])
    expect(toRemove).toEqual(['user-1'])
  })

  it('returns all current shares as toRemove when selection is empty', () => {
    const shared = new Set(['user-1', 'user-2'])
    const selected = new Set<string>()
    const { toAdd, toRemove } = computeShareDiff(selected, shared)
    expect(toAdd).toHaveLength(0)
    expect(toRemove).toEqual(expect.arrayContaining(['user-1', 'user-2']))
  })

  it('returns all selected as toAdd when there are no existing shares', () => {
    const shared = new Set<string>()
    const selected = new Set(['user-1', 'user-2'])
    const { toAdd, toRemove } = computeShareDiff(selected, shared)
    expect(toAdd).toEqual(expect.arrayContaining(['user-1', 'user-2']))
    expect(toRemove).toHaveLength(0)
  })
})
