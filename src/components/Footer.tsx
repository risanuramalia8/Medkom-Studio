import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';
import { User } from '../types/database';

interface FooterProps {
  onNavigate: (tab: 'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin') => void;
  currentUser?: User | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, currentUser }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-xs inline-flex items-center">
                <img
                  src="/logomedkomstudio.png"
                  alt="Medkom Studio"
                  className="h-7 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <p className="text-sm text-teal-400 font-medium tracking-wide">
              Create. Communicate. Educate.
            </p>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Platform repository, galeri, dan showcase media komunikasi kesehatan karya mahasiswa Jurusan Kesehatan Gigi Poltekkes Kemenkes Palembang pada mata kuliah Media Komunikasi Kesehatan.
            </p>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Dokumentasi Resmi Karya Akademik Lintas Angkatan</span>
            </div>
          </div>

          {/* Col 2: Navigasi */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('beranda')}
                  className="hover:text-teal-300 transition-colors text-slate-400"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('jelajahi')}
                  className="hover:text-teal-300 transition-colors text-slate-400"
                >
                  Jelajahi Media
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('upload')}
                  className="hover:text-teal-300 transition-colors text-slate-400"
                >
                  Upload Karya
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('tentang')}
                  className="hover:text-teal-300 transition-colors text-slate-400"
                >
                  Tentang Medkom Studio
                </button>
              </li>
              {currentUser?.role === 'superadmin' && (
                <li>
                  <button
                    onClick={() => onNavigate('dashboard-admin')}
                    className="hover:text-amber-300 transition-colors text-amber-400 font-semibold flex items-center gap-1"
                  >
                    <span>Panel Backend Super Admin</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Institusi & Kontak */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Institusi
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <p className="font-semibold text-slate-300">
                Jurusan Kesehatan Gigi
                <br />
                Poltekkes Kemenkes Palembang
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Jl. Sukabangun I Km. 6,5 Kel. Sukajaya, Palembang, Sumatera Selatan</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>medkom.gigi@poltekkespalembang.ac.id</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>(0711) 412586 / Lab Medkom Gigi</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()} Medkom Studio • Jurusan Kesehatan Gigi Poltekkes Kemenkes Palembang.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('tentang')}
              className="hover:text-slate-200 transition-colors"
            >
              Pedoman Media Edukasi
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onNavigate('dashboard-admin')}
              className="hover:text-teal-400 transition-colors text-xs"
            >
              Akses Kurator / Dosen
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
