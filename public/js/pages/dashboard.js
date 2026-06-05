let blogs = []

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth()

  // Mostrar email del usuario
  const user = await auth0Client.getUser()
  document.getElementById('user-email').textContent = user.email

  // Logout
  document.getElementById('btn-logout').addEventListener('click', logout)

  // Abrir modal
  document.getElementById('btn-new-blog').addEventListener('click', () => {
    document.getElementById('modal-new-blog').classList.remove('hidden')
  })

  // Cerrar modal
  document.getElementById('btn-cancel').addEventListener('click', () => {
    document.getElementById('modal-new-blog').classList.add('hidden')
    document.getElementById('input-title').value = ''
    document.getElementById('input-desc').value  = ''
  })

  // Crear blog
  document.getElementById('btn-create').addEventListener('click', crearBlog)

  await cargarBlogs()
})

async function cargarBlogs() {
  try {
    const token = await getToken()
    const res   = await fetch('/api/blogs', {
      headers: { Authorization: `Bearer ${token}` }
    })
    blogs = await res.json()
    renderBlogs()
  } catch (err) {
    console.error('Error cargando blogs:', err)
    document.getElementById('blogs-grid').innerHTML =
      '<p class="loading-text">Error al cargar blogs</p>'
  }
}

function renderBlogs() {
  const grid = document.getElementById('blogs-grid')

  if (!blogs.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <p>Aún no tienes blogs. ¡Crea el primero!</p>
      </div>`
    return
  }

  grid.innerHTML = blogs.map(blog => `
    <div class="blog-card">
      <h3 class="blog-card-title">${blog.title}</h3>
      <p class="blog-card-desc">${blog.description || 'Sin descripción'}</p>
      <div class="blog-card-footer">
        <span class="status-badge status-${blog.status}">
          ${blog.status === 'published' ? 'Publicado' : 'Borrador'}
        </span>
        <div class="card-actions">
          <button class="btn btn-outline btn-sm"
            onclick="window.location.href='/pages/editor.html?blogId=${blog.id}'">
            Editar
          </button>
          <button class="btn btn-sm"
            style="background:rgba(255,45,120,0.15);color:var(--primary);border:1px solid var(--primary)"
            onclick="eliminarBlog('${blog.id}')">
            Borrar
          </button>
        </div>
      </div>
    </div>
  `).join('')
}

async function crearBlog() {
  const title = document.getElementById('input-title').value.trim()
  const desc  = document.getElementById('input-desc').value.trim()

  if (!title) {
    alert('El título es obligatorio')
    return
  }

  try {
    document.getElementById('btn-create').textContent = 'Creando...'
    document.getElementById('btn-create').disabled    = true

    const token = await getToken()
    const res   = await fetch('/api/blogs', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${token}`
      },
      body: JSON.stringify({ title, description: desc })
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Error al crear blog')
      return
    }

    const blog = await res.json()
    document.getElementById('modal-new-blog').classList.add('hidden')
    document.getElementById('input-title').value = ''
    document.getElementById('input-desc').value  = ''

    // Ir directo al editor del nuevo blog
    window.location.href = `/pages/editor.html?blogId=${blog.id}`

  } catch (err) {
    console.error('Error:', err)
    alert('Error al crear blog')
  } finally {
    document.getElementById('btn-create').textContent = 'Crear'
    document.getElementById('btn-create').disabled    = false
  }
}

async function eliminarBlog(id) {
  if (!confirm('¿Seguro que quieres eliminar este blog?')) return

  try {
    const token = await getToken()
    const res   = await fetch(`/api/blogs/${id}`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Error al eliminar')
      return
    }

    await cargarBlogs()
  } catch (err) {
    console.error('Error:', err)
  }
}