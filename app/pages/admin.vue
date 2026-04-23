<template>
  <div class="admin-page">
    <div class="admin-page__inner">

      <header class="admin-header">
        <h1 class="admin-header__title">Panel Admin</h1>
        <button class="admin-header__logout" @click="handleLogout">Cerrar sesión</button>
      </header>

      <div class="admin-tabs">
        <button class="admin-tab" :class="{ 'admin-tab--active': tab === 'orders' }" @click="tab = 'orders'">
          Órdenes <span class="admin-tab__count">{{ data.orders.length }}</span>
        </button>
        <button class="admin-tab" :class="{ 'admin-tab--active': tab === 'waitlist' }" @click="tab = 'waitlist'">
          Waitlist <span class="admin-tab__count">{{ data.waitlist.length }}</span>
        </button>
      </div>

      <div v-if="loading" class="admin-empty">Cargando...</div>
      <div v-else-if="error" class="admin-error">{{ error }}</div>

      <template v-else>

        <!-- ÓRDENES -->
        <section v-if="tab === 'orders'">
          <div v-if="data.orders.length === 0" class="admin-empty">Sin órdenes aún.</div>
          <table v-else class="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Session ID</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="o in data.orders" :key="o.id">
                <td>{{ formatDate(o.created_at) }}</td>
                <td>{{ o.product_name || '—' }}</td>
                <td>${{ (o.amount || 0).toLocaleString('es-CL') }}</td>
                <td><span class="status-badge" :class="`status-badge--${o.status}`">{{ o.status }}</span></td>
                <td class="admin-table__mono">{{ o.session_id }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- WAITLIST -->
        <section v-if="tab === 'waitlist'">
          <div v-if="data.waitlist.length === 0" class="admin-empty">Waitlist vacía.</div>
          <table v-else class="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(w, i) in data.waitlist" :key="w.id">
                <td>{{ i + 1 }}</td>
                <td>{{ w.email }}</td>
                <td>{{ formatDate(w.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { logout, getToken } = useAuth()
const router = useRouter()

const tab     = ref<'orders' | 'waitlist'>('orders')
const loading = ref(true)
const error   = ref('')
const data    = ref<{ orders: any[]; waitlist: any[] }>({ orders: [], waitlist: [] })

onMounted(async () => {
  try {
    const token = await getToken()
    data.value = await $fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` },
    }) as any
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'No se pudo cargar el panel.'
  } finally {
    loading.value = false
  }
})

async function handleLogout() {
  await logout()
  router.push('/')
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background-color: #f2f1eb;
  padding: 5rem 2rem 4rem;
}
.admin-page__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(57, 78, 60, 0.15);
  padding-bottom: 1.5rem;
}
.admin-header__title {
  font-family: 'Acumin', sans-serif;
  font-size: 2rem;
  font-weight: 300;
  color: #394e3c;
}
.admin-header__logout {
  background: none;
  border: 1px solid rgba(57, 78, 60, 0.3);
  padding: 0.4rem 1rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
  cursor: pointer;
}
.admin-header__logout:hover { background: rgba(57, 78, 60, 0.07); }

.admin-tabs { display: flex; gap: 0.5rem; }
.admin-tab {
  background: none;
  border: 1px solid rgba(57, 78, 60, 0.2);
  padding: 0.5rem 1.25rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem;
  color: #394e3c;
  opacity: 0.5;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.admin-tab--active { opacity: 1; background: rgba(57, 78, 60, 0.08); }
.admin-tab__count {
  background: #394e3c;
  color: #fff;
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 20px;
}

.admin-empty, .admin-error {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  color: #394e3c;
  opacity: 0.6;
}
.admin-error { color: #8c3030; opacity: 1; }

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem;
}
.admin-table th {
  text-align: left;
  font-size: 0.75rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #394e3c;
  opacity: 0.5;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid rgba(57, 78, 60, 0.15);
}
.admin-table td {
  padding: 0.85rem 0.75rem;
  color: #394e3c;
  border-bottom: 1px solid rgba(57, 78, 60, 0.07);
}
.admin-table__mono { font-size: 0.75rem; opacity: 0.5; }

.status-badge {
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  padding: 0.2rem 0.55rem;
  text-transform: uppercase;
}
.status-badge--succeeded { background: #e8f0e8; color: #2d5a30; }
.status-badge--failed    { background: #f5e8e8; color: #8c3030; }
.status-badge--pending   { background: #f0ede8; color: #6b5a3e; }
</style>
