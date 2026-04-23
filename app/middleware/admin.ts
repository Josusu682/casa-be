export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return
  const { user, isAdmin } = useAuth()
  if (!user.value) return navigateTo('/login')
  if (!isAdmin.value) return navigateTo('/')
})
