
import React, { useEffect, useState } from 'react'
import { getTeams, createTeam, updateTeam, deleteTeam } from '../api'
import { Paper, Typography, TextField, Button, Box, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip } from '@mui/material'


// Componente para gestionar equipos
export default function Equipos() {
  // Estado para la lista de equipos
  const [equipos, setEquipos] = useState([])
  // Estado para el nombre del equipo
  const [nombreEquipo, setNombreEquipo] = useState('')
  // Estado para mensajes de error o éxito
  const [mensaje, setMensaje] = useState('')
  // Estado para edición de equipo
  const [editando, setEditando] = useState(null)
  // Estado para correos asociados al equipo
  const [correos, setCorreos] = useState([])
  // Estado para el input de correo
  const [correoInput, setCorreoInput] = useState('')

  // Cargar equipos al montar el componente
  useEffect(() => { cargarEquipos() }, [])
  async function cargarEquipos() {
    try {
      const data = await getTeams()
      setEquipos(data)
    } catch { setMensaje('Error al cargar equipos') }
  }

  // Iniciar edición de equipo
  function iniciarEdicion(equipo) {
    setEditando(equipo.id)
    setNombreEquipo(equipo.name)
    setCorreos(equipo.emails || [])
  }

  // Crear nuevo equipo
  async function crearEquipo() {
    if (!nombreEquipo) return
    try {
      await createTeam(nombreEquipo, correos)
      setNombreEquipo('')
      setCorreos([])
      setMensaje('Equipo creado')
      cargarEquipos()
    } catch (e) { setMensaje(e.message) }
  }

  // Actualizar equipo existente
  async function actualizarEquipo(id) {
    if (!nombreEquipo) return
    try {
      await updateTeam(id, nombreEquipo, correos)
      setEditando(null)
      setNombreEquipo('')
      setCorreos([])
      setMensaje('Equipo actualizado')
      cargarEquipos()
    } catch (e) { setMensaje(e.message) }
  }

  // Eliminar equipo
  async function eliminarEquipo(id) {
    if (!window.confirm('¿Eliminar equipo?')) return
    try {
      await deleteTeam(id)
      setMensaje('Equipo eliminado')
      cargarEquipos()
    } catch (e) { setMensaje(e.message) }
  }

  // Agregar correo al equipo
  function agregarCorreo() {
    if (!correoInput) return
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correoInput)) return setMensaje('Correo inválido')
    if (correos.includes(correoInput)) return setMensaje('Correo ya agregado')
    setCorreos(e => [...e, correoInput])
    setCorreoInput('')
    setMensaje('')
  }

  // Quitar correo del equipo
  function quitarCorreo(correo) {
    setCorreos(e => e.filter(x => x !== correo))
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Equipos</Typography>
      {mensaje && <Typography color="error">{mensaje}</Typography>}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField value={nombreEquipo} onChange={e => setNombreEquipo(e.target.value)} placeholder="Nombre equipo" fullWidth />
        {editando ? (
          <Button variant="contained" onClick={() => actualizarEquipo(editando)}>Guardar</Button>
        ) : (
          <Button variant="contained" onClick={crearEquipo}>Crear</Button>
        )}
        {editando && <Button variant="text" onClick={() => { setEditando(null); setNombreEquipo(''); setCorreos([]) }}>Cancelar</Button>}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField value={correoInput} onChange={e => setCorreoInput(e.target.value)} placeholder="Agregar correo" size="small" />
        <Button variant="outlined" onClick={agregarCorreo}>Agregar correo</Button>
      </Box>
      <Box sx={{ mt: 1, mb: 2 }}>
        {correos.map(correo => (
          <Chip key={correo} label={correo} onDelete={() => quitarCorreo(correo)} sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Equipo</TableCell>
            <TableCell>Correos</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipos.map(equipo => (
            <TableRow key={equipo.id}>
              <TableCell>{equipo.name}</TableCell>
              <TableCell>{(equipo.emails || []).map(correo => <Chip key={correo} label={correo} sx={{ mr: 0.5, mb: 0.5 }} />)}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => iniciarEdicion(equipo)}>Editar</Button>
                <Button size="small" color="error" onClick={() => eliminarEquipo(equipo.id)}>Eliminar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
