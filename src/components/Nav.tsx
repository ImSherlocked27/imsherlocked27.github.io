import { useLanguage } from '../context/LanguageContext'
import { ui } from '../data/content'

const links = [
  { id: 'experience', label: ui.nav.experience },
  { id: 'skills', label: ui.nav.skills },
  { id: 'projects', label: ui.nav.projects },
  { id: 'education', label: ui.nav.education },
  { id: 'contact', label: ui.nav.contact },
]

export function Nav() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <header className="nav">
      <a className="nav__brand" href="#top">
        JD<span className="nav__cursor">_</span>
      </a>
      <nav className="nav__links">
        {links.map((link) => (
          <a key={link.id} href={`#${link.id}`}>
            {link.label[language]}
          </a>
        ))}
      </nav>
      <button
        type="button"
        className="nav__lang-toggle"
        onClick={toggleLanguage}
        aria-label="Toggle language"
      >
        <span className={language === 'en' ? 'is-active' : ''}>EN</span>
        <span aria-hidden="true"> / </span>
        <span className={language === 'es' ? 'is-active' : ''}>ES</span>
      </button>
    </header>
  )
}
