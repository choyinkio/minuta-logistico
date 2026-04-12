'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Usuario o contraseña incorrectos');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Ocurrió un error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h1>Minuta Logístico</h1>
          <p>Bienvenido de nuevo, por favor inicia sesión</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="nombre.usuario"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 3rem 2rem;
          animation: fadeIn 0.5s ease-out;
        }
        @media (max-width: 480px) {
          .login-card {
            padding: 2rem 1.5rem;
            max-width: 90%;
          }
          .login-header h1 {
            font-size: 1.5rem;
          }
        }
        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .login-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          color: var(--accent);
        }
        .login-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .input-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .input-group input {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .input-group input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .error-message {
          color: var(--error);
          font-size: 0.85rem;
          text-align: center;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.75rem;
          border-radius: 6px;
        }
        .login-button {
          background: var(--accent);
          color: white;
          padding: 0.85rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          margin-top: 1rem;
          transition: filter 0.2s;
        }
        .login-button:hover {
          filter: brightness(1.1);
        }
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
