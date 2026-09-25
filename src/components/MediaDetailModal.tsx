import React, { useEffect } from 'react';
import {
  X,
  Heart,
  Download,
  Share2,
  Calendar,
  User as UserIcon,
  GraduationCap,
  HardDrive,
  Box,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Tag,
  Eye,
} from 'lucide-react';
import { MediaItemPopulated, User } from '../types/database';
import { DentalMediaVisual } from './DentalMediaVisual';

interface MediaDetailModalProps {
  item: MediaItemPopulated | null;
  onClose: () => void;
  currentUser: User | null;
  onToggleAppreciation: (id: string) => void;
  onDownload: (item: MediaItemPopulated) => void;
  onOpenShare: (item: MediaItemPopulated) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  onClose,
  currentUser,
  onToggleAppreciation,
  onDownload,
  onOpenShare,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const storageStatusLabel =
    item.storageType === 'both'
      ? 'Digital & Fisik'
      : item.storageType === 'physical'
      ? 'Physical Only'
      : 'Digital Only';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden relative text-left">
        
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Hero Preview */}
        <div className="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <DentalMediaVisual
            thumbnailKey={item.thumbnailUrl}
            title={item.title}
            mediaTypeName={item.mediaType.name}
            submediaTypeName={item.submediaType.name}
            className="w-full h-full rounded-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-wrap items-end justify-between gap-3 text-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-1">
                <span>{item.mediaType.name}</span>
                <span aria-hidden="true">/</span>
                <span>{item.submediaType.name}</span>
                <span aria-hidden="true">·</span>
                <span>Tahun {item.year}</span>
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white leading-tight max-w-2xl drop-shadow">
                {item.title}
              </h2>
            </div>

            {/* Publication badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 backdrop-blur-md flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dipublikasikan</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[calc(85vh-20rem)] overflow-y-auto space-y-8">
          
          {/* Action Bar (Apresiasi, Download, Bagikan) */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              {/* Apresiasi button */}
              <button
                onClick={() => onToggleAppreciation(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                  item.isAppreciatedByCurrentUser
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    item.isAppreciatedByCurrentUser ? 'fill-rose-500 text-rose-500 scale-110' : ''
                  }`}
                />
                <span>Apresiasi ({item.appreciationsCount})</span>
              </button>

              {/* Share button */}
              <button
                onClick={() => onOpenShare(item)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>Bagikan</span>
              </button>
            </div>

            {/* Download button */}
            <button
              onClick={() => onDownload(item)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-700/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Karya ({item.fileFormat} • {item.fileSize})</span>
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Deskripsi Karya
            </h3>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Academic & Metadata Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            
            {/* Pembuat */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                <UserIcon className="w-4 h-4 text-teal-600" />
                Informasi Pembuat
              </span>
              <p className="text-base font-bold text-slate-900">{item.creator.name}</p>
              <p className="text-sm text-slate-600 font-mono mt-0.5">NIM: {item.creator.nim}</p>
              <p className="text-sm text-slate-500 mt-1">{item.creator.prodi} • {item.creator.class}</p>
            </div>

            {/* Mata Kuliah & Kurikulum */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                Mata Kuliah & Angkatan
              </span>
              <p className="text-base font-bold text-slate-900">{item.course}</p>
              <p className="text-sm text-slate-600 mt-0.5">Tahun Karya: {item.year}</p>
              <p className="text-sm text-slate-500 mt-1">Jurusan Kesehatan Gigi Poltekkes Palembang</p>
            </div>

            {/* Sasaran & Topik */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Tag className="w-4 h-4 text-teal-600" />
                Topik & Sasaran Edukasi
              </span>
              <p className="text-base font-bold text-slate-900">{item.topic.name}</p>
              <p className="text-sm text-slate-600 mt-0.5">Target Sasaran: {item.targetAudience.name}</p>
              <p className="text-sm text-slate-500 mt-1">{item.submediaType.name} ({item.mediaType.name})</p>
            </div>

          </div>

          {/* Section: INFORMASI PENYIMPANAN (DIGITAL & FISIK) */}
          <div className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-teal-700" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Informasi Penyimpanan Karya
                </h3>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                Status Media: {storageStatusLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Digital Storage Info */}
              {(item.storageType === 'digital' || item.storageType === 'both') && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
                    <FileCode className="w-4 h-4 text-sky-600" />
                    <span>Penyimpanan Digital</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-600">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Status File:</span>
                      <span className="font-medium text-emerald-700">Tersedia Digital</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Format File:</span>
                      <span className="font-mono font-medium text-slate-800">{item.fileFormat}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Ukuran File:</span>
                      <span className="font-mono font-medium text-slate-800">{item.fileSize}</span>
                    </p>
                    <p className="flex justify-between items-start gap-2 pt-1 border-t border-slate-100">
                      <span className="text-slate-400 shrink-0">Server:</span>
                      <span className="font-mono text-xs text-slate-700 text-right truncate">
                        {item.digitalStorageLocation || 'Cloud Repository Poltekkes Palembang'}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Physical Storage Info */}
              {(item.storageType === 'physical' || item.storageType === 'both') && item.physicalInventory && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
                    <Box className="w-4 h-4 text-amber-600" />
                    <span>Penyimpanan Fisik (Inventaris Lab)</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-slate-600">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Kode Inventaris:</span>
                      <span className="font-mono font-semibold text-slate-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {item.physicalInventory.inventoryCode}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Jumlah Fisik:</span>
                      <span className="font-medium text-slate-900">
                        {item.physicalInventory.copiesCount} eksemplar
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Kondisi Media:</span>
                      <span className="font-medium text-emerald-700">
                        {item.physicalInventory.condition}
                      </span>
                    </p>
                    <p className="flex justify-between items-start gap-2 pt-1 border-t border-slate-100">
                      <span className="text-slate-400 shrink-0">Lokasi:</span>
                      <span className="font-medium text-slate-800 text-right">
                        {item.physicalInventory.storageLocation}
                      </span>
                    </p>
                    {item.physicalInventory.notes && (
                      <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                        Catatan: {item.physicalInventory.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Note for students & visitors */}
            <div className="flex items-start gap-2 pt-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <span>
                Peminjaman media fisik untuk keperluan simulasi penyuluhan atau praktikum lapangan dapat menghubungi pengelola Laboratorium Media Komunikasi Kesehatan Gigi Poltekkes Palembang.
              </span>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>ID Karya: <code className="font-mono text-slate-700">{item.id}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
