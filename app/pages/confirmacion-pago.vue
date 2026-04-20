<template>
  <section class="confirm-page">
    <div class="confirm-page__card">

      <!-- Estado: verificando -->  
      <template v-if="state === 'checking'">
        <div class="confirm-page__spinner" />
        <p class="confirm-page__overline">TIENDA</p>
        <h1 class="confirm-page__title">Verificando pago...</h1>
        <p class="confirm-page__desc">Estamos confirmando tu transacción con el banco.</p>
      </template>

      <!-- Estado: pago confirmado -->
      <template v-else-if="state === 'succeeded'">
        <div class="confirm-page__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="23" stroke="#394e3c" stroke-width="1.2"/>
            <path d="M14 24.5L21 31.5L34 17" stroke="#394e3c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="confirm-page__overline">TIENDA</p>
        <h1 class="confirm-page__title">Pago confirmado</h1>
        <p class="confirm-page__desc">
          Tu transacción fue verificada correctamente.<br />
          Recibirás un correo de confirmación en breve.
        </p>
        <div v-if="productName" class="confirm-page__product">
          <span class="confirm-page__product-label">Producto</span>
          <span class="confirm-page__product-name">{{ productName }}</span>
          <span v-if="productPrice" class="confirm-page__product-price">{{ productPrice }}</span>
        </div>
        <div v-if="sessionId" class="confirm-page__session">Referencia: {{ sessionId }}</div>
      </template>

      <!-- Estado: fallido -->
      <template v-else-if="state === 'failed'">
        <div class="confirm-page__icon confirm-page__icon--error">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="23" stroke="#8c3030" stroke-width="1.2"/>
            <path d="M17 17L31 31M31 17L17 31" stroke="#8c3030" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="confirm-page__overline">TIENDA</p>
        <h1 class="confirm-page__title confirm-page__title--error">Pago no procesado</h1>
        <p class="confirm-page__desc">No pudimos confirmar tu pago. Si se realizó un cargo, contáctanos.</p>
      </template>

      <!-- Estado: timeout (pago pendiente de confirmación) -->
      <template v-else-if="state === 'timeout'">
        <div class="confirm-page__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="23" stroke="#394e3c" stroke-width="1.2"/>
            <path d="M24 14V26" stroke="#394e3c" stroke-width="1.4" stroke-linecap="round"/>
            <circle cx="24" cy="32" r="1.2" fill="#394e3c"/>
          </svg>
        </div>
        <p class="confirm-page__overline">TIENDA</p>
        <h1 class="confirm-page__title">Pago en proceso</h1>
        <p class="confirm-page__desc">
          Tu pago está siendo procesado por el banco.<br />
          Te confirmaremos por correo cuando esté listo.
        </p>
        <div v-if="sessionId" class="confirm-page__session">Referencia: {{ sessionId }}</div>
      </template>

      <!-- Botón siempre visible -->
      <NuxtLink to="/tienda" class="confirm-page__btn">
        <span>Volver a la tienda</span>
        <svg width="30" height="12" viewBox="0 0 30 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 1L29 6L24 11" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M29 6L1 6" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
        </svg>
      </NuxtLink>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'

useSeoMeta({ title: 'Casa BE — Pago confirmado' })

const state        = ref('checking')  // 'checking' | 'succeeded' | 'failed' | 'timeout'
const sessionId    = ref(null)
const productName  = ref(null)
const productPrice = ref(null)

const MAX_POLLS      = 10
const POLL_INTERVAL  = 1500

async function verificarPago(sid) {
  for (let i = 0; i < MAX_POLLS; i++) {
    try {
      const result = await $fetch(`/api/verificar-pago?session_id=${sid}`)
      if (result.found) {
        state.value = result.status === 'succeeded' ? 'succeeded' : 'failed'
        return
      }
    } catch (_) {}
    if (i < MAX_POLLS - 1) {
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
    }
  }
  state.value = 'timeout'
}

onMounted(() => {
  sessionId.value    = sessionStorage.getItem('fintoc_session_id')
  productName.value  = sessionStorage.getItem('fintoc_product_name')
  productPrice.value = sessionStorage.getItem('fintoc_product_price')

  sessionStorage.removeItem('fintoc_session_id')
  sessionStorage.removeItem('fintoc_product_name')
  sessionStorage.removeItem('fintoc_product_price')

  if (sessionId.value) {
    verificarPago(sessionId.value)
  } else {
    state.value = 'failed'
  }
})
</script>

<style scoped>
.confirm-page {
  background-color: #D4D4D3;
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
}

.confirm-page__card {
  max-width: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
}

.confirm-page__icon {
  margin-bottom: 0.5rem;
}

.confirm-page__spinner {
  width: 40px;
  height: 40px;
  border: 1.5px solid rgba(57, 78, 60, 0.25);
  border-top-color: #394e3c;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.confirm-page__overline {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  color: #394e3c;
  text-transform: uppercase;
}

.confirm-page__title {
  font-family: 'Acumin Concept', sans-serif;
  font-size: clamp(2.4rem, 5vw, 3.8rem);
  font-weight: 450;
  color: #394e3c;
  line-height: 1.1;
  margin: 0;
}

.confirm-page__desc {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1.1rem;
  font-weight: 300;
  color: #5a665b;
  line-height: 1.6;
  max-width: 480px;
}

.confirm-page__product {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(57, 78, 60, 0.2);
  width: 100%;
}

.confirm-page__product-label {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: #5a665b;
  text-transform: uppercase;
}

.confirm-page__product-name {
  font-family: 'Acumin', sans-serif;
  font-size: 1.4rem;
  font-weight: 300;
  color: #394e3c;
  line-height: 1.2;
}

.confirm-page__product-price {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: #394e3c;
  margin-top: 0.25rem;
}

.confirm-page__session {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.78rem;
  color: #8a9c8b;
  word-break: break-all;
}

.confirm-page__btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #8c8c8c;
  text-decoration: none;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  transition: color 0.3s ease;
  margin-top: 0.5rem;
}

.confirm-page__btn:hover {
  color: #394e3c;
}
</style>
