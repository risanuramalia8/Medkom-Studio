import React from 'react';
import {
  ArrowRight,
  Printer,
  Tv,
  Shapes,
  FolderPlus,
  BookOpen,
  Dice5,
  Play,
  FileText,
  UploadCloud,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { MediaItemPopulated, MediaType, User, HeroSlide } from '../types/database';
import { db } from '../services/relationalStore';
import { MediaCard } from '../components/MediaCard';
import { HeroSlider } from '../components/HeroSlider';

interface HomePageProps {
  onNavigate: (tab: 'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin') => void;
  onSelectCategory: (mediaTypeId: string) => void;
  onSelectMedia: (item: MediaItemPopulated) => void;
  onToggleAppreciation: (e: React.MouseEvent, id: string) => void;
  onDownload: (e: React.MouseEvent, item: MediaItemPopulated) => void;
  mediaTypes: MediaType[];
  publishedItems: MediaItemPopulated[];
  currentUser?: User | null;
  stats: {
    totalPublished: number;
    digitalCount: number;
    physicalCount: number;
    uniqueCreatorsCount: number;
  };
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectCategory,
  onSelectMedia,
  onToggleAppreciation,
  onDownload,
  mediaTypes,
  publishedItems,
  currentUser,
  stats,
}) => {
  const featuredItems = publishedItems.filter((i) => i.isFeatured);
  const latestItems = [...publishedItems]
    .sort((a, b) => new Date(b.publishedAt || b.uploadedAt).getTime() - new Date(a.publishedAt || a.uploadedAt).getTime())
    .slice(0, 4);

  const [heroSlides, setHeroSlides] = React.useState<HeroSlide[]>(() => db.getHeroSlides());

  React.useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setHeroSlides(db.getHeroSlides());
    });
    return unsubscribe;
  }, []);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Printer':
        return <Printer className="w-6 h-6 text-teal-600" />;
      case 'Tv':
        return <Tv className="w-6 h-6 text-sky-600" />;
      case 'Shapes':
        return <Shapes className="w-6 h-6 text-amber-600" />;
      default:
        return <FolderPlus className="w-6 h-6 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION: FULL-WIDTH LANDSCAPE HEADER SLIDER */}
      <section className="relative overflow-hidden border-b border-slate-200/90 shadow-xs">
        <HeroSlider
          slides={heroSlides}
          onNavigate={onNavigate}
          autoPlayIntervalMs={4000}
        >
          {/* Left Content Card - Position and text intact, with refined transparent frosted glass */}
          <div className="max-w-xl w-full bg-white/70 sm:bg-white/75 hover:bg-white/80 backdrop-blur-xl p-6 sm:p-8 lg:p-9 rounded-3xl border border-white/60 shadow-2xl space-y-5 text-left transition-all">
            {/* Institutional Trust Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-950 tracking-wide bg-teal-100/80 border border-teal-300/80 px-3.5 py-1.5 rounded-full shadow-2xs backdrop-blur-xs">
              <span>Jurusan Kesehatan Gigi</span>
              <span aria-hidden="true">·</span>
              <span>Poltekkes Kemenkes Palembang</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.1] text-balance drop-shadow-2xs">
                Medkom Studio
              </h1>
              <p className="font-display font-bold text-lg sm:text-xl text-[#1e4b8f] tracking-tight">
                Ruang Karya Media Komunikasi Kesehatan
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
              Temukan, bagikan, dan kembangkan berbagai karya media komunikasi kesehatan hasil kreativitas mahasiswa Jurusan Kesehatan Gigi.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={() => onNavigate('jelajahi')}
                className="px-5.5 py-3 rounded-xl bg-[#265cb0] hover:bg-[#1e4b8f] text-white font-bold text-sm shadow-md shadow-[#265cb0]/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Jelajahi Media</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('upload')}
                className="px-5.5 py-3 rounded-xl bg-white/90 hover:bg-white border border-slate-300 text-slate-900 font-bold text-sm active:scale-95 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-[#265cb0]" />
                <span>Upload Karya</span>
              </button>
            </div>

            {/* Quick Tagline */}
            <p className="text-xs text-slate-600 font-medium tracking-wider uppercase pt-1 border-t border-slate-200/70">
              Tagline: <span className="text-slate-900 font-semibold">Create. Communicate. Educate.</span>
            </p>
          </div>
        </HeroSlider>
      </section>

      {/* 2. STATISTIK SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Total Karya
            </p>
            <p className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tabular-nums">
              {stats.totalPublished}
            </p>
            <p className="text-xs text-slate-500 mt-1">Karya terpublikasi resmi</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Media Digital
            </p>
            <p className="font-display font-extrabold text-3xl sm:text-4xl text-sky-700 tabular-nums">
              {stats.digitalCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Dapat diunduh langsung</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Media Fisik
            </p>
            <p className="font-display font-extrabold text-3xl sm:text-4xl text-amber-700 tabular-nums">
              {stats.physicalCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Tersimpan di lab medikom</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Mahasiswa Berkarya
            </p>
            <p className="font-display font-extrabold text-3xl sm:text-4xl text-teal-700 tabular-nums">
              {stats.uniqueCreatorsCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">Kontributor angkatan</p>
          </div>

        </div>
      </section>

      {/* 3. KATEGORI MEDIA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Kategori Media Komunikasi
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Pilih klasifikasi media edukasi untuk menelusuri karya mahasiswa
            </p>
          </div>
          <button
            onClick={() => onNavigate('jelajahi')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Semua Kategori</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mediaTypes.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-400 transition-all text-left flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>Jelajahi Kategori</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. FEATURED GALLERY (KARYA PILIHAN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
              <span>Kurasi Terbaik</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Karya Pilihan
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Karya media kesehatan gigi unggulan hasil evaluasi kurator & dosen
            </p>
          </div>

          <button
            onClick={() => onNavigate('jelajahi')}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 active:scale-95 transition-all self-start sm:self-auto shadow-xs"
          >
            Lihat Semua Karya
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={onSelectMedia}
              onToggleAppreciation={onToggleAppreciation}
              onDownload={onDownload}
            />
          ))}
        </div>
      </section>

      {/* 5. KARYA TERBARU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Karya Terbaru
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Media komunikasi kesehatan gigi yang baru saja lolos kurasi dan dipublikasikan
            </p>
          </div>

          <button
            onClick={() => onNavigate('jelajahi')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Semua Media ({publishedItems.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {latestItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={onSelectMedia}
              onToggleAppreciation={onToggleAppreciation}
              onDownload={onDownload}
            />
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION FOR STUDENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 p-8 sm:p-12 text-white text-left relative overflow-hidden shadow-xl">
          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200 bg-teal-900/40 px-3 py-1 rounded-full border border-teal-400/30">
              Mahasiswa Kesehatan Gigi
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Punya Karya Media Komunikasi Kesehatan Gigi?
            </h3>
            <p className="text-sm sm:text-base text-teal-100 leading-relaxed">
              Unggah karya poster, video, komik, maupun alat peraga fisik buatan Anda agar terdokumentasi rapi dan dapat dimanfaatkan oleh adik tingkat serta masyarakat umum.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('upload')}
                className="px-6 py-3 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-sm shadow-md active:scale-95 transition-all"
              >
                Upload Karya Sekarang
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SUPER ADMIN BACKEND ACCESS BANNER - Only shown to superadmin */}
      {currentUser?.role === 'superadmin' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Panel Khusus Super Admin
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Status: Sesi Aktif</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white mt-1">
                  Akses Halaman Backend Medkom Studio
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pengelolaan kurasi karya mahasiswa, master data skema relasional, inventaris arsip fisik laboratorium, dan cadangan basis data sistem.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('dashboard-admin')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md whitespace-nowrap flex items-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <span>Buka Halaman Backend</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

    </div>
  );
};
