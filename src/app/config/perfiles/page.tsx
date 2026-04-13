'use client';

import React, { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  menus: { menuItem: MenuItem }[];
}

interface Profile {
  id: string;
  name: string;
  description?: string;
  roles: { role: Role }[];
}

export default function PerfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New item states
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newProfileData, setNewProfileData] = useState({ name: '', description: '', roleIds: [] as string[] });
  
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ name: '', menuIds: [] as string[] });

  // Editing states
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editProfileData, setEditProfileData] = useState({ name: '', description: '', roleIds: [] as string[] });
  
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleData, setEditRoleData] = useState({ name: '', menuIds: [] as string[] });

  useEffect(() => { fetchData(); fetchAllMenus(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/config/perfiles');
      const data = await res.json();
      setProfiles(data.profiles || []);
      setRoles(data.roles || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchAllMenus = async () => {
    try {
      const res = await fetch('/api/config/menus');
      const data = await res.json();
      setAllMenus(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  const startEditProfile = (p: Profile) => {
    setEditingProfileId(p.id);
    setEditProfileData({ 
      name: p.name, 
      description: p.description || '',
      roleIds: p.roles.map(r => r.role.id)
    });
  };

  const startEditRole = (r: Role) => {
    setEditingRoleId(r.id);
    setEditRoleData({ 
      name: r.name,
      menuIds: r.menus.map(m => m.menuItem.id)
    });
  };

  // Improved handleToggle for both Edit and New states
  const handleToggle = (scope: 'edit' | 'new', type: 'profile' | 'role', id: string) => {
    if (scope === 'edit') {
      if (type === 'profile') {
        setEditProfileData(prev => ({
          ...prev,
          roleIds: prev.roleIds.includes(id) ? prev.roleIds.filter(rid => rid !== id) : [...prev.roleIds, id]
        }));
      } else {
        setEditRoleData(prev => ({
          ...prev,
          menuIds: prev.menuIds.includes(id) ? prev.menuIds.filter(mid => mid !== id) : [...prev.menuIds, id]
        }));
      }
    } else {
      if (type === 'profile') {
        setNewProfileData(prev => ({
          ...prev,
          roleIds: prev.roleIds.includes(id) ? prev.roleIds.filter(rid => rid !== id) : [...prev.roleIds, id]
        }));
      } else {
        setNewRoleData(prev => ({
          ...prev,
          menuIds: prev.menuIds.includes(id) ? prev.menuIds.filter(mid => mid !== id) : [...prev.menuIds, id]
        }));
      }
    }
  };

  const saveNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/config/perfiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProfileData, type: 'profile' }),
    });
    if (res.ok) { 
      setShowNewProfile(false); 
      setNewProfileData({ name: '', description: '', roleIds: [] }); 
      fetchData(); 
    }
  };

  const saveNewRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/config/perfiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRoleData, type: 'role' }),
    });
    if (res.ok) { 
      setShowNewRole(false); 
      setNewRoleData({ name: '', menuIds: [] }); 
      fetchData(); 
    }
  };

  const saveProfile = async (id: string) => {
    const res = await fetch(`/api/config/perfiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editProfileData),
    });
    if (res.ok) { setEditingProfileId(null); fetchData(); }
  };

  const saveRole = async (id: string) => {
    const res = await fetch(`/api/config/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editRoleData),
    });
    if (res.ok) { setEditingRoleId(null); fetchData(); }
  };

  const deleteProfile = async (id: string) => {
    if (confirm('¿Eliminar este perfil?')) {
      const res = await fetch(`/api/config/perfiles/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    }
  };

  const deleteRole = async (id: string) => {
    if (confirm('¿Eliminar este rol?')) {
      const res = await fetch(`/api/config/roles/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    }
  };

  // Group menus by category
  const groupedMenus = allMenus.reduce((acc: any, menu) => {
    const cat = menu.category === 'config' ? 'Configuración' : 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(menu);
    return acc;
  }, {});

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="title-section">
          <h1>Perfiles y Roles</h1>
          <p>Gestiona la jerarquía de accesos y permisos del sistema</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowNewRole(true)}>+ Nuevo Rol</button>
          <button className="btn-primary" onClick={() => setShowNewProfile(true)}>+ Nuevo Perfil</button>
        </div>
      </header>

      {/* Overlays for New Items (Augmented with checkboxes) */}
      {showNewProfile && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel scrollable-modal">
            <h2>Nuevo Perfil</h2>
            <form onSubmit={saveNewProfile}>
              <div className="field-group">
                <label>Nombre del Perfil</label>
                <input 
                  type="text" 
                  value={newProfileData.name} 
                  onChange={e => setNewProfileData({...newProfileData, name: e.target.value})} 
                  placeholder="Ej: Logístico"
                  required 
                />
              </div>
              <div className="field-group">
                <label>Descripción</label>
                <textarea 
                  value={newProfileData.description} 
                  onChange={e => setNewProfileData({...newProfileData, description: e.target.value})} 
                  placeholder="Defina el propósito de este perfil"
                />
              </div>

              <div className="assignment-section">
                <label className="section-label">Asociar Roles Inmediatamente</label>
                <div className="vertical-check-list compact">
                  {roles.map(r => (
                    <label key={r.id} className="selector-item">
                      <input 
                        type="checkbox" 
                        checked={newProfileData.roleIds.includes(r.id)}
                        onChange={() => handleToggle('new', 'profile', r.id)}
                      />
                      <span className="check-text">{r.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowNewProfile(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear Perfil</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNewRole && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel scrollable-modal">
            <h2>Nuevo Rol</h2>
            <form onSubmit={saveNewRole}>
              <div className="field-group">
                <label>Nombre del Rol</label>
                <input 
                  type="text" 
                  value={newRoleData.name} 
                  onChange={e => setNewRoleData({...newRoleData, name: e.target.value})} 
                  placeholder="Ej: Solo Lectura"
                  required 
                />
              </div>

              <div className="assignment-section">
                <label className="section-label">Definir Permisos de Menú</label>
                <div className="grouped-list">
                  {Object.keys(groupedMenus).map(cat => (
                    <div key={cat} className="menu-group">
                      <h4 className="group-title">{cat}</h4>
                      <div className="vertical-check-list compact">
                        {groupedMenus[cat].map((m: MenuItem) => (
                          <label key={m.id} className="selector-item">
                            <input 
                              type="checkbox" 
                              checked={newRoleData.menuIds.includes(m.id)}
                              onChange={() => handleToggle('new', 'role', m.id)}
                            />
                            <span className="check-text">{m.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowNewRole(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear Rol</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-grid">
        {/* PROFILES COLUMN */}
        <div className="admin-col">
          <div className="col-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
            <h2>Perfiles de Usuario</h2>
          </div>
          
          <div className="items-list">
            {profiles.map(p => (
              <div key={p.id} className={`item-card glass-panel ${editingProfileId === p.id ? 'editing' : ''}`}>
                <div className="card-main">
                  <div className="card-info">
                    {editingProfileId === p.id ? (
                      <input 
                        className="edit-input"
                        value={editProfileData.name} 
                        onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} 
                      />
                    ) : (
                      <h3>{p.name}</h3>
                    )}
                    <span className="subtitle">{p.description || 'Sin descripción'}</span>
                  </div>
                  <div className="card-actions">
                    {editingProfileId === p.id ? (
                      <button className="icon-btn success" onClick={() => saveProfile(p.id)}>✔️</button>
                    ) : (
                      <>
                        <button className="icon-btn" onClick={() => startEditProfile(p)}>✏️</button>
                        <button className="icon-btn delete" onClick={() => deleteProfile(p.id)}>🗑️</button>
                      </>
                    )}
                  </div>
                </div>

                {editingProfileId === p.id && (
                  <div className="edit-details">
                    <label className="section-label">Roles Asignados (Vertical)</label>
                    <div className="vertical-check-list">
                      {roles.map(r => (
                        <label key={r.id} className="selector-item">
                          <input 
                            type="checkbox" 
                            checked={editProfileData.roleIds.includes(r.id)}
                            onChange={() => handleToggle('edit', 'profile', r.id)}
                          />
                          <span className="check-text">{r.name}</span>
                        </label>
                      ))}
                    </div>
                    <button className="btn-ghost" onClick={() => setEditingProfileId(null)}>Cerrar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ROLES COLUMN */}
        <div className="admin-col">
          <div className="col-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2"/><circle cx="10" cy="14" r="5"/><path d="M12 12 21 3"/><path d="m16 8 2 2"/><path d="m19 5 2 2"/></svg>
            <h2>Roles y Permisos</h2>
          </div>

          <div className="items-list">
            {roles.map(r => (
              <div key={r.id} className={`item-card glass-panel ${editingRoleId === r.id ? 'editing' : ''}`}>
                <div className="card-main">
                  <div className="card-info">
                    {editingRoleId === r.id ? (
                      <input 
                        className="edit-input"
                        value={editRoleData.name} 
                        onChange={e => setEditRoleData({...editRoleData, name: e.target.value})} 
                      />
                    ) : (
                      <h3>{r.name}</h3>
                    )}
                    <span className="subtitle">{r.menus?.length || 0} opciones habilitadas</span>
                  </div>
                  <div className="card-actions">
                    {editingRoleId === r.id ? (
                      <button className="icon-btn success" onClick={() => saveRole(r.id)}>✔️</button>
                    ) : (
                      <>
                        <button className="icon-btn" onClick={() => startEditRole(r)}>✏️</button>
                        <button className="icon-btn delete" onClick={() => deleteRole(r.id)}>🗑️</button>
                      </>
                    )}
                  </div>
                </div>

                {editingRoleId === r.id && (
                  <div className="edit-details">
                    <label className="section-label">Permisos de Menú (Agrupados)</label>
                    <div className="grouped-list">
                      {Object.keys(groupedMenus).map(cat => (
                        <div key={cat} className="menu-group">
                          <h4 className="group-title">{cat}</h4>
                          <div className="vertical-check-list">
                            {groupedMenus[cat].map((m: MenuItem) => (
                              <label key={m.id} className="selector-item">
                                <input 
                                  type="checkbox" 
                                  checked={editRoleData.menuIds.includes(m.id)}
                                  onChange={() => handleToggle('edit', 'role', m.id)}
                                />
                                <span className="check-text">{m.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn-ghost" onClick={() => setEditingRoleId(null)}>Cerrar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 1rem;
          animation: fadeIn 0.5s ease-out;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border);
        }

        .title-section h1 {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.25rem;
        }

        .title-section p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          align-items: start;
        }

        .admin-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .col-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--accent);
        }

        .col-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .item-card {
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .item-card:hover {
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
        }

        .item-card.editing {
          border-color: var(--accent);
          background: rgba(30, 41, 59, 0.9);
        }

        .card-main {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-info h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .icon-btn.delete:hover {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
        }

        .icon-btn.success {
          color: var(--success);
          background: rgba(34, 197, 94, 0.1);
        }

        .edit-details, .assignment-section {
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .section-label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--accent);
        }

        .vertical-check-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .vertical-check-list.compact {
          gap: 0.5rem;
        }

        .selector-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .selector-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .check-text {
          font-size: 0.95rem;
        }

        .selector-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--accent);
        }

        .menu-group {
          margin-bottom: 1rem;
        }

        .group-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Modal / Form styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          max-height: 90vh;
        }

        .scrollable-modal {
          overflow-y: auto;
        }

        .field-group {
          margin-bottom: 1.5rem;
        }

        .field-group label {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        input, textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: #fff;
          font-family: inherit;
        }

        .edit-input {
          font-size: 1.1rem;
          font-weight: 600;
          background: transparent;
          border-bottom: 2px solid var(--accent);
          border-radius: 0;
          padding: 0.25rem 0;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        /* Buttons */
        .btn-primary {
          background: var(--accent);
          color: #fff;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          border: 1px solid var(--border);
          font-weight: 600;
        }

        .btn-ghost {
          color: var(--text-secondary);
          padding: 0.6rem 1rem;
          font-size: 0.9rem;
        }

        .btn-ghost:hover {
          color: #fff;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .admin-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
