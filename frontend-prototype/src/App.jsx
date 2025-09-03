import React, { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Button from '@mui/material/Button';
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'
import UserAdmin from './pages/UserAdmin'
import Teams from './pages/Teams'
import ClientCreate from './pages/ClientCreate'
import ProjectCreate from './pages/ProjectCreate'
import ProductionLineCreate from './pages/ProductionLineCreate'
import ProductCreate from './pages/ProductCreate'
import ProductList from './pages/ProductList'
import InspectorPanel from './pages/InspectorPanel'
import ManagerPanel from './pages/ManagerPanel'
import Chat from './pages/Chat'
import Checklists from './pages/Checklists'
import Inspections from './pages/Inspections'

import { getToken, clearToken } from './api'


export default function App(){
  const [authed, setAuthed] = useState(!!getToken())
  const [userRole, setUserRole] = useState(null)
  const [userEmail, setUserEmail] = useState("");
  useEffect(()=>{
    function updateAuth() {
      setAuthed(!!getToken())
      const token = getToken()
      console.log('[Sidebar] Token actual:', token)
      if(token){
        try{
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('[Sidebar] Payload decodificado:', payload)
          // Verificación extra: si el rol no es válido, limpiar token y forzar logout
          const validRoles = ['inspector','administrativo','gerente','admin']
          if(!payload.role || !validRoles.includes(payload.role)){
            console.warn('[Sidebar] Rol inválido en token, limpiando y forzando logout')
            clearToken();
            setAuthed(false);
            setUserRole(null);
            setUserEmail("");
            return;
          }
          setUserRole(payload.role)
          setUserEmail(payload.email || "")
        }catch(e){ 
          console.error('[Sidebar] Error decodificando token:', e)
          clearToken();
          setAuthed(false);
          setUserRole(null);
          setUserEmail("");
        }
      }else{
        setUserRole(null)
        setUserEmail("");
      }
    }
    window.addEventListener('storage', updateAuth)
    updateAuth()
    return ()=> window.removeEventListener('storage', updateAuth)
  },[])

  // Definir permisos por rol (agregando 'admin' como gerente)
  const roleAccess = {
    inspector: ["Alta Producto","Checklists","Inspecciones","Chat"],
    administrativo: ["Equipos","Alta Cliente","Alta Proyecto","Alta Línea","Alta Producto","Checklists","Inspecciones","Inspector","Chat"],
    gerente: ["Equipos","Alta Cliente","Alta Proyecto","Alta Línea","Alta Producto","Checklists","Inspecciones","Inspector","Gerencial","Chat"],
    admin: ["Equipos","Alta Cliente","Alta Proyecto","Alta Línea","Alta Producto","Checklists","Inspecciones","Inspector","Gerencial","Chat"]
  }
  const links = [
    { label: "Equipos", path: "/teams", roles: ["administrativo","gerente","admin"] },
    { label: "Alta Cliente", path: "/client-create", roles: ["administrativo","gerente","admin"] },
    { label: "Alta Proyecto", path: "/project-create", roles: ["administrativo","gerente","admin"] },
    { label: "Alta Línea", path: "/line-create", roles: ["administrativo","gerente","admin"] },
    { label: "Alta Producto", path: "/product-create", roles: ["inspector","administrativo","gerente","admin"] },
    { label: "Productos guardados", path: "/product-list", roles: ["inspector","administrativo","gerente","admin"] },
    { label: "Checklists", path: "/checklists", roles: ["inspector","administrativo","gerente","admin"] },
    { label: "Inspecciones", path: "/inspections", roles: ["inspector","administrativo","gerente","admin"] },
    { label: "Inspector", path: "/inspector", roles: ["administrativo","gerente","admin"] },
    { label: "Gerencial", path: "/manager", roles: ["gerente","admin"] },
    { label: "Chat", path: "/chat", roles: ["inspector","administrativo","gerente","admin"] },
  ]

  return (
    <div className="app">
      <nav className="sidebar">
        <h2>QA Panel</h2>
        <ul>
          {/* Log para depuración del rol y links visibles */}
          {console.log('[Sidebar] userRole:', userRole, 'Links visibles:', links.filter(l => l.roles.includes(userRole)).map(l => l.label))}
          {links.filter(l => l.roles.includes(userRole)).map(l => (
            <li key={l.path}><Link to={l.path}>{l.label}</Link></li>
          ))}
          <li><Button variant="text" onClick={()=>{ clearToken(); setAuthed(false) }}>Cerrar sesión</Button></li>
        </ul>
        <div style={{marginTop:24, fontSize:12, color:'#555', textAlign:'center'}}>
          {userEmail ? `Sesión: ${userEmail}` : ''}
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/useradmin" element={<UserAdmin/>} />
          <Route path="/admin" element={<AdminPanel/>} />
          <Route path="/teams" element={<Teams/>} />
          <Route path="/client-create" element={<ClientCreate/>} />
          <Route path="/project-create" element={<ProjectCreate/>} />
          <Route path="/line-create" element={<ProductionLineCreate/>} />
          <Route path="/product-create" element={<ProductCreate/>} />
          <Route path="/product-list" element={<ProductList/>} />
          <Route path="/checklists" element={<Checklists/>} />
          <Route path="/inspections" element={<Inspections/>} />
          <Route path="/inspector" element={<InspectorPanel userEmail={userEmail}/>} />
          <Route path="/manager" element={<ManagerPanel/>} />
          <Route path="/chat" element={<Chat/>} />
          <Route path="*" element={
            authed ? null : <Login onLogin={()=> setAuthed(true)} />
          } />
        </Routes>
      </main>
    </div>
  )
}
