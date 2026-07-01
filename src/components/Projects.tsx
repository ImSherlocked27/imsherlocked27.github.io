import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import type { Language } from '../context/LanguageContext'
import { projects, ui } from '../data/content'
import type { ProjectEntry } from '../data/content'
import { ProjectDemoChat } from './ProjectDemoChat'

function ProjectCard({ project, language }: { project: ProjectEntry; language: Language }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="project-card">
      <h3>{project.title[language]}</h3>
      <p>{project.teaser[language]}</p>
      {project.demoId && !expanded && (
        <button
          type="button"
          className="button button--primary project-card__cta"
          onClick={() => setExpanded(true)}
        >
          {ui.tryDemo[language]}
        </button>
      )}
      {project.demoId && expanded && <ProjectDemoChat projectId={project.demoId} />}
    </article>
  )
}

export function Projects() {
  const { language } = useLanguage()

  return (
    <section id="projects" className="section">
      <h2 className="section__title">{ui.nav.projects[language]}</h2>
      <div className="projects">
        {projects.map((project) => (
          <ProjectCard key={project.title.en} project={project} language={language} />
        ))}
      </div>
    </section>
  )
}
