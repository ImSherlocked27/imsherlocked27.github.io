import { useLanguage } from '../context/LanguageContext'
import { projects, ui } from '../data/content'

export function Projects() {
  const { language } = useLanguage()

  return (
    <section id="projects" className="section">
      <h2 className="section__title">{ui.nav.projects[language]}</h2>
      <div className="projects">
        {projects.map((project) => (
          <article key={project.title.en} className="project-card">
            <span className="project-card__badge">{ui.comingSoon[language]}</span>
            <h3>{project.title[language]}</h3>
            <p>{project.teaser[language]}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
