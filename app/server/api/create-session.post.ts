export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody(event)

  const { amount, currency = 'clp', product_name } = body

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "El campo 'amount' es obligatorio y debe ser un número positivo.",
    })
  }

  const payload: Record<string, unknown> = {
    amount:      Math.round(Number(amount)),
    currency:    (currency as string).toLowerCase(),
    success_url: config.fintocSuccessUrl,
    cancel_url:  config.fintocCancelUrl,
  }

  if (product_name) payload.product_name = product_name

  try {
    const data = await $fetch<{ id: string; redirect_url: string; status: string }>(
      'https://api.fintoc.com/v2/checkout_sessions',
      {
        method:  'POST',
        headers: {
          Authorization:  config.fintocSecretKey as string,
          'Content-Type': 'application/json',
        },
        body: payload,
      }
    )

    return {
      session_id:   data.id,
      redirect_url: data.redirect_url,
      status:       data.status,
    }
  } catch (err: unknown) {
    const e = err as { statusCode?: number; data?: unknown; message?: string }
    throw createError({
      statusCode: e.statusCode || 500,
      statusMessage: 'No se pudo crear la sesion de pago.',
      data: e.data || e.message,
    })
  }
})
