'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import '@/app/globals.css';

export default function NavBar() {
  const { data: session } = useSession();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = session?.user?.profile === "Administrador";

  return (
    <nav className="navbar glass-panel">
      <div className="nav-container">
        <Link href="/" className="logo">Minuta Logístico</Link>
        
        <button 
          className="mobile-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}
          </svg>
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link href="/dashboard" className="nav-item">Inicio</Link>
          
          {isAdmin && (
            <div 
              className="nav-item dropdown"
              onMouseEnter={() => setIsConfigOpen(true)}
              onMouseLeave={() => setIsConfigOpen(false)}
              onClick={() => setIsConfigOpen(!isConfigOpen)}
            >
              <span className="dropdown-trigger">
                Configuración
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  className={isConfigOpen ? 'rotate' : ''}
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </span>
              
              {isConfigOpen && (
                <div className="dropdown-menu glass-panel">
                  <Link href="/config/usuarios" className="dropdown-item">Usuarios</Link>
                  <Link href="/config/perfiles" className="dropdown-item">Perfiles y Roles</Link>
                  <Link href="/config/logs" className="dropdown-item">Logs del Sistema</Link>
                </div>
              )}
            </div>
          )}
          
          {session ? (
            <div className="user-profile">
              <div className="user-info">
                <span className="username">{session.user.name}</span>
                <span className="profile-label">{session.user.profile}</span>
              </div>
              <div className="avatar">{session.user.name?.[0]?.toUpperCase()}</div>
              <button onClick={() => signOut()} className="logout-btn">Salir</button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary">Iniciar Sesión</Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: sticky;
          top: 1rem;
          margin: 0 1rem;
          padding: 0.75rem 1.5rem;
          z-index: 100;
        }
        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .logo {
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--accent);
          letter-spacing: -0.5px;
        }
        .mobile-toggle {
          display: none;
          color: var(--text-primary);
        }
        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        @media (max-width: 768px) {
          .mobile-toggle {
            display: block;
          }
          .nav-links {
            display: none;
            position: absolute;
            top: calc(100% + 1rem);
            left: 0;
            right: 0;
            flex-direction: column;
            background: var(--bg-color);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid var(--border);
            gap: 1.5rem;
          }
          .nav-links.mobile-open {
            display: flex;
          }
          .dropdown-menu {
            position: static;
            background: rgba(15, 23, 42, 0.5);
            margin-top: 0.5rem;
          }
          .user-profile {
            border-left: none;
            border-top: 1px solid var(--border);
            padding-top: 1rem;
            width: 100%;
            justify-content: center;
          }
        }
        /* ... existing desktop styles ... */
        .nav-item {
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.2s;
          cursor: pointer;
        }
        .nav-item:hover { color: var(--text-primary); }
        .dropdown { position: relative; }
        .dropdown-trigger { display: flex; align-items: center; gap: 0.5rem; }
        .dropdown-trigger svg { transition: transform 0.2s; }
        .dropdown-trigger svg.rotate { transform: rotate(180deg); }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          min-width: 200px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
        }
        .dropdown-item {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }
        .dropdown-item:hover { background: rgba(59, 130, 246, 0.1); color: var(--accent); }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-left: 1rem;
          border-left: 1px solid var(--border);
        }
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .username {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .profile-label {
          font-size: 0.7rem;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .avatar {
          width: 32px;
          height: 32px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.85rem;
          color: white;
        }
        .logout-btn {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-left: 0.5rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          color: var(--error);
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }
        @media (max-width: 768px) {
          .user-info { align-items: center; }
          .logout-btn { margin-left: 0; margin-top: 0.5rem; }
        }
      `}</style>
    </nav>
  );
}
