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
        <a className="button" href="/resume.pdf" download>
          {ui.downloadCv[language]}
        </a>
      </div>
    </section>
  )
}
