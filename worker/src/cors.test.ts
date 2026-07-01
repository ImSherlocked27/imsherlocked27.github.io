import { describe, expect, it } from 'vitest'
import { corsHeaders } from './cors'

describe('corsHeaders', () => {
  it('allows the configured origin', () => {
    const headers = corsHeaders('https://imsherlocked27.github.io', 'https://imsherlocked27.github.io')
    expect(headers['Access-Control-Allow-Origin']).toBe('https://imsherlocked27.github.io')
  })

  it('omits the allow-origin header for any other origin', () => {
    const headers = corsHeaders('https://evil.example', 'https://imsherlocked27.github.io')
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined()
  })

  it('always includes the base JSON + method headers', () => {
    const headers = corsHeaders('https://evil.example', 'https://imsherlocked27.github.io')
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS')
  })
})
