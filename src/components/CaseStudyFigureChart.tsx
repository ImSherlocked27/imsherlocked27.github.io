import type { Language } from '../context/LanguageContext'
import type { CaseStudyFigure } from '../data/content'

const CHART_WIDTH = 400
const BAR_MAX_WIDTH = 300
const BAR_HEIGHT = 14
const ROW_HEIGHT = 44
const LABEL_HEIGHT = 16

/** Bar with only the data end (right side) rounded, anchored to the left baseline. */
function barPath(y: number, width: number): string {
  const r = Math.min(4, width)
  return `M0 ${y} H${width - r} Q${width} ${y} ${width} ${y + r} V${y + BAR_HEIGHT - r} Q${width} ${y + BAR_HEIGHT} ${width - r} ${y + BAR_HEIGHT} H0 Z`
}

export function CaseStudyFigureChart({ figure, language }: { figure: CaseStudyFigure; language: Language }) {
  const height = figure.bars.length * ROW_HEIGHT

  return (
    <figure className="case-figure">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        role="img"
        aria-label={figure.ariaLabel[language]}
        className="case-figure__chart"
      >
        {figure.bars.map((bar, index) => {
          const rowY = index * ROW_HEIGHT
          const barY = rowY + LABEL_HEIGHT + 6
          const width = Math.max(bar.value * BAR_MAX_WIDTH, 2)
          const valueText = `${bar.value.toFixed(2)}×`
          const color = bar.emphasis ? 'var(--accent)' : 'var(--text-muted)'

          return (
            <g key={bar.label.en}>
              <text x="0" y={rowY + LABEL_HEIGHT - 4} className="case-figure__label">
                {bar.label[language]}
              </text>
              <path d={barPath(barY, width)} fill={color}>
                <title>{`${bar.label[language]}: ${valueText}`}</title>
              </path>
              <text
                x={width + 8}
                y={barY + BAR_HEIGHT - 3}
                className={bar.emphasis ? 'case-figure__value case-figure__value--accent' : 'case-figure__value'}
              >
                {valueText}
                {bar.emphasis && figure.annotation ? `  (${figure.annotation})` : ''}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption className="case-figure__caption">{figure.caption[language]}</figcaption>
    </figure>
  )
}
