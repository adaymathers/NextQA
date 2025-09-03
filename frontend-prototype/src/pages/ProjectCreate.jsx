import React, { useEffect, useState } from 'react';
import api from '../api';


// Componente para gestionar proyectos
export default function CrearProyecto() {
  // Estado para la lista de clientes
  const [clientes, setClientes] = useState([]);
  // Estado para la lista de proyectos
  const [proyectos, setProyectos] = useState([]);
  // Estado para el cliente seleccionado
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  // Estado para el nombre del nuevo proyecto
  const [nombreProyecto, setNombreProyecto] = useState('');

  // Cargar clientes y proyectos al montar el componente
  useEffect(() => {
    api.getClients().then(setClientes).catch(() => {});
    api.getProjects().then(setProyectos).catch(() => {});
  }, []);

  // Función para crear un nuevo proyecto
  async function crearProyecto() {
    if (!clienteSeleccionado || !nombreProyecto) return;
    const creado = await api.createProject(clienteSeleccionado, nombreProyecto).catch(() => null);
    if (creado) {
      setProyectos(p => [...p, creado]);
      setNombreProyecto('');
    }
  }

  return (
    <div>
      <h3>Alta de Proyecto</h3>
      <div className="card">
        <p>Vincular proyecto a cliente</p>
        {/* Selector de cliente */}
        <select value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)}>
          <option value="">Selecciona cliente</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {/* Campo para el nombre del proyecto */}
        <input placeholder="Nombre proyecto" style={{ marginLeft: 8 }} value={nombreProyecto} onChange={e => setNombreProyecto(e.target.value)} />
        {/* Botón para crear el proyecto */}
        <button style={{ marginLeft: 8 }} onClick={crearProyecto}>Crear</button>
        <h4 style={{ marginTop: 12 }}>Proyectos</h4>
        {/* Listar proyectos y su cliente asociado */}
        <ul>{proyectos.map(p => <li key={p.id}>{p.name} (cliente {clientes.find(c => c.id === p.clientId)?.name || p.clientId})</li>)}</ul>
      </div>
    </div>
  );
}
