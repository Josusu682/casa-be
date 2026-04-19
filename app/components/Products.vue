<template>
  <section class="store-grid">
    <div class="store-grid__inner">
      
      <nav class="store-filters">
        <div class="store-filters__item store-filters__item--active">
          <span class="store-filters__name">Para cuando estás al límite</span>
          <p class="store-filters__desc">Activación simpática alta -<br>Herramientas para cuando el cuerpo no para</p>
        </div>
        <div class="store-filters__item">
          <span class="store-filters__name">Para cuando no puedes dormir</span>
        </div>
        <div class="store-filters__item">
          <span class="store-filters__name">Para cuando te irritas por nada</span>
        </div>
        <div class="store-filters__item">
          <span class="store-filters__name">Para el día a día</span>
        </div>
      </nav>

      <div class="product-list">
        <article 
          v-for="(product, index) in products" 
          :key="index" 
          class="product-card"
        >
          <div class="product-card__image-wrapper">
            <img :src="product.image" :alt="product.title" class="product-card__image" />
          </div>

          <div class="product-card__content">
            <span class="product-card__tag">{{ product.tag }}</span>
            
            <h3 class="product-card__title" v-html="product.title"></h3>
            
            <p class="product-card__desc">{{ product.desc }}</p>
          </div>

          <div class="product-card__footer">
            <span class="product-card__price">VALOR: {{ product.price }}</span>
            
            <a :href="product.link" class="product-card__btn">
              <span>Ver más</span>
              <svg width="30" height="12" viewBox="0 0 30 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 1L29 6L24 11" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M29 6L1 6" stroke="currentColor" stroke-width="0.8" stroke-linecap="round"/>
              </svg>
            </a>
          </div>
        </article>
      </div>

    </div>
  </section>
</template>

<script setup>
// Aquí defines los productos. Cambia las rutas de las imágenes por las tuyas.
const products = [
  {
    image: '/images/referencia-producto-1.png', 
    tag: 'HERRAMIENTA FÍSICA',
    title: 'Registro de<br>estado corporal',
    desc: 'Para nombrar lo que sientes antes de que se desborde. Entrena la interocepción en la vida cotidiana.',
    price: '$10.000',
    link: '#' // URL a la que llevará el botón "Ver más"
  },
  {
    image: '/images/referencia-producto-2.png',
    tag: 'HERRAMIENTA DIGITAL',
    title: 'Práctica de<br>regulación - 5 min',
    desc: 'Audio guiado calibrado para usarse cuando el sistema no puede esperar. Para el baño del trabajo, el auto, donde sea.',
    price: '$5.000',
    link: '#'
  },
  {
    image: '/images/referencia-producto-3.png',
    tag: 'KIT',
    title: 'Kit<br>Primeros pasos',
    desc: 'Herramientas físicas y digitales para quien está en déficit profundo y no sabe por dónde empezar.',
    price: '$35.000',
    link: '#'
  },
   {
    image: '/images/referencia-producto-4.png',
    tag: 'HERRAMIENTA DIGITAL',
    title: 'Mapa de señales<br>del cuerpo',
    desc: 'Para aprender a leer las señales físicas antes de que el sistema colapse. Psicoeducación aplicada.',
    price: '$15.000',
    link: '#'
  }
]
</script>

<style scoped>
/* Contenedor principal */
.store-grid {
  background-color: #D4D4D3; /* Color crema suave del fondo */
  padding: 4rem 2rem;
  width: 100%;
}

.store-grid__inner {
  max-width: 1200px;
  margin: 0 auto;
}

/* Filtros superiores */
.store-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 3rem;
  border-bottom: 1px solid rgba(57, 78, 60, 0.1);
  padding-bottom: 2rem;
}

.store-filters__item {
  flex: 1;
  min-width: 200px;
  color: #394e3c;
  cursor: pointer;
  transition: color 0.3s ease;
}

.store-filters__name {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  font-weight: 400;
}

.store-filters__item--active {
  color: #394e3c;
}

.store-filters__item--active .store-filters__name {
  font-weight: 600;
}

.store-filters__desc {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.9rem;
  color: #394e3c;
  margin-top: 0.5rem;
  line-height: 1.4;
}

/* Grilla de Productos */
.product-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem; /* Espacio entre columnas */
}

/* Tarjeta individual */
.product-card {
  display: flex;
  flex-direction: column;
}

.product-card__image-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1; /* Hace que la imagen sea perfectamente cuadrada */
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-card__image {
  transform: scale(1.03); /* Ligero zoom al pasar el mouse */
}

.product-card__tag {
  display: block;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  color: #394e3c;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.product-card__title {
  font-family: 'Acumin', sans-serif; /* Usa la fuente serif que ya tienes en Casa BE */
  font-size: 1.55rem;
  font-weight: 300;
  color: #394e3c;
  line-height: 1;
  margin-bottom: 1.5rem;
}

.product-card__desc {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1.05rem;
  color: #5a665b;
  line-height: 1.5;
  margin-bottom: 2.5rem;
  flex-grow: 1; /* Empuja el footer hacia abajo si el texto es corto */
}

/* Footer (Precio y Botón) */
.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid transparent;
  padding-top: 1rem;
}

.product-card__price {
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: #394e3c;
}

.product-card__btn {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #8c8c8c;
  text-decoration: none;
  font-family: 'Acumin Concept', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  transition: color 0.3s ease;
}

.product-card__btn:hover {
  color: #394e3c; /* Oscurece la letra y la flecha al pasar el mouse */
}

/* Responsivo para celulares y tablets */
@media (max-width: 992px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr); /* 2 columnas en tablet */
  }
}

@media (max-width: 768px) {
  .product-list {
    grid-template-columns: 1fr; /* 1 columna en celular */
  }
  
  .store-filters {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>