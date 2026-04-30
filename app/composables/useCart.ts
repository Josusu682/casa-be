export interface CartItem {
  id: number
  qty: number
}

export interface DisplayProduct {
  id: number
  image: string
  tag: string
  title: string
  price: string
  amount: number
}

export const PRODUCTS: DisplayProduct[] = [
  {
    id:     0,
    image:  '/images/referencia-producto-1.png',
    tag:    'HERRAMIENTA FÍSICA',
    title:  'Registro de estado corporal',
    price:  '$10.000',
    amount: 10000,
  },
  {
    id:     1,
    image:  '/images/referencia-producto-2.png',
    tag:    'HERRAMIENTA DIGITAL',
    title:  'Práctica de regulación - 5 min',
    price:  '$5.000',
    amount: 5000,
  },
  {
    id:     2,
    image:  '/images/referencia-producto-3.png',
    tag:    'KIT',
    title:  'Kit Primeros pasos',
    price:  '$35.000',
    amount: 35000,
  },
  {
    id:     3,
    image:  '/images/referencia-producto-4.png',
    tag:    'HERRAMIENTA DIGITAL',
    title:  'Mapa de señales del cuerpo',
    price:  '$15.000',
    amount: 15000,
  },
]

const CART_KEY = 'casabe_cart'

export const useCart = () => {
  const items    = useState<CartItem[]>('cart.items', () => [])
  const isOpen   = useState<boolean>('cart.open',  () => false)

  const load = () => {
    if (import.meta.client) {
      try {
        const raw = localStorage.getItem(CART_KEY)
        if (raw) items.value = JSON.parse(raw)
      } catch {}
    }
  }

  const _save = () => {
    if (import.meta.client) {
      localStorage.setItem(CART_KEY, JSON.stringify(items.value))
    }
  }

  const addItem = (id: number) => {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx >= 0) {
      items.value = items.value.map((i, n) => n === idx ? { ...i, qty: i.qty + 1 } : i)
    } else {
      items.value = [...items.value, { id, qty: 1 }]
    }
    _save()
    isOpen.value = true
  }

  const removeItem = (id: number) => {
    items.value = items.value.filter(i => i.id !== id)
    _save()
  }

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) { removeItem(id); return }
    items.value = items.value.map(i => i.id === id ? { ...i, qty } : i)
    _save()
  }

  const clear = () => {
    items.value = []
    _save()
  }

  const totalItems  = computed(() => items.value.reduce((s, i) => s + i.qty, 0))
  const totalAmount = computed(() =>
    items.value.reduce((s, i) => {
      const p = PRODUCTS.find(p => p.id === i.id)
      return s + (p ? p.amount * i.qty : 0)
    }, 0)
  )

  return { items, isOpen, load, addItem, removeItem, updateQty, clear, totalItems, totalAmount }
}
