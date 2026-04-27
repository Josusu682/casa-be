import { getSupabase } from '../../utils/supabase'

const DEEPSEEK_MODEL = 'deepseek-v4-flash'

const MEMORY_SYSTEM_PROMPT = `Eres un asistente que mantiene una memoria concisa sobre un usuario de un chat de acompañamiento terapéutico/somático.

Tu tarea: dado el historial de conversación y la memoria previa, genera una memoria actualizada que incluya:
- Nombre o apodo del usuario (si lo mencionó)
- Contexto emocional o personal relevante que compartió
- Temas que ha trabajado o quiere trabajar
- Experiencias significativas que mencionó
- Preferencias o patrones de comunicación

Reglas estrictas:
- Máximo 350 palabras
- Escribe en tercera persona ("El usuario...", "Ha mencionado...")
- Solo información útil para dar continuidad terapéutica
- Si no hay información nueva relevante, devuelve la memoria actual sin cambios
- Responde ÚNICAMENTE con el texto de la memoria, sin títulos ni explicaciones`

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token      = authHeader?.replace('Bearer ', '')
  if (!token) throw createError({ statusCode: 401 })

  const { data: { user }, error: authError } = await getSupabase().auth.getUser(token)
  if (authError || !user) throw createError({ statusCode: 401 })

  const { conversationId } = await readBody(event)
  if (!conversationId) throw createError({ statusCode: 400, statusMessage: 'conversationId requerido' })

  const config    = useRuntimeConfig()
  const apiKey    = config.deepseekApiKey as string
  if (!apiKey) return { ok: false, error: 'API key no configurada' }

  const [profileRes, messagesRes] = await Promise.all([
    getSupabase().from('profiles').select('memory').eq('id', user.id).single(),
    getSupabase()
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(30),
  ])

  const currentMemory = ((profileRes.data as any)?.memory ?? '').trim()
  const msgs = (messagesRes.data ?? []) as { role: string; content: string }[]

  if (msgs.length < 2) return { ok: true, skipped: 'conversación muy corta' }

  const conversationText = msgs
    .map(m => `${m.role === 'assistant' ? 'BE' : 'Usuario'}: ${m.content}`)
    .join('\n')

  const promptMessages = [
    ...(currentMemory
      ? [{ role: 'user', content: `Memoria actual del usuario:\n${currentMemory}` }]
      : []),
    {
      role: 'user',
      content: `Conversación reciente:\n${conversationText}\n\nActualiza la memoria incorporando cualquier información nueva relevante de esta conversación.`,
    },
  ]

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body:    JSON.stringify({
      model:       DEEPSEEK_MODEL,
      messages:    [{ role: 'system', content: MEMORY_SYSTEM_PROMPT }, ...promptMessages],
      max_tokens:  600,
      temperature: 0.3,
      stream:      false,
    }),
  })

  if (!res.ok) {
    console.error('[update-memory] DeepSeek error:', res.status)
    return { ok: false, error: `DeepSeek ${res.status}` }
  }

  const data      = await res.json()
  const newMemory = data.choices?.[0]?.message?.content?.trim()

  if (!newMemory) return { ok: false, error: 'Respuesta vacía de DeepSeek' }

  await getSupabase()
    .from('profiles')
    .update({ memory: newMemory } as never)
    .eq('id', user.id)

  console.log(`[update-memory] user=${user.id} memory=${newMemory.length}ch`)
  return { ok: true, memoryLength: newMemory.length }
})
