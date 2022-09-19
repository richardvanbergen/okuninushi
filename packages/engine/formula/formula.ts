// @ts-expect-error no types
import { Grammar, Parser } from 'nearley'
import grammar from './grammar-nearley'

export type GrammarPrimitive = 'boolean' | 'number'  | 'plus' | 'minus' | 'times' | 'divide' | 'exponent' | 'string' | 'equals' | 'not_equals' | 'lt' | 'lte' | 'gt' | 'gte'

export type GrammarType =  'formula' | 'function' | 'arithmetic' | 'comparison' | 'reference' | 'each' | 'scoped_reference' | GrammarPrimitive

export interface ParsedGrammar {
  type: GrammarType
  value: unknown
  text: string
  offset: number
  lineBreaks: number
  line: number
  col: number
}

export interface ParsedPrimitive extends ParsedGrammar {
  type: GrammarPrimitive
}

export interface ParsedBoolean extends ParsedPrimitive {
  type: 'boolean'
  value: boolean
}

export interface ParsedNumber extends ParsedPrimitive {
  type: 'number'
  value: number
}

export interface ParsedPlus extends ParsedPrimitive {
  type: 'plus'
  value: '+'
}

export interface ParsedMinus extends ParsedPrimitive {
  type: 'minus'
  value: '-'
}

export interface ParsedTimes extends ParsedPrimitive {
  type: 'times'
  value: '*'
}

export interface ParsedDivide extends ParsedPrimitive {
  type: 'divide'
  value: '/'
}

export interface ParsedExponent extends ParsedPrimitive {
  type: 'exponent'
  value: '^'
}

export interface ParsedEquals extends ParsedPrimitive {
  type: 'equals'
  value: '=='
}

export interface ParsedNotEquals extends ParsedPrimitive {
  type: 'not_equals'
  value: '=='
}

export interface ParsedLessThan extends ParsedPrimitive {
  type: 'lt'
  value: '<'
}

export interface ParsedGreaterThan extends ParsedPrimitive {
  type: 'gt'
  value: '>'
}

export interface ParsedLessThanOrEqualTo extends ParsedPrimitive {
  type: 'lte'
  value: '<='
}

export interface ParsedGreaterThanOrEqualTo extends ParsedPrimitive {
  type: 'gte'
  value: '>='
}

export interface ParsedString extends ParsedPrimitive {
  type: 'string'
  value: string
}

export interface ParsedReference extends ParsedGrammar {
  type: 'reference'
  value: {
    identifier: string
    subpath: string[]
  }
}

export interface ParsedScopedReference extends ParsedGrammar {
  type: 'scoped_reference'
  value: {
    subpath: string[]
  }
}

export interface ParsedEach extends ParsedGrammar {
  type: 'each'
  value: {
    context: ParsedFunction | ParsedReference
    body: ParsedGrammar
  }
}

export interface ParsedFunction extends ParsedGrammar {
  type: 'function'
  value: {
    name: string
    params: ParsedScopedFormulaValue[]
  }
}

export type ParsedOperator = ParsedPlus | ParsedMinus | ParsedTimes | ParsedDivide | ParsedExponent

export type ParsedComparator = ParsedEquals | ParsedNotEquals | ParsedLessThan | ParsedGreaterThan | ParsedLessThanOrEqualTo | ParsedGreaterThanOrEqualTo

export interface ParsedComparison extends ParsedGrammar {
  type: 'comparison'
  value: {
    a: ParsedArithmetic | ParsedNumber | ParsedReference | ParsedScopedReference
    operator: ParsedComparator
    b: ParsedArithmetic | ParsedNumber | ParsedReference | ParsedScopedReference
  }
}

export type ParsedScopedFormulaValue = ParsedFormulaValue | ParsedScopedReference

export type ParsedFormulaValue =
  ParsedArithmetic |
  ParsedBoolean |
  ParsedNumber |
  ParsedString |
  ParsedFunction |
  ParsedComparison |
  ParsedReference |
  ParsedEach

export interface ParsedArithmetic extends ParsedGrammar {
  type: 'arithmetic'
  value: {
    left: ParsedArithmetic | ParsedNumber | ParsedReference | ParsedScopedReference
    operator: ParsedOperator
    right: ParsedArithmetic | ParsedNumber | ParsedReference | ParsedScopedReference
  }
}

export interface ParsedFormula extends ParsedGrammar {
  type: 'formula'
  value: ParsedFormulaValue
}

export function isGrammarType<T extends ParsedGrammar>(value: ParsedGrammar, type: GrammarType): value is T {
  return value.type === type
}

export function isPrimitive(value: ParsedGrammar): value is ParsedPrimitive {
  return ['number', 'string', 'divide', 'times', 'plus', 'minus'].includes(value.type)
}

export class IncompleteInputError extends Error {}

export function parse(formula: string) {
  const parserTest = new Parser(Grammar.fromCompiled(grammar))
  const results = parserTest.feed(formula)?.results

  if (results) {
    if (results.length > 1) {
      throw new Error('Ambiguous grammar detected.')
    }

    if (results.length < 1) {
      throw new IncompleteInputError('Syntax error. Unexpected end of input.')
    }

    if (isGrammarType<ParsedFormula>(results?.[0]?.[0], 'formula')) {
      return results[0][0]
    }

    throw new Error(`If you see this, please report a bug to the parser library with this input: ${formula}`)
  }
}
