import { getSupabase } from '../utils/supabase'
import { SYSTEM_PROMPT } from '../../AI-Context/system-prompt'

const GEMINI_MODEL   = 'gemini-3.1-flash-lite-preview'
const DEEPSEEK_MODEL = 'deepseek-chat'
const MAX_HISTORY    = 20

async function callGemini(contents: unknown[], apiKey: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig:  { maxOutputTokens: 800, temperature: 0.75 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text().catch(() => 'unknown')
    throw createError({ statusCode: 502, statusMessage: 'Error Gemini.', data: err })
  }
  const json    = await res.json()
  const blocked = !json.candidates?.length || json.candidates[0]?.finishReason === 'SAFETY'
  const text    = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  if (!text && !blocked) throw createError({ statusCode: 502, statusMessage: 'Respuesta vacía de Gemini.' })
  return { text, blocked }
}

async function callDeepSeek(messages: { role: string; content: string }[], apiKey: string) {
  if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'DeepSeek API key no configurada.' })
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model:       DEEPSEEK_MODEL,
      messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens:  800,
      temperature: 0.75,
    }),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => 'unknown')
    throw createError({ statusCode: 502, statusMessage: 'Error DeepSeek.', data: err })
  }
  const json = await res.json()
  const text = json.choices?.[0]?.message?.content ?? ''
  if (!text) throw createError({ statusCode: 502, statusMessage: 'Respuesta vacía de DeepSeek.' })
  return { text, blocked: false }
}

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token      = authHeader?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Debes iniciar sesión para conversar.' })

  const { data: { user }, error: authError } = await getSupabase().auth.getUser(token)
  if (authError || !user) throw createError({ statusCode: 401, statusMessage: 'Sesión inválida.' })

  const config = useRuntimeConfig()
  const { messages, conversationId, model } = await readBody(event)

  if (!Array.isArray(messages) || messages.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Se requieren mensajes.' })
  }

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
      conversation_id: convId,
      role:            'user',
      content:         lastMsg.content,
    } as any)
  }

  const trimmed = messages.slice(-MAX_HISTORY) as { role: string; content: string }[]

  const result = model === 'deepseek'
    ? await callDeepSeek(trimmed, deepseekKey)
    : await callGemini(
        trimmed.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        geminiKey
      )

  const finalReply = result.text || 'Lo que me contás excede lo que puedo acompañar desde acá. Lo más importante ahora es que busques apoyo de alguien especializado. No estás sola en esto, pero necesitás más que lo que yo puedo darte. Si estás en Chile y necesitás hablar con alguien ahora, podés llamar al Fono Salud Responde: 600 360 7777.'

  if (convId) {
    void (async () => {
      await getSupabase().from('messages').insert({
        conversation_id: convId,
        role:            'assistant',
        content:         finalReply,
      } as any)
    })()
  }

  return { reply: finalReply, conversationId: convId }
})
