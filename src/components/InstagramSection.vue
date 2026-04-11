<template>
  <section class="instagram" :style="{ backgroundImage: `url('/images/fondo_2.png')` }">
    <div class="instagram__header">
      <img src="/images/ig.png" alt="Instagram" class="instagram__icon" />
      <span>Síguenos en Instagram</span>
    </div>
    <div class="instagram__grid">
      <div class="ig-card" v-for="card in cards" :key="card.id">
        <div class="ig-card__header">
          <img src="/images/icono_2.png" alt="" class="ig-card__avatar" />
          <span class="ig-card__account">casa be</span>
          <span class="ig-card__dots">···</span>
        </div>
        <div :class="['ig-card__img', `ig-card__img--${card.id}`]"></div>
        <div class="ig-card__footer"><span>♡  ♺  ✈</span><span>8</span></div>
      </div>
    </div>
  </section>
</template>

<script setup>
const cards = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
]
</script>

<style scoped>
.instagram {
  padding: 0 0 4rem;
  background-color: var(--cream-light);
  background-size: cover;
  background-position: center;
}
.instagram__header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-mid);
  letter-spacing: 0.03em;
  padding: 2.5rem 0 1.8rem;
}
.instagram__icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.instagram__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 740px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.ig-card {
  background: var(--white);
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.6rem;
  color: var(--text-mid);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.ig-card__header {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.5rem;
  font-weight: 500;
}
.ig-card__avatar {
  width: 16px;
  height: 16px;
  object-fit: contain;
  border-radius: 50%;
}
.ig-card__account {
  flex: 1;
  font-size: 0.55rem;
  letter-spacing: 0.02em;
}
.ig-card__dots { color: var(--text-light); font-size: 0.7rem; }
.ig-card__img {
  width: 100%;
  aspect-ratio: 1 / 1;
}
.ig-card__footer {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0.5rem;
  font-size: 0.55rem;
  color: var(--text-light);
}

.ig-card__img--1 { background: linear-gradient(135deg, #c8d5b0, #a8bf92); }
.ig-card__img--2 { background: linear-gradient(135deg, #c4d4d8, #a0bbbf); }
.ig-card__img--3 { background: linear-gradient(135deg, #d8cfc8, #c4b8b0); }
.ig-card__img--4 { background: linear-gradient(135deg, #b8c8c4, #94aaa5); }
.ig-card__img--5 { background: linear-gradient(135deg, #d4c4b0, #c0a890); }
.ig-card__img--6 { background: linear-gradient(135deg, #c8d0c0, #b0baa4); }
</style>
