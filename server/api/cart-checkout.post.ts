import { getRedis } from '../utils/redis'
import { SERVER_PRODUCTS } from '../utils/products'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const { items, user_id } = body

  if (!Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'El carrito está vacío.' })
  }

  if (items.length > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Demasiados ítems en el carrito.' })
  }

  let total = 0
  const lineItems: string[] = []

  for (const item of items) {
    const id  = Number(item?.id)
    const qty = Number(item?.qty)

    if (!Number.isInteger(id) || id < 0) {
      throw createError({ statusCode: 400, statusMessage: 'ID de producto inválido.' })
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      throw createError({ statusCode: 400, statusMessage: 'Cantidad inválida (1–10).' })
    }

    const product = SERVER_PRODUCTS.find(p => p.id === id)
    if (!product) {
      throw createError({ statusCode: 400, statusMessage: `Producto no encontrado: ${id}` })
    }

    total += product.price * qty
    lineItems.push(qty > 1 ? `${product.title} x${qty}` : product.title)
  }

  const product_name = lineItems.join(' · ')

  try {
    const data = await $fetch<{ id: string; redirect_url: string; status: string }>(
      'https://api.fintoc.com/v2/checkout_sessions',
      {
        method:  'POST',
        headers: {
          Authorization:  config.fintocSecretKey as string,
          'Content-Type': 'application/json',
        },
        body: {
          amount:      total,
          currency:    'clp',
          success_url: config.fintocSuccessUrl,
          cancel_url:  config.fintocCancelUrl,
          product_name,
        },
      }
    )

    if (user_id && typeof user_id === 'string' && user_id.length < 128) {
      await getRedis().set(`fintoc:user:${data.id}`, user_id, 'EX', 86400)
    }

    return {
      session_id:   data.id,
      redirect_url: data.redirect_url,
      status:       data.status,
      product_name,
      total,
    }
  } catch (err: unknown) {
    const e = err as { statusCode?: number; data?: unknown; message?: string }
    throw createError({
      statusCode:    e.statusCode || 500,
      statusMessage: 'No se pudo crear la sesión de pago.',
      data:          e.data || e.message,
    })
  }
})
