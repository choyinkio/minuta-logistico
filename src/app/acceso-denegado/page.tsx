'use client';

import Link from 'next/link';

export default function AccesoDenegado() {
  return (
    <div className="denied-container">
      <div className="glass-panel content">
        <div className="icon">🛡️</div>
        <h1>Acceso Denegado</h1>
        <p>No tienes los permisos necesarios para acceder a esta sección.</p>
        <Link href="/dashboard" className="btn-primary">Volver al Dashboard</Link>
      </div>

      <style jsx>{`
        .denied-container {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          color: white;
        }
        .content {
          padding: 3rem;
          text-align: center;
          max-width: 500px;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .icon { font-size: 4rem; margin-bottom: 1.5rem; }
        h1 { font-size: 2rem; margin-bottom: 1rem; color: #ef4444; }
        p { color: #94a3b8; margin-bottom: 2rem; }
        .btn-primary {
          background: var(--accent);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
