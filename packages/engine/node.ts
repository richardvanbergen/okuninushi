import type { Field } from './field'
import { parse, resolve } from './field'
import type { ZodType } from 'zod'

async function validatedResolve(resolvedValue: unknown, validator?: ZodType) {
  if (validator) {
    return await validator.parseAsync(resolvedValue)
  }

  return resolvedValue
}

export function createNode(name: string, inputs: Field[] = [], outputs: Field[] = []) {
  async function resolveField(fieldList: Field[], name: string) {
    const field = fieldList.find((input) => input.name === name)
    if (field) {
      if (field.type === 'formula') {
        const parsed = parse(field)
        if (parsed) {
          const resolved = await resolve(parsed.ast)
          return validatedResolve(resolved, field.validator)
        }
      } else {
        return validatedResolve(field.value, field.validator)
      }
    }
  }

  const resolveInputField = async (fieldName: string) => await resolveField(inputs, fieldName)
  const resolveOutputField = async (fieldName: string) => await resolveField(outputs, fieldName)

  return {
    name,
    resolveInputField,
    resolveOutputField
  }
}
