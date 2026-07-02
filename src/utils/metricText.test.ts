import { describe, expect, it } from 'vitest'
import { parseMetricSegments } from './metricText'

describe('parseMetricSegments', () => {
  it('returns plain text as a single non-metric segment', () => {
    expect(parseMetricSegments('no metrics here')).toEqual([
      { text: 'no metrics here', metric: false },
    ])
  })

  it('extracts a metric in the middle of a sentence', () => {
    expect(parseMetricSegments('cut costs **30%+** overall')).toEqual([
      { text: 'cut costs ', metric: false },
      { text: '30%+', metric: true },
      { text: ' overall', metric: false },
    ])
  })

  it('handles metrics at the start and end', () => {
    expect(parseMetricSegments('**~20%** uplift and **~40%** less time')).toEqual([
      { text: '~20%', metric: true },
      { text: ' uplift and ', metric: false },
      { text: '~40%', metric: true },
      { text: ' less time', metric: false },
    ])
  })

  it('treats an unclosed marker as literal text', () => {
    expect(parseMetricSegments('a **broken marker')).toEqual([
      { text: 'a **broken marker', metric: false },
    ])
  })

  it('drops empty metric markers', () => {
    expect(parseMetricSegments('odd **** case')).toEqual([
      { text: 'odd ', metric: false },
      { text: ' case', metric: false },
    ])
  })

  it('returns no segments for an empty string', () => {
    expect(parseMetricSegments('')).toEqual([])
  })
})
