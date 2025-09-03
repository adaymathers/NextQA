import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api';
import './UserAdmin.css';

export default function UserAdmin() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', role: 'inspector' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setMsg('Error al cargar usuarios');
    }
  }

  function handleEdit(user) {
    setEditingUser(user);
    setForm({ email: user.email, password: '', role: user.role });
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, form);
        setMsg('Usuario actualizado');
      } else {
        // Usar /auth/register y enviar email, password, name y role
        const name = form.email.split('@')[0] || 'Usuario';
        await import('../api').then(api => api.register(form.email, form.password, name, form.role));
        setMsg('Usuario registrado');
      }
      setEditingUser(null);
      setForm({ email: '', password: '', role: 'inspector' });
      loadUsers();
    } catch (err) {
      setMsg('Error: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (window.confirm('¿Eliminar usuario?')) {
      await deleteUser(id);
      setMsg('Usuario eliminado');
      loadUsers();
    }
  }

  return (
    <div className="user-admin-page">
      <h2>Administrar Usuarios</h2>
      {msg && <div className="user-admin-msg">{msg}</div>}
      <form className="user-admin-form" onSubmit={handleSave}>
        <input type="email" placeholder="Correo" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <input type="password" placeholder="Contraseña" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editingUser} />
        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
          <option value="inspector">Inspector</option>
          <option value="administrativo">Administrativo</option>
          <option value="gerente">Gerente</option>
          <option value="admin">Administrador</option>
        </select>
  <button type="submit">{editingUser ? 'Guardar' : 'Registrar usuario'}</button>
        {editingUser && <button type="button" onClick={() => { setEditingUser(null); setForm({ email: '', password: '', role: 'inspector' }); }}>Cancelar</button>}
      </form>
      <table className="user-admin-table">
        <thead>
          <tr>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Editar</button>
                <button onClick={() => handleDelete(user.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
