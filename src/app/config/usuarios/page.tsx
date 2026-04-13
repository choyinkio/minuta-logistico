'use client';

import { useState, useEffect } from 'react';
import '@/app/globals.css';

interface Licitacion {
  id: string;
  code: string;
  name: string;
}

interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  expirationDate: string | null;
  isLocked: boolean;
  canWrite: boolean;
  profileId?: string;
  profile?: { name: string };
  licitaciones?: { licitacion: Licitacion }[];
}

interface Profile {
  id: string;
  name: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allLicitaciones, setAllLicitaciones] = useState<Licitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    profileId: '',
    expirationDate: '',
    isLocked: false,
    canWrite: false,
    licitacionIds: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
    fetchProfiles();
    fetchLicitaciones();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/config/usuarios');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/config/perfiles');
      const data = await res.json();
      if (Array.isArray(data.profiles)) setProfiles(data.profiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchLicitaciones = async () => {
    try {
      const res = await fetch('/api/config/licitaciones');
      const data = await res.json();
      if (Array.isArray(data)) setAllLicitaciones(data);
    } catch (error) {
      console.error('Error fetching licitaciones:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Password stay empty unless changed
      profileId: user.profileId || '',
      expirationDate: user.expirationDate ? user.expirationDate.split('T')[0] : '',
      isLocked: user.isLocked,
      canWrite: user.canWrite,
      licitacionIds: user.licitaciones?.map(l => l.licitacion.id) || [],
    });
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      profileId: profiles[0]?.id || '',
      expirationDate: '',
      isLocked: false,
      canWrite: false,
      licitacionIds: [],
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingUser ? 'PUT' : 'POST';
    const url = editingUser ? `/api/config/usuarios/${editingUser.id}` : '/api/config/usuarios';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const toggleLicitacion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      licitacionIds: prev.licitacionIds.includes(id)
        ? prev.licitacionIds.filter(lid => lid !== id)
        : [...prev.licitacionIds, id]
    }));
  };

  const toggleLock = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/config/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !currentStatus }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling lock:', error);
    }
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p className="subtitle">Administra los datos personales, perfiles y licitaciones asignadas</p>
        </div>
        {!isFormOpen && <button className="btn-primary" onClick={handleCreate}>+ Nuevo Usuario</button>}
      </header>

      {isFormOpen ? (
        <section className="form-section glass-panel">
          <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  value={formData.firstName} 
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Ej: Juan"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input 
                  type="text" 
                  value={formData.lastName} 
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Ej: Pérez"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  placeholder="ejemplo@correo.com"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Contraseña {editingUser && '(Dejar vacío para no cambiar)'}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required={!editingUser} 
                />
              </div>
              <div className="form-group">
                <label>Perfil / Rol</label>
                <select 
                  value={formData.profileId} 
                  onChange={e => setFormData({...formData, profileId: e.target.value})}
                  required
                >
                  <option value="">Seleccione un perfil</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Expiración</label>
                <input 
                  type="date" 
                  value={formData.expirationDate} 
                  onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                />
              </div>
              
              <div className="form-group full-width licitaciones-selector">
                <label>Asociar Licitaciones</label>
                <div className="licitaciones-grid">
                  {allLicitaciones.length === 0 ? (
                    <p className="no-data">No hay licitaciones creadas aún.</p>
                  ) : (
                    allLicitaciones.map(l => (
                      <label key={l.id} className="checkbox-label item">
                        <input 
                          type="checkbox" 
                          checked={formData.licitacionIds.includes(l.id)} 
                          onChange={() => toggleLicitacion(l.id)}
                        />
                        <span><strong className="code-tag">{l.code}</strong> - {l.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="form-group checkboxes-inline full-width">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.canWrite} 
                    onChange={e => setFormData({...formData, canWrite: e.target.checked})}
                  />
                  <span>Permiso de Escritura</span>
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.isLocked} 
                    onChange={e => setFormData({...formData, isLocked: e.target.checked})}
                  />
                  <span>Cuenta Bloqueada</span>
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Guardar Cambios</button>
            </div>
          </form>
        </section>
      ) : (
        <section className="users-table-container glass-panel">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Usuario</th>
                  <th>Perfil</th>
                  <th>Permisos</th>
                  <th>Licitaciones Asignadas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center">Cargando...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="text-center">No hay usuarios registrados</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-name-cell">
                          <span className="bold">{user.firstName} {user.lastName}</span>
                          <span className="email-sub">{user.email}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{user.username}</td>
                      <td>{user.profile?.name || 'N/A'}</td>
                      <td>
                        <span className={`perm-badge ${user.canWrite || user.profile?.name === 'Administrador' ? 'write' : 'read'}`}>
                          {(user.canWrite || user.profile?.name === 'Administrador') ? ' Escritura' : 'Lectura'}
                        </span>
                      </td>
                      <td>
                        <div className="licitaciones-tags">
                          {user.licitaciones && user.licitaciones.length > 0 ? (
                            user.licitaciones.map(l => (
                              <span key={l.licitacion.id} className="lic-tag" title={l.licitacion.name}>
                                {l.licitacion.code}
                              </span>
                            ))
                          ) : (
                            <span className="no-data">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${user.isLocked ? 'locked' : 'active'}`}>
                          {user.isLocked ? 'Bloqueado' : 'Activo'}
                        </span>
                      </td>
                      <td className="actions">
                        <button onClick={() => handleEdit(user)} title="Editar" className="edit-btn">✏️</button>
                        <button onClick={() => toggleLock(user.id, user.isLocked)} title={user.isLocked ? "Desbloquear" : "Bloquear"}>
                          {user.isLocked ? '🔓' : '🔒'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <style jsx>{`
        .admin-page { display: flex; flex-direction: column; gap: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
        .subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; }
        
        .btn-primary { background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; }
        .btn-secondary { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid var(--border); }
        
        .form-section { padding: 2rem; }
        .form-section h2 { margin-bottom: 2rem; font-size: 1.25rem; }
        .user-form { display: flex; flex-direction: column; gap: 2rem; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.85rem; color: var(--text-secondary); }
        .form-group input, .form-group select { 
          background: rgba(15, 23, 42, 0.3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; color: white; font-family: inherit;
        }
        .checkboxes-inline { display: flex; gap: 2rem; align-items: center; padding-top: 1rem; }
        .checkbox-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; color: var(--text-primary) !important; font-size: 0.9rem; }
        .checkbox-label input { width: 18px; height: 18px; accent-color: var(--accent); }
        
        /* Licitaciones Selector */
        .licitaciones-selector { background: rgba(0, 0, 0, 0.2); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border); margin: 1rem 0; }
        .licitaciones-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem; max-height: 200px; overflow-y: auto; padding-right: 0.5rem; }
        .licitaciones-grid .item { background: rgba(255, 255, 255, 0.03); padding: 0.75rem; border-radius: 8px; border: 1px solid transparent; transition: all 0.2s; }
        .licitaciones-grid .item:hover { border-color: var(--accent); background: rgba(59, 130, 246, 0.05); }
        .code-tag { color: var(--accent); font-family: monospace; }
        .no-data { color: var(--text-secondary); font-style: italic; font-size: 0.9rem; }

        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid var(--border); padding-top: 2rem; }

        .users-table-container { overflow: hidden; }
        .users-table { width: 100%; border-collapse: collapse; }
        .user-name-cell { display: flex; flex-direction: column; }
        .email-sub { font-size: 0.75rem; color: var(--text-secondary); font-weight: 400; }
        
        .licitaciones-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; max-width: 250px; }
        .lic-tag { background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.65rem; font-weight: 700; border: 1px solid rgba(59, 130, 246, 0.3); }

        .perm-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
        .perm-badge.write { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
        .perm-badge.read { background: rgba(148, 163, 184, 0.1); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }
        
        .users-table th { padding: 1.25rem 1rem; color: var(--text-secondary); font-size: 0.85rem; text-align: left; border-bottom: 1px solid var(--border); }
        .users-table td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.5); }
        .bold { font-weight: 600; color: var(--text-primary); }
        .text-secondary { color: var(--text-secondary); font-size: 0.9rem; }
        .badge { padding: 0.25rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
        .badge.active { background: rgba(34, 197, 94, 0.1); color: var(--success); }
        .badge.locked { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .actions { display: flex; gap: 0.5rem; }
        .actions button { font-size: 1.1rem; padding: 0.5rem; border-radius: 6px; transition: all 0.2s; }
        .actions button:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-2px); }
        .edit-btn { color: var(--accent); }
        .text-center { text-align: center; color: var(--text-secondary); padding: 3rem; }
      `}</style>
    </div>
  );
}
