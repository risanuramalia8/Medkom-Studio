import React from 'react';
import {
  BookOpen,
  MapPin,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  Award,
  Users,
  Building,
  GraduationCap,
  Heart,
  Share2,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (tab: 'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-left">
      
      {/* Top Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-500/30">
            <span>Jurusan Kesehatan Gigi</span>
            <span aria-hidden="true">·</span>
            <span>Poltekkes Kemenkes Palembang</span>
          </div>

          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white drop-shadow-xs">
            Tentang <span className="text-teal-300 font-black">Medkom Studio</span>
          </h1>

          <p className="text-teal-200 text-base sm:text-lg font-medium">
            Create. Communicate. Educate.
          </p>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Platform repository dan galeri media komunikasi kesehatan yang dikembangkan untuk mendokumentasikan, mengorganisir, dan mempublikasikan karya mahasiswa Jurusan Kesehatan Gigi Poltekkes Kemenkes Palembang.
          </p>
        </div>

        {/* Decorative graphic */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Philosophy & Background */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-xl text-slate-900">
            Mata Kuliah Media Komunikasi Kesehatan
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Platform ini dirancang untuk mendukung proses pembelajaran pada mata kuliah <strong>Media Komunikasi Kesehatan</strong>. Mahasiswa dilatih merancang pesan promotif dan preventif kesehatan gigi yang efektif untuk berbagai lapisan masyarakat sasaran — mulai dari anak usia dini, remaja, ibu hamil, hingga lansia.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Karya yang dibuat bukan sekadar tugas kuliah yang selesai lalu terlupakan, melainkan terdokumentasikan ke dalam bank data digital dan fisik yang dapat diakses lintas angkatan dan dimanfaatkan secara nyata.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-xl text-slate-900">
            Nilai Strategis Repositori
          </h2>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="text-teal-600 font-bold">✓</span>
              <span><strong>Pelestarian Portofolio:</strong> Menjaga karya mahasiswa agar tidak hilang saat pergantian semester dan kelulusan.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-teal-600 font-bold">✓</span>
              <span><strong>Kurasi Standar Mutu:</strong> Setiap karya melalui review dosen untuk memastikan kebenaran ilmiah pesan kesehatan gigi.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-teal-600 font-bold">✓</span>
              <span><strong>Pemanfaatan Pengabdian Masyarakat:</strong> Materi siap pakai untuk penyuluhan di Puskesmas, Posyandu, dan UKS sekolah.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Laboratorium & Kontak Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="font-display font-bold text-xl text-slate-900">
            Laboratorium & Kontak Pengelola
          </h2>
          <p className="text-xs text-slate-500">
            Informasi akses penyimpanan media fisik dan layanan peminjaman alat peraga
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Building className="w-4 h-4 text-teal-600" />
              <span>Lokasi Kampus & Lab</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Laboratorium Media Komunikasi Kesehatan Gigi</strong><br />
              Gedung Jurusan Kesehatan Gigi Lt. 2<br />
              Poltekkes Kemenkes Palembang<br />
              Jl. Sukabangun I Km. 6,5 Kel. Sukajaya, Palembang
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Mail className="w-4 h-4 text-sky-600" />
              <span>Kontak Admin & Kurasi</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Email Kurator:<br />
              <strong className="text-slate-800">medikom.gigi@poltekkespalembang.ac.id</strong><br />
              Telepon: (0711) 412586<br />
              WhatsApp Admin Lab: +62 812-7890-4421
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Jam Operasional Lab</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Senin – Kamis: 08.00 – 16.00 WIB<br />
              Jumat: 08.00 – 16.30 WIB<br />
              Sabtu & Minggu: Tutup (Layanan digital 24/7)
            </p>
          </div>

        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-teal-950 text-base">
            Siap Menemukan Media Edukasi Gigi?
          </h3>
          <p className="text-xs text-teal-800">
            Jelajahi ratusan materi poster, lembar balik, video, dan boardgame karya mahasiswa.
          </p>
        </div>

        <button
          onClick={() => onNavigate('jelajahi')}
          className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
        >
          Mulai Jelajahi Media
        </button>
      </div>

    </div>
  );
};
