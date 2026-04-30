<template>
  <div class="account-page">

    <!-- Hero header -->
    <div class="account-hero">
      <div class="account-hero__inner">
        <div class="account-hero__avatar">
          {{ avatarLetter }}
        </div>
        <div class="account-hero__info">
          <h1 class="account-hero__name">{{ profile?.display_name || user?.email?.split('@')[0] }}</h1>
          <p class="account-hero__email">{{ user?.email }}</p>
          <p class="account-hero__since">Miembro desde {{ memberSince }}</p>
        </div>
      </div>
    </div>

    <!-- Tab nav -->
    <div class="account-tabs">
      <div class="account-tabs__inner">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="account-tabs__btn"
          :class="{ 'account-tabs__btn--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="account-content">
      <div class="account-content__inner">

        <!-- MIS DATOS -->
        <section v-if="activeTab === 'datos'" class="account-section">
          <h2 class="account-section__title">Mis datos</h2>

          <div class="account-fields">
            <div class="account-field">
              <label class="account-field__label">Correo electrónico</label>
              <p class="account-field__value account-field__value--readonly">{{ user?.email }}</p>
            </div>

            <div class="account-field">
              <label class="account-field__label">Nombre para mostrar</label>
              <div v-if="!editingName" class="account-field__row">
                <p class="account-field__value">{{ profile?.display_name || '—' }}</p>
                <button class="account-field__edit-btn" @click="startEditName">Editar</button>
              </div>
              <div v-else class="account-field__edit-row">
                <input
                  v-model="nameInput"
                  class="account-field__input"
                  placeholder="Tu nombre"
                  maxlength="80"
                  @keydown.enter="saveName"
                  @keydown.escape="editingName = false"
                />
                <button class="account-field__save-btn" :disabled="savingName" @click="saveName">
                  {{ savingName ? '...' : 'Guardar' }}
                </button>
                <button class="account-field__cancel-btn" @click="editingName = false">Cancelar</button>
              </div>
              <p v-if="nameError" class="account-field__error">{{ nameError }}</p>
              <p v-if="nameSuccess" class="account-field__success">Nombre actualizado.</p>
            </div>

            <div class="account-field">
              <label class="account-field__label">Miembro desde</label>
              <p class="account-field__value">{{ memberSince }}</p>
            </div>
          </div>

          <div class="account-danger">
            <button class="account-danger__logout" @click="handleLogout">Cerrar sesión</button>
          </div>
        </section>

        <!-- MIS COMPRAS -->
        <section v-else-if="activeTab === 'compras'" class="account-section">
          <h2 class="account-section__title">Historial de compras</h2>

          <div v-if="loadingOrders" class="account-empty">Cargando...</div>

          <div v-else-if="orders.length === 0" class="account-empty">
            <p>Aún no tienes compras registradas.</p>
            <NuxtLink to="/tienda" class="account-empty__link">
              <span>Ir a la tienda</span>
              <svg width="24" height="10" viewBox="0 0 30 12" fill="none">
                <path d="M24 1L29 6L24 11" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M29 6L1 6" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
              </svg>
            </NuxtLink>
          </div>

          <div v-else class="orders-list">
            <article v-for="order in orders" :key="order.id" class="order-card">
              <div class="order-card__top">
                <span class="order-card__name">{{ order.product_name || 'Producto' }}</span>
                <span class="order-card__status" :class="`order-card__status--${order.status}`">
                  {{ statusLabel(order.status) }}
                </span>
              </div>
              <div class="order-card__bottom">
                <span class="order-card__amount">${{ order.amount.toLocaleString('es-CL') }}</span>
                <span class="order-card__date">{{ formatDate(order.created_at) }}</span>
              </div>
            </article>
          </div>
        </section>


      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Casa BE — Mi cuenta' })

const { user, logout, getToken } = useAuth()
const router = useRouter()

const tabs = [
  { id: 'datos',          label: 'Mis datos'         },
  { id: 'compras',        label: 'Mis compras'       },
]
const activeTab = ref('datos')

const profile = ref<any>(null)
const orders  = ref<any[]>([])

const loadingOrders = ref(true)

const editingName  = ref(false)
const nameInput    = ref('')
const savingName   = ref(false)
const nameError    = ref<string | null>(null)
const nameSuccess  = ref(false)

onMounted(async () => {
  const token = await getToken()
  const headers = { Authorization: `Bearer ${token}` }

  const [profileData, ordersData] = await Promise.allSettled([
    $fetch('/api/me/profile', { headers }),
    $fetch('/api/me/orders',  { headers }),
  ])

  if (profileData.status === 'fulfilled') profile.value = profileData.value as any
  if (ordersData.status === 'fulfilled')  orders.value  = ordersData.value  as any[]

  loadingOrders.value = false
})

const avatarLetter = computed(() => {
  const src = profile.value?.display_name || user.value?.email || '?'
  return src[0].toUpperCase()
})

const memberSince = computed(() => {
  const d = profile.value?.created_at || user.value?.created_at
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
})


function startEditName() {
  nameInput.value   = profile.value?.display_name ?? ''
  nameError.value   = null
  nameSuccess.value = false
  editingName.value = true
}

async function saveName() {
  if (savingName.value) return
  savingName.value = true
  nameError.value  = null
  nameSuccess.value = false
  try {
    const token = await getToken()
    const res = await $fetch<{ display_name: string }>('/api/me/profile', {
      method:  'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body:    { display_name: nameInput.value },
    })
    if (profile.value) profile.value.display_name = res.display_name
    editingName.value = false
    nameSuccess.value = true
    setTimeout(() => { nameSuccess.value = false }, 3000)
  } catch {
    nameError.value = 'No se pudo guardar. Intenta de nuevo.'
  } finally {
    savingName.value = false
  }
}

async function handleLogout() {
  await logout()
  router.push('/')
}

const STATUS_LABELS: Record<string, string> = { succeeded: 'Pagado', failed: 'Fallido', pending: 'Pendiente' }
const statusLabel = (s: string) => STATUS_LABELS[s] ?? s

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<style scoped>
/* ── PAGE ── */
.account-page {
  min-height: 100vh;
  background-color: #f2f1eb;
}

/* ── HERO ── */
.account-hero {
  background-color: #2a3d2c;
  padding: 7rem 2rem 3rem;
}
.account-hero__inner {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}
.account-hero__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-family: 'Acumin', sans-serif;
  font-size: 2rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.account-hero__name {
  font-family: 'Acumin', sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 300;
  color: #fff;
  margin: 0 0 0.3rem;
}
.account-hero__email {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 0.2rem;
}
.account-hero__since {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

/* ── TABS ── */
.account-tabs {
  background-color: #2a3d2c;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.account-tabs__inner {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  padding: 0 2rem;
  gap: 0;
}
.account-tabs__btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.account-tabs__btn:hover { color: rgba(255, 255, 255, 0.8); }
.account-tabs__btn--active {
  color: #fff;
  border-bottom-color: rgba(255, 255, 255, 0.7);
}

/* ── CONTENT ── */
.account-content {
  padding: 3rem 2rem 5rem;
}
.account-content__inner {
  max-width: 860px;
  margin: 0 auto;
}

.account-section__title {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #394e3c;
  opacity: 0.5;
  margin-bottom: 2rem;
}

/* ── FIELDS (Mis datos) ── */
.account-fields {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid rgba(57, 78, 60, 0.1);
}
.account-field {
  padding: 1.4rem 0;
  border-bottom: 1px solid rgba(57, 78, 60, 0.1);
}
.account-field__label {
  display: block;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #394e3c;
  opacity: 0.5;
  margin-bottom: 0.5rem;
}
.account-field__value {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  color: #394e3c;
  margin: 0;
}
.account-field__value--readonly {
  opacity: 0.6;
}
.account-field__row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.account-field__edit-btn {
  background: none;
  border: none;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.82rem;
  color: #394e3c;
  opacity: 0.45;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}
.account-field__edit-btn:hover { opacity: 1; }

.account-field__edit-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.account-field__input {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  color: #394e3c;
  background: #fff;
  border: 1px solid rgba(57, 78, 60, 0.25);
  padding: 0.5rem 0.75rem;
  outline: none;
  width: 260px;
  max-width: 100%;
  transition: border-color 0.2s;
}
.account-field__input:focus { border-color: #394e3c; }

.account-field__save-btn {
  background-color: #394e3c;
  color: #f2f1eb;
  border: none;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  padding: 0.5rem 1.1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}
.account-field__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.account-field__cancel-btn {
  background: none;
  border: none;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
  opacity: 0.45;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
}
.account-field__cancel-btn:hover { opacity: 1; }

.account-field__error {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.8rem;
  color: #8c3030;
  margin: 0.4rem 0 0;
}
.account-field__success {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.8rem;
  color: #2d5a30;
  margin: 0.4rem 0 0;
}

.account-danger {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(57, 78, 60, 0.1);
}
.account-danger__logout {
  background: none;
  border: 1px solid rgba(57, 78, 60, 0.3);
  padding: 0.5rem 1.25rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.account-danger__logout:hover {
  background: rgba(57, 78, 60, 0.06);
  border-color: rgba(57, 78, 60, 0.5);
}

/* ── EMPTY STATE ── */
.account-empty {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  color: #394e3c;
  opacity: 0.6;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.account-empty__link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.95rem;
  font-weight: 300;
  color: #8c8c8c;
  text-decoration: none;
  transition: color 0.2s;
}
.account-empty__link:hover { color: #394e3c; }

/* ── ORDERS ── */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.order-card {
  background: #fff;
  border: 1px solid rgba(57, 78, 60, 0.1);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.order-card__top,
.order-card__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.order-card__bottom { opacity: 0.55; }
.order-card__name {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  color: #394e3c;
}
.order-card__amount,
.order-card__date {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.85rem;
  color: #394e3c;
}
.order-card__status {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.65rem;
}
.order-card__status--succeeded { background: #e8f0e8; color: #2d5a30; }
.order-card__status--failed    { background: #f5e8e8; color: #8c3030; }
.order-card__status--pending   { background: #f0ede8; color: #6b5a3e; }

/* ── CONVERSATIONS ── */
.convs-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.convs-summary {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}
.convs-summary__count {
  font-family: 'Acumin', sans-serif;
  font-size: 2.5rem;
  font-weight: 300;
  color: #394e3c;
  line-height: 1;
}
.convs-summary__label {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem;
  color: #394e3c;
  opacity: 0.55;
}
.conv-card {
  background: #fff;
  border: 1px solid rgba(57, 78, 60, 0.1);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.conv-card__preview {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.95rem;
  color: #394e3c;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}
.conv-card__date {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.8rem;
  color: #394e3c;
  opacity: 0.45;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── RESPONSIVE ── */
@media (max-width: 600px) {
  .account-hero__inner { flex-direction: column; align-items: flex-start; }
  .account-tabs__btn { font-size: 0.75rem; padding: 0.9rem 0.9rem; }
}
</style>
