import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { loginAsDummy } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Link OTP telah dikirim ke email Anda. Silakan cek inbox atau folder spam.');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengirim email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Masuk - PropMart</title>
      </Helmet>
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div>
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
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-xl shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Alamat Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent sm:text-sm transition-all"
                placeholder="Alamat Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
          {message && <div className="text-emerald-700 text-sm text-center font-medium p-4 bg-emerald-50 rounded-xl border border-emerald-100">{message}</div>}

          <div>
            <button
              type="submit"
              disabled={loading || !!message}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Masuk'}
            </button>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium uppercase tracking-wider text-xs">Mode Development</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={async () => {
                  await loginAsDummy();
                  navigate('/');
                }}
                className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all"
              >
                Login sebagai Dummy (Bypass)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
