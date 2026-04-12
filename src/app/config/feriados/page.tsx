'use client';

import { useState, useEffect } from 'react';
import '@/app/globals.css';

interface Holiday {
  id: string;
  date: string;
  description: string;
}

export default function FeriadosPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState({ date: '', description: '' });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/config/feriados');
      const data = await res.json();
      if (Array.isArray(data)) setHolidays(data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setFormData({
      date: holiday.date.split('T')[0],
      description: holiday.description
    });
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingHoliday(null);
    setFormData({ date: '', description: '' });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingHoliday ? 'PUT' : 'POST';
    const url = editingHoliday ? `/api/config/feriados/${editingHoliday.id}` : '/api/config/feriados';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsFormOpen(false);
        fetchHolidays();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar feriado');
      }
    } catch (error) {
      console.error('Error saving holiday:', error);
    }
  };

  const deleteHoliday = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este feriado?')) return;
    try {
      const res = await fetch(`/api/config/feriados/${id}`, { method: 'DELETE' });
      if (res.ok) fetchHolidays();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Gestión de Feriados</h1>
          <p className="subtitle">Configura los días feriados del año para la lógica del sistema</p>
        </div>
        {!isFormOpen && <button className="btn-primary" onClick={handleCreate}>+ Agregar Feriado</button>}
      </header>

      {isFormOpen && (
        <section className="form-section glass-panel">
          <h3>{editingHoliday ? 'Editar Feriado' : 'Nuevo Feriado'}</h3>
          <form onSubmit={handleSubmit} className="horizontal-form">
            <div className="form-group">
              <label>Fecha</label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group flex-1">
              <label>Descripción</label>
              <input 
                type="text" 
                placeholder="Ej: Año Nuevo"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>
            <div className="form-actions-inline">
              <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
              <button type="submit" className="btn-primary">{editingHoliday ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </form>
        </section>
      )}

      <section className="list-section glass-panel">
        <div className="table-responsive">
          <table className="holidays-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center">Cargando feriados...</td></tr>
              ) : holidays.length === 0 ? (
                <tr><td colSpan={3} className="text-center">No hay feriados registrados</td></tr>
              ) : (
                holidays.map(h => (
                  <tr key={h.id}>
                    <td className="date-cell">{new Date(h.date).toLocaleDateString('es-CL', { timeZone: 'UTC' })}</td>
                    <td className="bold">{h.description}</td>
                    <td className="text-right actions-cell">
                      <button onClick={() => handleEdit(h)} className="edit-btn">✏️</button>
                      <button onClick={() => deleteHoliday(h.id)} className="delete-btn">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .admin-page { display: flex; flex-direction: column; gap: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .page-header h1 { font-size: 1.75rem; font-weight: 700; }
        .subtitle { color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem; }

        .btn-primary { background: var(--accent); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; }
        .btn-secondary { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); padding: 0.75rem 1.5rem; border-radius: 8px; border: 1px solid var(--border); }

        .form-section { padding: 1.5rem; margin-bottom: 2rem; border: 1px solid var(--accent); }
        .form-section h3 { font-size: 1rem; margin-bottom: 1rem; color: var(--text-primary); }
        .horizontal-form { display: flex; gap: 1.5rem; align-items: flex-end; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.8rem; color: var(--text-secondary); }
        .form-group input { 
          background: rgba(15, 23, 42, 0.3); border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem; color: white; font-family: inherit;
        }
        .flex-1 { flex: 1; }
        .form-actions-inline { display: flex; gap: 0.75rem; }

        .list-section { padding: 1rem; }
        .holidays-table { width: 100%; border-collapse: collapse; }
        .holidays-table th { padding: 1rem; color: var(--text-secondary); font-size: 0.8rem; text-align: left; border-bottom: 1px solid var(--border); }
        .holidays-table td { padding: 1.25rem 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.4); }
        
        .date-cell { width: 150px; font-variant-numeric: tabular-nums; color: var(--accent); font-weight: 600; }
        .bold { color: var(--text-primary); }
        .text-right { text-align: right; }
        .actions-cell { display: flex; justify-content: flex-end; gap: 0.5rem; }
        
        .edit-btn, .delete-btn { font-size: 1.1rem; padding: 0.4rem; border-radius: 6px; transition: all 0.2s; }
        .edit-btn { color: var(--accent); }
        .edit-btn:hover { background: rgba(59, 130, 246, 0.1); }
        .delete-btn { color: var(--error); }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.1); }

        .text-center { text-align: center; color: var(--text-secondary); padding: 5rem; }

        @media (max-width: 768px) {
          .horizontal-form { flex-direction: column; align-items: stretch; }
          .form-actions-inline { justify-content: flex-end; }
        }
      `}</style>
    </div>
  );
}
