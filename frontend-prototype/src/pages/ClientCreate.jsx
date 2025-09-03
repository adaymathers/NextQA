
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Paper, Typography, TextField, Button, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


// Componente para gestionar clientes
export default function Clientes() {
  // Estado para la lista de clientes
  const [clientes, setClientes] = useState([]);
  // Estado para la lista de proyectos
  const [proyectos, setProyectos] = useState([]);
  // Estado para el nombre del nuevo cliente
  const [nombreCliente, setNombreCliente] = useState('');

  // Cargar clientes y proyectos al montar el componente
  useEffect(() => {
    api.getClients().then(setClientes).catch(() => {});
    api.getProjects().then(setProyectos).catch(() => {});
  }, []);

  // Función para crear un nuevo cliente
  async function crearCliente() {
    if (!nombreCliente) return;
    const creado = await api.createClient(nombreCliente);
    setClientes((c) => [...c, creado]);
    setNombreCliente('');
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Clientes</Typography>
      <Typography variant="body2" color="text.secondary">Crear nuevo cliente</Typography>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        {/* Campo para el nombre del cliente */}
        <TextField value={nombreCliente} onChange={e => setNombreCliente(e.target.value)} placeholder="Nombre cliente" fullWidth />
        {/* Botón para guardar el cliente */}
        <Button variant="contained" onClick={crearCliente}>Guardar</Button>
      </Box>
      <Typography sx={{ mt: 2 }}>Clientes existentes</Typography>
      <Box>
        {/* Mostrar mensaje si no hay clientes */}
        {clientes.length === 0 && <Typography color="text.secondary">No hay clientes registrados.</Typography>}
        {/* Listar clientes y sus proyectos */}
        {clientes.map(cliente => (
          <Accordion key={cliente.id} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{cliente.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2">Proyectos de este cliente:</Typography>
              <ul>
                {proyectos.filter(p => p.clientId === cliente.id).length === 0 ? (
                  <Typography color="text.secondary" sx={{ ml: 2 }}>No hay proyectos para este cliente.</Typography>
                ) : (
                  proyectos.filter(p => p.clientId === cliente.id).map(p => (
                    <li key={p.id}>{p.name}</li>
                  ))
                )}
              </ul>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Paper>
  );
}
