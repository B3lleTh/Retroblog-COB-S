Quill.register({
  'modules/htmlEditButton': htmlEditButton.default || htmlEditButton
});

const quill = new Quill('#quill-editor', {
  theme: 'snow',
  placeholder: 'Escribe el contenido de tu publicación aquí...',
  modules: {
    htmlEditButton: {
      msg: "Editar código HTML",
      okText: "Guardar",
      cancelText: "Cancelar"
    },
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean', 'htmlEditButton']
    ]
  }
});

// contador de caracteres
quill.on('text-change', () => {
  const len = quill.getText().trim().length;
  document.getElementById('char-count').textContent = len + ' caracteres';
});

// validación y publicar
document.getElementById('btn-publish').addEventListener('click', () => {
  const tituloInput = document.getElementById('titulo');
  const titulo = tituloInput.value.trim();

  if (!titulo) {
    tituloInput.focus();
    tituloInput.classList.add('input-error');
    setTimeout(() => tituloInput.classList.remove('input-error'), 1500);
    return;
  }

  const blogContent = {
    titulo,
    contenido_html: quill.root.innerHTML,
    slug: titulo
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, ''),
    creado_en: new Date().toISOString()
  };

  // TODO: conectar con POST /api/blogs
  console.log(blogContent);
});

// portada
document.getElementById('cover-dropzone').addEventListener('click', () => {
  // TODO: abrir selector de Unsplash
  console.log('abrir selector de Unsplash');
});