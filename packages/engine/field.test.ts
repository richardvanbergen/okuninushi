import { describe, expect, it } from 'vitest'
import field from './field'

describe('field', () => {
  it('should be able to set a name', () => {
    const f = field('name', 'value')
    expect(f.name).toBe('name')
  })

  it('should be able to set a formula', () => {
    const f = field('name', '=1')
    expect(f.formula).toBe('=1')
  })

  it('should be able to resolve a formula value', () => {
    const f = field('name', '=1 + 2')
    expect(f.resolve()).toBe(3)
  })

  it('should be able to process inputs', () => {
    const f = field('name', '=1 + 2 + $test.subObject', {
      test: {
        subObject: 3
      }
    })

    expect(f.resolve()).toBe(6)
  })
})
