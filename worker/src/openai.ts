export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CallOpenAIParams {
  apiKey: string
  model: string
  systemPrompt: string
  messages: ChatMessage[]
  fetchImpl?: typeof fetch
}

export async function callOpenAI(params: CallOpenAIParams): Promise<string> {
  const fetchFn = params.fetchImpl ?? fetch

  const response = await fetchFn('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      messages: [{ role: 'system', content: params.systemPrompt }, ...params.messages],
      max_tokens: 400,
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`)
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content

  if (typeof content !== 'string' || content.length === 0) {
    throw new Error('OpenAI response missing content')
  }

  return content
}
