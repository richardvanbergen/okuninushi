import type { ZodType } from 'zod'
import type { ParsedFormula, ParsedReference } from './formula/formula'
import { createResultResolver } from './formula/resultResolver'
import { isGrammar, isGrammarType, parse } from './formula/formula'
import { z } from 'zod'
import { flatten } from './formula/ast'

export type FieldType = 'value' | 'formula'

interface Field {
  type: FieldType
  name: string
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

export function resolveFieldValue(field: Field, inputs?: Record<string, unknown>) {
  let result
  if (isGrammar(field.value) && isGrammarType<ParsedFormula>(field.value, 'formula')) {
    const resolver = createResultResolver(inputs ?? {})
    result = resolver(field.value)
  } else {
    result = field.value
  }

  if (field.validator) {
    field.validator.parse(result)
  }

  return result
}

export function createValueField(name: string, value: unknown, validationSchema?: ZodType): ValueField {
  return {
    type: 'value',
    name,
    value,
    validator: validationSchema
  }
}

export function createFormulaField(name: string, value: string, validationSchema?: ZodType): FormulaField {
  const formulaValidator = z.string().trim().startsWith('=')
  formulaValidator.parse(value)

  return {
    type: 'formula',
    name,
    value: parse(value),
    validator: validationSchema
  }
}
