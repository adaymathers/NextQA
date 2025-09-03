
import React, { useEffect, useState } from 'react';
import api, { getUsers, getChecklists } from '../api';
import { Paper, Typography, List, ListItem, ListItemText, Button, TextField, MenuItem, Grid, Box } from '@mui/material';

export default function Inspections() {
  // Helper para obtener el número de punto desde el checklist
  function getPointNumber(detail, r, idx) {
    if (detail && detail.checklist && Array.isArray(detail.checklist.items)) {
      const item = detail.checklist.items.find(it => it.id === r.checklistItemId);
      if (item && item.num !== undefined) return item.num;
    }
    return idx + 1;
  }
  // Eliminar inspección
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta inspección?')) return;
    try {
      await api.deleteInspection(id);
      setItems(items => items.filter(i => i.id !== id));
      setDetail(null);
    } catch (e) {
      alert('Error al eliminar inspección: ' + e.message);
    }
  };
  const [items, setItems] = useState([]);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    line: '',
    inspector: '',
    project: '',
    product: ''
  });
  const [lines, setLines] = useState([]);
  const [projects, setProjects] = useState([]);
  const [products, setProducts] = useState([]);
  const [inspectors, setInspectors] = useState([]);

  useEffect(() => {
    // Cargar inspecciones y datos relacionados
    Promise.all([
      api.getInspections(),
      api.getLines(),
      api.getProjects(),
      api.getProducts(),
      getUsers(),
      getChecklists()
    ]).then(([inspections, linesData, projectsData, productsData, usersData, checklistsData]) => {
      // Unificar mapeo de usuarios por id y email
      const userMapUnified = usersData.reduce((acc, u) => {
        acc[u.id] = u.name || u.email;
        acc[u.email] = u.name || u.email;
        return acc;
      }, {});
      setUserMap(userMapUnified);
      // Mapear checklists por id
      const checklistMap = checklistsData.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
      // Enriquecer inspecciones
      const enriched = inspections.map(i => {
        const line = linesData.find(l => l.id === i.lineId);
        const project = projectsData.find(pj => pj.id === i.projectId);
        const product = productsData.find(p => p.id === i.productId);
        let inspectorName = '';
        if (i.inspectorId && userMapUnified[i.inspectorId]) {
          inspectorName = userMapUnified[i.inspectorId];
        } else if (i.inspector && userMapUnified[i.inspector]) {
          inspectorName = userMapUnified[i.inspector];
        } else if (i.userEmail && userMapUnified[i.userEmail]) {
          inspectorName = userMapUnified[i.userEmail];
        } else {
          inspectorName = i.inspector || i.userEmail || '';
        }
        return {
          ...i,
          inspectorName,
          lineName: line?.name || '',
          projectName: project?.name || '',
          productName: product?.name || '',
        };
      });
      setItems(enriched);
      setLines(linesData);
      setProjects(projectsData);
      setProducts(productsData);
      setInspectors([...new Set(enriched.map(i => i.inspectorName).filter(Boolean))]);
    }).catch(() => {});
  }, []);
  // Mapeo de usuarios para mostrar nombre
  const [userMap, setUserMap] = useState({});

  const load = async (id) => {
    try {
      const json = await api.getInspection(id);
      // Enriquecer con nombre de inspector si es posible
      let inspectorName = '';
      if (json.inspectorId && userMap[json.inspectorId]) {
        inspectorName = userMap[json.inspectorId];
      } else if (json.inspector && userMap[json.inspector]) {
        inspectorName = userMap[json.inspector];
      } else if (json.userEmail && userMap[json.userEmail]) {
        inspectorName = userMap[json.userEmail];
      } else {
        inspectorName = json.inspector || json.userEmail || '';
      }
      setDetail({ ...json, inspectorName });
    } catch (e) {
      setDetail({ error: 'No se pudo cargar' });
    }
  };

  // Filtro avanzado
  const filteredItems = items.filter(i => {
    const dateMatch = !filters.date || (i.createdAt && i.createdAt.startsWith(filters.date));
    const lineMatch = !filters.line || i.lineId === filters.line;
    const inspectorMatch = !filters.inspector || (i.inspector || i.userEmail) === filters.inspector;
    const projectMatch = !filters.project || i.projectId === filters.project;
    const productMatch = !filters.product || i.productId === filters.product;
    return dateMatch && lineMatch && inspectorMatch && projectMatch && productMatch;
  });

  // El resumen ahora viene del backend como resultSummary

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Inspecciones</Typography>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {/* ...filtros igual que antes... */}
          <Grid item xs={12} sm={2}>
            <TextField
              label="Fecha"
              type="date"
              value={filters.date}
              onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Línea"
              select
              value={filters.line}
              onChange={e => setFilters(f => ({ ...f, line: e.target.value }))}
              fullWidth
            >
              <MenuItem value="">Todas</MenuItem>
              {lines.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Inspector"
              select
              value={filters.inspector}
              onChange={e => setFilters(f => ({ ...f, inspector: e.target.value }))}
              fullWidth
            >
              <MenuItem value="">Todos</MenuItem>
              {inspectors.map(i => <MenuItem key={i} value={i}>{userMap[i] || i}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Proyecto"
              select
              value={filters.project}
              onChange={e => setFilters(f => ({ ...f, project: e.target.value }))}
              fullWidth
            >
              <MenuItem value="">Todos</MenuItem>
              {projects.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Producto"
              select
              value={filters.product}
              onChange={e => setFilters(f => ({ ...f, product: e.target.value }))}
              fullWidth
            >
              <MenuItem value="">Todos</MenuItem>
              {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Box>
      <List>
        {filteredItems.map(i => {
          const fechaHora = i.createdAt ? i.createdAt.replace('T', ' ').slice(0, 19) : '';
          const title = `${fechaHora} → ${i.lineName} → ${i.projectName} → ${i.productName}`;
          return (
            <ListItem key={i.id} secondaryAction={
              <>
                <Button onClick={() => load(i.id)} sx={{mr:1}}>Ver</Button>
                <Button color="error" onClick={() => handleDelete(i.id)}>Eliminar</Button>
              </>
            }>
              <ListItemText
                primary={title}
                secondary={`Inspector: ${i.inspectorName} | ${i.resultSummary || ''}`}
              />
            </ListItem>
          );
        })}
      </List>
      {detail && !detail.error && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle1">Detalle de Inspección</Typography>
          <Typography variant="body2"><b>Inspector:</b> {detail.inspectorName || ''}</Typography>
          <Typography variant="body2"><b>Fecha:</b> {detail.createdAt ? detail.createdAt.replace('T', ' ').slice(0, 19) : ''}</Typography>
          <Typography variant="body2"><b>Línea:</b> {detail.lineName || ''}</Typography>
          <Typography variant="body2"><b>Proyecto:</b> {detail.projectName || ''}</Typography>
          <Typography variant="body2"><b>Producto:</b> {detail.productName || ''}</Typography>
          <Typography variant="body2"><b>Checklist:</b> {detail.checklistName || detail.checklistId || ''}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}><b>Resumen:</b> {detail.resultSummary || ''}</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2"><b>Puntos de Inspección:</b></Typography>
            <List>
              {Array.isArray(detail.results) && detail.results.map((r, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={`Punto: ${getPointNumber(detail, r, idx)}`}
                    secondary={
                      <>
                        <span><b>Resultado:</b> {r.status}</span>{' | '}
                        {r.valorReal !== undefined && <span><b>Valor Real:</b> {r.valorReal}{' | '}</span>}
                        {r.diferencia !== undefined && <span><b>Diferencia:</b> {r.diferencia}{' | '}</span>}
                        {r.severityObserved && <span><b>Gravedad:</b> {r.severityObserved}{' | '}</span>}
                        <span><b>Comentarios:</b> {r.comment || ''}</span>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      )}
      {detail && detail.error && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography color="error">{detail.error}</Typography>
        </Paper>
      )}
    </Paper>
  );
}
