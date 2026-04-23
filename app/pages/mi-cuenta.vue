<template>
  <div class="account-page">
    <div class="account-page__inner">

      <header class="account-header">
        <h1 class="account-header__title">Mi cuenta</h1>
        <p class="account-header__email">{{ user?.email }}</p>
        <button class="account-header__logout" @click="handleLogout">Cerrar sesión</button>
      </header>

      <section class="account-section">
        <h2 class="account-section__title">Mis compras</h2>

        <div v-if="loading" class="account-empty">Cargando...</div>

        <div v-else-if="orders.length === 0" class="account-empty">
          Aún no tienes compras registradas.
          <NuxtLink to="/tienda" class="account-empty__link">Ir a la tienda →</NuxtLink>
        </div>

        <div v-else class="orders-list">
          <article v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-card__row">
              <span class="order-card__name">{{ order.product_name || 'Producto' }}</span>
              <span class="order-card__status" :class="`order-card__status--${order.status}`">
                {{ statusLabel(order.status) }}
              </span>
            </div>
            <div class="order-card__row order-card__row--sub">
              <span class="order-card__amount">${{ (order.amount / 1).toLocaleString('es-CL') }}</span>
              <span class="order-card__date">{{ formatDate(order.created_at) }}</span>
            </div>
          </article>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { user, logout, getToken } = useAuth()
const router = useRouter()

const orders  = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const token = await getToken()
    orders.value = await $fetch('/api/me/orders', {
      headers: { Authorization: `Bearer ${token}` },
    }) as any[]
  } catch {
    orders.value = []
  } finally {
    loading.value = false
  }
})

async function handleLogout() {
  await logout()
  router.push('/')
}

const statusLabel = (s: string) => ({
  succeeded: 'Pagado',
  failed:    'Fallido',
  pending:   'Pendiente',
}[s] ?? s)

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  background-color: #f2f1eb;
  padding: 6rem 2rem 4rem;
}
.account-page__inner {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.account-header {
  display: flex;
  align-items: baseline;
  gap: 1.5rem;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(57, 78, 60, 0.15);
  padding-bottom: 1.5rem;
}
.account-header__title {
  font-family: 'Acumin', sans-serif;
  font-size: 2.2rem;
  font-weight: 300;
  color: #394e3c;
  flex: 1;
}
.account-header__email {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem;
  color: #394e3c;
  opacity: 0.6;
}
.account-header__logout {
  background: none;
  border: 1px solid rgba(57, 78, 60, 0.3);
  padding: 0.4rem 1rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
  cursor: pointer;
  transition: background 0.2s;
}
.account-header__logout:hover { background: rgba(57, 78, 60, 0.07); }

.account-section__title {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #394e3c;
  opacity: 0.6;
  margin-bottom: 1.5rem;
}

.account-empty {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  color: #394e3c;
  opacity: 0.6;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.account-empty__link {
  color: #394e3c;
  font-size: 0.9rem;
}

.orders-list { display: flex; flex-direction: column; gap: 1rem; }

.order-card {
  background: #fff;
  border: 1px solid rgba(57, 78, 60, 0.1);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.order-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-card__row--sub { opacity: 0.6; }
.order-card__name {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  color: #394e3c;
}
.order-card__amount, .order-card__date {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
}
.order-card__status {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
}
.order-card__status--succeeded { background: #e8f0e8; color: #2d5a30; }
.order-card__status--failed    { background: #f5e8e8; color: #8c3030; }
.order-card__status--pending   { background: #f0ede8; color: #6b5a3e; }
</style>
