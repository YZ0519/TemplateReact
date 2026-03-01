import { describe, it, expect } from 'vitest'
import { createProjectSchema } from '../createProjectSchema'

describe('createProjectSchema', () => {
  const validData = {
    title: 'My Project',
    description: 'A detailed description that is long enough',
    displayOrder: 1,
  }

  it('passes with valid data', () => {
    const result = createProjectSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  describe('title', () => {
    it('fails when title is fewer than 3 characters', () => {
      const result = createProjectSchema.safeParse({ ...validData, title: 'ab' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message)
        expect(messages).toContain('Title must be at least 3 characters')
      }
    })

    it('fails when title exceeds 100 characters', () => {
      const result = createProjectSchema.safeParse({
        ...validData,
        title: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message)
        expect(messages).toContain('Title must be 100 characters or fewer')
      }
    })

    it('passes when title is exactly 3 characters', () => {
      const result = createProjectSchema.safeParse({ ...validData, title: 'abc' })
      expect(result.success).toBe(true)
    })

    it('passes when title is exactly 100 characters', () => {
      const result = createProjectSchema.safeParse({
        ...validData,
        title: 'a'.repeat(100),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('description', () => {
    it('fails when description is fewer than 10 characters', () => {
      const result = createProjectSchema.safeParse({
        ...validData,
        description: 'short',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message)
        expect(messages).toContain('Description must be at least 10 characters')
      }
    })

    it('fails when description exceeds 2000 characters', () => {
      const result = createProjectSchema.safeParse({
        ...validData,
        description: 'a'.repeat(2001),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message)
        expect(messages).toContain(
          'Description must be 2000 characters or fewer'
        )
      }
    })

    it('passes when description is exactly 10 characters', () => {
      const result = createProjectSchema.safeParse({
        ...validData,
        description: 'a'.repeat(10),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('displayOrder', () => {
    it('coerces a numeric string to a number', () => {
      const result = createProjectSchema.safeParse({
        ...validData,
        displayOrder: '5',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.displayOrder).toBe(5)
      }
    })

    it('fails when displayOrder is not a number', () => {
      const result = createProjectSchema.safeParse({
        ...validData,
        displayOrder: 'not-a-number',
      })
      expect(result.success).toBe(false)
    })

    it('coerces the value 0 correctly', () => {
      const result = createProjectSchema.safeParse({
        ...validData,
        displayOrder: 0,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.displayOrder).toBe(0)
      }
    })
  })
})
