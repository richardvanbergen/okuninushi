import type { ZodType } from 'zod'
import type { ParsedFormula, ParsedReference } from './formula/formula'
import { createResultResolver } from './formula/resultResolver'
import { isGrammar, isGrammarType, parse } from './formula/formula'
import { z } from 'zod'
import { flatten } from './formula/ast'

export type FieldType = 'value' | 'formula'

export interface Field {
  id: symbol
  ref: string
  type: FieldType
  value: unknown
  validator?: ZodType
}

export interface ValueField extends Field {
  type: 'value'
  value: unknown
}

export interface FormulaField extends Field {
  type: 'formula'
  value: ParsedFormula
}

export function getNodeList(field: FormulaField) {
  return [...flatten(field.value)]
}

export function getReferences(field: FormulaField) {
  const nodeList = getNodeList(field)
  return nodeList.filter(node => isGrammarType<ParsedReference>(node, 'reference')) as ParsedReference[]
}

export function isFormulaField(field: Field): field is FormulaField {
  return field.type === 'formula'
}

export function resolveFieldValue(field: Field, inputs?: Map<string, unknown>) {
  let result
  if (isGrammar(field.value) && isGrammarType<ParsedFormula>(field.value, 'formula')) {
    const resolver = createResultResolver(inputs ?? new Map<string, unknown>())
    result = resolver(field.value)
  } else {
    result = field.value
  }

  if (field.validator) {
    field.validator.parse(result)
  }

  return result
}

export function createValueField(ref: string, value: unknown, validationSchema?: ZodType): ValueField {
  return {
    id: Symbol(ref),
    ref,
    type: 'value',
    value,
    validator: validationSchema
  }
}

export function createFormulaField(ref: string, value: string, validationSchema?: ZodType): FormulaField {
  const formulaValidator = z.string().trim().startsWith('=')
  formulaValidator.parse(value)

  return {
    id: Symbol(ref),
    ref,
    type: 'formula',
    value: parse(value),
    validator: validationSchema
  }
}
