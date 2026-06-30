/**
 * auth.js — Helpers compartidos de sesión para todas las páginas del frontend.
 * Carga este script en cualquier página que necesite saber si hay sesión activa.
 *
 * USO:
 *   <script src="auth.js"></script>
 *
 * EXPONE en window.Auth:
 *   Auth.getSession()           → { accessToken, refreshToken, user } | null
 *   Auth.saveSession(data)      → void
 *   Auth.clearSession()         → void
 *   Auth.isLoggedIn()           → boolean
 *   Auth.requireAuth()          → redirige a login.html si no hay sesión
 *   Auth.requireGuest()         → redirige a dashboard.html si ya hay sesión
 *   Auth.logout()               → llama /auth/logout y limpia sesión
 *   Auth.refreshIfNeeded()      → renueva el access token si está por vencer
 *   Auth.fetchWithAuth(url, opts) → fetch con header Authorization automático
 */

const API = 'http://localhost:3000'

window.Auth = (function () {

  // ── Sesión ──────────────────────────────────────────────────────────────────

  function saveSession(data) {
    sessionStorage.setItem('bp_session', JSON.stringify({
      accessToken:  data.accessToken,
      refreshToken: data.refreshToken,
      user:         data.user
    }))
  }

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem('bp_session'))
    } catch {
      return null
    }
  }

  function clearSession() {
    sessionStorage.removeItem('bp_session')
  }

  function isLoggedIn() {
    const s = getSession()
    return !!(s && s.accessToken)
  }

  // ── Guards de navegación ────────────────────────────────────────────────────

  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html'
    }
  }

  function requireGuest() {
    if (isLoggedIn()) {
      window.location.href = 'dashboard.html'
    }
  }

  // ── Logout ──────────────────────────────────────────────────────────────────

  async function logout() {
    const session = getSession()
    try {
      if (session && session.refreshToken) {
        await fetch(API + '/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: session.refreshToken })
        })
      }
    } catch (e) {
      // Silenciar errores de red en logout — igual limpiamos local
    } finally {
      clearSession()
      window.location.href = 'login.html'
    }
  }

  // ── Refresh token ───────────────────────────────────────────────────────────

  async function refreshIfNeeded() {
    const session = getSession()
    if (!session) return false

    try {
      // Decodificar el access token (sin verificar firma, solo leer exp)
      const payload = JSON.parse(atob(session.accessToken.split('.')[1]))
      const expiresIn = payload.exp * 1000 - Date.now()

      // Si quedan menos de 2 minutos, renovar
      if (expiresIn > 2 * 60 * 1000) return true

      const res = await fetch(API + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken })
      })

      if (!res.ok) {
        clearSession()
        window.location.href = 'login.html'
        return false
      }

      const data = await res.json()
      saveSession({
        accessToken:  data.accessToken,
        refreshToken: data.refreshToken,
        user:         session.user
      })
      return true

    } catch {
      return false
    }
  }

  // ── fetch con autenticación automática ─────────────────────────────────────

  async function fetchWithAuth(url, options = {}) {
    await refreshIfNeeded()
    const session = getSession()
    if (!session) {
      window.location.href = 'login.html'
      return
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${session.accessToken}`
    }

    return fetch(url, { ...options, headers })
  }

  return {
    saveSession,
    getSession,
    clearSession,
    isLoggedIn,
    requireAuth,
    requireGuest,
    logout,
    refreshIfNeeded,
    fetchWithAuth
  }

})()