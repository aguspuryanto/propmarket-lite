import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { Building2, LogIn, AlertCircle, Info } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginAsDummy } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (email === 'agent@propmart.dummy' && password === 'password') {
        await loginAsDummy('agent');
        navigate(from, { replace: true });
      } else if (email === 'admin@propmart.dummy' && password === 'password') {
        await loginAsDummy('admin');
        navigate(from, { replace: true });
      } else {
        setError('Email atau password salah. Silakan gunakan kredensial dummy.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDummyAgentLogin = () => {
    setEmail('agent@propmart.dummy');
    setPassword('password');
  };

  const handleDummyAdminLogin = () => {
    setEmail('admin@propmart.dummy');
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Masuk - PropMart</title>
      </Helmet>
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div>
          <div className="flex justify-center mb-4">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-2 text-center text-4xl font-bold text-slate-900 font-serif tracking-tight">
            PropMart
          </h2>
          <p className="mt-4 text-center text-sm text-slate-600">
            Masuk ke akun Anda atau{' '}
            <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors">
              daftar agen baru
            </Link>
          </p>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Mode Demo Aktif</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Gunakan kredensial berikut untuk login:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    <button type="button" onClick={handleDummyAgentLogin} className="font-mono bg-blue-100 px-1 rounded hover:bg-blue-200 transition-colors">agent@propmart.dummy</button> / <span className="font-mono">password</span> (Agen)
                  </li>
                  <li>
                    <button type="button" onClick={handleDummyAdminLogin} className="font-mono bg-blue-100 px-1 rounded hover:bg-blue-200 transition-colors">admin@propmart.dummy</button> / <span className="font-mono">password</span> (Admin)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">Alamat Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent sm:text-sm transition-all shadow-sm"
                placeholder="Alamat Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent sm:text-sm transition-all shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Masuk
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
