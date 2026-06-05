document.addEventListener('DOMContentLoaded', async () => {
  await initAuth0()

  // Si ya está logueado mándalo al dashboard
  if (await isAuthenticated()) {
    window.location.href = '/pages/dashboard.html'
    return
  }

  document.getElementById('btn-login').addEventListener('click', login)
})