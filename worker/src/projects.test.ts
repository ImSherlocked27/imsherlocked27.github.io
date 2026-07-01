import { describe, expect, it } from 'vitest'
import { buildSystemPrompt, isValidProjectId } from './projects'

describe('isValidProjectId', () => {
  it('accepts known project ids', () => {
    expect(isValidProjectId('logistics-analytics')).toBe(true)
    expect(isValidProjectId('car-marketplace')).toBe(true)
  })

  it('rejects unknown project ids', () => {
    expect(isValidProjectId('neighborhood-magazine')).toBe(false)
    expect(isValidProjectId('')).toBe(false)
  })
})

describe('buildSystemPrompt', () => {
  it('returns a non-empty English prompt for logistics-analytics', () => {
    const prompt = buildSystemPrompt('logistics-analytics', 'en')
    expect(prompt.length).toBeGreaterThan(0)
    expect(prompt).toContain('Northstar Logistics')
  })

  it('returns a non-empty Spanish prompt for logistics-analytics', () => {
    const prompt = buildSystemPrompt('logistics-analytics', 'es')
    expect(prompt.length).toBeGreaterThan(0)
    expect(prompt).toContain('Northstar Logistics')
  })

  it('returns a non-empty English prompt for car-marketplace', () => {
    const prompt = buildSystemPrompt('car-marketplace', 'en')
    expect(prompt).toContain('Concierge')
  })

  it('returns a non-empty Spanish prompt for car-marketplace', () => {
    const prompt = buildSystemPrompt('car-marketplace', 'es')
    expect(prompt).toContain('Concierge')
  })
})
