'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

// Icon Renderer for dynamic SVGs
const IconRenderer = ({ iconName, className }: { iconName: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'LayoutDashboard': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
    'Users': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    'ShieldCheck': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
    'Activity': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    'CalendarDays': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" />
      </svg>
    ),
    'Lock': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    'Key': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21 2-2 2" /><circle cx="10" cy="14" r="5" /><path d="M12 12 21 3" /><path d="m16 8 2 2" /><path d="m19 5 2 2" />
      </svg>
    ),
    'UserPlus': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="16" x2="22" y1="11" y2="11" />
      </svg>
    ),
    'FileText': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" />
      </svg>
    ),
    'Settings': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    'Logout': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
      </svg>
    ),
    'MapPinned': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
        <circle cx="12" cy="8" r="2" />
        <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712" />
      </svg>
    ),
    'Building2': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
      </svg>
    ),
    'FileSignature': (
      <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5" />
        <path d="M8 18h1" />
        <path d="M18.42 9.61a2.1 2.1 0 1 1 2.97 2.97L16.95 17 13 18l.99-3.95 4.43-4.44Z" />
      </svg>
    )
  };
  
  // Fallback icon (Generic circle/clock) but with correct scale
  const FallbackIcon = (
    <svg className={className} style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );

  return icons[iconName] || FallbackIcon;
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isConfigOpen, setIsConfigOpen] = useState(pathname.startsWith('/config'));
  const [permittedMenus, setPermittedMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper for static sub-menu icons based on path
  const getSubMenuIcon = (path: string) => {
    if (path.includes('usuarios')) return 'UserPlus';
    if (path.includes('perfiles')) return 'ShieldCheck';
    if (path.includes('roles')) return 'Key';
    if (path.includes('logs')) return 'FileText';
    if (path.includes('feriados')) return 'CalendarDays';
    if (path.includes('licitaciones')) return 'FileSignature';
    if (path.includes('zonas')) return 'MapPinned';
    if (path.includes('sucursales')) return 'Building2';
    return '';
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch('/api/auth/menu');
      const data = await res.json();
      if (Array.isArray(data)) setPermittedMenus(data);
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const mainItems = permittedMenus.filter(m => m.category === 'main');
  const configItems = permittedMenus.filter(m => m.category === 'config');

  return (
    <aside className="sidebar">
      <div className="sidebar-container glass-panel">
        <div className="sidebar-header">
          <Link href="/" className="logo-container">
            <div className="logo-icon">M</div>
            <span className="logo-text">Minuta Logístico</span>
          </Link>
        </div>

        <nav className="sidebar-nav custom-scrollbar">
          {loading ? (
            <div className="skeleton-container">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-item" />)}
            </div>
          ) : (
            <>
              <div className="nav-label">General</div>
              {mainItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`nav-link ${pathname === item.path ? 'active' : ''}`}
                >
                  <IconRenderer iconName={item.icon || ''} className="nav-icon" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {configItems.length > 0 && (
                <div className="nav-group">
                  <button 
                    className={`nav-link group-trigger ${isConfigOpen ? 'open' : ''}`} 
                    onClick={() => setIsConfigOpen(!isConfigOpen)}
                  >
                    <IconRenderer iconName="Settings" className="nav-icon" />
                    <span>Configuración</span>
                    <svg 
                      className={`chevron ${isConfigOpen ? 'rotate' : ''}`} 
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>

                  <div className={`sub-menu-container ${isConfigOpen ? 'expanded' : ''}`}>
                    <div className="sub-menu">
                      {configItems.map((item) => (
                        <Link 
                          key={item.path} 
                          href={item.path} 
                          className={`sub-link ${pathname === item.path ? 'active' : ''}`}
                        >
                          <IconRenderer iconName={getSubMenuIcon(item.path)} className="sub-nav-icon" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
              <div className="status-indicator" />
            </div>
            <div className="user-info">
              <span className="user-name">{session?.user?.name}</span>
              <span className="user-role">{session?.user?.profile || 'Usuario'}</span>
            </div>
            <button className="logout-button" onClick={() => signOut()} title="Cerrar Sesión">
              <IconRenderer iconName="Logout" className="logout-icon" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          padding: 1rem;
          z-index: 1000;
        }

        .sidebar-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--accent) 0%, #6366f1 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          font-size: 1.1rem;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
        }

        .logo-text {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
        }

        .nav-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 1rem 0.75rem 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          color: #94a3b8;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.95rem;
          text-decoration: none;
          position: relative;
        }

        .nav-link:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }

        .nav-link.active {
          color: #fff;
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 100%);
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          height: 60%;
          width: 3px;
          background: var(--accent);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px var(--accent);
        }

        .nav-icon {
          width: 1rem;
          height: 1rem;
          min-width: 1rem;
          min-height: 1rem;
          transition: transform 0.3s ease;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-link.active .nav-icon {
          color: var(--accent);
        }

        .sub-nav-icon {
          width: 0.85rem;
          height: 0.85rem;
          min-width: 0.85rem;
          min-height: 0.85rem;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .sub-link:hover .sub-nav-icon {
          color: #fff;
          transform: scale(1.1);
        }

        .sub-link.active .sub-nav-icon {
          color: var(--accent);
        }

        .group-trigger {
          width: 100%;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }

        .chevron {
          margin-left: auto;
          transition: transform 0.3s ease;
          opacity: 0.5;
        }

        .chevron.rotate {
          transform: rotate(180deg);
          opacity: 1;
        }

        .sub-menu-container {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s ease;
        }

        .sub-menu-container.expanded {
          grid-template-rows: 1fr;
        }

        .sub-menu {
          overflow: hidden;
          margin-left: 1.5rem;
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          padding-left: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sub-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          color: #64748b;
          font-size: 0.9rem;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .sub-link:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
          padding-left: 1.25rem;
        }

        .sub-link.active {
          color: var(--accent);
          font-weight: 600;
        }

        .sidebar-footer {
          padding: 1.25rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .status-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #22c55e;
          border: 2px solid #0f172a;
          border-radius: 50%;
        }

        .user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .user-role {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: capitalize;
        }

        .logout-button {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .logout-button:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .logout-icon {
          width: 18px;
          height: 18px;
        }

        .skeleton-container {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .skeleton-item {
          height: 40px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </aside>
  );
}
