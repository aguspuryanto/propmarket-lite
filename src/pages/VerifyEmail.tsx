import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function VerifyEmail() {
  const [status, setStatus] = useState('Memverifikasi link...');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifySignInLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          // User opened the link on a different device. Prompt for email.
          email = window.prompt('Silakan masukkan email Anda untuk konfirmasi');
        }

        if (email) {
          try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            
            const user = result.user;
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
              // New user registration
              const name = window.localStorage.getItem('registrationName') || 'Agen Baru';
              const phone = window.localStorage.getItem('registrationPhone') || '';
              
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: name,
                phone: phone,
                role: 'agent',
                propertiesSold: 0,
                commissionTier: 1.5,
                createdAt: new Date()
              });
              
              window.localStorage.removeItem('registrationName');
              window.localStorage.removeItem('registrationPhone');
            }

            setStatus('Verifikasi berhasil! Mengalihkan...');
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } catch (err: any) {
            setError(err.message || 'Gagal memverifikasi link.');
          }
        } else {
          setError('Email diperlukan untuk verifikasi.');
        }
      } else {
        setError('Link tidak valid atau sudah kadaluarsa.');
      }
    };

    verifySignInLink();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Verifikasi - PropMart</title>
      </Helmet>
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
        <h2 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Verifikasi Login</h2>
        {error ? (
          <div className="text-red-500 mt-4 bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>
        ) : (
          <div className="text-slate-600 mt-4 flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 mb-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-medium">{status}</p>
          </div>
        )}
        {error && (
          <button
            onClick={() => navigate('/login')}
            className="mt-6 inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Kembali ke Login
          </button>
        )}
      </div>
    </div>
  );
}
