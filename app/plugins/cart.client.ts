import { useCart } from '~/composables/useCart'

export default defineNuxtPlugin(() => {
  const { load } = useCart()
  load()
})
