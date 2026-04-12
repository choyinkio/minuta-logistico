'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function Header() {
  const pathname = usePathname();

  // Simple breadcrumbs logic
  const pathParts = pathname.split('/').filter(p => p);
  const breadcrumb = pathParts.length > 0 
    ? pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')).join(' / ')
    : 'Inicio';

  return (
    <header className="main-header glass-panel">
      <div className="breadcrumb">
        <span>{breadcrumb}</span>
      </div>

      <div className="header-actions">
        <button className="logout-btn" onClick={() => signOut()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Salir
        </button>
      </div>

      <style jsx>{`
        .main-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          margin-bottom: 2rem;
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        .breadcrumb {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .logout-btn:hover {
          background: var(--error);
          color: white;
          border-color: var(--error);
        }
      `}</style>
    </header>
  );
}
