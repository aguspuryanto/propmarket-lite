import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Building, Users, BarChart2, LogOut, Menu, X } from 'lucide-react';

export default function Layout() {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Properti', href: '/properties', icon: Building },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Laporan', href: '/reports', icon: BarChart2 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <span className="text-xl font-bold font-serif tracking-wide">PropMart</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 z-20
        absolute md:relative min-h-screen md:min-h-0 transition-all duration-300 ease-in-out
      `}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex items-center justify-center h-20 bg-slate-900 text-white">
            <span className="text-2xl font-bold font-serif tracking-wider">PropMart</span>
          </div>
          
          <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Login sebagai:</p>
            <p className="font-semibold text-slate-900 truncate">{profile?.name || 'Agen'}</p>
            <p className="text-sm text-slate-500 truncate">{profile?.email}</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                               (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-red-400 group-hover:text-red-500 transition-colors duration-200" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
