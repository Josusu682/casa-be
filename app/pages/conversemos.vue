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
        <div class="model-selector">
          <button
            class="model-selector__btn"
            :class="{ 'model-selector__btn--active': selectedModel === 'gemini' }"
            @click="selectedModel = 'gemini'"
          >Gemini</button>
          <button
            class="model-selector__btn"
            :class="{ 'model-selector__btn--active': selectedModel === 'deepseek' }"
            @click="selectedModel = 'deepseek'"
          >DeepSeek</button>
        </div>
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
          </article>

          <div v-if="streaming" class="message message--assistant">
            <div class="message__meta"><span class="message__label">BE</span></div>
            <div class="message__bubble">
              <span v-if="streamingText" class="message__text" v-html="formatText(streamingText)"></span>
              <span v-else class="message__dots">
                <span></span><span></span><span></span>
                <span v-if="elapsedSecs > 2" class="message__elapsed">{{ elapsedSecs }}s</span>
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- Input -->
      <form class="chat-input" @submit.prevent="sendMessage">
        <textarea
          ref="inputEl"
          v-model="input"
          class="chat-input__field"
          placeholder="Escribe tu pregunta..."
          rows="1"
          :disabled="streaming"
          @keydown.enter.exact.prevent="sendMessage"
          @input="autoResize"
        ></textarea>
        <button type="submit" class="chat-input__btn" :disabled="streaming || !input.trim()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </form>

      <p class="chat-disclaimer">BE es un asistente de IA. No reemplaza atención médica ni psicológica profesional.</p>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Message    { role: 'user' | 'assistant'; content: string; timestamp: Date }
interface ConvItem   { id: number; preview: string; created_at: string }

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
const selectedModel   = ref<'gemini' | 'deepseek'>('gemini')
const history         = ref<ConvItem[]>([])
const loadingHistory  = ref(false)
const loadingMessages = ref(false)
let   _timer: ReturnType<typeof setInterval> | null = null

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
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br />')
}
function formatTime(date: Date) {
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
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
    history.value = await $fetch<ConvItem[]>('/api/me/conversations', {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch { /* silent */ } finally { loadingHistory.value = false }
}

async function loadConversation(id: number) {
  if (conversationId.value === id) { sidebarOpen.value = false; return }
  sidebarOpen.value   = false
  loadingMessages.value = true
  messages.value      = []
  conversationId.value = id
  try {
    const token = await getToken(); if (!token) return
    const msgs = await $fetch<{ role: string; content: string; created_at: string }[]>(
      `/api/me/conversations/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    messages.value = msgs.map(m => ({
      role:      m.role as 'user' | 'assistant',
      content:   m.content,
      timestamp: new Date(m.created_at),
    }))
    scrollToBottom(true)
  } catch { /* silent */ } finally { loadingMessages.value = false }
}

function newConversation() {
  messages.value       = []
  conversationId.value = null
  sidebarOpen.value    = false
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

  try {
    const token = await getToken()
    if (!token) { router.push('/login'); return }

    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 45000)

    const res = await $fetch<{ reply: string; conversationId: number }>('/api/chat', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      signal:  controller.signal,
      body:    { messages: messages.value.map(m => ({ role: m.role, content: m.content })), conversationId: conversationId.value, model: selectedModel.value },
    }).finally(() => clearTimeout(timeout))

    conversationId.value = res.conversationId
    await typewrite(res.reply)
    messages.value.push({ role: 'assistant', content: res.reply, timestamp: new Date() })
    await fetchHistory()

  } catch (err: any) {
    const isAbort = err?.message?.includes('abort') || err?.name === 'AbortError'
    const status  = err?.response?.status ?? err?.statusCode ?? '?'
    const message = isAbort
      ? 'La respuesta tardó demasiado. Intenta de nuevo.'
      : (err?.data?.statusMessage ?? err?.data?.message ?? err?.message ?? 'Error desconocido')
    const detail  = (!isAbort && err?.data?.data) ? ` | ${JSON.stringify(err.data.data).slice(0, 300)}` : ''
    messages.value.push({ role: 'assistant', content: isAbort ? message : `[Error ${status}] ${message}${detail}`, timestamp: new Date() })
  } finally {
    stopTimer(); streaming.value = false; streamingText.value = ''
    scrollToBottom(true); nextTick(() => inputEl.value?.focus())
  }
}

async function typewrite(text: string) {
  for (let i = 0; i < text.length; i++) {
    streamingText.value += text[i]
    if (i % 4 === 0) { scrollToBottom(); await new Promise(r => setTimeout(r, 12)) }
  }
  scrollToBottom()
}

onMounted(fetchHistory)
</script>

<style scoped>
/* ── ROOT ── */
.chat-page {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background-color: #f2f1eb;
  padding-top: 64px;
}

/* ── SIDEBAR OVERLAY (mobile) ── */
.sidebar-overlay {
  position: fixed;
  top: 64px; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 140;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 260px;
  flex-shrink: 0;
  background-color: #2a3d2c;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: transform 0.25s ease;
}
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 64px; left: 0; bottom: 0;
    z-index: 150;
    transform: translateX(-100%);
  }
  .sidebar--open { transform: translateX(0); }
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sidebar__title {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
}
.sidebar__close {
  background: none; border: none; color: rgba(255,255,255,0.4);
  cursor: pointer; display: flex; padding: 4px;
}
.sidebar__close:hover { color: rgba(255,255,255,0.8); }

.sidebar__new {
  display: flex; align-items: center; gap: 0.5rem;
  margin: 0.75rem; padding: 0.6rem 0.9rem;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.75); cursor: pointer;
  font-family: 'Acumin Concept', sans-serif; font-size: 0.85rem;
  transition: background 0.2s;
}
.sidebar__new:hover { background: rgba(255,255,255,0.12); }

.sidebar__list {
  flex: 1; overflow-y: auto; padding: 0.25rem 0;
}
.sidebar__item {
  display: flex; flex-direction: column; gap: 0.2rem;
  width: 100%; text-align: left; padding: 0.7rem 1rem;
  background: none; border: none; cursor: pointer;
  transition: background 0.15s;
}
.sidebar__item:hover { background: rgba(255,255,255,0.06); }
.sidebar__item--active { background: rgba(255,255,255,0.1); }
.sidebar__item-preview {
  font-family: 'Acumin Concept', sans-serif; font-size: 0.85rem;
  color: rgba(255,255,255,0.8); white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.sidebar__item-date {
  font-family: 'Acumin Concept', sans-serif; font-size: 0.7rem;
  color: rgba(255,255,255,0.3);
}
.sidebar__loading, .sidebar__empty {
  font-family: 'Acumin Concept', sans-serif; font-size: 0.8rem;
  color: rgba(255,255,255,0.3); padding: 1rem; text-align: center;
}

/* ── CHAT BODY ── */
.chat-body {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; min-width: 0;
}

/* ── TOPBAR ── */
.chat-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid rgba(57,78,60,0.12);
  background: #f2f1eb;
  flex-shrink: 0;
}
.chat-topbar__menu, .chat-topbar__new {
  background: none; border: none; color: #394e3c;
  cursor: pointer; display: flex; padding: 6px; opacity: 0.55;
  transition: opacity 0.2s;
}
.chat-topbar__menu:hover, .chat-topbar__new:hover { opacity: 1; }
@media (min-width: 769px) { .chat-topbar__menu { display: none; } }
.chat-topbar__label {
  font-family: 'Acumin Concept', sans-serif; font-size: 0.8rem;
  letter-spacing: 0.08em; color: #394e3c; opacity: 0.5; text-transform: uppercase;
}

/* ── MODEL SELECTOR ── */
.model-selector {
  display: flex;
  border: 1px solid rgba(57,78,60,0.18);
  overflow: hidden;
}
.model-selector__btn {
  background: none; border: none; padding: 0.3rem 0.85rem;
  font-family: 'Acumin Concept', sans-serif; font-size: 0.72rem;
  letter-spacing: 0.06em; color: #394e3c; opacity: 0.45;
  cursor: pointer; transition: background 0.15s, opacity 0.15s;
}
.model-selector__btn:first-child { border-right: 1px solid rgba(57,78,60,0.18); }
.model-selector__btn:hover { opacity: 0.8; }
.model-selector__btn--active {
  background: #394e3c; color: #fff; opacity: 1;
}

/* ── MESSAGES ── */
.messages {
  flex: 1; overflow-y: auto; padding: 1.5rem 1.5rem 1rem;
  display: flex; flex-direction: column; gap: 1.5rem;
  scroll-behavior: smooth;
}
.messages__empty {
  display: flex; flex-direction: column; gap: 1.5rem;
  padding-top: 1rem; max-width: 640px; margin: 0 auto; width: 100%;
}
.messages__empty-text {
  font-family: 'Acumin Concept', sans-serif; font-size: 1.25rem;
  font-weight: 300; color: #394e3c; opacity: 0.6;
}
.messages__suggestions { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.messages__suggestion {
  background: none; border: 1px solid rgba(57,78,60,0.25);
  padding: 0.5rem 1rem; font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem; color: #394e3c; cursor: pointer; text-align: left;
  transition: background 0.2s, border-color 0.2s;
}
.messages__suggestion:hover { background: rgba(57,78,60,0.06); border-color: rgba(57,78,60,0.5); }
.messages__loading {
  font-family: 'Acumin Concept', sans-serif; font-size: 0.9rem;
  color: #394e3c; opacity: 0.4; padding: 2rem; text-align: center;
}

/* ── MESSAGE ── */
.message {
  display: flex; flex-direction: column; gap: 0.35rem;
  max-width: 80%;
}
.message--user  { align-self: flex-end;  align-items: flex-end; }
.message--assistant { align-self: flex-start; align-items: flex-start; }
.message__meta  { display: flex; align-items: center; gap: 0.5rem; }
.message__label {
  font-family: 'Acumin Concept', sans-serif; font-size: 0.7rem;
  letter-spacing: 0.1em; color: #394e3c; opacity: 0.45; text-transform: uppercase;
}
.message__time {
  font-family: 'Acumin Concept', sans-serif; font-size: 0.7rem;
  color: #394e3c; opacity: 0.3;
}
.message__bubble {
  padding: 0.85rem 1.15rem; font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem; line-height: 1.6; color: #394e3c;
}
.message--user .message__bubble      { background-color: #394e3c; color: #fff; }
.message--assistant .message__bubble { background-color: #fff; border: 1px solid rgba(57,78,60,0.1); }

/* ── DOTS ── */
.message__dots { display: flex; gap: 5px; align-items: center; height: 20px; }
.message__dots span {
  width: 6px; height: 6px; background: #394e3c; border-radius: 50%;
  opacity: 0.4; animation: dot-bounce 1.2s infinite ease-in-out;
}
.message__dots span:nth-child(2) { animation-delay: 0.2s; }
.message__dots span:nth-child(3) { animation-delay: 0.4s; }
.message__elapsed {
  width: auto !important; height: auto !important; background: none !important;
  border-radius: 0 !important; opacity: 0.45 !important; animation: none !important;
  font-family: 'Acumin Concept', sans-serif; font-size: 0.7rem; color: #394e3c; margin-left: 4px;
}
@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40%           { transform: translateY(-6px); opacity: 1; }
}

/* ── INPUT ── */
.chat-input {
  display: flex; align-items: flex-end; gap: 0.75rem;
  border-top: 1px solid rgba(57,78,60,0.15);
  padding: 1rem 1.5rem 1.25rem;
  background-color: #f2f1eb; flex-shrink: 0;
}
.chat-input__field {
  flex: 1; resize: none; border: 1px solid rgba(57,78,60,0.2);
  background: #fff; padding: 0.75rem 1rem;
  font-family: 'Acumin Concept', sans-serif; font-size: 1rem;
  color: #394e3c; outline: none; line-height: 1.5;
  transition: border-color 0.2s; overflow-y: hidden;
}
.chat-input__field:focus     { border-color: #394e3c; }
.chat-input__field::placeholder { color: rgba(57,78,60,0.4); }
.chat-input__field:disabled  { opacity: 0.5; cursor: not-allowed; }
.chat-input__btn {
  width: 44px; height: 44px; background-color: #394e3c; border: none;
  color: #fff; cursor: pointer; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; transition: background-color 0.2s;
}
.chat-input__btn:hover:not(:disabled) { background-color: #2d3f30; }
.chat-input__btn:disabled { opacity: 0.4; cursor: not-allowed; }

.chat-disclaimer {
  font-family: 'Acumin Concept', sans-serif; font-size: 0.75rem;
  color: #394e3c; opacity: 0.4; text-align: center;
  padding: 0 1.5rem 1.25rem;
}
</style>