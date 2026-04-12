'use client';

import { useSession } from "next-auth/react";
import '@/app/globals.css';

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="dashboard-container">
      <div className="welcome-section glass-panel">
        <h1>Bienvenido, {session?.user?.name || 'Usuario'}</h1>
        <p>Has iniciado sesión como <strong>{session?.user?.profile}</strong></p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <h3>Estado de Cuenta</h3>
          <p className="status active">Activa</p>
        </div>
        <div className="stat-card glass-panel">
          <h3>Próxima Expiración</h3>
          <p>31/12/2026</p>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-top: 1rem;
        }
        .welcome-section {
          padding: 3rem;
          text-align: center;
        }
        .welcome-section h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .stat-card {
          padding: 2rem;
          text-align: center;
        }
        .stat-card h3 {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        .stat-card p {
          font-size: 1.5rem;
          font-weight: 600;
        }
        .status.active {
          color: var(--success);
        }
      `}</style>
    </div>
  );
}
