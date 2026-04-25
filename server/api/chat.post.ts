import { getSupabase } from '../utils/supabase'
import { SYSTEM_PROMPT } from '../../AI-Context/system-prompt'

const MODEL       = 'gemini-3.1-flash-lite-preview'
const MAX_HISTORY = 20

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token      = authHeader?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Debes iniciar sesión para conversar.' })

  const { data: { user }, error: authError } = await getSupabase().auth.getUser(token)
  if (authError || !user) throw createError({ statusCode: 401, statusMessage: 'Sesión inválida.' })

  const config = useRuntimeConfig()
  const { messages, conversationId } = await readBody(event)

  if (!Array.isArray(messages) || messages.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Se requieren mensajes.' })
  }

  const apiKey = config.geminiApiKey as string
  if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'API key no configurada.' })

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

  const trimmed  = messages.slice(-MAX_HISTORY)
  const contents = trimmed.map((m: { role: string; content: string }) => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method:  'POST',
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

  if (!geminiRes.ok) {
    const err = await geminiRes.text().catch(() => 'unknown')
    throw createError({ statusCode: 502, statusMessage: 'Error al conectar con la IA.', data: err })
  }

  const json    = await geminiRes.json()
  const blocked = !json.candidates?.length || json.candidates[0]?.finishReason === 'SAFETY'
  const reply   = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  if (!reply && !blocked) {
    throw createError({ statusCode: 502, statusMessage: 'Respuesta vacía de la IA.' })
  }

  const finalReply = reply || 'Lo que me contás excede lo que puedo acompañar desde acá. Lo más importante ahora es que busques apoyo de alguien especializado. No estás sola en esto, pero necesitás más que lo que yo puedo darte. Si estás en Chile y necesitás hablar con alguien ahora, podés llamar al Fono Salud Responde: 600 360 7777.'

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
