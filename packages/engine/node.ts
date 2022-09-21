import type { Field } from './field'
import { getReferences, isFormulaField, resolveFieldValue } from './field'
import { z } from 'zod'

type Node = {
  ref: string
  inputs: Node[]
  fields: Map<string, Field>
}

export function resolveNodeField(node: Node, fieldName: string) {
  const field = node.fields.get(fieldName)
  if (field) {
    return resolveFieldValue(field, {})
  }

  return null
}

export function createNode(ref: string, fields: Field[] = [], inputs: Node[] = []) {
  const references = fields.reduce(
    (acc, field) => {
      if (isFormulaField(field)) {
        const refs = getReferences(field)
        return [...acc, ...refs.map(ref => ref.value)]
      }

      return acc
    },
    [] as { identifier: string, subpath: string[] }[]
  )

  const nodeValidation = z.object({})
  references.forEach(ref => {
    nodeValidation.extend({
      [ref.identifier]: z.object({})
    })
  })

  const fieldMap = new Map<string, Field>()
  fields.map(field => fieldMap.set(field.name, field))

  return {
    ref,
    inputs,
    fields: fieldMap,
    validator: nodeValidation
  }
}
