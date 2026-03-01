import { describe, it, expect } from 'vitest'
import { addTechStackSchema } from '../addTechStackSchema'

describe('addTechStackSchema', () => {
  const validData = { name: 'React', category: 'Frontend' }

  it('passes with valid data', () => {
    const result = addTechStackSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  describe('name', () => {
    it('fails when name is an empty string', () => {
      const result = addTechStackSchema.safeParse({ ...validData, name: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message)
        expect(messages).toContain('Name is required')
      }
    })

    it('fails when name is missing', () => {
      const result = addTechStackSchema.safeParse({ category: 'Frontend' })
      expect(result.success).toBe(false)
    })
  })

  describe('category', () => {
    it('fails when category is an empty string', () => {
      const result = addTechStackSchema.safeParse({
        ...validData,
        category: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message)
        expect(messages).toContain('Category is required')
      }
    })

    it('fails when category is missing', () => {
      const result = addTechStackSchema.safeParse({ name: 'React' })
      expect(result.success).toBe(false)
    })
  })

  it('passes with trimmed-but-non-empty values', () => {
    const result = addTechStackSchema.safeParse({
      name: 'TypeScript',
      category: 'Language',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('TypeScript')
      expect(result.data.category).toBe('Language')
    }
  })
})
