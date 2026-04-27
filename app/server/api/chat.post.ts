import { getSupabase } from '../utils/supabase'
import { SYSTEM_PROMPT } from '../../../AI-Context/system-prompt'

const DEEPSEEK_MODEL = 'deepseek-v4-flash'
const MAX_HISTORY    = 20

async function* streamDeepSeek(messages: { role: string; content: string }[], apiKey: string) {
  if (!apiKey) throw new Error('DeepSeek API key no configurada.')
  const ac = new AbortController()
  const t  = setTimeout(() => ac.abort(), 8000)
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    signal: ac.signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model:       DEEPSEEK_MODEL,
      messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens:  800,
      temperature: 0.75,
      stream:      true,
    }),
  })
  clearTimeout(t)
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

  const deepseekKey = config.deepseekApiKey as string
  if (!deepseekKey) throw createError({ statusCode: 500, statusMessage: 'API key no configurada.' })

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
  let streamDone = false
  const streamTimeout = setTimeout(() => {
    if (!streamDone) {
      console.error('[chat] timeout total de 30s alcanzado')
      clearInterval(keepalive)
      send({ error: 'La IA tardó demasiado en responder. Intenta de nuevo.' })
      send({ done: true, convId })
      nodeRes.end()
      streamDone = true
    }
  }, 30000)

  try {
    const source = streamDeepSeek(trimmed, deepseekKey)

    for await (const chunk of source) {
      if (streamDone) break
      if (chunk.text) {
        fullText += chunk.text
        send({ t: chunk.text })
      }
    }
  } catch (err: any) {
    const msg = err?.message ?? 'Error desconocido'
    console.error('[chat] stream error:', msg)
    if (!streamDone) send({ error: `Error al conectar con la IA: ${msg}` })
  }

  clearTimeout(streamTimeout)
  if (!streamDone) {
    clearInterval(keepalive)
    console.log('[chat] done — tokens:', fullText.length, 'chars')
    send({ done: true, convId, tokenChars: fullText.length })
    nodeRes.end()
    streamDone = true
  }

  if (convId && fullText) {
    void (async () => {
      try { await getSupabase().from('messages').insert({ conversation_id: convId, role: 'assistant', content: fullText } as any) } catch {}
    })()
  }
})
