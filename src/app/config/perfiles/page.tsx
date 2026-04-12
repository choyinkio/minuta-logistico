'use client';

import { useState, useEffect } from 'react';
import '@/app/globals.css';

interface MenuItem {
  id: string;
  name: string;
  path: string;
  category: string;
}

interface Profile {
  id: string;
  name: string;
  description: string | null;
  menus: { menuItem: MenuItem }[];
}

interface Role {
  id: string;
  name: string;
  menus: { menuItem: MenuItem }[];
}

export default function PerfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New item states
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newProfileData, setNewProfileData] = useState({ name: '', description: '' });
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ name: '' });

  // Editing states
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editProfileData, setEditProfileData] = useState({ name: '', description: '', menuIds: [] as string[] });
  
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleData, setEditRoleData] = useState({ name: '', menuIds: [] as string[] });

  useEffect(() => {
    fetchData();
    fetchAllMenus();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/config/perfiles');
      const data = await res.json();
      setProfiles(data.profiles || []);
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMenus = async () => {
    try {
      const res = await fetch('/api/config/menus');
      const data = await res.json();
      setAllMenus(data);
    } catch (error) {
      console.error(error);
    }
  };

  const startEditProfile = (p: Profile) => {
    setEditingProfileId(p.id);
    setEditProfileData({ 
      name: p.name, 
      description: p.description || '',
      menuIds: p.menus.map(m => m.menuItem.id)
    });
  };

  const startEditRole = (r: Role) => {
    setEditingRoleId(r.id);
    setEditRoleData({ 
      name: r.name,
      menuIds: r.menus.map(m => m.menuItem.id)
    });
  };

  const handleMenuToggle = (type: 'profile' | 'role', menuId: string) => {
    if (type === 'profile') {
      setEditProfileData(prev => ({
        ...prev,
        menuIds: prev.menuIds.includes(menuId) 
          ? prev.menuIds.filter(id => id !== menuId)
          : [...prev.menuIds, menuId]
      }));
    } else {
      setEditRoleData(prev => ({
        ...prev,
        menuIds: prev.menuIds.includes(menuId) 
          ? prev.menuIds.filter(id => id !== menuId)
          : [...prev.menuIds, menuId]
      }));
    }
  };

  const saveNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config/perfiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProfileData, type: 'profile' }),
      });
      if (res.ok) {
        setShowNewProfile(false);
        setNewProfileData({ name: '', description: '' });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveNewRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config/perfiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRoleData, type: 'role' }),
      });
      if (res.ok) {
        setShowNewRole(false);
        setNewRoleData({ name: '' });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveProfile = async (id: string) => {
    try {
      const res = await fetch(`/api/config/perfiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfileData),
      });
      if (res.ok) {
        setEditingProfileId(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveRole = async (id: string) => {
    try {
      const res = await fetch(`/api/config/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editRoleData),
      });
      if (res.ok) {
        setEditingRoleId(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este perfil?')) return;
    try {
      const res = await fetch(`/api/config/perfiles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) fetchData();
      else alert(data.error);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteRole = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este rol?')) return;
    try {
      const res = await fetch(`/api/config/roles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) fetchData();
      else alert(data.error);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>Perfiles y Roles</h1>
        <div className="btn-group">
          <button className="btn-secondary" onClick={() => setShowNewRole(true)}>+ Nuevo Rol</button>
          <button className="btn-primary" onClick={() => setShowNewProfile(true)}>+ Nuevo Perfil</button>
        </div>
      </header>

      {showNewProfile && (
        <div className="glass-panel form-overlay">
          <h2>Nuevo Perfil</h2>
          <form onSubmit={saveNewProfile}>
            <input type="text" placeholder="Nombre" value={newProfileData.name} onChange={e => setNewProfileData({...newProfileData, name: e.target.value})} required />
            <input type="text" placeholder="Descripción" value={newProfileData.description} onChange={e => setNewProfileData({...newProfileData, description: e.target.value})} />
            <div className="form-actions-inline">
              <button type="button" onClick={() => setShowNewProfile(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Crear</button>
            </div>
          </form>
        </div>
      )}

      {showNewRole && (
        <div className="glass-panel form-overlay">
          <h2>Nuevo Rol</h2>
          <form onSubmit={saveNewRole}>
            <input type="text" placeholder="Nombre del Rol" value={newRoleData.name} onChange={e => setNewRoleData({ name: e.target.value })} required />
            <div className="form-actions-inline">
              <button type="button" onClick={() => setShowNewRole(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Crear</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-grid">
        <section className="glass-panel admin-section">
          <h2>Perfiles</h2>
          <div className="list-container">
            {loading ? <p>Cargando...</p> : profiles.map(p => (
              <div key={p.id} className="list-item">
                {editingProfileId === p.id ? (
                  <div className="edit-mode full-width">
                    <div className="field-row">
                      <input 
                        type="text" 
                        value={editProfileData.name} 
                        onChange={e => setEditProfileData({...editProfileData, name: e.target.value})}
                      />
                      <input 
                        type="text" 
                        value={editProfileData.description} 
                        placeholder="Descripción"
                        onChange={e => setEditProfileData({...editProfileData, description: e.target.value})}
                      />
                    </div>
                    
                    <div className="permissions-section">
                      <h4>Permisos de Menú</h4>
                      <div className="menu-checks">
                        {allMenus.map(m => (
                          <label key={m.id} className="check-label">
                            <input 
                              type="checkbox" 
                              checked={editProfileData.menuIds.includes(m.id)}
                              onChange={() => handleMenuToggle('profile', m.id)}
                            />
                            {m.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="edit-actions">
                      <button className="confirm-btn" onClick={() => saveProfile(p.id)}>✔️ Guardar</button>
                      <button className="cancel-btn" onClick={() => setEditingProfileId(null)}>❌ Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-info">
                      <strong>{p.name}</strong>
                      <span className="desc">{p.description || 'Sin descripción'}</span>
                      <span className="badge">{p.menus.length} menús</span>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => startEditProfile(p)}>✏️</button>
                      <button onClick={() => deleteProfile(p.id)}>🗑️</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel admin-section">
          <h2>Roles</h2>
          <div className="list-container">
            {loading ? <p>Cargando...</p> : roles.map(r => (
              <div key={r.id} className="list-item">
                {editingRoleId === r.id ? (
                  <div className="edit-mode full-width">
                    <input 
                      type="text" 
                      value={editRoleData.name} 
                      onChange={e => setEditRoleData({ ...editRoleData, name: e.target.value })}
                    />

                    <div className="permissions-section">
                      <h4>Permisos de Menú (Roles)</h4>
                      <div className="menu-checks">
                        {allMenus.map(m => (
                          <label key={m.id} className="check-label">
                            <input 
                              type="checkbox" 
                              checked={editRoleData.menuIds.includes(m.id)}
                              onChange={() => handleMenuToggle('role', m.id)}
                            />
                            {m.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="edit-actions">
                      <button className="confirm-btn" onClick={() => saveRole(r.id)}>✔️ Guardar</button>
                      <button className="cancel-btn" onClick={() => setEditingRoleId(null)}>❌ Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="item-info">
                      <strong>{r.name}</strong>
                      <span className="badge">{r.menus?.length || 0} menús</span>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => startEditRole(r)}>✏️</button>
                      <button onClick={() => deleteRole(r.id)}>🗑️</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .admin-page { display: flex; flex-direction: column; gap: 2rem; position: relative; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .btn-group { display: flex; gap: 1rem; }
        .btn-primary { background: var(--accent); color: white; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; }
        .btn-secondary { background: rgba(59, 130, 246, 0.1); color: var(--accent); border: 1px solid var(--accent); padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; }
        
        .form-overlay { padding: 1.5rem; border: 1px solid var(--accent); animation: slideDown 0.3s ease; }
        .form-overlay form { display: flex; flex-direction: column; gap: 1rem; }
        .form-overlay input { background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px; padding: 0.75rem; color: white; }

        .admin-grid { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; align-items: start; }
        .admin-section { padding: 1.5rem; }
        .admin-section h2 { font-size: 1.15rem; margin-bottom: 1.5rem; color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
        
        .list-container { display: flex; flex-direction: column; gap: 1rem; }
        .list-item { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 1.25rem; 
          background: rgba(15, 23, 42, 0.4); 
          border-radius: 12px; 
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .list-item:hover { border-color: var(--accent); }

        .item-info { display: flex; flex-direction: column; gap: 0.35rem; }
        .item-info strong { font-size: 1.05rem; color: var(--text-primary); }
        .desc { font-size: 0.85rem; color: var(--text-secondary); }
        .badge { font-size: 0.7rem; background: var(--accent); color: white; width: fit-content; padding: 0.1rem 0.6rem; border-radius: 20px; text-transform: uppercase; font-weight: 700; margin-top: 0.25rem; }
        
        .item-actions { display: flex; gap: 0.5rem; }
        .item-actions button { font-size: 1.2rem; padding: 0.4rem; border-radius: 8px; transition: background 0.2s; }
        .item-actions button:hover { background: rgba(255,255,255,0.05); }

        .edit-mode { display: flex; flex-direction: column; gap: 1.25rem; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .edit-mode input { 
          background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; color: white; width: 100%;
        }
        
        .permissions-section { 
          background: rgba(0,0,0,0.2); 
          padding: 1rem; 
          border-radius: 8px; 
          border: 1px solid rgba(255,255,255,0.05);
        }
        .permissions-section h4 { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; }
        .menu-checks { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
        .check-label { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; cursor: pointer; color: var(--text-primary); }
        .check-label input { width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent); }

        .edit-actions { display: flex; gap: 1rem; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 1rem; }
        .confirm-btn { color: var(--accent); font-weight: 600; }
        .cancel-btn { color: var(--error); }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .admin-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
