import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import type { Language } from '../context/LanguageContext'
import { projects, ui } from '../data/content'
import type { CaseStudy, ProjectEntry } from '../data/content'
import { ProjectDemoChat } from './ProjectDemoChat'

function CaseStudyPanel({ caseStudy, language }: { caseStudy: CaseStudy; language: Language }) {
  return (
    <div className="case-study">
      <ul className="case-study__metrics">
        {caseStudy.metrics.map((metric) => (
          <li key={metric.label.en} className="case-study__metric">
            <span className="case-study__metric-value">{metric.value}</span>
            <span className="case-study__metric-label">{metric.label[language]}</span>
          </li>
        ))}
      </ul>
      <h4>{ui.caseProblem[language]}</h4>
      <p>{caseStudy.problem[language]}</p>
      <h4>{ui.caseApproach[language]}</h4>
      <p>{caseStudy.approach[language]}</p>
      <h4>{ui.caseResults[language]}</h4>
      <p>{caseStudy.results[language]}</p>
      <h4>{ui.caseStack[language]}</h4>
      <ul className="case-study__stack">
        {caseStudy.stack.map((item) => (
          <li key={item} className="chip">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProjectCard({ project, language }: { project: ProjectEntry; language: Language }) {
  const [caseOpen, setCaseOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <article className="project-card">
      <div className="project-card__header">
        <h3>{project.title[language]}</h3>
        {project.tag && <span className="project-card__tag">{project.tag[language]}</span>}
      </div>
      <p>{project.teaser[language]}</p>
      <div className="project-card__actions">
        {project.caseStudy && (
          <button
            type="button"
            className="button"
            aria-expanded={caseOpen}
            onClick={() => setCaseOpen((open) => !open)}
          >
            {caseOpen ? ui.hideCaseStudy[language] : ui.readCaseStudy[language]}
          </button>
        )}
        {project.demoId && !demoOpen && (
          <button
            type="button"
            className="button button--primary"
            aria-expanded={demoOpen}
            onClick={() => setDemoOpen(true)}
          >
            {ui.tryDemo[language]}
          </button>
        )}
      </div>
      {project.caseStudy && caseOpen && (
        <CaseStudyPanel caseStudy={project.caseStudy} language={language} />
      )}
      {project.demoId && demoOpen && <ProjectDemoChat projectId={project.demoId} />}
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
