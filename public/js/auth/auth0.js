let auth0Client = null

async function initAuth0() {
  auth0Client = await auth0.createAuth0Client({
    domain:   'TU_DOMAIN.us.auth0.com',
    clientId: 'TU_CLIENT_ID',
    authorizationParams: {
      redirect_uri: 'http://localhost:3000/pages/dashboard.html',
      audience:     'https://retroblog-api',
    }
  })

  // Si Auth0 redirigió de vuelta con código, procesarlo
  const query = window.location.search
  if (query.includes('code=') && query.includes('state=')) {
    await auth0Client.handleRedirectCallback()
    window.history.replaceState({}, document.title, window.location.pathname)

    // Sincronizar usuario con nuestra base de datos
    const token = await auth0Client.getTokenSilently()
    await fetch('/api/auth/sync', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    window.location.href = '/pages/dashboard.html'
  }

  return auth0Client
}

async function login() {
  await auth0Client.loginWithRedirect()
}

async function register() {
  await auth0Client.loginWithRedirect({
    authorizationParams: { screen_hint: 'signup' }
  })
}

async function logout() {
  await auth0Client.logout({
    logoutParams: { returnTo: 'http://localhost:3000/index.html' }
  })
}

async function getToken() {
  return await auth0Client.getTokenSilently()
}

async function isAuthenticated() {
  return await auth0Client.isAuthenticated()
}