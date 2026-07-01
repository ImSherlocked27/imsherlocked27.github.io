import { useLanguage } from '../context/LanguageContext'
import { certifications, education, ui } from '../data/content'

export function Education() {
  const { language } = useLanguage()

  return (
    <section id="education" className="section">
      <h2 className="section__title">{ui.nav.education[language]}</h2>
      <div className="education">
        <h3>{education.degree[language]}</h3>
        <p className="education__meta">
          {education.institution} · {education.dates}
        </p>
        <p>
          {ui.coursework[language]}: {education.coursework[language]}
        </p>
      </div>
      <div className="certifications">
        <h3>{ui.certifications[language]}</h3>
        <ul>
          {certifications.map((cert) => (
            <li key={cert.name}>
              <span>{cert.name}</span>
              <span className="certifications__meta">
                {cert.issuer} · {cert.status[language]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
