<template>
  <div class="chat-page">

    <!-- Hero -->
    <header class="chat-hero">
      <div class="chat-hero__inner">
        <p class="chat-hero__label">CASA BE / IA</p>
        <h1 class="chat-hero__title">Conversemos</h1>
        <p class="chat-hero__sub">
          Pregúntale a BE sobre regulación del sistema nervioso,<br class="chat-hero__br" />
          señales del cuerpo y herramientas de bienestar.
        </p>
      </div>
    </header>

    <!-- Chat container -->
    <main class="chat-main">
      <div class="chat-main__inner">

        <!-- Mensajes -->
        <div ref="messagesEl" class="messages">
          <div v-if="messages.length === 0" class="messages__empty">
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

          <template v-else>
            <article
              v-for="(msg, i) in messages"
              :key="i"
              class="message"
              :class="`message--${msg.role}`"
            >
              <div class="message__meta">
                <span class="message__label">
                  {{ msg.role === 'assistant' ? 'BE' : userInitial }}
                </span>
                <span class="message__time">{{ formatTime(msg.timestamp) }}</span>
              </div>
              <div class="message__bubble">
                <span class="message__text" v-html="formatText(msg.content)"></span>
              </div>
            </article>

            <!-- Typing indicator -->
            <div v-if="streaming" class="message message--assistant">
              <div class="message__meta">
                <span class="message__label">BE</span>
              </div>
              <div class="message__bubble">
                <span v-if="streamingText" class="message__text" v-html="formatText(streamingText)"></span>
                <span v-else class="message__dots">
                  <span></span><span></span><span></span>
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

        <p class="chat-disclaimer">
          BE es un asistente de IA. No reemplaza atención médica ni psicológica profesional.
        </p>

      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Message {
  role:      'user' | 'assistant'
  content:   string
  timestamp: Date
}

const { user, getToken } = useAuth()
const router = useRouter()

const messagesEl    = ref<HTMLElement | null>(null)
const inputEl       = ref<HTMLTextAreaElement | null>(null)
const messages      = ref<Message[]>([])
const input         = ref('')
const streaming     = ref(false)
const streamingText = ref('')
const conversationId = ref<number | null>(null)

const userInitial = computed(() => {
  const email = user.value?.email ?? ''
  return email.charAt(0).toUpperCase()
})

const suggestions = [
  '¿Qué es el sistema nervioso autónomo?',
  'Tengo mucha ansiedad, ¿qué hago?',
  '¿Cómo sé si estoy en modo supervivencia?',
  '¿Qué es la regulación somática?',
]

function formatText(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function autoResize() {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

function scrollToBottom(force = false) {
  nextTick(() => {
    const el = messagesEl.value
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (force || nearBottom) el.scrollTop = el.scrollHeight
  })
}

function sendSuggestion(text: string) {
  input.value = text
  sendMessage()
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || streaming.value) return

  messages.value.push({ role: 'user', content: text, timestamp: new Date() })
  input.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'
  scrollToBottom(true)

  streaming.value     = true
  streamingText.value = ''

  try {
    const token = await getToken()
    if (!token) { router.push('/login'); return }

    const res = await $fetch<{ reply: string; conversationId: number }>('/api/chat', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        messages:       messages.value.map(m => ({ role: m.role, content: m.content })),
        conversationId: conversationId.value,
      },
    })

    conversationId.value = res.conversationId

    await typewrite(res.reply)

    messages.value.push({ role: 'assistant', content: res.reply, timestamp: new Date() })

  } catch {
    messages.value.push({
      role:      'assistant',
      content:   'Lo siento, ocurrió un error. Por favor intenta de nuevo.',
      timestamp: new Date(),
    })
  } finally {
    streaming.value     = false
    streamingText.value = ''
    scrollToBottom(true)
    nextTick(() => inputEl.value?.focus())
  }
}

async function typewrite(text: string) {
  for (let i = 0; i < text.length; i++) {
    streamingText.value += text[i]
    if (i % 4 === 0) {
      scrollToBottom()
      await new Promise(resolve => setTimeout(resolve, 12))
    }
  }
  scrollToBottom()
}
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f2f1eb;
}

/* ── HERO ── */
.chat-hero {
  padding: 7rem 2rem 3rem;
  background-color: #394e3c;
}
.chat-hero__inner {
  max-width: 760px;
  margin: 0 auto;
}
.chat-hero__label {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.5);
  margin-bottom: 1rem;
}
.chat-hero__title {
  font-family: 'Acumin', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 300;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 1.25rem;
}
.chat-hero__sub {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1.1rem;
  font-weight: 300;
  color: rgba(255,255,255,0.7);
  line-height: 1.5;
}
.chat-hero__br { display: none; }
@media (min-width: 600px) { .chat-hero__br { display: inline; } }

/* ── MAIN ── */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 2rem 0;
}
.chat-main__inner {
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── MESSAGES ── */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  scroll-behavior: smooth;
  max-height: calc(100vh - 340px);
  min-height: 300px;
}

.messages__empty {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1rem;
}
.messages__empty-text {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1.25rem;
  font-weight: 300;
  color: #394e3c;
  opacity: 0.6;
}
.messages__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
.messages__suggestion {
  background: none;
  border: 1px solid rgba(57, 78, 60, 0.25);
  padding: 0.5rem 1rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem;
  color: #394e3c;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, border-color 0.2s;
}
.messages__suggestion:hover {
  background: rgba(57, 78, 60, 0.06);
  border-color: rgba(57, 78, 60, 0.5);
}

/* ── MESSAGE ── */
.message {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-width: 80%;
}
.message--user {
  align-self: flex-end;
  align-items: flex-end;
}
.message--assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.message__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.message__label {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: #394e3c;
  opacity: 0.45;
  text-transform: uppercase;
}
.message__time {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.7rem;
  color: #394e3c;
  opacity: 0.3;
}

.message__bubble {
  padding: 0.85rem 1.15rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #394e3c;
}
.message--user .message__bubble {
  background-color: #394e3c;
  color: #fff;
}
.message--assistant .message__bubble {
  background-color: #fff;
  border: 1px solid rgba(57, 78, 60, 0.1);
}

/* Typing dots */
.message__dots {
  display: flex;
  gap: 5px;
  align-items: center;
  height: 20px;
}
.message__dots span {
  width: 6px;
  height: 6px;
  background: #394e3c;
  border-radius: 50%;
  opacity: 0.4;
  animation: dot-bounce 1.2s infinite ease-in-out;
}
.message__dots span:nth-child(2) { animation-delay: 0.2s; }
.message__dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40%           { transform: translateY(-6px); opacity: 1; }
}

/* ── INPUT ── */
.chat-input {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  border-top: 1px solid rgba(57, 78, 60, 0.15);
  padding: 1rem 0 1.25rem;
  position: sticky;
  bottom: 0;
  background-color: #f2f1eb;
}
.chat-input__field {
  flex: 1;
  resize: none;
  border: 1px solid rgba(57, 78, 60, 0.2);
  background: #fff;
  padding: 0.75rem 1rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  color: #394e3c;
  outline: none;
  line-height: 1.5;
  transition: border-color 0.2s;
  overflow-y: hidden;
}
.chat-input__field:focus { border-color: #394e3c; }
.chat-input__field::placeholder { color: rgba(57,78,60,0.4); }
.chat-input__field:disabled { opacity: 0.5; cursor: not-allowed; }

.chat-input__btn {
  width: 44px;
  height: 44px;
  background-color: #394e3c;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.2s;
}
.chat-input__btn:hover:not(:disabled) { background-color: #2d3f30; }
.chat-input__btn:disabled { opacity: 0.4; cursor: not-allowed; }

.chat-disclaimer {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.75rem;
  color: #394e3c;
  opacity: 0.4;
  text-align: center;
  padding-bottom: 1.5rem;
}
</style>