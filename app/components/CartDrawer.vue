<template>
  <Teleport to="body">
    <Transition name="cart-backdrop">
      <div
        v-if="cart.isOpen.value"
        class="cart-backdrop"
        @click="cart.isOpen.value = false"
      />
    </Transition>

    <Transition name="cart-drawer">
      <aside v-if="cart.isOpen.value" class="cart-drawer" role="dialog" aria-label="Carrito de compras">

        <div class="cart-drawer__header">
          <span class="cart-drawer__title">Carrito</span>
          <button class="cart-drawer__close" @click="cart.isOpen.value = false" aria-label="Cerrar carrito">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div v-if="cart.items.value.length === 0" class="cart-drawer__empty">
          <p class="cart-drawer__empty-text">Tu carrito está vacío.</p>
          <NuxtLink to="/tienda" class="cart-drawer__empty-link" @click="cart.isOpen.value = false">
            <span>Ver productos</span>
            <svg width="28" height="10" viewBox="0 0 30 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 1L29 6L24 11" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M29 6L1 6" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
            </svg>
          </NuxtLink>
        </div>

        <div v-else class="cart-drawer__body">
          <ul class="cart-drawer__list">
            <li
              v-for="item in cartItemsResolved"
              :key="item.id"
              class="cart-drawer__item"
            >
              <img :src="item.image" :alt="item.title" class="cart-drawer__item-img" />
              <div class="cart-drawer__item-info">
                <span class="cart-drawer__item-tag">{{ item.tag }}</span>
                <p class="cart-drawer__item-title">{{ item.title }}</p>
                <p class="cart-drawer__item-price">{{ item.price }}</p>
              </div>
              <div class="cart-drawer__item-controls">
                <button
                  class="cart-drawer__qty-btn"
                  @click="cart.updateQty(item.id, item.qty - 1)"
                  aria-label="Disminuir cantidad"
                >−</button>
                <span class="cart-drawer__qty">{{ item.qty }}</span>
                <button
                  class="cart-drawer__qty-btn"
                  @click="cart.updateQty(item.id, item.qty + 1)"
                  :disabled="item.qty >= 10"
                  aria-label="Aumentar cantidad"
                >+</button>
                <button
                  class="cart-drawer__remove"
                  @click="cart.removeItem(item.id)"
                  aria-label="Eliminar producto"
                >
                  <svg width="12" height="12" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3L15 15M15 3L3 15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </li>
          </ul>

          <div class="cart-drawer__footer">
            <div class="cart-drawer__total-row">
              <span class="cart-drawer__total-label">Total</span>
              <span class="cart-drawer__total-value">{{ formattedTotal }}</span>
            </div>

            <button
              class="cart-drawer__checkout-btn"
              :class="{ 'cart-drawer__checkout-btn--loading': loading }"
              :disabled="loading"
              @click="handleCheckout"
            >
              {{ loading ? 'Procesando...' : 'Ir a pagar' }}
              <svg v-if="!loading" width="28" height="10" viewBox="0 0 30 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 1L29 6L24 11" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M29 6L1 6" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
              </svg>
            </button>

            <p v-if="errorMsg" class="cart-drawer__error">{{ errorMsg }}</p>
          </div>
        </div>

      </aside>
    </Transition>
  </Teleport>
</template>

<script setup>
import { PRODUCTS } from '~/composables/useCart'

const cart    = useCart()
const { user } = useAuth()

const loading  = ref(false)
const errorMsg = ref(null)

const cartItemsResolved = computed(() =>
  cart.items.value
    .map(item => {
      const p = PRODUCTS.find(p => p.id === item.id)
      return p ? { ...p, qty: item.qty } : null
    })
    .filter(Boolean)
)

const formattedTotal = computed(() => {
  const n = cart.totalAmount.value
  return '$' + n.toLocaleString('es-CL')
})

async function handleCheckout() {
  if (loading.value) return
  loading.value = true
  errorMsg.value = null

  try {
    const data = await $fetch('/api/cart-checkout', {
      method: 'POST',
      body: {
        items:   cart.items.value,
        user_id: user.value?.id ?? null,
      },
    })

    sessionStorage.setItem('fintoc_session_id',    data.session_id)
    sessionStorage.setItem('fintoc_product_name',  data.product_name)
    sessionStorage.setItem('fintoc_product_price', formattedTotal.value)

    cart.clear()
    cart.isOpen.value = false

    window.location.href = data.redirect_url
  } catch (err) {
    console.error('[CartDrawer]', err)
    errorMsg.value = 'No se pudo iniciar el pago. Intenta de nuevo.'
    setTimeout(() => { errorMsg.value = null }, 4000)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Backdrop */
.cart-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background-color: rgba(30, 40, 32, 0.45);
  backdrop-filter: blur(2px);
}

.cart-backdrop-enter-active,
.cart-backdrop-leave-active { transition: opacity 0.3s ease; }
.cart-backdrop-enter-from,
.cart-backdrop-leave-to     { opacity: 0; }

/* Drawer panel */
.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: 420px;
  max-width: 100vw;
  z-index: 301;
  background-color: #f2f1eb;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(30, 40, 32, 0.12);
}

.cart-drawer-enter-active,
.cart-drawer-leave-active { transition: transform 0.38s cubic-bezier(0.76, 0, 0.24, 1); }
.cart-drawer-enter-from,
.cart-drawer-leave-to     { transform: translateX(100%); }

/* Header */
.cart-drawer__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid rgba(57, 78, 60, 0.1);
  flex-shrink: 0;
}

.cart-drawer__title {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #394e3c;
}

.cart-drawer__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #394e3c;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.cart-drawer__close:hover { opacity: 1; }

/* Empty state */
.cart-drawer__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 2.5rem 1.75rem;
  gap: 1.5rem;
}

.cart-drawer__empty-text {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1.1rem;
  font-weight: 300;
  color: #5a665b;
}

.cart-drawer__empty-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  color: #8c8c8c;
  text-decoration: none;
  transition: color 0.2s;
}
.cart-drawer__empty-link:hover { color: #394e3c; }

/* Body */
.cart-drawer__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* List */
.cart-drawer__list {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
}

.cart-drawer__item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1.1rem 1.75rem;
  border-bottom: 1px solid rgba(57, 78, 60, 0.07);
}

.cart-drawer__item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  flex-shrink: 0;
}

.cart-drawer__item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.cart-drawer__item-tag {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #5a665b;
}

.cart-drawer__item-title {
  font-family: 'Acumin', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  color: #394e3c;
  line-height: 1.2;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-drawer__item-price {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: #394e3c;
  margin: 0;
}

/* Quantity controls */
.cart-drawer__item-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.cart-drawer__qty-btn {
  background: none;
  border: 1px solid rgba(57, 78, 60, 0.25);
  color: #394e3c;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: border-color 0.2s, opacity 0.2s;
  padding: 0;
}
.cart-drawer__qty-btn:hover { border-color: #394e3c; }
.cart-drawer__qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.cart-drawer__qty {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem;
  color: #394e3c;
  min-width: 18px;
  text-align: center;
}

.cart-drawer__remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #394e3c;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  margin-left: 0.2rem;
  opacity: 0.35;
  transition: opacity 0.2s;
}
.cart-drawer__remove:hover { opacity: 1; }

/* Footer */
.cart-drawer__footer {
  padding: 1.5rem 1.75rem;
  border-top: 1px solid rgba(57, 78, 60, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex-shrink: 0;
}

.cart-drawer__total-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.cart-drawer__total-label {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5a665b;
}

.cart-drawer__total-value {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: #394e3c;
}

.cart-drawer__checkout-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background-color: #394e3c;
  color: #f2f1eb;
  border: none;
  cursor: pointer;
  padding: 1rem 1.4rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  transition: background-color 0.25s ease, opacity 0.25s;
}
.cart-drawer__checkout-btn:hover:not(:disabled) { background-color: #2a3d2c; }
.cart-drawer__checkout-btn--loading,
.cart-drawer__checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.cart-drawer__error {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.82rem;
  color: #8c3030;
  margin: 0;
}

@media (max-width: 480px) {
  .cart-drawer { width: 100vw; }
  .cart-drawer__item { grid-template-columns: 64px 1fr auto; }
  .cart-drawer__item-img { width: 64px; height: 64px; }
}
</style>
