import { describe, it, expect } from 'vitest'
import { addFeatureSchema } from '../addFeatureSchema'

describe('addFeatureSchema', () => {
  const validData = { description: 'This is a feature', displayOrder: 0 }

  it('passes with valid data', () => {
    const result = addFeatureSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  describe('description', () => {
    it('fails when description is an empty string', () => {
      const result = addFeatureSchema.safeParse({
        ...validData,
        description: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message)
        expect(messages).toContain('Description is required')
      }
    })

    it('fails when description is missing', () => {
      const result = addFeatureSchema.safeParse({ displayOrder: 0 })
      expect(result.success).toBe(false)
    })
  })

  describe('displayOrder', () => {
    it('coerces a numeric string to a number', () => {
      const result = addFeatureSchema.safeParse({
        ...validData,
        displayOrder: '3',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.displayOrder).toBe(3)
      }
    })

    it('coerces the value 0 correctly', () => {
      const result = addFeatureSchema.safeParse({
        ...validData,
        displayOrder: 0,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.displayOrder).toBe(0)
      }
    })

    it('fails when displayOrder is not a number', () => {
      const result = addFeatureSchema.safeParse({
        ...validData,
        displayOrder: 'not-a-number',
      })
      expect(result.success).toBe(false)
    })
  })
})
