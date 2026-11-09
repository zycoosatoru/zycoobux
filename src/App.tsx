import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { HomePage } from './pages/HomePage';
import { CheckOrderPage } from './pages/CheckOrderPage';
import { InvoicePage } from './pages/InvoicePage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  // Handle URL change
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Invoice route parsing: /invoice/:id
  const invoiceMatch = currentPath.match(/^\/invoice\/([A-Za-z0-9_]+)$/);
  const invoiceOrderId = invoiceMatch ? invoiceMatch[1] : null;

  const isAdminLoginRoute =
    currentPath === '/admin' ||
    currentPath === '/admin/' ||
    currentPath === '/admin/login' ||
    currentPath === '/admin/login/';

  const isAdminDashboardRoute =
    currentPath === '/admin/dashboard' || currentPath === '/admin/dashboard/';

  const isAdminRoute = isAdminLoginRoute || isAdminDashboardRoute;

  return (
    <div className="min-h-screen bg-[#09090D] text-[#E5E4E2] flex flex-col font-sans selection:bg-[#9B5CFF] selection:text-white">
      {/* Global Navbar (Only on Public Customer Store) */}
      {!isAdminRoute ? (
        <Navbar currentPath={currentPath} navigate={navigate} />
      ) : (
        <header className="bg-[#09090D] border-b border-white/5 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl p-[1.5px] bg-gradient-to-br from-white via-[#C0C0C0] to-[#71717A]">
              <div className="w-full h-full bg-[#09090D] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img src="/images/logo-zycoo.png" alt="ZYCOOBUX" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <span className="text-base font-black tracking-widest text-white">ZYCOOBUX</span>
              <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#9B5CFF]/20 text-[#9B5CFF] border border-[#9B5CFF]/30">
                Admin Portal
              </span>
            </div>
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
          >
            &larr; Buka Toko Publik
          </a>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentPath === '/' && <HomePage navigate={navigate} />}
        {currentPath === '/check-order' && <CheckOrderPage navigate={navigate} />}
        {invoiceOrderId && <InvoicePage orderId={invoiceOrderId} navigate={navigate} />}
        {isAdminLoginRoute && <AdminLoginPage navigate={navigate} />}
        {isAdminDashboardRoute && <AdminDashboardPage navigate={navigate} />}

        {/* 404 Fallback */}
        {currentPath !== '/' &&
          currentPath !== '/check-order' &&
          !invoiceOrderId &&
          !isAdminLoginRoute &&
          !isAdminDashboardRoute && (
            <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
              <h1 className="text-4xl font-black text-white">404 - Halaman Tidak Ditemukan</h1>
              <p className="text-sm text-[#A1A1AA]">
                Halaman yang Anda tuju tidak tersedia atau tautan telah berpindah.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#9B5CFF] to-[#368BFF] text-white font-bold text-xs uppercase"
              >
                Kembali ke Beranda
              </button>
            </div>
          )}
      </main>

      {/* Global Footer (Public Store vs Minimal Admin Footer) */}
      {!isAdminRoute ? (
        <Footer navigate={navigate} />
      ) : (
        <footer className="py-4 border-t border-white/5 text-center text-xs text-[#71717A]">
          <span>ZYCOOBUX Internal Admin Management Workspace &copy; {new Date().getFullYear()}</span>
        </footer>
      )}

      {/* Floating WhatsApp Support Widget (Only on Public Customer Store) */}
      {!isAdminRoute && <WhatsAppWidget />}
    </div>
  );
}
