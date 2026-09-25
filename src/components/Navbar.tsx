import React, { useState } from 'react';
import { Search, User as UserIcon, LogOut, ShieldAlert, PlusCircle } from 'lucide-react';
import { User } from '../types/database';

interface NavbarProps {
  activeTab: 'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin';
  onNavigate: (tab: 'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin') => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSearch: () => void;
}

const getInitials = (name: string): string => {
  if (!name) return 'U';
  const clean = name
    .replace(/\b(drg|dr|ns|prof|ir|apt|s\.st|m\.kes|m\.pd|s\.pd|s\.tr\.tg|s\.ked)\b\.?/gi, '')
    .trim();
  const words = (clean || name).trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0] || name).slice(0, 2).toUpperCase();
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenSearch,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#3270c4] text-white shadow-md border-b border-[#265cb0]">
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-12 h-18 flex items-center justify-between">
        
        {/* Zone 1: Official Brand Logo */}
        <button
          onClick={() => onNavigate('beranda')}
          className="text-left flex items-center hover:opacity-95 transition-opacity py-1"
          aria-label="Medkom Studio Beranda"
        >
          <div className="bg-white/95 hover:bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-white/20 transition-all flex items-center">
            <img
              src="/logomedkomstudio.png"
              alt="Medkom Studio"
              className="h-7 sm:h-8 md:h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </button>

        {/* Zone 2: 4 nav links strictly text with subtle hover underlines */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3 text-sm font-semibold">
          <button
            onClick={() => onNavigate('beranda')}
            className={`whitespace-nowrap px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'beranda'
                ? 'text-white bg-white/20 font-bold shadow-xs'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onNavigate('jelajahi')}
            className={`whitespace-nowrap px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'jelajahi'
                ? 'text-white bg-white/20 font-bold shadow-xs'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            Jelajahi Media
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className={`whitespace-nowrap px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'text-white bg-white/20 font-bold shadow-xs'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-blue-200" />
            <span>Upload Karya</span>
          </button>
          <button
            onClick={() => onNavigate('tentang')}
            className={`whitespace-nowrap px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'tentang'
                ? 'text-white bg-white/20 font-bold shadow-xs'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            Tentang
          </button>
          {currentUser?.role === 'superadmin' && (
            <button
              onClick={() => onNavigate('dashboard-admin')}
              className={`whitespace-nowrap px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 font-bold ring-1 ${
                activeTab === 'dashboard-admin'
                  ? 'text-slate-950 bg-amber-400 ring-amber-300 shadow-md scale-102'
                  : 'text-amber-200 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 ring-amber-400/40'
              }`}
              title="Masuk ke Halaman Backend Super Admin"
            >
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>Halaman Backend</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Search + Login / Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="p-2.5 text-blue-100 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
            title="Cari media..."
            aria-label="Cari media"
          >
            <Search className="w-5 h-5" />
          </button>

          {!currentUser ? (
            <button
              onClick={onOpenLogin}
              className="px-5 py-2 text-sm font-bold text-[#265cb0] bg-white rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow-sm whitespace-nowrap"
            >
              Login
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 transition-colors text-white"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#3270c4] flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {getInitials(currentUser.name)}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="font-semibold text-white text-sm max-w-[140px] truncate">{currentUser.name}</p>
                  <p className="text-xs text-blue-200 capitalize">{currentUser.role === 'admin' ? 'Dosen Kurator' : currentUser.role}</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3270c4] text-white flex items-center justify-center font-bold text-sm uppercase ring-2 ring-[#3270c4]/20 select-none shrink-0 shadow-xs">
                      {getInitials(currentUser.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-0.5 text-xs font-medium uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {currentUser.role === 'superadmin' ? 'Super Administrator' : currentUser.role === 'admin' ? 'Administrator' : 'Mahasiswa'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    {currentUser.role === 'superadmin' && (
                      <button
                        onClick={() => onNavigate('dashboard-admin')}
                        className="w-full text-left px-4 py-2.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold flex items-center gap-2 border-b border-amber-200/50"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Halaman Backend Super Admin</span>
                      </button>
                    )}

                    {currentUser.role === 'mahasiswa' && (
                      <button
                        onClick={() => onNavigate('dashboard-mhs')}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-teal-600" />
                        <span>Dashboard Karya Saya</span>
                      </button>
                    )}

                    <button
                      onClick={() => onNavigate('upload')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4 text-teal-600" />
                      <span>Upload Karya Baru</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={onOpenLogin}
                      className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Kelola Sesi Akun</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-white/20 py-2.5 px-3 text-xs bg-[#265cb0] text-blue-100">
        <button
          onClick={() => onNavigate('beranda')}
          className={`px-2.5 py-1 font-semibold rounded-md ${
            activeTab === 'beranda' ? 'text-white bg-white/20 font-bold' : 'text-blue-100 hover:text-white'
          }`}
        >
          Beranda
        </button>
        <button
          onClick={() => onNavigate('jelajahi')}
          className={`px-2.5 py-1 font-semibold rounded-md ${
            activeTab === 'jelajahi' ? 'text-white bg-white/20 font-bold' : 'text-blue-100 hover:text-white'
          }`}
        >
          Jelajahi
        </button>
        <button
          onClick={() => onNavigate('upload')}
          className={`px-2.5 py-1 font-semibold rounded-md ${
            activeTab === 'upload' ? 'text-white bg-white/20 font-bold' : 'text-blue-100 hover:text-white'
          }`}
        >
          Upload
        </button>
        {currentUser?.role === 'superadmin' && (
          <button
            onClick={() => onNavigate('dashboard-admin')}
            className={`px-2.5 py-1 font-bold rounded-md flex items-center gap-1 ${
              activeTab === 'dashboard-admin' ? 'text-slate-900 bg-amber-400 font-extrabold' : 'text-amber-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Backend</span>
          </button>
        )}
      </div>
    </header>
  );
};
