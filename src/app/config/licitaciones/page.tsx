'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import '@/app/globals.css';

interface Licitacion {
  id: string;
  code: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
}

export default function LicitacionesPage() {
  const { data: session } = useSession();
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Licitacion | null>(null);

  const canWrite = session?.user?.profile === 'Administrador' || session?.user?.canWrite;

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchLicitaciones();
  }, []);

  const fetchLicitaciones = async () => {
    try {
      const res = await fetch('/api/config/licitaciones');
      const data = await res.json();
      if (Array.isArray(data)) setLicitaciones(data);
    } catch (error) {
      console.error('Error fetching licitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Licitacion) => {
    if (!canWrite) return;
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || '',
      startDate: item.startDate.split('T')[0],
      endDate: item.endDate.split('T')[0],
    });
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) return;

    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem ? `/api/config/licitaciones/${editingItem.id}` : '/api/config/licitaciones';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchLicitaciones();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar licitación');
      }
    } catch (error) {
      console.error('Error saving licitacion:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canWrite) return;
    if (!confirm('¿Está seguro de eliminar esta licitación?')) return;

    try {
      const res = await fetch(`/api/config/licitaciones/${id}`, { method: 'DELETE' });
      if (res.ok) fetchLicitaciones();
    } catch (error) {
      console.error('Error deleting licitacion:', error);
    }
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Gestión de Licitaciones</h1>
          <p className="subtitle">Configura los periodos y códigos de los procesos licitatorios</p>
        </div>
        {canWrite && !isFormOpen && (
          <button className="btn-primary" onClick={handleCreate}>+ Nueva Licitación</button>
        )}
      </header>

      {isFormOpen ? (
        <section className="form-section glass-panel">
          <h2>{editingItem ? 'Editar Licitación' : 'Nueva Licitación'}</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Código de Licitación</label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  placeholder="Ej: LICI-2024-001"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Nombre de la Licitación</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Suministro Logístico Zona Sur"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input 
                  type="date" 
                  value={formData.startDate} 
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha de Término</label>
                <input 
                  type="date" 
                  value={formData.endDate} 
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
              <div className="form-group full-width">
                <label>Descripción / Observaciones</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detalles adicionales del proceso..."
                  rows={3}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">Guardar Licitación</button>
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
                  <th>Nombre</th>
                  <th>Inicio</th>
                  <th>Término</th>
                  <th>Estado</th>
                  {canWrite && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center">Cargando...</td></tr>
                ) : licitaciones.length === 0 ? (
                  <tr><td colSpan={6} className="text-center">No hay licitaciones registradas</td></tr>
                ) : (
                  licitaciones.map(item => {
                    const now = new Date();
                    const end = new Date(item.endDate);
                    const isExpired = end < now;
                    return (
                      <tr key={item.id}>
                        <td className="bold">{item.code}</td>
                        <td className="text-primary">{item.name}</td>
                        <td>{new Date(item.startDate).toLocaleDateString()}</td>
                        <td>{new Date(item.endDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${isExpired ? 'locked' : 'active'}`}>
                            {isExpired ? 'Vencida' : 'Vigente'}
                          </span>
                        </td>
                        {canWrite && (
                          <td className="actions">
                            <button onClick={() => handleEdit(item)} title="Editar" className="edit-btn">✏️</button>
                            <button onClick={() => handleDelete(item.id)} title="Eliminar" className="delete-btn">🗑️</button>
                          </td>
                        )}
                      </tr>
                    )
                  })
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
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label { font-size: 0.85rem; color: var(--text-secondary); }
        .form-group input, .form-group textarea { 
          background: rgba(15, 23, 42, 0.3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; color: white; font-family: inherit;
        }
        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid var(--border); padding-top: 2rem; }

        .users-table-container { overflow: hidden; }
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table th { padding: 1.25rem 1rem; color: var(--text-secondary); font-size: 0.85rem; text-align: left; border-bottom: 1px solid var(--border); }
        .users-table td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.5); }
        .bold { font-weight: 600; color: var(--text-primary); }
        .text-primary { color: var(--accent); }
        .badge { padding: 0.25rem 0.6rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
        .badge.active { background: rgba(34, 197, 94, 0.1); color: var(--success); }
        .badge.locked { background: rgba(239, 68, 68, 0.1); color: var(--error); }
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
