import React, { useEffect, useState } from 'react'
import api from '../api'
import { Paper, Typography, List, ListItem, ListItemText, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material'

export default function Checklists(){
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  useEffect(()=>{
    api.getChecklists().then(setItems).catch(()=>{})
    api.getProjects().then(setProjects).catch(()=>{})
    api.getClients().then(setClients).catch(()=>{})
  },[])

  // Filtrar checklists por cliente y proyecto
  const filteredItems = items.filter(ch => {
    const project = ch.product?.project;
    const clientId = project?.client?.id;
    const projectId = project?.id;
    let ok = true;
    if(selectedClient) ok = ok && clientId === selectedClient;
    if(selectedProject) ok = ok && projectId === selectedProject;
    return ok;
  });

  return (
    <Paper sx={{p:2}}>
      <Typography variant="h6">Checklists</Typography>
      <FormControl sx={{minWidth:180, mr:2}} size="small">
        <InputLabel>Cliente</InputLabel>
        <Select value={selectedClient} label="Cliente" onChange={e=>setSelectedClient(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          {clients.map(c=>(<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
        </Select>
      </FormControl>
      <FormControl sx={{minWidth:180, mr:2}} size="small">
        <InputLabel>Proyecto</InputLabel>
        <Select value={selectedProject} label="Proyecto" onChange={e=>setSelectedProject(e.target.value)}>
          <MenuItem value="">Todos</MenuItem>
          {projects.map(p=>(<MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>))}
        </Select>
      </FormControl>
      <List>
        {filteredItems.map(ch=> (
          <ListItem key={ch.id} secondaryAction={<Button href={api.getChecklistPdfUrl(ch.id)} target="_blank">Abrir PDF</Button>}>
            <ListItemText
              primary={
                <>
                  <span style={{fontWeight:'bold', fontSize:16}}>{ch.product?.name || 'Sin nombre'}</span>
                  <br/>
                  <span style={{color:'#8888', fontSize:12}}>{ch.id}</span>
                </>
              }
              secondary={
                <>
                  {ch.product?.project?.client?.name ? `Cliente: ${ch.product.project.client.name}` : ''}
                  {ch.product?.project?.name ? ` | Proyecto: ${ch.product.project.name}` : ''}
                  {` | ${ch.items.length} puntos`}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}
