import { getSupabase } from '../utils/supabase'
import { SYSTEM_PROMPT } from '../../AI-Context/system-prompt'

const GEMINI_MODEL   = 'gemini-3.1-flash-lite-preview'
const DEEPSEEK_MODEL = 'deepseek-v4-flash'
const MAX_HISTORY    = 20
const SAFETY_MSG     = 'Lo que me contás excede lo que puedo acompañar desde acá. Lo más importante ahora es que busques apoyo de alguien especializado. No estás sola en esto, pero necesitás más que lo que yo puedo darte. Si estás en Chile y necesitás hablar con alguien ahora, podés llamar al Fono Salud Responde: 600 360 7777.'
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
]

async function* streamGemini(contents: unknown[], apiKey: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig:  { maxOutputTokens: 800, temperature: 0.75 },
        safetySettings:    SAFETY_SETTINGS,
      }),
    }
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}`)

  const reader  = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const chunk = JSON.parse(line.slice(6))
        const finishReason = chunk.candidates?.[0]?.finishReason
        const text         = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        if (finishReason === 'SAFETY') { yield { blocked: true }; return }
        if (text) yield { text }
      } catch {}
    }
  }
}

async function* streamDeepSeek(messages: { role: string; content: string }[], apiKey: string) {
  if (!apiKey) throw new Error('DeepSeek API key no configurada.')
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model:       DEEPSEEK_MODEL,
      messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens:  800,
      temperature: 0.75,
      stream:      true,
    }),
  })
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`)

  const reader  = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (raw === '[DONE]') return
      try {
        const chunk = JSON.parse(raw)
        const text  = chunk.choices?.[0]?.delta?.content ?? ''
        if (text) yield { text }
      } catch {}
    }
  }
}

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token      = authHeader?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Debes iniciar sesión para conversar.' })

  const { data: { user }, error: authError } = await getSupabase().auth.getUser(token)
  if (authError || !user) throw createError({ statusCode: 401, statusMessage: 'Sesión inválida.' })

  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if ((profile as any)?.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'No tienes acceso al chat.' })

  const config = useRuntimeConfig()
  const { messages, conversationId, model } = await readBody(event)

  if (!Array.isArray(messages) || messages.length === 0)
    throw createError({ statusCode: 400, statusMessage: 'Se requieren mensajes.' })

  const geminiKey   = config.geminiApiKey   as string
  const deepseekKey = config.deepseekApiKey as string
  if (!geminiKey) throw createError({ statusCode: 500, statusMessage: 'API key no configurada.' })

  let convId: number | null = conversationId ?? null
  if (!convId) {
    const { data: conv } = await getSupabase()
      .from('conversations')
      .insert({ user_id: user.id } as any)
      .select('id')
      .single()
    convId = (conv as any)?.id ?? null
  }

  const lastMsg = messages[messages.length - 1]
  if (lastMsg?.role === 'user' && convId) {
    await getSupabase().from('messages').insert({
      conversation_id: convId, role: 'user', content: lastMsg.content,
    } as any)
  }

  const trimmed = (messages as { role: string; content: string }[]).slice(-MAX_HISTORY)

  const nodeRes = event.node.res
  nodeRes.setHeader('Content-Type', 'text/event-stream')
  nodeRes.setHeader('Cache-Control', 'no-cache')
  nodeRes.setHeader('X-Accel-Buffering', 'no')
  nodeRes.flushHeaders()

  const send = (data: object) => {
    nodeRes.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  const keepalive = setInterval(() => {
    try { nodeRes.write(': keepalive\n\n') } catch {}
  }, 5000)

  let fullText = ''
  try {
    const source = model === 'deepseek'
      ? streamDeepSeek(trimmed, deepseekKey)
      : streamGemini(
          trimmed.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
          geminiKey
        )

    for await (const chunk of source) {
      if ('blocked' in chunk && chunk.blocked) {
        send({ replace: SAFETY_MSG })
        fullText = SAFETY_MSG
        break
      }
      if (chunk.text) {
        fullText += chunk.text
        send({ t: chunk.text })
      }
    }
  } catch (err: any) {
    const msg = err?.message ?? 'Error desconocido'
    console.error('[chat] stream error:', msg)
    send({ error: `Error al conectar con la IA: ${msg}` })
  }

  clearInterval(keepalive)
  send({ done: true, convId })
  nodeRes.end()

  if (convId && fullText) {
    void (async () => {
      try { await getSupabase().from('messages').insert({ conversation_id: convId, role: 'assistant', content: fullText } as any) } catch {}
    })()
  }
})
