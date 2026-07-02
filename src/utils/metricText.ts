export interface MetricSegment {
  text: string
  metric: boolean
}

/**
 * Splits a string on `**…**` markers so key metrics can be rendered
 * with emphasis without dangerouslySetInnerHTML. Unclosed markers are
 * treated as literal text.
 */
export function parseMetricSegments(input: string): MetricSegment[] {
  const segments: MetricSegment[] = []
  let rest = input

  while (rest.length > 0) {
    const open = rest.indexOf('**')
    if (open === -1) {
      segments.push({ text: rest, metric: false })
      break
    }
    const close = rest.indexOf('**', open + 2)
    if (close === -1) {
      segments.push({ text: rest, metric: false })
      break
    }
    if (open > 0) {
      segments.push({ text: rest.slice(0, open), metric: false })
    }
    const inner = rest.slice(open + 2, close)
    if (inner.length > 0) {
      segments.push({ text: inner, metric: true })
    }
    rest = rest.slice(close + 2)
  }

  return segments
}
