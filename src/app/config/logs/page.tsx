'use client';

import { useState, useEffect } from 'react';
import '@/app/globals.css';

interface Log {
  id: string;
  action: string;
  username: string | null;
  description: string;
  createdAt: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/config/logs');
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, string> = {
      'USER_CREATE': 'success',
      'USER_EDIT': 'accent',
      'USER_LOCKED': 'error',
      'USER_DELETE': 'error',
      'LOGIN': 'active'
    };
    return actionMap[action] || 'secondary';
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Logs del Sistema</h1>
          <p className="subtitle">Historial detallado de todas las acciones y comportamientos en la plataforma</p>
        </div>
        <button className="btn-secondary" onClick={fetchLogs}>Refrescar</button>
      </header>

      <section className="logs-container glass-panel">
        <div className="table-responsive">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Acción</th>
                <th>Usuario Responsable</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center">Cargando historial...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="text-center">No hay registros de actividad</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td className="date-cell">
                      {new Date(log.createdAt).toLocaleString('es-CL')}
                    </td>
                    <td>
                      <span className={`badge ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="bold">{log.username || 'Sistema'}</td>
                    <td className="desc-cell">{log.description}</td>
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

        .btn-secondary { 
          background: rgba(255, 255, 255, 0.05); 
          color: var(--text-secondary); 
          padding: 0.6rem 1.2rem; 
          border-radius: 8px; 
          border: 1px solid var(--border);
          font-weight: 500;
        }

        .logs-container { overflow: hidden; }
        .logs-table { width: 100%; border-collapse: collapse; }
        .logs-table th { padding: 1.25rem 1rem; color: var(--text-secondary); font-size: 0.85rem; text-align: left; border-bottom: 1px solid var(--border); }
        .logs-table td { padding: 1rem; border-bottom: 1px solid rgba(51, 65, 85, 0.4); font-size: 0.9rem; }
        
        .date-cell { color: var(--text-secondary); font-variant-numeric: tabular-nums; width: 180px; }
        .bold { font-weight: 600; color: var(--text-primary); }
        .desc-cell { color: var(--text-secondary); }

        .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.5px; }
        .badge.active { background: rgba(34, 197, 94, 0.1); color: var(--success); }
        .badge.error { background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .badge.accent { background: rgba(59, 130, 246, 0.1); color: var(--accent); }
        .badge.success { background: rgba(34, 197, 94, 0.1); color: var(--success); }
        .badge.secondary { background: rgba(148, 163, 184, 0.1); color: var(--text-secondary); }

        .text-center { text-align: center; color: var(--text-secondary); padding: 5rem; }
        
        @media (max-width: 768px) {
          .date-cell { width: auto; font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
}
