<template>
  <div class="auth-page">
    <NuxtLink to="/" class="auth-page__back">← Volver</NuxtLink>

    <div class="auth-card">
      <img src="/images/logo_be.png" alt="Casa BE" class="auth-card__logo" />

      <div class="auth-card__tabs">
        <button
          class="auth-card__tab"
          :class="{ 'auth-card__tab--active': mode === 'login' }"
          @click="mode = 'login'"
        >Ingresar</button>
        <button
          class="auth-card__tab"
          :class="{ 'auth-card__tab--active': mode === 'register' }"
          @click="mode = 'register'"
        >Crear cuenta</button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-card__form">
        <div class="auth-card__field">
          <label class="auth-card__label">Correo</label>
          <input
            v-model="email"
            type="email"
            class="auth-card__input"
            placeholder="tu@correo.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="auth-card__field">
          <label class="auth-card__label">Contraseña</label>
          <input
            v-model="password"
            type="password"
            class="auth-card__input"
            :placeholder="mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'"
            :minlength="mode === 'register' ? 8 : undefined"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorMsg" class="auth-card__error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="auth-card__success">{{ successMsg }}</p>

        <button type="submit" class="auth-card__btn" :disabled="loading">
          {{ loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: [] })

const { login, register, user } = useAuth()
const router = useRouter()
const route  = useRoute()

if (user.value) {
  router.replace((route.query.redirect as string) || '/')
}

const mode       = ref<'login' | 'register'>('login')
const email      = ref('')
const password   = ref('')
const loading    = ref(false)
const errorMsg   = ref('')
const successMsg = ref('')

watch(mode, () => {
  errorMsg.value   = ''
  successMsg.value = ''
})

async function handleSubmit() {
  if (loading.value) return
  loading.value  = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    if (mode.value === 'login') {
      await login(email.value, password.value)
      router.replace((route.query.redirect as string) || '/mi-cuenta')
    } else {
      await register(email.value, password.value)
      successMsg.value = 'Revisa tu correo para confirmar tu cuenta.'
      email.value    = ''
      password.value = ''
    }
  } catch (err: any) {
    const msg: Record<string, string> = {
      'Invalid login credentials':    'Correo o contraseña incorrectos.',
      'Email not confirmed':           'Confirma tu correo antes de ingresar.',
      'User already registered':       'Ya existe una cuenta con ese correo.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 8 caracteres.',
    }
    errorMsg.value = msg[err?.message] ?? 'Algo salió mal. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background-color: #f2f1eb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.auth-page__back {
  position: absolute;
  top: 2rem;
  left: 2rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem;
  color: #394e3c;
  text-decoration: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.auth-page__back:hover { opacity: 1; }

.auth-card {
  background: #fff;
  border: 1px solid rgba(57, 78, 60, 0.12);
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.auth-card__logo {
  height: 48px;
  width: auto;
  object-fit: contain;
}

.auth-card__tabs {
  display: flex;
  width: 100%;
  border-bottom: 1px solid rgba(57, 78, 60, 0.15);
}

.auth-card__tab {
  flex: 1;
  background: none;
  border: none;
  padding: 0.75rem 0;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.95rem;
  color: #394e3c;
  opacity: 0.45;
  cursor: pointer;
  transition: opacity 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.auth-card__tab--active {
  opacity: 1;
  border-bottom-color: #394e3c;
}

.auth-card__form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.auth-card__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.auth-card__label {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #394e3c;
  opacity: 0.7;
}

.auth-card__input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(57, 78, 60, 0.25);
  background: #fafaf8;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  color: #394e3c;
  outline: none;
  transition: border-color 0.2s;
}
.auth-card__input:focus {
  border-color: #394e3c;
}

.auth-card__error {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #8c3030;
}

.auth-card__success {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
}

.auth-card__btn {
  margin-top: 0.5rem;
  padding: 0.85rem;
  background-color: #394e3c;
  color: #fff;
  border: none;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background-color 0.2s;
}
.auth-card__btn:hover:not(:disabled) { background-color: #2d3f30; }
.auth-card__btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
