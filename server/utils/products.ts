export interface ServerProduct {
  id: number
  title: string
  price: number
}

export const SERVER_PRODUCTS: ServerProduct[] = [
  { id: 0, title: 'Registro de estado corporal',    price: 10000 },
  { id: 1, title: 'Práctica de regulación - 5 min', price: 5000  },
  { id: 2, title: 'Kit Primeros pasos',              price: 35000 },
  { id: 3, title: 'Mapa de señales del cuerpo',      price: 15000 },
]
