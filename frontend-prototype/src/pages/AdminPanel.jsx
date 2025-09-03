import React, { useEffect, useState } from 'react'
import { getToken } from '../api'

export default function AdminPanel(){
  const [user, setUser] = useState(null)
  useEffect(()=>{
    const token = getToken()
    if(token){
      try{
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      }catch(e){ setUser(null) }
    }
  },[])
  if(!user || user.role !== 'admin'){
    window.location.href = '/'
    return null
  }
  return (
    <div>
      <h3>Panel de administración de usuarios</h3>
      <div className="card">
        <p>Gestión de usuarios: crear, modificar, eliminar y asignar permisos</p>
        <button>Crear usuario</button>
        <button style={{marginLeft:8}}>Gestionar permisos</button>
      </div>
    </div>
  )
}
