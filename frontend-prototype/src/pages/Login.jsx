import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveToken, createUser } from '../api';
import './Login.css';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [showUserAdmin, setShowUserAdmin] = useState(false);
  // Estado para el panel de administración de usuarios
  const [secretCode, setSecretCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPass, setNewUserPass] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [userCreateMsg, setUserCreateMsg] = useState("");
  // Login normal
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  // Modal admin
  const [showAdmin, setShowAdmin] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Log petición
      console.log('[Login] Intentando login:', { email, password });
  const res = await login(email, password);
      console.log('[Login] Respuesta:', res);
      if (res.token) {
        saveToken(res.token);
        if (onLogin) onLogin();
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (e) {
      setError(e.message || 'Error de conexión o credenciales');
      console.error('[Login] Error:', e);
    }
  };

  const submitAdmin = async (e)=>{
    e.preventDefault()
    setAdminError('')
    try{
      const res = await api.login(adminEmail, adminPass)
      if(res.token){
        // Decodificar el token para verificar rol
        const payload = JSON.parse(atob(res.token.split('.')[1]))
        if(payload.role === 'admin'){
          saveToken(res.token)
          setShowAdmin(true);
        }else{
          setAdminError('No tienes permisos de administrador')
        }
      }else{
        setAdminError('Credenciales incorrectas')
      }
    }catch(e){
      setAdminError('Credenciales incorrectas')
    }
  }

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={submit}>
        <div className="login-avatar">
          <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#eee"/><circle cx="32" cy="28" r="14" fill="#ccc"/><ellipse cx="32" cy="50" rx="18" ry="10" fill="#ccc"/></svg>
        </div>
        <div className="login-title">Acceso</div>
        <div className="login-fields">
          <div className="login-field">
            <span role="img" aria-label="email">📧</span>
            <input
              className="login-input"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <span role="img" aria-label="lock">🔒</span>
            <input
              className="login-input"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="login-options">
          <label><input type="checkbox" checked={remember} onChange={e=> setRemember(e.target.checked)} /> Recuérdame</label>
        </div>
        <div className="login-footer">
          <span className="login-admin-link" style={{cursor:'pointer', textDecoration:'underline', color:'#5b9ffb'}} onClick={()=> setShowUserAdmin(true)}>
            Panel de Administración de Usuarios
          </span>
        </div>
        {error && <div className="login-error">{error}</div>}
        <button className="login-btn" type="submit">ENTRAR</button>
      </form>
      {showUserAdmin && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-title">Acceso al Panel de Administración de Usuarios</div>
            <div className="admin-modal-field">
              <span role="img" aria-label="key">🔑</span>
              <input
                className="admin-modal-input"
                type="password"
                placeholder="Código secreto"
                value={secretCode}
                onChange={e => { setSecretCode(e.target.value); setCodeError(""); }}
              />
            </div>
            {codeError && <div className="login-error">{codeError}</div>}
            <div className="admin-modal-actions">
              <button className="admin-modal-btn" onClick={async ()=> {
                if(secretCode === "0000") {
                  setCodeError("");
                  setShowUserAdmin(false);
                  setSecretCode("");
                  // Login como admin real
                  try {
                    const res = await fetch('http://localhost:5000/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: 'admin@admin.com', password: 'admin' })
                    });
                    if (!res.ok) throw new Error('Credenciales admin incorrectas');
                    const data = await res.json();
                    localStorage.setItem('qa_token', data.token);
                    navigate('/useradmin');
                  } catch (err) {
                    setCodeError('No se pudo acceder como admin');
                  }
                } else {
                  setCodeError("Código incorrecto");
                }
              }}>Acceder</button>
              <button className="admin-modal-cancel" onClick={()=> {setShowUserAdmin(false); setSecretCode(""); setCodeError("");}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
