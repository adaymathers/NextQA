import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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
import './styles.css';
import Navbar from './components/Navbar';
import { getToken, clearToken } from './api'

export default function App(){
  const [authed, setAuthed] = useState(!!getToken())
  const [userRole, setUserRole] = useState(null)
  const [userEmail, setUserEmail] = useState("");
  useEffect(()=>{
    function updateAuth() {
      setAuthed(!!getToken())
      const token = getToken()
      if(token){
        try{
          const payload = JSON.parse(atob(token.split('.')[1]))
          const validRoles = ['inspector','administrativo','gerente','admin']
          if(!payload.role || !validRoles.includes(payload.role)){
            clearToken();
            setAuthed(false);
            setUserRole(null);
            setUserEmail("");
            return;
          }
          setUserRole(payload.role)
          setUserEmail(payload.email || "")
        }catch(e){ 
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
    <>
      <Navbar links={links.filter(l => l.roles.includes(userRole))} userEmail={userEmail} onLogout={()=>{ clearToken(); setAuthed(false) }} />
      <div className="app pt-16">
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
    </>
  )
}
