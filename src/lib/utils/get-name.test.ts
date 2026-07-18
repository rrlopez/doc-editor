import { describe, expect, it } from 'vitest'
import { getName } from './get-name'

describe('getName', () => {
  it('returns nickName when present', () => {
    expect(getName({ firstName: 'Alice', lastName: 'Johnson', nickName: 'Ali' })).toBe('Ali')
  })

  it('returns firstName + lastName when no nickName', () => {
    expect(getName({ firstName: 'Alice', lastName: 'Johnson', nickName: null })).toBe('Alice Johnson')
  })

  it('returns firstName alone when lastName is missing', () => {
    expect(getName({ firstName: 'Alice', lastName: null, nickName: null })).toBe('Alice')
  })

  it('returns Unknown when all fields are null', () => {
    expect(getName({ firstName: null, lastName: null, nickName: null })).toBe('Unknown')
  })

  it('returns Unknown when called with undefined', () => {
    expect(getName(undefined)).toBe('Unknown')
  })

  it('trims whitespace from names', () => {
    expect(getName({ firstName: '  Bob  ', lastName: '  Smith  ', nickName: null })).toBe('Bob Smith')
  })

  it('ignores empty-string nickName and falls back to first+last', () => {
    expect(getName({ firstName: 'Charlie', lastName: 'Brown', nickName: '   ' })).toBe('Charlie Brown')
  })
})
