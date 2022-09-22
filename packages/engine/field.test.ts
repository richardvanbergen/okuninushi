import { describe, expect, it } from 'vitest'
import {
  createFormulaField,
  createValueField,
  getNodeList,
  getReferences,
  isFormulaField,
  resolveFieldValue
} from './field'
import { z, ZodError } from 'zod'

describe('field', () => {
  it('should be able to set a name', () => {
    const f = createValueField('name', 'value')
    expect(f.ref).toBe('name')
  })

  it('should have an immutable ref', () => {
    const f = createValueField('name', 'value')
    expect(f.id.toString()).toBe('Symbol(name)')
  })

  it('should be able to parse a formula', () => {
    const f = createFormulaField('name', '=1')
    expect(f.value.type).toBe('formula')
    expect(f.value.value.type).toBe('number')
    expect(f.value.value.value).toBe(1)
  })

  it('should reject invalid formulas', () => {
    expect(() => createFormulaField('name', '1')).toThrowError(new ZodError([
      {
        'code': 'invalid_string',
        'validation': {
          'startsWith': '='
         },
         'message': 'Invalid input: must start with "="',
         'path': []
      }
    ]))
  })

  it('should be able to validate a raw value', async () => {
    const f1 = createValueField('name', 'value 1', z.string())
    const f2 = createValueField('name', 'value 2', z.number())

    expect(await f1.validator?.parseAsync(f1.value)).toBe('value 1')

    expect(async () => await f2.validator?.parseAsync(f2.value))
      .rejects.toThrowError(new ZodError([
      {
        'code': 'invalid_type',
        'expected': 'number',
        'received': 'string',
        'path': [],
        'message': 'Expected number, received string'
      }
    ]))
  })

  it('should able to resolve values', async () => {
    const f = createValueField('name', 123, z.number())
    const resolved = await resolveFieldValue(f)
    expect(resolved).toBe(123)
  })

  it('should be able to resolve a formula value', async () => {
    const f = createFormulaField('name', '=1 + 2', z.number())
    const resolved = await resolveFieldValue(f)
    expect(resolved).toBe(3)
  })

  it('should be able to process inputs', async () => {
    const f = createFormulaField('name', '=1 + 2 + $test.subObject')

    const inputs = new Map<string, unknown>()
    inputs.set('test', { subObject: 3 })

    expect(await resolveFieldValue(f, inputs)).toBe(6)
  })

  it('should validate its output', () => {
    const f = createFormulaField('name', '=1', z.string())
    const throws = async () => await resolveFieldValue(f)
    expect(throws).rejects.toThrowError(new ZodError([
      {
        'code': 'invalid_type',
        'expected': 'string',
        'received': 'number',
        'path': [],
        'message': 'Expected string, received number'
      }
    ]))
  })

  it('can flatten parsed nodes to a list', () => {
    const f = createFormulaField('name', '=1 + 2')
    const nodeList = getNodeList(f)
    expect(nodeList.length).toEqual(5)
  })

  it('can extract a list of referenced nodes', () => {
    const f = createFormulaField('name', '=1 + 2 + $test.subObject')
    const references = getReferences(f)
    expect(references.length).toEqual(1)
    expect(references[0].value.identifier).toEqual('test')
    expect(references[0].value.subpath).toEqual(['subObject'])
  })

  it('can test for a formula field type', () => {
    const f1 = createFormulaField('name', '=1')
    const f2 = createValueField('name', 1)
    expect(isFormulaField(f1)).toBe(true)
    expect(isFormulaField(f2)).toBe(false)
  })

  it.todo('should be able to validate the field name')
})
