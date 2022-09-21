import { describe, expect, it } from 'vitest'
import { createNode, resolveNodeField } from './node'
import { createFormulaField } from './field'

describe('node', () => {
  it('should be able to set a node name', () => {
    const node = createNode('test name')
    expect(node.ref).toBe('test name')
  })

  it('should be able to resolve a field in its input', async () => {
    const node = createNode('test field', [
      createFormulaField('fieldName', '=1 + 2')
    ])

    expect(resolveNodeField(node, 'fieldName')).toBe(3)
  })

  it.todo('should be able to resolve field inputs')
})
