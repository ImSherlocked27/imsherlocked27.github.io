import { useLanguage } from '../context/LanguageContext'
import { experience, ui } from '../data/content'
import { parseMetricSegments } from '../utils/metricText'

function BulletText({ text }: { text: string }) {
  return (
    <>
      {parseMetricSegments(text).map((segment, index) =>
        segment.metric ? (
          <strong key={index} className="metric">
            {segment.text}
          </strong>
        ) : (
          segment.text
        ),
      )}
    </>
  )
}

export function Experience() {
  const { language } = useLanguage()

  return (
    <section id="experience" className="section">
      <h2 className="section__title">{ui.nav.experience[language]}</h2>
      <ol className="timeline">
        {experience.map((entry) => (
          <li key={`${entry.company}-${entry.dates.en}`} className="timeline__item">
            <div className="timeline__header">
              <h3>{entry.role[language]}</h3>
              <span className="timeline__dates">{entry.dates[language]}</span>
            </div>
            <p className="timeline__meta">
              {entry.company} · {entry.location[language]}
            </p>
            <ul className="timeline__bullets">
              {entry.bullets.map((bullet, index) => (
                <li key={index}>
                  <BulletText text={bullet[language]} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
