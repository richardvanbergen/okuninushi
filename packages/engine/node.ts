import type { Field } from './field'
import { getReferences, isFormulaField, resolveFieldValue } from './field'
import { get } from 'lodash'

type Node = {
  id: symbol
  ref: string
  linkedNodes: Map<string, Node>
  fields: Map<string, Field>
}

export function resolveNodeField(node: Node, fieldName: string): unknown {
  const field = node.fields.get(fieldName)
  if (field) {
    if (isFormulaField(field)) {
      const refs = getReferences(field)

      const inputs = refs.reduce((acc, ref) => {
        const linkedNode = node.linkedNodes.get(ref.value.identifier)
        if (linkedNode) {
          const [ refFieldName, subPath ] = ref.value.subpath
          const result = subPath && subPath.length
            ? get(resolveNodeField(linkedNode, refFieldName), subPath)
            : resolveNodeField(linkedNode, refFieldName)

          acc.set(
            linkedNode.ref,
            { [refFieldName]: result }
          )
        }

        return acc
      }, new Map<string, unknown>())

      return resolveFieldValue(field, inputs)
    }

    return resolveFieldValue(field)
  }
}

export function createNode(ref: string, fields: Field[] = [], linkedNodes: Node[] = []): Node {
  const fieldMap = new Map<string, Field>()
  fields.map(field => fieldMap.set(field.ref, field))

  const linkedNodesMap = new Map<string, Node>()
  linkedNodes.map(linked => linkedNodesMap.set(linked.ref, linked))

  return {
    id: Symbol(ref),
    ref: ref,
    fields: fieldMap,
    linkedNodes: linkedNodesMap,
  }
}
