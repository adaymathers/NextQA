
import React, { useState, useEffect } from 'react';
import api from '../api';


// Componente para gestionar líneas de producción
export default function CrearLineaProduccion() {
  // Estado para la lista de líneas
  const [lineas, setLineas] = useState([]);
  // Estado para el nombre de la línea
  const [nombreLinea, setNombreLinea] = useState('');
  // Estado para la descripción de la línea
  const [descripcion, setDescripcion] = useState('');
  // Estado para el archivo de imagen
  const [archivoImagen, setArchivoImagen] = useState(null);
  // Estado para los datos de la imagen en base64
  const [datosImagen, setDatosImagen] = useState('');
  // Estado para edición de línea
  const [editandoId, setEditandoId] = useState(null);
  // Estado para mensajes de error o éxito
  const [mensaje, setMensaje] = useState('');

  // Cargar líneas al montar el componente
  useEffect(() => {
    api.getLines().then(setLineas).catch(() => {});
  }, []);

  // Manejar la carga de imagen
  function manejarCargaImagen(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setArchivoImagen(archivo);
    const lector = new FileReader();
    lector.onload = () => setDatosImagen(lector.result);
    lector.readAsDataURL(archivo);
  }

  // Crear o actualizar línea
  async function guardarLinea() {
    setMensaje('');
    if (!nombreLinea) {
      setMensaje('El nombre de la línea es obligatorio');
      return;
    }
    let urlImagen = '';
    if (datosImagen) {
      try {
        const up = await api.upload(datosImagen, `linea_${Date.now()}`);
        urlImagen = up.url;
      } catch (e) {
        setMensaje('Error al subir la imagen: ' + e.message);
        return;
      }
    }
    if (editandoId) {
      // Buscar la línea actual para obtener la imagen existente
      const lineaActual = lineas.find(l => l.id === editandoId);
      // Si no se sube nueva imagen, usar la actual
      if (!urlImagen && lineaActual && lineaActual.image) {
        urlImagen = lineaActual.image;
      }
      try {
        // Actualizar línea existente
        const actualizada = await api.updateLine(editandoId, nombreLinea, urlImagen, descripcion);
        if (actualizada) {
          // Refrescar la lista desde el backend para evitar inconsistencias
          const nuevasLineas = await api.getLines().catch(() => []);
          setLineas(nuevasLineas);
          setEditandoId(null);
          setNombreLinea('');
          setDescripcion('');
          setArchivoImagen(null);
          setDatosImagen('');
          setMensaje('Línea actualizada correctamente');
        } else {
          setMensaje('No se pudo actualizar la línea.');
        }
      } catch (e) {
        setMensaje('Error al actualizar la línea: ' + e.message);
      }
    } else {
      // Crear nueva línea
      try {
        const creada = await api.createLine(nombreLinea, urlImagen, descripcion);
        if (creada) {
          setLineas(l => [...l, creada]);
          setNombreLinea('');
          setDescripcion('');
          setArchivoImagen(null);
          setDatosImagen('');
          setMensaje('Línea creada correctamente');
        } else {
          setMensaje('No se pudo crear la línea.');
        }
      } catch (e) {
        setMensaje('Error al crear la línea: ' + e.message);
      }
    }
  }

  // Iniciar edición de línea
  function editarLinea(linea) {
    setEditandoId(linea.id);
    setNombreLinea(linea.name);
    setDescripcion(linea.description || '');
    setArchivoImagen(null);
    setDatosImagen('');
  }

  // Cancelar edición
  function cancelarEdicion() {
    setEditandoId(null);
    setNombreLinea('');
    setDescripcion('');
    setArchivoImagen(null);
    setDatosImagen('');
  }

  // Eliminar línea
  async function eliminarLinea(id) {
    if (!window.confirm('¿Eliminar línea?')) return;
    const eliminada = await api.deleteLine(id).catch(() => null);
    if (eliminada) {
      setLineas(ls => ls.filter(l => l.id !== id));
      cancelarEdicion();
      alert('Línea eliminada');
    }
  }

  return (
    <div>
      <h3>Alta de Línea de Producción / Proceso</h3>
      <div className="card">
        {/* Campo para el nombre de la línea */}
        <input
          placeholder="Nombre línea / proceso"
          value={nombreLinea}
          onChange={e => setNombreLinea(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        {/* Campo para cargar imagen */}
        <input
          type="file"
          accept="image/*"
          onChange={manejarCargaImagen}
          style={{ marginBottom: 8 }}
        />
        {/* Campo para la descripción */}
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          style={{ marginBottom: 8, width: '100%' }}
        />
  {/* Botón para crear o actualizar línea */}
  <button style={{ marginLeft: 8 }} onClick={guardarLinea}>{editandoId ? 'Guardar cambios' : 'Crear'}</button>
  {editandoId && <button style={{ marginLeft: 8 }} onClick={cancelarEdicion}>Cancelar</button>}
  {mensaje && <div style={{ color: mensaje.includes('Error') ? 'red' : 'green', marginBottom: 8 }}>{mensaje}</div>}
  <h4 style={{ marginTop: 12 }}>Líneas</h4>
        {/* Listar líneas creadas con acciones de editar y eliminar */}
        <ul>
          {lineas.map(linea => (
            <li key={linea.id}>
              <strong>{linea.name}</strong><br />
              {linea.image && <img src={`http://localhost:5000${linea.image}`} alt={linea.name} style={{ maxWidth: 120, maxHeight: 80 }} />}<br />
              {linea.description && <span>{linea.description}</span>}<br />
              <button style={{ marginRight: 8 }} onClick={() => editarLinea(linea)}>Editar</button>
              <button style={{ color: 'red' }} onClick={() => eliminarLinea(linea.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
