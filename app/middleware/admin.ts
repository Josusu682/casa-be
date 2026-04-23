export default defineNuxtRouteMiddleware(() => {
  const { user, isAdmin } = useAuth()
  if (!user.value) return navigateTo('/login')
  if (!isAdmin.value) return navigateTo('/')
})
