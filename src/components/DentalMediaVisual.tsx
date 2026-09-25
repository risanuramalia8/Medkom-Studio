import React from 'react';
import {
  Play,
  Dice5,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Smile,
  ShieldCheck,
  HeartPulse,
  Layers,
} from 'lucide-react';

interface DentalMediaVisualProps {
  thumbnailKey: string;
  title: string;
  mediaTypeName?: string;
  submediaTypeName?: string;
  className?: string;
  aspectRatio?: 'video' | 'portrait' | 'square' | 'auto';
}

export const DentalMediaVisual: React.FC<DentalMediaVisualProps> = ({
  thumbnailKey,
  title,
  mediaTypeName,
  submediaTypeName,
  className = '',
  aspectRatio = 'auto',
}) => {
  // If thumbnailKey is an actual base64 or URL
  if (thumbnailKey.startsWith('http') || thumbnailKey.startsWith('data:')) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
        <img
          src={thumbnailKey}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            // gracefully fallback to vector renderer if URL fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Pre-configured distinct visual designs for dental media items
  const renderVisualArtwork = () => {
    switch (thumbnailKey) {
      case 'poster_karies_gigi':
        return (
          <div className="w-full h-full bg-gradient-to-br from-teal-500 via-teal-600 to-teal-800 text-white p-5 flex flex-col justify-between relative overflow-hidden">
            {/* Background graphic elements */}
            <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute top-2 right-4 text-xs font-semibold tracking-wider uppercase text-teal-200 bg-teal-900/40 px-2.5 py-0.5 rounded backdrop-blur-sm border border-teal-400/20">
              Poster Edukasi
            </div>
            
            <div className="pt-2 z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                {/* Clean Tooth SVG */}
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 7.5 5 11 5 13.5C5 17.5 7 21 8.5 21C9.5 21 10 19.5 10.5 17.5C11 15.5 11.5 15 12 15C12.5 15 13 15.5 13.5 17.5C14 19.5 14.5 21 15.5 21C17 21 19 17.5 19 13.5C19 11 18.5 7.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" />
                </svg>
              </div>
              <p className="text-xs text-teal-100 font-medium">JURUSAN KESEHATAN GIGI</p>
              <h4 className="text-base font-bold font-display leading-tight text-white mt-1 drop-shadow-sm line-clamp-2">
                Jurus 2 Menit Sikat Gigi Tepat
              </h4>
            </div>

            <div className="z-10 flex items-center justify-between pt-4 border-t border-teal-400/30 text-xs text-teal-100">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-teal-300" /> Perlindungan Enamel
              </span>
              <span className="text-xs opacity-90">2 Menit • 2x Sehari</span>
            </div>
          </div>
        );

      case 'boardgame_edukasi':
        return (
          <div className="w-full h-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 text-white p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-yellow-300/20 rounded-full blur-lg pointer-events-none" />
            
            <div className="flex items-center justify-between z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Dice5 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-amber-100 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-300/20">
                Boardgame Kit
              </span>
            </div>

            <div className="my-auto py-2 z-10 text-center">
              <div className="inline-flex items-center gap-1.5 bg-amber-900/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-100 mb-2 border border-amber-300/20">
                Jalur Rahang Gigi
              </div>
              <h4 className="text-base font-bold font-display leading-snug text-white drop-shadow">
                Jelajah Kerajaan Gigi
              </h4>
              <p className="text-xs text-amber-100 mt-1 font-medium">Petualangan Melawan Monster Karies</p>
            </div>

            <div className="z-10 flex items-center justify-between pt-3 border-t border-amber-400/30 text-xs text-amber-100">
              <span>Alat Peraga Fisik & Papan</span>
              <span className="font-semibold">3-4 Pemain</span>
            </div>
          </div>
        );

      case 'video_animasi_gigi':
        return (
          <div className="w-full h-full bg-gradient-to-br from-sky-600 via-indigo-700 to-slate-900 text-white p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-radial from-transparent to-black/40 pointer-events-none" />
            <div className="flex items-center justify-between z-10">
              <span className="text-xs text-sky-200 flex items-center gap-1.5 font-medium">
                <Smile className="w-4 h-4 text-sky-300" /> Animasi 3D Edukatif
              </span>
              <span className="text-xs bg-sky-950/60 text-sky-200 px-2 py-0.5 rounded border border-sky-400/20">
                4 Menit
              </span>
            </div>

            <div className="my-auto flex flex-col items-center justify-center z-10 text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-7 h-7 text-white fill-white ml-0.5" />
              </div>
              <h4 className="text-base font-bold font-display text-white drop-shadow">
                Petualangan Kiki si Gigi Geraham
              </h4>
            </div>

            <div className="z-10 flex items-center justify-between pt-2 border-t border-indigo-400/30 text-xs text-sky-200">
              <span>Sasaran: Anak TK & PAUD</span>
              <span className="text-xs font-mono">1080p Full HD</span>
            </div>
          </div>
        );

      case 'booklet_bumil':
        return (
          <div className="w-full h-full bg-gradient-to-br from-rose-500 via-pink-600 to-rose-800 text-white p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase text-rose-100 bg-rose-900/40 px-2.5 py-0.5 rounded border border-rose-300/20">
                Buku Saku
              </span>
            </div>

            <div className="my-auto py-2 z-10">
              <p className="text-xs text-rose-100 font-medium">Panduan Kesehatan Gigi Trimester 1-3</p>
              <h4 className="text-base font-bold font-display leading-tight text-white mt-1">
                Senyum Sehat Bunda & Buah Hati
              </h4>
              <p className="text-xs text-rose-100 mt-2 opacity-90 line-clamp-2">
                Pencegahan gingivitis gravidarum & asupan nutrisi benih gigi.
              </p>
            </div>

            <div className="z-10 flex items-center justify-between pt-3 border-t border-rose-400/30 text-xs text-rose-200">
              <span className="flex items-center gap-1"><HeartPulse className="w-3.5 h-3.5" /> Ibu Hamil</span>
              <span>24 Halaman Full Color</span>
            </div>
          </div>
        );

      case 'flashcard_nutrisi':
        return (
          <div className="w-full h-full bg-gradient-to-br from-amber-400 via-emerald-500 to-teal-700 text-white p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between z-10">
              <span className="text-xs font-semibold bg-emerald-900/40 px-2.5 py-0.5 rounded text-emerald-100 border border-emerald-300/20">
                30 Kartu Bergambar
              </span>
            </div>

            <div className="my-auto text-center py-2 z-10">
              <div className="inline-block bg-white/25 backdrop-blur-sm rounded-lg p-2.5 mb-2">
                <svg className="w-8 h-8 text-white mx-auto" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 7.5 5 11 5 13.5C5 17.5 7 21 8.5 21C9.5 21 10 19.5 10.5 17.5C11 15.5 11.5 15 12 15C12.5 15 13 15.5 13.5 17.5C14 19.5 14.5 21 15.5 21C17 21 19 17.5 19 13.5C19 11 18.5 7.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" />
                </svg>
              </div>
              <h4 className="text-base font-bold font-display text-white">
                Tebak Nutrisi Sahabat Gigi
              </h4>
              <p className="text-xs text-teal-100 mt-1">Kartu Edukasi Kariogenik vs Non-Kariogenik</p>
            </div>

            <div className="z-10 pt-2 border-t border-emerald-400/30 text-xs text-teal-100 flex justify-between">
              <span>Alat Peraga Interaktif</span>
              <span>Anak TK / PAUD</span>
            </div>
          </div>
        );

      case 'leaflet_periodontitis':
        return (
          <div className="w-full h-full bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-800 text-white p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center z-10">
              <span className="text-xs font-semibold uppercase bg-cyan-950/50 text-cyan-200 px-2.5 py-0.5 rounded border border-cyan-300/20">
                Leaflet Lipat 3
              </span>
              <FileText className="w-5 h-5 text-cyan-200" />
            </div>

            <div className="my-auto py-2 z-10">
              <h4 className="text-base font-bold font-display text-white leading-tight">
                Waspada Periodontitis & Perawatan Gigi Tiruan
              </h4>
              <p className="text-xs text-cyan-100 mt-1 line-clamp-2">
                Pencegahan kegoyangan gigi, scaling, dan desinfeksi gigi tiruan lansia.
              </p>
            </div>

            <div className="z-10 pt-3 border-t border-cyan-400/30 text-xs text-cyan-200 flex justify-between">
              <span>Sasaran: Lansia & Keluarga</span>
              <span>Standar Puskesmas</span>
            </div>
          </div>
        );

      case 'boneka_jari_gigi':
        return (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-800 text-white p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center z-10">
              <span className="text-xs font-semibold uppercase bg-purple-950/40 text-purple-200 px-2.5 py-0.5 rounded">
                Boneka Jari Flanel
              </span>
              <Smile className="w-5 h-5 text-purple-200" />
            </div>

            <div className="my-auto text-center py-2 z-10">
              <h4 className="text-base font-bold font-display text-white">
                Keluarga Gigi Sehat & Geng Mikroba
              </h4>
              <p className="text-xs text-purple-100 mt-1">Set 5 Karakter Simulasi Dongeng PAUD</p>
            </div>

            <div className="z-10 pt-2 border-t border-purple-400/30 text-xs text-purple-200 flex justify-between">
              <span>Media Peraga Fisik</span>
              <span>Laboratorium Medikom</span>
            </div>
          </div>
        );

      case 'komik_digital_behel':
        return (
          <div className="w-full h-full bg-gradient-to-br from-fuchsia-600 via-pink-600 to-purple-800 text-white p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center z-10">
              <span className="text-xs font-semibold uppercase bg-fuchsia-950/40 text-fuchsia-200 px-2.5 py-0.5 rounded">
                Webtoon Strip
              </span>
              <span className="text-xs font-mono">16 Episode</span>
            </div>

            <div className="my-auto py-2 z-10">
              <p className="text-xs text-fuchsia-100 font-medium">Edukasi Ortodonti Remaja</p>
              <h4 className="text-base font-bold font-display text-white mt-1">
                Behind The Braces
              </h4>
              <p className="text-xs text-fuchsia-100 mt-1">Kisah nyata bahaya behel salon abal-abal.</p>
            </div>

            <div className="z-10 pt-2 border-t border-pink-400/30 text-xs text-fuchsia-200 flex justify-between">
              <span>Media Elektronik</span>
              <span>Remaja SMP / SMA</span>
            </div>
          </div>
        );

      case 'popup_anatomi_karies':
        return (
          <div className="w-full h-full bg-gradient-to-br from-teal-700 via-cyan-800 to-slate-900 text-white p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center z-10">
              <span className="text-xs font-semibold uppercase bg-teal-950/50 text-teal-200 px-2.5 py-0.5 rounded">
                Pop-Up Book 3D
              </span>
              <Layers className="w-5 h-5 text-teal-300" />
            </div>

            <div className="my-auto py-2 z-10">
              <h4 className="text-base font-bold font-display text-white leading-tight">
                Model Anatomi Pop-Up: Penjalaran Karies
              </h4>
              <p className="text-xs text-teal-200 mt-1">Struktur Enamel, Dentin, hingga Pulpa Saraf.</p>
            </div>

            <div className="z-10 pt-2 border-t border-teal-500/30 text-xs text-teal-200 flex justify-between">
              <span>Ukuran 40x30 cm</span>
              <span>Fisik & Pola Digital</span>
            </div>
          </div>
        );

      case 'pamflet_karang_gigi':
      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 via-teal-800 to-slate-900 text-white p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center z-10">
              <span className="text-xs font-semibold uppercase bg-slate-900/50 text-teal-200 px-2.5 py-0.5 rounded">
                {submediaTypeName || mediaTypeName || 'Karya Media'}
              </span>
              <ImageIcon className="w-4 h-4 text-teal-300" />
            </div>

            <div className="my-auto py-2 z-10">
              <h4 className="text-base font-bold font-display text-white leading-snug line-clamp-2">
                {title}
              </h4>
              <p className="text-xs text-slate-300 mt-1">Jurusan Kesehatan Gigi Poltekkes Palembang</p>
            </div>

            <div className="z-10 pt-2 border-t border-slate-600/50 text-xs text-slate-300 flex justify-between">
              <span>Media Komunikasi Kesehatan</span>
              <span>Dokumentasi Resmi</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-t-xl transition-all select-none ${
        aspectRatio === 'video'
          ? 'aspect-video'
          : aspectRatio === 'portrait'
          ? 'aspect-[3/4]'
          : aspectRatio === 'square'
          ? 'aspect-square'
          : 'h-48'
      } ${className}`}
    >
      {renderVisualArtwork()}
    </div>
  );
};
