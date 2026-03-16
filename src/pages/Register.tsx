import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
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
      
      // Save data to localStorage to use after verification
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('registrationName', name);
      window.localStorage.setItem('registrationPhone', phone);

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
        <title>Daftar - PropMart</title>
      </Helmet>
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-4xl font-bold text-slate-900 font-serif tracking-tight">
            Daftar Agen
          </h2>
          <p className="mt-4 text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-xl shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1 ml-1">Nama Lengkap</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent sm:text-sm transition-all"
                placeholder="Masukkan nama lengkap Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1 ml-1">Alamat Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent sm:text-sm transition-all"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1 ml-1">Nomor HP / WhatsApp</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent sm:text-sm transition-all"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
          {message && <div className="text-emerald-700 text-sm text-center font-medium p-4 bg-emerald-50 rounded-xl border border-emerald-100">{message}</div>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !!message}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {loading ? 'Mengirim...' : 'Daftar & Kirim OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
