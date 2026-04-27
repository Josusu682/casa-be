<template>
  <div class="chat-page">

    <!-- Sidebar overlay (mobile) -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="sidebar__header">
        <span class="sidebar__title">Conversaciones</span>
        <button class="sidebar__close" @click="sidebarOpen = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>

      <button class="sidebar__new" @click="newConversation">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        Nueva conversación
      </button>

      <div class="sidebar__list">
        <div v-if="loadingHistory" class="sidebar__loading">Cargando...</div>
        <button
          v-for="conv in history"
          :key="conv.id"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': conversationId === conv.id }"
          @click="loadConversation(conv.id)"
        >
          <span class="sidebar__item-preview">{{ conv.preview }}</span>
          <span class="sidebar__item-date">{{ formatDate(conv.created_at) }}</span>
        </button>
        <p v-if="!loadingHistory && history.length === 0" class="sidebar__empty">Sin conversaciones aún</p>
      </div>
    </aside>

    <!-- Main area -->
    <div class="chat-body">

      <!-- Top bar -->
      <header class="chat-topbar">
        <button class="chat-topbar__menu" @click="sidebarOpen = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <span class="chat-topbar__label">BE — Casa BE</span>
        <button class="chat-topbar__new" @click="newConversation" title="Nueva conversación">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </header>

      <!-- Messages -->
      <div ref="messagesEl" class="messages">
        <div v-if="messages.length === 0 && !loadingMessages" class="messages__empty">
          <p class="messages__empty-text">¿Por dónde quieres empezar?</p>
          <div class="messages__suggestions">
            <button
              v-for="s in suggestions"
              :key="s"
              class="messages__suggestion"
              @click="sendSuggestion(s)"
            >{{ s }}</button>
          </div>
        </div>

        <div v-if="loadingMessages" class="messages__loading">Cargando conversación...</div>

        <template v-if="!loadingMessages">
          <article
            v-for="(msg, i) in messages"
            :key="i"
            class="message"
            :class="`message--${msg.role}`"
          >
            <div class="message__meta">
              <span class="message__label">{{ msg.role === 'assistant' ? 'BE' : userInitial }}</span>
              <span class="message__time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="message__bubble">
              <span class="message__text" v-html="formatText(msg.content)"></span>
            </div>

            <div v-if="getAudioSrc(msg.content)" class="audio-player">
              <audio
                :ref="(el) => { if(el) audioEls[i] = el; else delete audioEls[i] }"
                :src="getAudioSrc(msg.content)!"
                style="display:none"
                @timeupdate="updateAudioTime(i, $event)"
                @loadedmetadata="setAudioDuration(i, $event)"
                @ended="setAudioPlaying(i, false)"
                @play="setAudioPlaying(i, true)"
                @pause="setAudioPlaying(i, false)"
              ></audio>
              <div class="audio-player__header">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" class="audio-player__icon">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span class="audio-player__label">{{ getAudioLabel(getAudioSrc(msg.content)) }}</span>
              </div>
              <div class="audio-player__track" @click="seekAudio(i, $event)">
                <div class="audio-player__fill" :style="{ width: getAudioProgress(i) + '%' }"></div>
                <div class="audio-player__thumb" :style="{ left: getAudioProgress(i) + '%' }"></div>
              </div>
              <div class="audio-player__controls">
                <button class="audio-player__btn" @click="toggleAudio(i)">
                  <svg v-if="!audioStates[i]?.playing" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                <span class="audio-player__time">{{ formatAudioTime(audioStates[i]?.currentTime ?? 0) }}</span>
                <div class="audio-player__spacer"></div>
                <span class="audio-player__duration">{{ formatAudioTime(audioStates[i]?.duration ?? 0) }}</span>
              </div>
            </div>

            <div v-if="msg.role === 'assistant'" class="message__actions">
              <button class="msg-action" :class="{ 'msg-action--active': ratings[i] === 'up' }" @click="rateMessage(i, 'up')" title="Me gustó">
                <HandThumbUpIcon style="width:17px;height:17px;"/>
              </button>
              <button class="msg-action" :class="{ 'msg-action--active': ratings[i] === 'down' }" @click="rateMessage(i, 'down')" title="No me gustó">
                <HandThumbDownIcon style="width:17px;height:17px;"/>
              </button>
              <button class="msg-action" :class="{ 'msg-action--active': speakingIdx === i }" @click="toggleSpeak(i, msg.content)" :title="speakingIdx === i ? 'Detener' : 'Escuchar'">
                <StopIcon v-if="speakingIdx === i" style="width:17px;height:17px;"/>
                <SpeakerWaveIcon v-else style="width:17px;height:17px;"/>
              </button>
            </div>
          </article>

          <div v-if="streaming" class="message message--assistant">
            <div class="message__meta">
              <span class="message__label">BE</span>
              <span class="message__time">{{ elapsedSecs }}s</span>
            </div>
            <div class="message__bubble">
              <span v-if="streamingText && !streamingText.startsWith('Reintento')" class="message__text" v-html="formatText(streamingText)"></span>
              <div v-else class="message__loading-state">
                <span class="message__dots"><span></span><span></span><span></span></span>
                <span class="message__status">{{ streamingStatus }}</span>
              </div>
            </div>
          </div>

          <div v-if="debugLog.length" class="debug-panel">
            <div class="debug-panel__header">
              <span>🔍 DEBUG</span>
              <button class="debug-panel__clear" @click="debugLog = []">limpiar</button>
            </div>
            <div class="debug-panel__row"><b>streaming:</b> {{ streaming }} | <b>elapsed:</b> {{ elapsedSecs }}s | <b>attempt:</b> {{ dbgAttempt }} | <b>continuations:</b> {{ dbgContinuations }}</div>
            <div class="debug-panel__row"><b>fase:</b> {{ dbgPhase }}</div>
            <div class="debug-panel__row"><b>partialSoFar len:</b> {{ dbgPartialLen }} | <b>fullText len:</b> {{ dbgFullTextLen }}</div>
            <div v-for="(line, i) in debugLog" :key="i" class="debug-panel__line">{{ line }}</div>
          </div>
        </template>
      </div>

      <div class="chat-input-area">
        <form class="chat-input" @submit.prevent="sendMessage">
          <textarea
            ref="inputEl" v-model="input"
            class="chat-input__field"
            placeholder="Escribe tu pregunta..."
            rows="1" :disabled="streaming"
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
          ></textarea>
          <button type="submit" class="chat-input__btn" :disabled="streaming || !input.trim()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </form>
      </div>

      <p class="chat-disclaimer">BE es un asistente de IA. No reemplaza atención médica ni psicológica profesional.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HandThumbUpIcon, HandThumbDownIcon, SpeakerWaveIcon, StopIcon } from '@heroicons/vue/24/outline'
definePageMeta({ middleware: 'auth' })

interface Message  { role: 'user' | 'assistant'; content: string; timestamp: Date }
interface ConvItem { id: number; preview: string; created_at: string }

const { user, getToken } = useAuth()
const router = useRouter()

const messagesEl      = ref<HTMLElement | null>(null)
const inputEl         = ref<HTMLTextAreaElement | null>(null)
const messages        = ref<Message[]>([])
const input           = ref('')
const streaming       = ref(false)
const streamingText   = ref('')
const conversationId  = ref<number | null>(null)
const elapsedSecs     = ref(0)
const sidebarOpen     = ref(false)
const history         = ref<ConvItem[]>([])
const loadingHistory  = ref(false)
const loadingMessages = ref(false)
let   _timer: ReturnType<typeof setInterval> | null = null

const debugLog       = ref<string[]>([])
const dbgPhase       = ref('')
const dbgAttempt     = ref(0)
const dbgContinuations = ref(0)
const dbgPartialLen  = ref(0)
const dbgFullTextLen = ref(0)
function dbg(msg: string) {
  const ts = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  debugLog.value.push(`[${ts}] ${msg}`)
  if (debugLog.value.length > 80) debugLog.value.shift()
  console.log('[DBG]', msg)
}

const ratings     = ref<Record<number, 'up' | 'down'>>({})
const speakingIdx = ref<number | null>(null)

function rateMessage(i: number, rating: 'up' | 'down') {
  if (ratings.value[i] === rating) { const r = { ...ratings.value }; delete r[i]; ratings.value = r }
  else ratings.value = { ...ratings.value, [i]: rating }
}
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
}
function toggleSpeak(i: number, content: string) {
  if (speakingIdx.value === i) { window.speechSynthesis.cancel(); speakingIdx.value = null; return }
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(stripHtml(content))
  utter.lang = 'es-CL'; utter.rate = 0.95
  utter.onend = () => { speakingIdx.value = null }
  utter.onerror = () => { speakingIdx.value = null }
  speakingIdx.value = i
  window.speechSynthesis.speak(utter)
}

const streamingStatus = computed(() => {
  if (streamingText.value.startsWith('Reintento')) return streamingText.value
  const s = elapsedSecs.value
  if (s < 4)  return 'Conectando...'
  if (s < 12) return 'Generando respuesta...'
  if (s < 25) return 'Esto está tardando un poco más de lo usual...'
  if (s < 32) return 'Tiempo agotado, reintentando...'
  return 'Reintentando conexión...'
})

function startTimer() { elapsedSecs.value = 0; _timer = setInterval(() => { elapsedSecs.value++ }, 1000) }
function stopTimer()  { if (_timer) { clearInterval(_timer); _timer = null } }

const userInitial = computed(() => (user.value?.email ?? '').charAt(0).toUpperCase())

const suggestions = [
  '¿Qué es el sistema nervioso autónomo?',
  'Tengo mucha ansiedad, ¿qué hago?',
  '¿Cómo sé si estoy en modo supervivencia?',
  '¿Qué es la regulación somática?',
]

function formatText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\/audio\/[^\s<]+\.mp3/g, '')
    .replace(/\n/g, '<br />')
}
function formatTime(date: Date) {
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}
function autoResize() {
  const el = inputEl.value; if (!el) return
  el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}
function scrollToBottom(force = false) {
  nextTick(() => {
    const el = messagesEl.value; if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (force || nearBottom) el.scrollTop = el.scrollHeight
  })
}

async function fetchHistory() {
  loadingHistory.value = true
  try {
    const token = await getToken(); if (!token) return
    history.value = await $fetch<ConvItem[]>('/api/me/conversations', { headers: { Authorization: `Bearer ${token}` } })
  } catch { /* silent */ } finally { loadingHistory.value = false }
}

async function loadConversation(id: number) {
  if (conversationId.value === id) { sidebarOpen.value = false; return }
  sidebarOpen.value = false; loadingMessages.value = true
  messages.value = []; conversationId.value = id
  try {
    const token = await getToken(); if (!token) return
    const msgs = await $fetch<{ role: string; content: string; created_at: string }[]>(
      `/api/me/conversations/${id}`, { headers: { Authorization: `Bearer ${token}` } }
    )
    messages.value = msgs.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content, timestamp: new Date(m.created_at) }))
    scrollToBottom(true)
  } catch { /* silent */ } finally { loadingMessages.value = false }
}

function newConversation() {
  messages.value = []; conversationId.value = null; sidebarOpen.value = false
  nextTick(() => inputEl.value?.focus())
}

function sendSuggestion(text: string) { input.value = text; sendMessage() }

async function sendMessage() {
  const text = input.value.trim()
  if (!text || streaming.value) return

  messages.value.push({ role: 'user', content: text, timestamp: new Date() })
  input.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'
  scrollToBottom(true)

  streaming.value = true; streamingText.value = ''; startTimer()
  debugLog.value = []; dbgPhase.value = 'iniciando'
  dbgFullTextLen.value = 0; dbgPartialLen.value = 0
  dbg('sendMessage iniciado')

  const MAX_RETRIES      = 2
  const MAX_CONTINUATIONS = 4
  let attempt            = 0
  let continuations      = 0
  let partialSoFar       = ''
  let isContinuation     = false
  let lastError: any     = null

  while (attempt <= MAX_RETRIES) {
    if (attempt > 0 && !isContinuation) {
      const errMsg = lastError?.message ?? 'error desconocido'
      console.warn(`[retry] intento ${attempt}/${MAX_RETRIES} — error:`, errMsg)
      streamingText.value = `Reintento fallido (${attempt}/${MAX_RETRIES}): ${errMsg}. Reintentando en 10s...`
      await new Promise(r => setTimeout(r, 10000))
      streamingText.value = partialSoFar
    }
    isContinuation = false

    dbgAttempt.value = attempt; dbgContinuations.value = continuations
    dbg(`while loop: attempt=${attempt} continuations=${continuations} partialLen=${partialSoFar.length}`)

    const baseMessages    = messages.value.map(m => ({ role: m.role, content: m.content }))
    const messagesForReq  = partialSoFar
      ? [...baseMessages, { role: 'assistant' as const, content: partialSoFar }]
      : baseMessages

    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 55000)
    let gotDone      = false
    let fullText     = ''
    let noTokenTimer: ReturnType<typeof setTimeout> | null = null
    const resetNoTokenTimer = () => {
      if (noTokenTimer) clearTimeout(noTokenTimer)
      noTokenTimer = setTimeout(() => controller.abort(), 20000)
    }

    try {
      const token = await getToken()
      if (!token) { router.push('/login'); return }

      dbgPhase.value = 'fetch...'
      dbg('fetch iniciado (connectTimeout=12s)')
      const connectTimeoutId = setTimeout(() => { dbg('connectTimeout DISPARADO a 12s'); controller.abort() }, 12000)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages:       messagesForReq,
          conversationId: conversationId.value,
          model:          'deepseek',
        }),
      })
      clearTimeout(connectTimeoutId)
      dbg(`fetch resolvió → status=${res.status}`)
      dbgPhase.value = `fetch OK (${res.status})`

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.statusMessage ?? `Error ${res.status}`)
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      dbgPhase.value = 'leyendo stream...'
      dbg('reader obtenido, noTokenTimer iniciado (20s)')
      resetNoTokenTimer()

      const readChunk = () => Promise.race([
        reader.read(),
        new Promise<never>((_, rej) =>
          setTimeout(() => { controller.abort(); rej(new Error('Sin respuesta del servidor (timeout read)')) }, 30000)
        ),
      ])

      outer: while (true) {
        const { done, value } = await readChunk()
        console.log('[stream] read done:', done, 'bytes:', value?.length)
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          console.log('[stream] line:', line.slice(0, 120))
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.t) {
              if (fullText.length === 0) dbg('PRIMER TOKEN recibido')
              resetNoTokenTimer()
              dbgFullTextLen.value = fullText.length + ev.t.length
              streamingText.value += ev.t; fullText += ev.t; scrollToBottom()
            } else if (ev.replace) {
              streamingText.value = ev.replace; fullText = ev.replace
            } else if (ev.error) {
              dbg(`ev.error recibido: ${ev.error}`)
              throw new Error(ev.error)
            } else if (ev.done) {
              dbg(`ev.done recibido — client fullText=${fullText.length} | server tokenChars=${ev.tokenChars ?? '?'}`)
              gotDone = true
              if (ev.convId) conversationId.value = ev.convId
              break outer
            }
          } catch (e) { if (e instanceof SyntaxError) continue; throw e }
        }
      }

      if (!gotDone && fullText !== '') {
        partialSoFar += fullText
        dbgPartialLen.value = partialSoFar.length
        dbg(`stream cortado (Vercel?) — partial=${partialSoFar.length}ch continuations=${continuations}/${MAX_CONTINUATIONS}`)
        streamingText.value = partialSoFar
        if (continuations < MAX_CONTINUATIONS) {
          continuations++; isContinuation = true; continue
        }
        messages.value.push({ role: 'assistant', content: partialSoFar, timestamp: new Date() })
        stopTimer(); streaming.value = false; streamingText.value = ''
        scrollToBottom(true); await fetchHistory(); lastError = null; break
      }

      if (!gotDone && fullText === '') { dbg('stream cerró SIN done y SIN texto'); throw new Error('Conexión interrumpida por el servidor') }

      const finalText = partialSoFar + fullText
      if (!finalText) {
        dbg('RESPUESTA VACÍA — reintentando')
        throw new Error('La IA no generó respuesta (vacía). Reintentando...')
      }
      messages.value.push({ role: 'assistant', content: finalText, timestamp: new Date() })
      stopTimer(); streaming.value = false; streamingText.value = ''
      scrollToBottom(true)
      await fetchHistory()
      lastError = null
      break

    } catch (err: any) {
      lastError = err
      dbg(`CATCH: ${err?.name} — ${err?.message}`)
      dbgPhase.value = `error: ${err?.message?.slice(0,40)}`
      if (noTokenTimer) clearTimeout(noTokenTimer)
      const isAuth  = /401|403|sesión|acceso/.test(err?.message ?? '')
      if (isAuth || attempt >= MAX_RETRIES) { dbg(`break — isAuth=${isAuth} attempt=${attempt}`); break }
      attempt++
    } finally {
      clearTimeout(timeout)
      if (noTokenTimer) clearTimeout(noTokenTimer)
    }
  }

  if (lastError) {
    const isAbort = lastError?.name === 'AbortError' || String(lastError?.message).includes('abort')
    const msg = isAbort ? 'La respuesta tardó demasiado. Intenta de nuevo.' : (lastError?.message ?? 'Error desconocido')
    messages.value.push({ role: 'assistant', content: msg, timestamp: new Date() })
  }

  stopTimer(); streaming.value = false; streamingText.value = ''
  scrollToBottom(true); nextTick(() => inputEl.value?.focus())
}

const audioEls: Record<number, any> = {}
const audioStates = reactive<Record<number, { playing: boolean; currentTime: number; duration: number }>>({})

function getAudioSrc(content: string): string | null {
  const match = content.match(/\/audio\/[^\s<]+\.mp3/)
  return match ? match[0] : null
}
function getAudioLabel(src: string | null): string {
  if (!src) return ''
  const name = src.split('/').pop()?.replace('.mp3', '') ?? ''
  return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
function getAudioProgress(i: number) {
  const s = audioStates[i]; return s?.duration ? (s.currentTime / s.duration) * 100 : 0
}
function updateAudioTime(i: number, e: Event) {
  if (!audioStates[i]) audioStates[i] = { playing: false, currentTime: 0, duration: 0 }
  audioStates[i].currentTime = (e.target as HTMLAudioElement).currentTime
}
function setAudioDuration(i: number, e: Event) {
  if (!audioStates[i]) audioStates[i] = { playing: false, currentTime: 0, duration: 0 }
  audioStates[i].duration = (e.target as HTMLAudioElement).duration
}
function setAudioPlaying(i: number, playing: boolean) {
  if (!audioStates[i]) audioStates[i] = { playing: false, currentTime: 0, duration: 0 }
  audioStates[i].playing = playing
}
function toggleAudio(i: number) {
  const el = audioEls[i]; if (!el) return
  el.paused ? el.play() : el.pause()
}
function seekAudio(i: number, e: MouseEvent) {
  const el = audioEls[i]; if (!el || !el.duration) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration
}
function formatAudioTime(secs: number) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60); const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

onMounted(fetchHistory)
</script>

<style scoped>
/* ── ROOT ── */
.chat-page { display: flex; height: 100vh; overflow: hidden; background-color: #1c2b1e; padding-top: 64px; }

/* ── SIDEBAR OVERLAY ── */
.sidebar-overlay { position: fixed; top: 64px; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.35); z-index: 140; }

/* ── SIDEBAR ── */
.sidebar { width: 260px; flex-shrink: 0; background-color: #2a3d2c; display: flex; flex-direction: column; height: 100%; overflow: hidden; transition: transform 0.25s ease; }
@media (max-width: 768px) {
  .sidebar { position: fixed; top: 64px; left: 0; bottom: 0; z-index: 150; transform: translateX(-100%); }
  .sidebar--open { transform: translateX(0); }
}
.sidebar__header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
.sidebar__title { font-family: 'Acumin Concept', sans-serif; font-size: 0.7rem; letter-spacing: 0.12em; color: rgba(255,255,255,0.4); text-transform: uppercase; }
.sidebar__close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; display: flex; padding: 4px; }
.sidebar__close:hover { color: rgba(255,255,255,0.8); }
.sidebar__new { display: flex; align-items: center; gap: 0.5rem; margin: 0.75rem; padding: 0.6rem 0.9rem; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.75); cursor: pointer; font-family: 'Acumin Concept', sans-serif; font-size: 0.85rem; transition: background 0.2s; }
.sidebar__new:hover { background: rgba(255,255,255,0.12); }
.sidebar__list { flex: 1; overflow-y: auto; padding: 0.25rem 0; }
.sidebar__item { display: flex; flex-direction: column; gap: 0.2rem; width: 100%; text-align: left; padding: 0.7rem 1rem; background: none; border: none; cursor: pointer; transition: background 0.15s; }
.sidebar__item:hover { background: rgba(255,255,255,0.06); }
.sidebar__item--active { background: rgba(255,255,255,0.1); }
.sidebar__item-preview { font-family: 'Acumin Concept', sans-serif; font-size: 0.85rem; color: rgba(255,255,255,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar__item-date { font-family: 'Acumin Concept', sans-serif; font-size: 0.7rem; color: rgba(255,255,255,0.3); }
.sidebar__loading, .sidebar__empty { font-family: 'Acumin Concept', sans-serif; font-size: 0.8rem; color: rgba(255,255,255,0.3); padding: 1rem; text-align: center; }

/* ── CHAT BODY ── */
.chat-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

/* ── TOPBAR ── */
.chat-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.07); background: #243328; flex-shrink: 0; }
.chat-topbar__menu, .chat-topbar__new { background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; display: flex; padding: 6px; transition: color 0.2s; }
.chat-topbar__menu:hover, .chat-topbar__new:hover { color: rgba(255,255,255,0.95); }
@media (min-width: 769px) { .chat-topbar__menu { display: none; } }
.chat-topbar__label { font-family: 'Acumin Concept', sans-serif; font-size: 0.8rem; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); text-transform: uppercase; }

/* ── MESSAGES ── */
.messages { flex: 1; overflow-y: auto; padding: 1.5rem 1.5rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; scroll-behavior: smooth; }
.messages__empty { display: flex; flex-direction: column; gap: 1.5rem; padding-top: 1rem; max-width: 640px; margin: 0 auto; width: 100%; }
.messages__empty-text { font-family: 'Acumin Concept', sans-serif; font-size: 1.25rem; font-weight: 300; color: rgba(255,255,255,0.55); }
.messages__suggestions { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.messages__suggestion { background: none; border: 1px solid rgba(255,255,255,0.15); padding: 0.5rem 1rem; font-family: 'Acumin Concept', sans-serif; font-size: 0.9rem; color: rgba(255,255,255,0.65); cursor: pointer; text-align: left; transition: background 0.2s, border-color 0.2s; }
.messages__suggestion:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.35); }
.messages__loading { font-family: 'Acumin Concept', sans-serif; font-size: 0.9rem; color: rgba(255,255,255,0.35); padding: 2rem; text-align: center; }

/* ── MESSAGE ── */
.message { display: flex; flex-direction: column; gap: 0.35rem; max-width: 80%; }
.message--user      { align-self: flex-end;   align-items: flex-end; }
.message--assistant { align-self: flex-start; align-items: flex-start; }
.message__meta  { display: flex; align-items: center; gap: 0.5rem; }
.message__label { font-family: 'Acumin Concept', sans-serif; font-size: 0.7rem; letter-spacing: 0.1em; color: rgba(255,255,255,0.35); text-transform: uppercase; }
.message__time  { font-family: 'Acumin Concept', sans-serif; font-size: 0.7rem; color: rgba(255,255,255,0.22); }
.message__bubble { padding: 0.85rem 1.15rem; font-family: 'Acumin Concept', sans-serif; font-size: 1rem; line-height: 1.6; }
.message--user .message__bubble      { background-color: #3d5940; color: rgba(255,255,255,0.92); }
.message--assistant .message__bubble { background-color: #2a3d2c; color: rgba(255,255,255,0.88); border: 1px solid rgba(255,255,255,0.06); }

/* ── LOADING DOTS ── */
.message__loading-state { display: flex; flex-direction: column; gap: 8px; }
.message__status { font-family: 'Acumin Concept', sans-serif; font-size: 0.78rem; color: rgba(255,255,255,0.38); letter-spacing: 0.02em; }
.message__dots { display: flex; gap: 5px; align-items: center; height: 20px; }
.message__dots span { width: 6px; height: 6px; background: rgba(255,255,255,0.5); border-radius: 50%; opacity: 0.5; animation: dot-bounce 1.2s infinite ease-in-out; }
.message__dots span:nth-child(2) { animation-delay: 0.2s; }
.message__dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); opacity: 1; } }

/* ── AUDIO PLAYER ── */
.audio-player {
  display: flex; flex-direction: column; gap: 11px;
  margin-top: 10px; padding: 14px 16px 12px;
  background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.07);
  width: 100%;
}
.audio-player__header { display: flex; align-items: center; gap: 7px; }
.audio-player__icon   { color: rgba(255,255,255,0.28); flex-shrink: 0; }
.audio-player__label  { font-family: 'Acumin Concept', sans-serif; font-size: 0.75rem; color: rgba(255,255,255,0.45); letter-spacing: 0.04em; }
.audio-player__track  { width: 100%; height: 3px; background: rgba(255,255,255,0.1); cursor: pointer; position: relative; transition: height 0.12s; }
.audio-player__track:hover { height: 5px; }
.audio-player__fill   { position: absolute; left: 0; top: 0; height: 100%; background: #7ab87a; pointer-events: none; }
.audio-player__thumb  { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 11px; height: 11px; border-radius: 50%; background: #9dd49d; pointer-events: none; opacity: 0; transition: opacity 0.12s; }
.audio-player__track:hover .audio-player__thumb { opacity: 1; }
.audio-player__controls { display: flex; align-items: center; gap: 10px; }
.audio-player__btn {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(122,184,122,0.15); border: 1px solid rgba(122,184,122,0.3);
  color: #9dd49d; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background 0.15s; padding-left: 1px;
}
.audio-player__btn:hover { background: rgba(122,184,122,0.28); }
.audio-player__time     { font-family: 'Acumin Concept', sans-serif; font-size: 0.65rem; color: rgba(255,255,255,0.45); }
.audio-player__spacer   { flex: 1; }
.audio-player__duration { font-family: 'Acumin Concept', sans-serif; font-size: 0.65rem; color: rgba(255,255,255,0.22); }

/* ── INPUT AREA ── */
.chat-input-area { border-top: 1px solid rgba(255,255,255,0.07); padding: 0.6rem 1.5rem 1.25rem; background-color: #243328; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.chat-input { display: flex; align-items: flex-end; gap: 0.75rem; padding: 0; border: none; }
.chat-input__field { flex: 1; resize: none; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.06); padding: 0.75rem 1rem; font-family: 'Acumin Concept', sans-serif; font-size: 1rem; color: rgba(255,255,255,0.9); outline: none; line-height: 1.5; transition: border-color 0.2s; overflow-y: hidden; }
.chat-input__field:focus       { border-color: rgba(255,255,255,0.3); }
.chat-input__field::placeholder { color: rgba(255,255,255,0.28); }
.chat-input__field:disabled    { opacity: 0.4; cursor: not-allowed; }
.chat-input__btn { width: 44px; height: 44px; background-color: rgba(255,255,255,0.12); border: none; color: rgba(255,255,255,0.85); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background-color 0.2s; }
.chat-input__btn:hover:not(:disabled) { background-color: rgba(255,255,255,0.2); }
.chat-input__btn:disabled { opacity: 0.3; cursor: not-allowed; }

/* ── MESSAGE ACTIONS ── */
.message__actions { display: flex; gap: 2px; margin-top: 4px; padding-left: 2px; }
.msg-action { background: none; border: none; padding: 5px; cursor: pointer; color: rgba(255,255,255,0.35); display: flex; align-items: center; transition: color 0.15s; }
.msg-action:hover  { color: rgba(255,255,255,0.7); }
.msg-action--active { color: rgba(255,255,255,0.95); }

.chat-disclaimer { font-family: 'Acumin Concept', sans-serif; font-size: 0.75rem; color: rgba(255,255,255,0.22); text-align: center; padding: 0 1.5rem 1.25rem; }

/* ── DEBUG PANEL ── */
.debug-panel { margin-top: 8px; background: #0a0f0b; border: 1px solid #2a5c2a; padding: 10px 12px; font-family: monospace; font-size: 0.72rem; color: #7dff7d; max-width: 100%; word-break: break-all; }
.debug-panel__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-weight: bold; color: #afffaf; }
.debug-panel__clear { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); font-size: 0.65rem; padding: 2px 8px; cursor: pointer; }
.debug-panel__row { color: #9fe89f; margin-bottom: 3px; }
.debug-panel__line { color: #7dff7d; padding: 1px 0; border-top: 1px solid rgba(255,255,255,0.04); }
</style>