import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit3,
  Heart,
  Download,
  PlusCircle,
  FileText,
  Send,
  Trash2,
} from 'lucide-react';
import { MediaItemPopulated, MediaStatus, User } from '../types/database';
import { db } from '../services/relationalStore';
import { DentalMediaVisual } from '../components/DentalMediaVisual';

interface StudentDashboardProps {
  currentUser: User;
  onNavigate: (tab: 'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin') => void;
  onSelectMedia: (item: MediaItemPopulated) => void;
  onEditKarya: (item: MediaItemPopulated) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardProps> = ({
  currentUser,
  onNavigate,
  onSelectMedia,
  onEditKarya,
}) => {
  const [activeTabFilter, setActiveTabFilter] = useState<MediaStatus | 'all'>('all');

  // Fetch all populated items
  const allPopulated = db.getPopulatedMediaItems();

  // Filter items created by current student
  const studentItems = allPopulated.filter(
    (item) => item.creator.userId === currentUser.id || item.creator.name.includes(currentUser.name)
  );

  // Statistics
  const totalKarya = studentItems.length;
  const dipublikasikanCount = studentItems.filter((i) => i.status === 'published').length;
  const pendingReviewCount = studentItems.filter((i) => i.status === 'pending_review').length;
  const perluRevisiCount = studentItems.filter((i) => i.status === 'revision_needed').length;
  const ditolakCount = studentItems.filter((i) => i.status === 'rejected').length;

  const filteredItems = studentItems.filter((item) => {
    if (activeTabFilter === 'all') return true;
    return item.status === activeTabFilter;
  });

  const getStatusBadge = (status: MediaStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>🟢 Dipublikasikan</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>🟡 Menunggu Review</span>
          </span>
        );
      case 'revision_needed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-800 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>🟠 Perlu Revisi</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>🔴 Ditolak</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Draft Disimpan</span>
          </span>
        );
    }
  };

  const handleSendDraftForReview = (id: string) => {
    db.updateMediaItem(id, { status: 'pending_review' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus karya ini?')) {
      db.deleteMediaItem(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Dashboard Mahasiswa</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser.prodi}</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">
            Karya Saya
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Pantau status verifikasi, catatan dosen, dan statistik karya yang telah Anda unggah
          </p>
        </div>

        <button
          onClick={() => onNavigate('upload')}
          className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Karya Baru</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Karya
          </p>
          <p className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1 tabular-nums">
            {totalKarya}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Semua karya Anda</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Dipublikasikan
            </p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-display font-extrabold text-2xl sm:text-3xl text-emerald-700 mt-1 tabular-nums">
            {dipublikasikanCount}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Tersedia di galeri publik</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Menunggu Review
            </p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-display font-extrabold text-2xl sm:text-3xl text-amber-700 mt-1 tabular-nums">
            {pendingReviewCount}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Dalam antrean dosen</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Perlu Revisi
            </p>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <p className="font-display font-extrabold text-2xl sm:text-3xl text-orange-700 mt-1 tabular-nums">
            {perluRevisiCount}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Butuh perbaikan pesan/visual</p>
        </div>

      </div>

      {/* Tabs Filter */}
      <div className="flex gap-1.5 p-1 bg-slate-100/90 rounded-xl overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTabFilter('all')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTabFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua ({totalKarya})
        </button>
        <button
          onClick={() => setActiveTabFilter('published')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTabFilter === 'published'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Dipublikasikan ({dipublikasikanCount})
        </button>
        <button
          onClick={() => setActiveTabFilter('pending_review')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTabFilter === 'pending_review'
              ? 'bg-white text-amber-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Menunggu Review ({pendingReviewCount})
        </button>
        <button
          onClick={() => setActiveTabFilter('revision_needed')}
          className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTabFilter === 'revision_needed'
              ? 'bg-white text-orange-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Perlu Revisi ({perluRevisiCount})
        </button>
        {ditolakCount > 0 && (
          <button
            onClick={() => setActiveTabFilter('rejected')}
            className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTabFilter === 'rejected'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ditolak ({ditolakCount})
          </button>
        )}
      </div>

      {/* Karya Saya List */}
      {filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row gap-5"
            >
              {/* Thumbnail preview */}
              <div className="w-full md:w-48 h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                <DentalMediaVisual
                  thumbnailKey={item.thumbnailUrl}
                  title={item.title}
                  mediaTypeName={item.mediaType.name}
                  submediaTypeName={item.submediaType.name}
                  aspectRatio="auto"
                  className="w-full h-full"
                />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="text-teal-700 font-semibold">{item.mediaType.name}</span>
                      <span aria-hidden="true">/</span>
                      <span>{item.submediaType.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>Tahun {item.year}</span>
                    </div>

                    {getStatusBadge(item.status)}
                  </div>

                  <h3 className="font-display font-bold text-base text-slate-900">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {item.description}
                  </p>

                  {/* Revision Notes Alert */}
                  {item.status === 'revision_needed' && item.reviewNotes && (
                    <div className="mt-3 p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-orange-800">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span>Catatan Revisi dari Dosen / Kurator:</span>
                      </div>
                      <p className="leading-relaxed pl-5 font-medium">{item.reviewNotes}</p>
                    </div>
                  )}

                  {/* Rejection Note */}
                  {item.status === 'rejected' && item.reviewNotes && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-800">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Alasan Penolakan:</span>
                      </div>
                      <p className="leading-relaxed pl-5 font-medium">{item.reviewNotes}</p>
                    </div>
                  )}
                </div>

                {/* Bottom Actions & Engagement Stats */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  {/* Engagement (if published) */}
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1.5" title="Jumlah Apresiasi">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span className="font-semibold tabular-nums text-slate-800">
                        {item.appreciationsCount}
                      </span>
                      <span>Apresiasi</span>
                    </span>

                    <span className="flex items-center gap-1.5" title="Jumlah Unduhan">
                      <Download className="w-3.5 h-3.5 text-teal-600" />
                      <span className="font-semibold tabular-nums text-slate-800">
                        {item.downloadsCount}
                      </span>
                      <span>Unduhan</span>
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* View Detail */}
                    <button
                      onClick={() => onSelectMedia(item)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lihat Detail</span>
                    </button>

                    {/* Edit button (for draft or revision needed) */}
                    {(item.status === 'revision_needed' || item.status === 'draft') && (
                      <button
                        onClick={() => onEditKarya(item)}
                        className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit & Perbaiki</span>
                      </button>
                    )}

                    {/* Send draft */}
                    {item.status === 'draft' && (
                      <button
                        onClick={() => handleSendDraftForReview(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Review</span>
                      </button>
                    )}

                    {/* Delete draft */}
                    {item.status === 'draft' && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">
              Belum ada karya pada status ini
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Unggah karya media komunikasi kesehatan Anda untuk menambah portofolio akademik.
            </p>
          </div>
          <button
            onClick={() => onNavigate('upload')}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors"
          >
            Upload Karya Sekarang
          </button>
        </div>
      )}

    </div>
  );
};
