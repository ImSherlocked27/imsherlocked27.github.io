import { useLanguage } from '../context/LanguageContext'
import { skills, ui } from '../data/content'

export function Skills() {
  const { language } = useLanguage()

  return (
    <section id="skills" className="section">
      <h2 className="section__title">{ui.nav.skills[language]}</h2>
      <div className="skills">
        {skills.map((group) => (
          <div key={group.category.en} className="skills__group">
            <h3>{group.category[language]}</h3>
            <div className="skills__chips">
              {group.items.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
