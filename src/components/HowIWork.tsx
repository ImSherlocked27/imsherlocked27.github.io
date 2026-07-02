import { useLanguage } from '../context/LanguageContext'
import { howIWork, ui } from '../data/content'

export function HowIWork() {
  const { language } = useLanguage()

  return (
    <section id="how-i-work" className="section">
      <h2 className="section__title">{ui.howIWork[language]}</h2>
      <div className="how-i-work">
        {howIWork.map((item) => (
          <article key={item.title.en} className="how-i-work__item">
            <h3>{item.title[language]}</h3>
            <p>{item.body[language]}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
