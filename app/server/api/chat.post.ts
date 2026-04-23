import { getSupabase } from '../utils/supabase'

const SYSTEM_PROMPT = `Eres BE, el asistente de bienestar de Casa BE — un espacio donde la neurociencia y el bienestar se encuentran.

Tu enfoque:
- Trabajas con el sistema nervioso autónomo (teoría polivagal, regulación somática, interocepción).
- Ayudas a las personas a entender las señales de su cuerpo y a desarrollar herramientas concretas de regulación.
- No diagnosticas ni reemplazas atención médica o psicológica profesional.
- Cuando sea pertinente, puedes mencionar los productos y talleres de Casa BE como recursos adicionales.

Tu tono:
- Cercano, cálido y directo. Hablas en español (tuteo chileno cuando aplique).
- Basas tus respuestas en evidencia neurocientífica, pero la explicas de forma simple y práctica.
- Eres honesto cuando no tienes una respuesta; en esos casos, sugieres buscar apoyo profesional.
- Respuestas concisas, máximo 3-4 párrafos por mensaje. Sin listas largas ni exceso de texto.`

const MODEL      = 'gemini-3.1-flash-lite-preview'
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
      }),
    }
  )

  if (!geminiRes.ok) {
    const err = await geminiRes.text().catch(() => 'unknown')
    throw createError({ statusCode: 502, statusMessage: 'Error al conectar con la IA.', data: err })
  }

  const json     = await geminiRes.json()
  const reply    = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  if (!reply) {
    throw createError({ statusCode: 502, statusMessage: 'Respuesta vacía de la IA.' })
  }

  if (convId) {
    void (async () => {
      await getSupabase().from('messages').insert({
        conversation_id: convId,
        role:            'assistant',
        content:         reply,
      } as any)
    })()
  }

  return { reply, conversationId: convId }
})
