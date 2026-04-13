'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import '@/app/globals.css';

export default function ZonasGeograficasPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('paises');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // References for dropdowns
  const [paises, setPaises] = useState<any[]>([]);
  const [regiones, setRegiones] = useState<any[]>([]);
  const [ciudades, setCiudades] = useState<any[]>([]);

  const canWrite = session?.user?.profile === 'Administrador' || session?.user?.canWrite;

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData(activeTab);
    // Load references if needed
    if (activeTab === 'regiones') fetchReference('pais');
    if (activeTab === 'ciudades') fetchReference('region');
    if (activeTab === 'comunas') fetchReference('ciudad');
  }, [activeTab]);

  const getEndpoint = (tab: string) => {
    switch (tab) {
      case 'paises': return '/api/config/geografia/pais';
      case 'regiones': return '/api/config/geografia/region';
      case 'ciudades': return '/api/config/geografia/ciudad';
      case 'comunas': return '/api/config/geografia/comuna';
      default: return '';
    }
  };

  const fetchData = async (tab: string) => {
    setLoading(true);
    try {
      const res = await fetch(getEndpoint(tab));
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReference = async (ref: string) => {
    try {
      const res = await fetch(`/api/config/geografia/${ref}`);
      const data = await res.json();
      if (!Array.isArray(data)) return;
      
      if (ref === 'pais') setPaises(data);
      if (ref === 'region') setRegiones(data);
      if (ref === 'ciudad') setCiudades(data);
    } catch (err) {
      console.error('Error fetching ref', err);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    if (activeTab === 'paises') setFormData({ codigo: '', nombre: '' });
    if (activeTab === 'regiones') setFormData({ nombre: '', paisId: '' });
    if (activeTab === 'ciudades') setFormData({ nombre: '', regionId: '' });
    if (activeTab === 'comunas') setFormData({ nombre: '', ciudadId: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    if (!canWrite) return;
    setEditingItem(item);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    const baseData = { ...formData };
    
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `${getEndpoint(activeTab)}/${editingItem.id}` : getEndpoint(activeTab);

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseData),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchData(activeTab);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canWrite) return;
    if (!confirm('¿Está seguro de eliminar este registro? Esto podría eliminar datos dependientes.')) return;

    try {
      const res = await fetch(`${getEndpoint(activeTab)}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        fetchData(activeTab);
      } else {
        alert(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Zonas Geográficas</h1>
          <p className="subtitle">Configura la jerarquía base de los territorios (País &rarr; Región &rarr; Ciudad &rarr; Comuna)</p>
        </div>
        {canWrite && !isFormOpen && (
          <button className="btn-primary" onClick={handleCreate}>+ Nuevo Registro</button>
        )}
      </header>

      <div className="tabs">
        <button className={activeTab === 'paises' ? 'active' : ''} onClick={() => { setActiveTab('paises'); setIsFormOpen(false); }}>Países</button>
        <button className={activeTab === 'regiones' ? 'active' : ''} onClick={() => { setActiveTab('regiones'); setIsFormOpen(false); }}>Regiones</button>
        <button className={activeTab === 'ciudades' ? 'active' : ''} onClick={() => { setActiveTab('ciudades'); setIsFormOpen(false); }}>Ciudades</button>
        <button className={activeTab === 'comunas' ? 'active' : ''} onClick={() => { setActiveTab('comunas'); setIsFormOpen(false); }}>Comunas</button>
      </div>

      {isFormOpen ? (
        <section className="form-section glass-panel">
          <h2>{editingItem ? 'Editar' : 'Nuevo'} en {activeTab.toUpperCase()}</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-grid">
              {activeTab === 'paises' && (
                <div className="form-group">
                  <label>Código País</label>
                  <input 
                    type="text" 
                    value={formData.codigo || ''} 
                    onChange={e => setFormData({...formData, codigo: e.target.value})}
                    placeholder="Ej: CL"
                    required 
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  value={formData.nombre || ''} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  required 
                />
              </div>

              {activeTab === 'regiones' && (
                <div className="form-group">
                  <label>País Perteneciente</label>
                  <select value={formData.paisId || ''} onChange={e => setFormData({...formData, paisId: e.target.value})} required>
                    <option value="">Seleccione...</option>
                    {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'ciudades' && (
                <div className="form-group">
                  <label>Región Perteneciente</label>
                  <select value={formData.regionId || ''} onChange={e => setFormData({...formData, regionId: e.target.value})} required>
                    <option value="">Seleccione...</option>
                    {regiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>
              )}

              {activeTab === 'comunas' && (
                <div className="form-group">
                  <label>Ciudad Perteneciente</label>
                  <select value={formData.ciudadId || ''} onChange={e => setFormData({...formData, ciudadId: e.target.value})} required>
                    <option value="">Seleccione...</option>
                    {ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Guardar</button>
            </div>
          </form>
        </section>
      ) : (
        <section className="users-table-container glass-panel">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  {activeTab === 'paises' && <th>Código</th>}
                  <th>Nombre</th>
                  {activeTab === 'regiones' && <th>País</th>}
                  {activeTab === 'ciudades' && <th>Región</th>}
                  {activeTab === 'comunas' && <th>Ciudad</th>}
                  {canWrite && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center">Cargando...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={4} className="text-center">No hay registros en esta zona</td></tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id}>
                      {activeTab === 'paises' && <td className="font-mono text-primary">{item.codigo}</td>}
                      <td className="bold">{item.nombre}</td>
                      {activeTab === 'regiones' && <td>{item.pais?.nombre}</td>}
                      {activeTab === 'ciudades' && <td>{item.region?.nombre}</td>}
                      {activeTab === 'comunas' && <td>{item.ciudad?.nombre}</td>}
                      {canWrite && (
                        <td className="actions">
                          <button onClick={() => handleEdit(item)} title="Editar" className="edit-btn">✏️</button>
                          <button onClick={() => handleDelete(item.id)} title="Eliminar" className="delete-btn">🗑️</button>
                        </td>
                      )}
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
        
        .tabs { display: flex; gap: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
        .tabs button { background: none; border: none; font-size: 1rem; color: var(--text-secondary); cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; transition: all 0.2s; font-weight: 600; }
        .tabs button:hover { background: rgba(255, 255, 255, 0.05); color: var(--text-primary); }
        .tabs button.active { background: rgba(59, 130, 246, 0.15); color: var(--accent); }

        .btn-primary { background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; }
        .btn-secondary { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid var(--border); }
        
        .form-section { padding: 2rem; }
        .form-section h2 { margin-bottom: 2rem; font-size: 1.25rem; }
        .user-form { display: flex; flex-direction: column; gap: 2rem; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.85rem; color: var(--text-secondary); }
        .form-group input, .form-group select { 
          background: rgba(15, 23, 42, 0.3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; color: white; font-family: inherit;
        }
        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid var(--border); padding-top: 2rem; }

        .users-table-container { overflow: hidden; }
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table th { padding: 1.25rem 1rem; color: var(--text-secondary); font-size: 0.85rem; text-align: left; border-bottom: 1px solid var(--border); }
        .users-table td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.5); }
        .bold { font-weight: 600; color: var(--text-primary); }
        .text-primary { color: var(--accent); }
        .font-mono { font-family: monospace; }
        .actions { display: flex; gap: 0.5rem; }
        .actions button { font-size: 1.1rem; padding: 0.5rem; border-radius: 6px; transition: all 0.2s; }
        .actions button:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-2px); }
        .edit-btn { color: var(--accent); }
        .delete-btn { color: var(--error); }
        .text-center { text-align: center; color: var(--text-secondary); padding: 3rem; }
      `}</style>
    </div>
  );
}
