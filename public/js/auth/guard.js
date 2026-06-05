async function requireAuth() {
  const client = await initAuth0()
  const authenticated = await client.isAuthenticated()
  if (!authenticated) {
    window.location.href = '/pages/login.html'
  }
  return client
}