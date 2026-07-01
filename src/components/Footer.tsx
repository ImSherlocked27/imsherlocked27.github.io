import { useLanguage } from '../context/LanguageContext'
import { hero, ui } from '../data/content'

export function Footer() {
  const { language } = useLanguage()

  return (
    <footer id="contact" className="footer">
      <div className="footer__links">
        <a href={`mailto:${hero.email}`}>{hero.email}</a>
        <a href={hero.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
      <p className="footer__copyright">
        © {new Date().getFullYear()} {hero.name}. {ui.footerRights[language]}
      </p>
    </footer>
  )
}
