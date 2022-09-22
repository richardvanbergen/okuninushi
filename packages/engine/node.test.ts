import { describe, expect, it } from 'vitest'
import { createNode, resolveNodeField } from './node'
import { createFormulaField } from './field'

describe('node', () => {
  it('should be able to set a node name', () => {
    const node = createNode('test name')
    expect(node.ref).toBe('test name')
  })

  it('should be able to resolve a field in its input', async () => {
    const node = createNode('test node', [
      createFormulaField('fieldName', '=1 + 2')
    ])

    expect(resolveNodeField(node, 'fieldName')).toBe(3)
  })

  it('should be able to resolve field inputs', () => {
    const node = createNode('test',
      [
        createFormulaField('testFieldName', '=$linkedNode.fieldName')
      ],
      [
        createNode('linkedNode', [createFormulaField('fieldName', '=1 + 2')])
      ],
    )

    expect(resolveNodeField(node, 'testFieldName')).toBe(3)
  })

  it.todo('should be able be able to validate inputs')
})
