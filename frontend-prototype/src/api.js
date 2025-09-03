export const deleteInspection = (id) => request(`/inspections/${id}`, { method: 'DELETE' });
// Equipos
export const getTeams = () => request('/teams')
export const createTeam = (name, emails=[]) => request('/teams', { method: 'POST', body: JSON.stringify({ name, emails }) })
export const updateTeam = (id, name, emails=[]) => request(`/teams/${id}`, { method: 'PUT', body: JSON.stringify({ name, emails }) })
export const deleteTeam = (id) => request(`/teams/${id}`, { method: 'DELETE' })
// Gestión de usuarios
export const getUsers = () => request('/users');
export const updateUser = (id, data) => request(`/users/${id}`, { method:'PUT', body: JSON.stringify(data) });
export const deleteUser = (id) => request(`/users/${id}`, { method:'DELETE' });
// Crear usuario (admin)
export const createUser = (email, password, role) => request('/users', { method:'POST', body: JSON.stringify({ email, password, role }) });
// Use Vite env var (VITE_API_URL) in the browser; fallback to local backend at 4000
export const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function getToken(){ return localStorage.getItem('qa_token') }

async function request(path, opts){
  const headers = { 'Content-Type':'application/json' }
  const token = getToken()
  if(token) headers['Authorization'] = `Bearer ${token}`
  let body = opts && opts.body
  if(body && typeof body !== 'string') body = JSON.stringify(body)
  // Log detallado para depuración
  console.log('[API] Preparando petición:', {
    url: `${BASE}${path}`,
    método: opts && opts.method,
    headers,
    body,
    token_actual: token,
    mensaje: token ? 'El token se está enviando correctamente en el header Authorization.' : 'No hay token en localStorage, la petición será anónima.'
  })
  try {
    const res = await fetch(`${BASE}${path}`, { ...opts, headers, body })
    const text = await res.text()
    if(!res.ok) {
      let errMsg = text
      try { errMsg = JSON.parse(text).error || text } catch {}
      console.error('[API] Error en la respuesta:', {
        status: res.status,
        url: `${BASE}${path}`,
        token_enviado: token,
        mensaje: 'La respuesta del backend no fue exitosa. Revisa el status y el mensaje de error.'
      })
      throw new Error(`API ${res.status}: ${errMsg}`)
    }
    console.log('[API] Respuesta exitosa:', {
      url: `${BASE}${path}`,
      status: res.status,
      token_enviado: token,
      mensaje: 'La petición se realizó correctamente y el token no fue modificado.'
    })
    try { return JSON.parse(text) } catch { return text }
  } catch (err) {
    console.error('[API] Error de red o petición:', {
      error: err.message,
      url: `${BASE}${path}`,
      token_enviado: token,
      mensaje: 'Ocurrió un error de red o de la API. El token NO se borra ni modifica en este flujo.'
    })
    throw new Error(`Network/API error: ${err.message}`)
  }
}



export const getClients = ()=> request('/clients')
export const createClient = (name)=> request('/clients', { method:'POST', body: JSON.stringify({ name }) })

export const getProjects = ()=> request('/projects')
export const createProject = (clientId, name)=> request('/projects', { method:'POST', body: JSON.stringify({ clientId, name }) })

export const getProducts = ()=> request('/products')
export const createProduct = (projectId, name)=> request('/products', { method:'POST', body: JSON.stringify({ projectId, name }) })
export const deleteProduct = (id) => request(`/products/${id}`, { method:'DELETE' })
// Editar producto
export const updateProduct = (id, data) => request(`/products/${id}`, { method:'PUT', body: JSON.stringify(data) })

export const getChecklists = ()=> request('/checklists')
/**
 * Sube una imagen al backend asegurando que el campo dataUrl tenga el prefijo correcto.
 * @param {string} dataUrl - Debe ser 'data:image/png;base64,...' o 'data:image/jpeg;base64,...'
 * @param {string} filename - Nombre personalizado para el archivo.
 * @returns {Promise<Object>} Respuesta del backend con la URL pública.
 */
export const upload = (dataUrl, filename) => {
  // Validar y corregir el prefijo si falta
  if (typeof dataUrl === 'string' && !dataUrl.startsWith('data:image')) {
    // Si solo es base64, agregar prefijo PNG por defecto
    dataUrl = 'data:image/png;base64,' + dataUrl;
  }
  return request('/uploads', { method:'POST', body: JSON.stringify({ dataUrl, filename }) })
}
export const createChecklist = async (productId, items, imageData, nombrePlano, imageUrl)=>{
  imageUrl = typeof imageUrl !== 'undefined' ? imageUrl : null;
  let urlPlano = imageUrl;
  if(imageData){
    // Usar nombre personalizado si se proporciona
    const nombreArchivo = nombrePlano ? nombrePlano : `checklist_${Date.now()}`;
    const up = await upload(imageData, nombreArchivo).catch(()=> null);
    if(up && up.url) urlPlano = up.url;
  }
  return request('/checklists', { method:'POST', body: JSON.stringify({ productId, items, imageUrl: urlPlano }) });
}
export const getChecklist = (id)=> request(`/checklists/${id}`)
export const getChecklistPdfUrl = (id)=> `${BASE}/checklists/${id}/pdf`
export const createInspection = (checklistId, inspector, results, lineId, projectId, productId)=> request('/inspections', { method:'POST', body: JSON.stringify({ checklistId, inspector, results, lineId, projectId, productId }) })
export const getInspections = ()=> request('/inspections')
export const getInspection = (id)=> request(`/inspections/${id}`)

// Auth helpers
export const login = (email, password)=> request('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) })
export const register = (email, password, name, role)=> request('/auth/register', { method:'POST', body: JSON.stringify({ email, password, name, role }) })

// Guardar y borrar token solo en login/logout manual
export function saveToken(token){
  console.log('[API] Guardando token en localStorage:', token)
  localStorage.setItem('qa_token', token)
}
export function clearToken(){
  console.log('[API] Borrando token de localStorage por logout manual.')
  localStorage.removeItem('qa_token')
}


export const getLines = ()=> request('/lines')
export const createLine = (name, image, description)=> request('/lines', { method:'POST', body: JSON.stringify({ name, image, description }) })
export const updateLine = (id, name, image, description)=> request(`/lines/${id}`, { method:'PUT', body: JSON.stringify({ name, image, description }) })
export const deleteLine = (id)=> request(`/lines/${id}`, { method:'DELETE' })
// Obtener checklists por producto
export const getChecklistsByProduct = (productId) => request(`/checklists?productId=${productId}`);
// Regenerar PDF de checklist
export const regenerarChecklistPDF = (checklistId) => request(`/checklists/${checklistId}/regenerar-pdf`, { method: 'POST' });

export default { getClients, createClient, getProjects, createProject, getProducts, createProduct, getChecklists, createChecklist, getChecklist, getChecklistPdfUrl, createInspection, getInspections, getInspection, getLines, createLine, updateLine, deleteLine, upload, getChecklistsByProduct, deleteInspection }
