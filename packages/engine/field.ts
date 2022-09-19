import { createResultResolver } from './formula/resultResolver'
import { parse } from './formula'

export default function createField(name: string, formula: string, inputs: Record<string, unknown> = {}) {
  const resolve = createResultResolver(inputs)

  return {
    name,
    formula,
    resolve: () => {
      const parsed = parse(formula)
      if (parsed) {
        return resolve(parsed)
      }

      return undefined
    }
  }
}
