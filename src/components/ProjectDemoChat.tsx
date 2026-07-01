import { useReducer, useState } from 'react'
import type { FormEvent } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { hero, ui } from '../data/content'
import type { DemoProjectId } from '../data/content'
import { sendDemoMessage } from '../lib/demoApi'
import { demoChatReducer, INITIAL_DEMO_CHAT_STATE } from '../lib/demoChatReducer'

interface ProjectDemoChatProps {
  projectId: DemoProjectId
}

export function ProjectDemoChat({ projectId }: ProjectDemoChatProps) {
  const { language } = useLanguage()
  const [state, dispatch] = useReducer(demoChatReducer, INITIAL_DEMO_CHAT_STATE)
  const [input, setInput] = useState('')

  const isSending = state.status === 'sending'
  const isDone = state.status === 'capped' || state.status === 'daily-capped'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const content = input.trim()
    if (!content || isSending || isDone) return

    const historyForRequest = [...state.messages, { role: 'user' as const, content }]
    dispatch({ type: 'SEND', content })
    setInput('')

    try {
      const result = await sendDemoMessage(projectId, language, historyForRequest)
      if (result.capped) {
        dispatch({ type: 'CAPPED', reason: result.reason })
      } else {
        dispatch({ type: 'SUCCESS', reply: result.reply, remaining: result.remaining })
      }
    } catch {
      dispatch({ type: 'ERROR' })
    }
  }

  return (
    <div className="project-demo">
      <div className="project-demo__messages">
        {state.messages.map((message, index) => (
          <p key={index} className={`project-demo__bubble project-demo__bubble--${message.role}`}>
            {message.content}
          </p>
        ))}
        {isSending && (
          <p className="project-demo__bubble project-demo__bubble--pending">{ui.demoSending[language]}</p>
        )}
      </div>

      {state.status === 'error' && <p className="project-demo__error">{ui.demoError[language]}</p>}
      {state.status === 'daily-capped' && <p className="project-demo__error">{ui.demoDailyLimit[language]}</p>}

      {state.status === 'capped' && (
        <div className="project-demo__end-card">
          <p>{ui.demoEndTitle[language]}</p>
          <a className="button button--primary" href={`mailto:${hero.email}`}>
            {ui.demoEndCta[language]}
          </a>
        </div>
      )}

      {!isDone && (
        <form className="project-demo__input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={ui.demoInputPlaceholder[language]}
            disabled={isSending}
            maxLength={500}
          />
          <button type="submit" className="button" disabled={isSending || !input.trim()}>
            &#8594;
          </button>
        </form>
      )}

      {!isDone && (
        <p className="project-demo__counter">
          {state.remaining} {ui.demoRemaining[language]}
        </p>
      )}
    </div>
  )
}
