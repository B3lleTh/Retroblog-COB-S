document.addEventListener('DOMContentLoaded', async () => {
  await initAuth0()

  if (await isAuthenticated()) {
    window.location.href = '/pages/dashboard.html'
    return
  }

  document.getElementById('btn-register').addEventListener('click', register)
})