import React from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material'

export default function ManagerPanel(){
  return (
    <div>
      <Typography variant="h5">Panel Gerencial / Administrativo</Typography>
      <Box sx={{mt:2}}>
        <Typography variant="body2" color="text.secondary">Resumen de procesos activos, KPIs y alertas críticas.</Typography>
        <Grid container spacing={2} sx={{mt:1}}>
          <Grid item xs={12} md={6}><Paper sx={{p:2}}>Gráfica de control estadístico (mock)</Paper></Grid>
          <Grid item xs={12} md={6}><Paper sx={{p:2}}>Cantidad de defectos (mock)</Paper></Grid>
          <Grid item xs={12} md={6}><Paper sx={{p:2}}>Alertas críticas (mock)</Paper></Grid>
          <Grid item xs={12} md={6}><Paper sx={{p:2}}>Reportes históricos (mock)</Paper></Grid>
        </Grid>
      </Box>
    </div>
  )
}
