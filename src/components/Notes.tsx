import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import type { Language } from '../context/LanguageContext'
import { notes, ui } from '../data/content'
import type { NoteEntry } from '../data/content'
import { parseMetricSegments } from '../utils/metricText'

function NoteParagraph({ text }: { text: string }) {
  return (
    <p>
      {parseMetricSegments(text).map((segment, index) =>
        segment.metric ? (
          <strong key={index} className="metric">
            {segment.text}
          </strong>
        ) : (
          segment.text
        ),
      )}
    </p>
  )
}

function NoteCard({ note, language }: { note: NoteEntry; language: Language }) {
  const [open, setOpen] = useState(false)

  return (
    <article className="note-card">
      <div className="note-card__header">
        <span className="note-card__tag">{note.tag[language]}</span>
        <span className="note-card__date">{note.date[language]}</span>
      </div>
      <h3>{note.title[language]}</h3>
      <p>{note.teaser[language]}</p>
      <button type="button" className="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? ui.hideNote[language] : ui.readNote[language]}
      </button>
      {open && (
        <div className="note-card__body">
          {note.body.map((paragraph, index) => (
            <NoteParagraph key={index} text={paragraph[language]} />
          ))}
        </div>
      )}
    </article>
  )
}

export function Notes() {
  const { language } = useLanguage()

  return (
    <section id="notes" className="section">
      <h2 className="section__title">{ui.nav.notes[language]}</h2>
      <div className="notes">
        {notes.map((note) => (
          <NoteCard key={note.title.en} note={note} language={language} />
        ))}
      </div>
    </section>
  )
}
