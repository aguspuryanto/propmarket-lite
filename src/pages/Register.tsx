import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Building2, Info, ArrowLeft } from 'lucide-react';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Daftar - PropMart</title>
      </Helmet>
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div>
          <div className="flex justify-center mb-4">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mt-2 text-center text-4xl font-bold text-slate-900 font-serif tracking-tight">
            Daftar Agen
          </h2>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Pendaftaran Dinonaktifkan</h3>
              <p className="mt-1 text-sm text-blue-700">
                Pada mode demo ini, fitur pendaftaran akun baru dinonaktifkan. Silakan gunakan kredensial dummy yang tersedia di halaman login untuk mencoba aplikasi.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to="/login"
            className="w-full flex justify-center items-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
