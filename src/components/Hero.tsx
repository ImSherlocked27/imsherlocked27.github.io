import { useLanguage } from '../context/LanguageContext'
import { hero, ui } from '../data/content'

export function Hero() {
  const { language } = useLanguage()

  return (
    <section id="top" className="hero">
      <p className="hero__eyebrow">{hero.location}</p>
      <h1 className="hero__name">{hero.name}</h1>
      <h2 className="hero__title">{hero.title[language]}</h2>
      <p className="hero__summary">{hero.summary[language]}</p>
      <ul className="hero__stats">
        {hero.stats.map((stat) => (
          <li key={stat.label.en} className="hero__stat">
            <span className="hero__stat-value">{stat.value}</span>
            <span className="hero__stat-label">{stat.label[language]}</span>
          </li>
        ))}
      </ul>
      <div className="hero__actions">
        <a className="button button--primary" href={`mailto:${hero.email}`}>
          {hero.email}
        </a>
        <a
          className="button"
          href={hero.linkedin}
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <a
          className="button"
          href={hero.github}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a className="button" href="/resume.pdf" download>
          {ui.downloadCv[language]}
        </a>
      </div>
    </section>
  )
}
