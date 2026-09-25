import React, { useState, useEffect, useCallback } from 'react';
import { db } from './services/relationalStore';
import { User, MediaItemPopulated, MediaType, SubmediaType, Topic, TargetAudience, MediaItem } from './types/database';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { UploadPage } from './pages/UploadPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { MediaDetailModal } from './components/MediaDetailModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin'
  >('beranda');

  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getActiveUser());
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>(() => db.getMediaTypes());
  const [submediaTypes, setSubmediaTypes] = useState<SubmediaType[]>(() => db.getSubmediaTypes());
  const [topics, setTopics] = useState<Topic[]>(() => db.getTopics());
  const [targetAudiences, setTargetAudiences] = useState<TargetAudience[]>(() => db.getTargetAudiences());
  const [publishedItems, setPublishedItems] = useState<MediaItemPopulated[]>(() =>
    db.getPopulatedMediaItems('published')
  );
  const [stats, setStats] = useState(() => db.getRepositoryStats());

  // Navigation and Filter state
  const [selectedMediaTypeId, setSelectedMediaTypeId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [activeDetailItem, setActiveDetailItem] = useState<MediaItemPopulated | null>(null);
  const [activeShareItem, setActiveShareItem] = useState<MediaItemPopulated | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [editKaryaItem, setEditKaryaItem] = useState<MediaItem | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  // Sync state from relational store on any change
  const syncStoreData = useCallback(() => {
    setMediaTypes(db.getMediaTypes());
    setSubmediaTypes(db.getSubmediaTypes());
    setTopics(db.getTopics());
    setTargetAudiences(db.getTargetAudiences());
    setPublishedItems(db.getPopulatedMediaItems('published'));
    setStats(db.getRepositoryStats());
    setCurrentUser(db.getActiveUser());

    // Also update activeDetailItem if open
    if (activeDetailItem) {
      const refreshed = db.getPopulatedItemById(activeDetailItem.id);
      if (refreshed) {
        setActiveDetailItem(refreshed);
      }
    }
  }, [activeDetailItem]);

  useEffect(() => {
    const unsubscribe = db.subscribe(syncStoreData);
    return () => unsubscribe();
  }, [syncStoreData]);

  // Navigate handler
  const handleNavigate = (
    tab: 'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin'
  ) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select category from HomePage and jump to ExplorePage
  const handleSelectCategoryFromHome = (typeId: string) => {
    setSelectedMediaTypeId(typeId);
    setActiveTab('jelajahi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick search trigger from Navbar
  const handleOpenSearch = () => {
    setActiveTab('jelajahi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle appreciation
  const handleToggleAppreciation = (e: React.MouseEvent | string, idArg?: string) => {
    const id = typeof e === 'string' ? e : idArg;
    if (typeof e !== 'string' && e.stopPropagation) {
      e.stopPropagation();
    }
    if (!id) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Harap login terlebih dahulu untuk mengapresiasi karya.');
      return;
    }

    try {
      const { isAppreciated } = db.toggleAppreciation(id);
      if (isAppreciated) {
        showToast('❤️ Terima kasih atas apresiasi Anda!');
      } else {
        showToast('Apresiasi ditarik.');
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui apresiasi.');
    }
  };

  // Realistic file download trigger
  const handleDownload = (e: React.MouseEvent | MediaItemPopulated, itemArg?: MediaItemPopulated) => {
    const item = typeof (e as any).preventDefault === 'function' ? itemArg : (e as MediaItemPopulated);
    if ((e as any)?.stopPropagation) {
      (e as any).stopPropagation();
    }
    if (!item) return;

    // Increment download counter
    db.incrementDownload(item.id);

    // Create realistic downloadable blob content
    const fileContent = `=====================================================
Medkom Studio - Poltekkes Kemenkes Palembang
Jurusan Kesehatan Gigi
Platform Repository Media Komunikasi Kesehatan
=====================================================

JUDUL KARYA:
${item.title}

JENIS MEDIA: ${item.mediaType.name} - ${item.submediaType.name}
TOPIK: ${item.topic.name}
SASARAN: ${item.targetAudience.name}
TAHUN: ${item.year}
MATA KULIAH: ${item.course}

INFORMASI PEMBUAT:
Nama: ${item.creator.name}
NIM: ${item.creator.nim}
Prodi: ${item.creator.prodi} (${item.creator.class})

DESKRIPSI:
${item.description}

STATUS PENYIMPANAN:
Tipe: ${item.storageType}
${item.physicalInventory ? `Lokasi Fisik Lab: ${item.physicalInventory.storageLocation}\nKode Inventaris: ${item.physicalInventory.inventoryCode}` : ''}

Dilisensikan untuk keperluan pendidikan kesehatan masyarakat.
Dokumentasi Resmi Jurusan Kesehatan Gigi Poltekkes Kemenkes Palembang.
=====================================================`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${item.fileFormat.toLowerCase() === 'pdf' ? 'txt' : item.fileFormat.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`⬇ Mengunduh "${item.title}" (${item.fileFormat} • ${item.fileSize})`);
  };

  // Logout
  const handleLogout = () => {
    db.setActiveUser(null);
    setCurrentUser(null);
    showToast('Anda telah keluar (Logout).');
    if (activeTab === 'dashboard-mhs' || activeTab === 'dashboard-admin') {
      setActiveTab('beranda');
    }
  };

  // Edit karya trigger
  const handleEditKarya = (item: MediaItemPopulated) => {
    setEditKaryaItem(item);
    setActiveTab('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 antialiased">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenSearch={handleOpenSearch}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'beranda' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectCategory={handleSelectCategoryFromHome}
            onSelectMedia={(item) => setActiveDetailItem(item)}
            onToggleAppreciation={handleToggleAppreciation}
            onDownload={handleDownload}
            mediaTypes={mediaTypes}
            publishedItems={publishedItems}
            currentUser={currentUser}
            stats={stats}
          />
        )}

        {activeTab === 'jelajahi' && (
          <ExplorePage
            items={publishedItems}
            mediaTypes={mediaTypes}
            submediaTypes={submediaTypes}
            topics={topics}
            targetAudiences={targetAudiences}
            selectedMediaTypeId={selectedMediaTypeId}
            onSelectMediaTypeId={setSelectedMediaTypeId}
            onSelectMedia={(item) => setActiveDetailItem(item)}
            onToggleAppreciation={handleToggleAppreciation}
            onDownload={handleDownload}
            initialSearchQuery={searchQuery}
          />
        )}

        {activeTab === 'upload' && (
          <UploadPage
            currentUser={currentUser}
            onOpenLogin={() => setIsAuthModalOpen(true)}
            onNavigate={handleNavigate}
            mediaTypes={mediaTypes}
            submediaTypes={submediaTypes}
            topics={topics}
            targetAudiences={targetAudiences}
            initialEditItem={editKaryaItem}
            onFinishEdit={() => setEditKaryaItem(null)}
          />
        )}

        {activeTab === 'dashboard-mhs' && (
          currentUser ? (
            <StudentDashboardPage
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onSelectMedia={(item) => setActiveDetailItem(item)}
              onEditKarya={handleEditKarya}
            />
          ) : (
            <div className="py-20 text-center space-y-3">
              <p className="text-sm text-slate-500">Silakan login untuk melihat dashboard mahasiswa Anda.</p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-teal-700 text-white text-xs font-bold rounded-xl"
              >
                Login Mahasiswa
              </button>
            </div>
          )
        )}

        {activeTab === 'dashboard-admin' && (
          (currentUser?.role === 'superadmin' || currentUser?.role === 'admin') ? (
            <AdminDashboardPage
              currentUser={currentUser}
              onSelectMedia={(item) => setActiveDetailItem(item)}
              mediaTypes={mediaTypes}
              submediaTypes={submediaTypes}
              topics={topics}
              targetAudiences={targetAudiences}
              onNavigateHome={() => handleNavigate('beranda')}
            />
          ) : (
            <div className="py-24 text-center space-y-4 max-w-lg mx-auto px-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold">🔒</span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-slate-900">
                Akses Halaman Backend Super Admin
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Halaman ini khusus untuk pengelolaan operasional backend, kurasi karya, konfigurasi master skema relasional, dan pencadangan database sistem Medkom Studio.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    const superadmin = db.getUsers().find(u => u.role === 'superadmin' || u.role === 'admin');
                    if (superadmin) {
                      db.setActiveUser(superadmin);
                      setCurrentUser(superadmin);
                      showToast('Berhasil masuk ke Halaman Backend sebagai Superadmin!');
                    } else {
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Masuk sebagai Super Admin
                </button>
                <button
                  onClick={() => handleNavigate('beranda')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'tentang' && (
          <AboutPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} currentUser={currentUser} />

      {/* Media Detail Modal */}
      {activeDetailItem && (
        <MediaDetailModal
          item={activeDetailItem}
          onClose={() => setActiveDetailItem(null)}
          currentUser={currentUser}
          onToggleAppreciation={(id) => handleToggleAppreciation(id)}
          onDownload={(item) => handleDownload(item)}
          onOpenShare={(item) => setActiveShareItem(item)}
        />
      )}

      {/* Share Modal */}
      {activeShareItem && (
        <ShareModal
          item={activeShareItem}
          onClose={() => setActiveShareItem(null)}
        />
      )}

      {/* Login & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectUser={(u) => {
          setCurrentUser(u);
          showToast(`Berhasil masuk sebagai ${u.name} (${u.role})`);
        }}
      />

    </div>
  );
}
