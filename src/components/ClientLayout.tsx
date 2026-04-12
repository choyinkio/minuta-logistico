'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Providers } from "@/components/Providers";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <Providers>
      {!isLoginPage && <Sidebar />}
      <div className={`main-wrapper ${isLoginPage ? 'full-width' : ''}`}>
        {!isLoginPage && <Header />}
        <main className="content">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-color);
        }
        .main-wrapper {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          padding: 2rem;
          transition: all 0.3s ease;
        }
        .main-wrapper.full-width {
          margin-left: 0;
          padding: 0;
        }
        @media (max-width: 768px) {
          .main-wrapper {
            margin-left: 0;
            padding: 1rem;
          }
        }
      `}</style>
    </Providers>
  );
}
