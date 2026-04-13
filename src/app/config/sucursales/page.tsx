'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import '@/app/globals.css';

export default function SucursalesPage() {
  const { data: session } = useSession();
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // References Data
  const [licitaciones, setLicitaciones] = useState<any[]>([]);
  const [paises, setPaises] = useState<any[]>([]);
  const [allRegiones, setAllRegiones] = useState<any[]>([]);
  const [allCiudades, setAllCiudades] = useState<any[]>([]);
  const [allComunas, setAllComunas] = useState<any[]>([]);

  // Filtered dropdown lists 
  const [filteredRegiones, setFilteredRegiones] = useState<any[]>([]);
  const [filteredCiudades, setFilteredCiudades] = useState<any[]>([]);
  const [filteredComunas, setFilteredComunas] = useState<any[]>([]);

  const canWrite = session?.user?.profile === 'Administrador' || session?.user?.canWrite;

  const [formData, setFormData] = useState<any>({
    codigo: '',
    nombre: '',
    direccion: '',
    paisId: '',
    regionId: '',
    ciudadId: '',
    comunaId: '',
    licitacionId: '',
  });

  useEffect(() => {
    fetchData();
    fetchReferences();
  }, []);

  // Update cascade dropdowns when parent selections change
  useEffect(() => {
    if (formData.paisId) {
      setFilteredRegiones(allRegiones.filter(r => r.paisId === formData.paisId));
    } else {
      setFilteredRegiones([]);
    }
  }, [formData.paisId, allRegiones]);

  useEffect(() => {
    if (formData.regionId) {
      setFilteredCiudades(allCiudades.filter(c => c.regionId === formData.regionId));
    } else {
      setFilteredCiudades([]);
    }
  }, [formData.regionId, allCiudades]);

  useEffect(() => {
    if (formData.ciudadId) {
      setFilteredComunas(allComunas.filter(c => c.ciudadId === formData.ciudadId));
    } else {
      setFilteredComunas([]);
    }
  }, [formData.ciudadId, allComunas]);


  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config/sucursales');
      const data = await res.json();
      if (Array.isArray(data)) setSucursales(data);
    } catch (error) {
      console.error('Error fetching sucursales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferences = async () => {
    try {
      const get = async (endpoint: string) => {
        const res = await fetch(`/api/config/${endpoint}`);
        return await res.json();
      }

      setPaises(await get('geografia/pais'));
      setAllRegiones(await get('geografia/region'));
      setAllCiudades(await get('geografia/ciudad'));
      setAllComunas(await get('geografia/comuna'));
      setLicitaciones(await get('licitaciones'));

    } catch (err) {
      console.error('Error fetching references', err);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ 
      codigo: '', nombre: '', direccion: '', 
      paisId: '', regionId: '', ciudadId: '', comunaId: '', 
      licitacionId: '' 
    });
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    if (!canWrite) return;
    
    // Attempt to reconstruct hierarchy based on nested comuna relation
    const comuna = item.comuna;
    const ciudad = comuna?.ciudad;
    const region = ciudad?.region;
    const pais = region?.pais;

    setEditingItem(item);
    setFormData({ 
      codigo: item.codigo, 
      nombre: item.nombre, 
      direccion: item.direccion, 
      paisId: pais?.id || '', 
      regionId: region?.id || '', 
      ciudadId: ciudad?.id || '', 
      comunaId: item.comunaId, 
      licitacionId: item.licitacionId 
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    // Solo necesitamos enviar la comunaId y la licitacion, los demás IDs son "helpers" del UI
    const payload = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      direccion: formData.direccion,
      comunaId: formData.comunaId,
      licitacionId: formData.licitacionId
    };
    
    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/config/sucursales/${editingItem.id}` : '/api/config/sucursales';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar (revise que el código no esté duplicado)');
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canWrite) return;
    if (!confirm('¿Está seguro de eliminar esta sucursal?')) return;

    try {
      const res = await fetch(`/api/config/sucursales/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Control de Sucursales</h1>
          <p className="subtitle">Gestione las ubicaciones físicas asociadas a las licitaciones</p>
        </div>
        {canWrite && !isFormOpen && (
          <button className="btn-primary" onClick={handleCreate}>+ Nueva Sucursal</button>
        )}
      </header>

      {isFormOpen ? (
        <section className="form-section glass-panel">
          <h2>{editingItem ? 'Editar Sucursal' : 'Nueva Sucursal'}</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-grid">
              
              {/* Información Base */}
              <div className="form-group full-width-sm">
                <label>Código Sucursal</label>
                <input 
                  type="text" 
                  value={formData.codigo} 
                  onChange={e => setFormData({...formData, codigo: e.target.value})}
                  placeholder="Ej: SUC-STGO-01"
                  required 
                />
              </div>
              <div className="form-group full-width-sm">
                <label>Nombre de Sucursal</label>
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Base Principal Santiago"
                  required 
                />
              </div>

              {/* Licitación Asociada */}
              <div className="form-group full-width">
                <label>Licitación Asociada</label>
                <select 
                  value={formData.licitacionId} 
                  onChange={e => setFormData({...formData, licitacionId: e.target.value})} 
                  className="accented-select"
                  required
                >
                  <option value="">Seleccione una licitación...</option>
                  {licitaciones.map(l => <option key={l.id} value={l.id}>{l.code} - {l.name}</option>)}
                </select>
              </div>

              {/* Geografía en Cascada */}
              <div className="cascade-container full-width">
                <h4>Ubicación Geográfica</h4>
                <div className="cascade-grid">
                  <div className="form-group">
                    <label>País</label>
                    <select 
                      value={formData.paisId} 
                      onChange={e => setFormData({...formData, paisId: e.target.value, regionId: '', ciudadId: '', comunaId: ''})} 
                      required
                    >
                      <option value="">1. Seleccione País...</option>
                      {paises.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Región</label>
                    <select 
                      value={formData.regionId} 
                      onChange={e => setFormData({...formData, regionId: e.target.value, ciudadId: '', comunaId: ''})} 
                      disabled={!formData.paisId}
                      required
                    >
                      <option value="">2. Seleccione Región...</option>
                      {filteredRegiones.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ciudad</label>
                    <select 
                      value={formData.ciudadId} 
                      onChange={e => setFormData({...formData, ciudadId: e.target.value, comunaId: ''})} 
                      disabled={!formData.regionId}
                      required
                    >
                      <option value="">3. Seleccione Ciudad...</option>
                      {filteredCiudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Comuna</label>
                    <select 
                      value={formData.comunaId} 
                      onChange={e => setFormData({...formData, comunaId: e.target.value})} 
                      disabled={!formData.ciudadId}
                      required
                    >
                      <option value="">4. Seleccione Comuna...</option>
                      {filteredComunas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dirección Física */}
              <div className="form-group full-width">
                <label>Dirección Física</label>
                <input 
                  type="text" 
                  value={formData.direccion} 
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Ej: Av. Apoquindo 1234, Piso 4"
                  required 
                />
              </div>

            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Guardar Sucursal</button>
            </div>
          </form>
        </section>
      ) : (
        <section className="users-table-container glass-panel">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Sucursal</th>
                  <th>Comuna (Ciudad)</th>
                  <th>Licitación</th>
                  {canWrite && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center">Cargando...</td></tr>
                ) : sucursales.length === 0 ? (
                  <tr><td colSpan={5} className="text-center">No hay sucursales registradas</td></tr>
                ) : (
                  sucursales.map(suc => (
                    <tr key={suc.id}>
                      <td className="font-mono text-primary">{suc.codigo}</td>
                      <td>
                        <div className="node-detail">
                          <span className="bold">{suc.nombre}</span>
                          <span className="sub-detail">{suc.direccion}</span>
                        </div>
                      </td>
                      <td>
                        <div className="node-detail">
                          <span>{suc.comuna?.nombre}</span>
                          <span className="sub-detail">{suc.comuna?.ciudad?.nombre}, {suc.comuna?.ciudad?.region?.pais?.codigo}</span>
                        </div>
                      </td>
                      <td><span className="lic-badge" title={suc.licitacion?.name}>{suc.licitacion?.code}</span></td>
                      {canWrite && (
                        <td className="actions">
                          <button onClick={() => handleEdit(suc)} title="Editar" className="edit-btn">✏️</button>
                          <button onClick={() => handleDelete(suc.id)} title="Eliminar" className="delete-btn">🗑️</button>
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
        
        .btn-primary { background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; }
        .btn-secondary { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid var(--border); }
        
        .form-section { padding: 2rem; }
        .form-section h2 { margin-bottom: 2rem; font-size: 1.25rem; }
        .user-form { display: flex; flex-direction: column; gap: 2rem; }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label { font-size: 0.85rem; color: var(--text-secondary); }
        .form-group input, .form-group select { 
          background: rgba(15, 23, 42, 0.3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; color: white; font-family: inherit;
        }
        .form-group select:disabled { opacity: 0.5; cursor: not-allowed; }
        
        /* Hierarchy Section */
        .cascade-container { background: rgba(255, 255, 255, 0.02); padding: 1.5rem; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1); }
        .cascade-container h4 { margin: 0 0 1rem 0; font-size: 0.95rem; color: var(--text-primary); }
        .cascade-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }

        .accented-select { border-color: rgba(59, 130, 246, 0.5) !important; background: rgba(59, 130, 246, 0.05) !important;}

        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid var(--border); padding-top: 2rem; }

        .users-table-container { overflow: hidden; }
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table th { padding: 1.25rem 1rem; color: var(--text-secondary); font-size: 0.85rem; text-align: left; border-bottom: 1px solid var(--border); }
        .users-table td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.5); }
        
        .node-detail { display: flex; flex-direction: column; gap: 0.2rem; }
        .sub-detail { font-size: 0.75rem; color: var(--text-secondary); }
        
        .bold { font-weight: 600; color: var(--text-primary); }
        .text-primary { color: var(--accent); }
        .font-mono { font-family: monospace; font-weight: 600;}
        
        .lic-badge { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; border: 1px solid rgba(59, 130, 246, 0.2); }

        .actions { display: flex; gap: 0.5rem; }
        .actions button { font-size: 1.1rem; padding: 0.5rem; border-radius: 6px; transition: all 0.2s; }
        .actions button:hover { background: rgba(255, 255, 255, 0.05); transform: translateY(-2px); }
        .edit-btn { color: var(--accent); }
        .delete-btn { color: var(--error); }
        .text-center { text-align: center; color: var(--text-secondary); padding: 3rem; }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
