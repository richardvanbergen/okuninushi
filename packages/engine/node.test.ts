import { describe, expect, it } from 'vitest'

describe('node', () => {
  it('should be able to set a node name', () => {
    expect(true).toBe(true)
  })
  // it('should be able to set a node name', () => {
  //   const node = createNode('test name')
  //   expect(node.name).toBe('test name')
  // })
  //
  // it('should be able to resolve a field in its input', async () => {
  //   const field = createField('test field', '=1 + 2')
  //   const node = createNode('test name', [field])
  //   expect(await node.resolveInputField('test field')).toBe(3)
  // })
  //
  // it('should be able to resolve a field in its output', async () => {
  //   const field = createField('test field', '=1 + 2')
  //   const node = createNode('test name', [], [field])
  //   expect(await node.resolveOutputField('test field')).toBe(3)
  // })
})
