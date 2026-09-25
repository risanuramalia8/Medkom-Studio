import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Plus,
  Edit2,
  Save,
  X,
  HardDrive,
  Box,
  BarChart3,
  Heart,
  Search,
  Filter,
  Layers,
  Tag,
  Users,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  FileText,
  Database,
  Server,
  Activity,
  Check,
  BookOpen,
  ShieldCheck,
  Lock,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';
import {
  MediaItemPopulated,
  MediaStatus,
  MediaType,
  SubmediaType,
  Topic,
  TargetAudience,
  User,
  AuditLog,
  HeroSlide,
} from '../types/database';
import { db } from '../services/relationalStore';
import { DentalMediaVisual } from '../components/DentalMediaVisual';
import { HeroSlider } from '../components/HeroSlider';

interface AdminDashboardProps {
  currentUser: User;
  onSelectMedia: (item: MediaItemPopulated) => void;
  mediaTypes: MediaType[];
  submediaTypes: SubmediaType[];
  topics: Topic[];
  targetAudiences: TargetAudience[];
  onNavigateHome?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({
  currentUser,
  onSelectMedia,
  mediaTypes,
  submediaTypes,
  topics,
  targetAudiences,
  onNavigateHome,
}) => {
  const [activeSection, setActiveSection] = useState<
    'overview' | 'review' | 'schema' | 'inventory' | 'users' | 'audit' | 'slider'
  >('overview');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<MediaStatus | 'all'>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState<string>('all');

  // Hero Slider states
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => db.getHeroSlides());
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideFormTitle, setSlideFormTitle] = useState('');
  const [slideFormSubtitle, setSlideFormSubtitle] = useState('');
  const [slideFormBadge, setSlideFormBadge] = useState('');
  const [slideFormImageUrl, setSlideFormImageUrl] = useState('');
  const [slideFormTargetTab, setSlideFormTargetTab] = useState<'jelajahi' | 'upload' | 'tentang'>('jelajahi');
  const [slideFormOrder, setSlideFormOrder] = useState<number>(1);
  const [slideFormIsActive, setSlideFormIsActive] = useState<boolean>(true);
  const [slideSuccessMsg, setSlideSuccessMsg] = useState('');

  // Review note modal state
  const [activeModalAction, setActiveModalAction] = useState<{
    itemId: string;
    itemTitle: string;
    action: 'revision' | 'reject';
  } | null>(null);
  const [reviewNotesInput, setReviewNotesInput] = useState('');

  // Schema creation states
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDesc, setNewTypeDesc] = useState('');
  const [newSubmediaName, setNewSubmediaName] = useState('');
  const [selectedParentTypeId, setSelectedParentTypeId] = useState<string>(mediaTypes[0]?.id || '');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTargetName, setNewTargetName] = useState('');

  // Physical inventory search & quick edit
  const [inventorySearch, setInventorySearch] = useState('');
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);
  const [invLocation, setInvLocation] = useState('');
  const [invCondition, setInvCondition] = useState<'Sangat Baik' | 'Baik' | 'Perlu Perawatan' | 'Rusak Ringan'>('Baik');
  const [invCopies, setInvCopies] = useState<number>(1);

  // Restore DB state
  const [restoreJsonInput, setRestoreJsonInput] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState('');

  // Add User state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserNip, setNewUserNip] = useState('');
  const [userCreatedMsg, setUserCreatedMsg] = useState(false);

  const allPopulated = db.getPopulatedMediaItems();
  const repoStats = db.getRepositoryStats();
  const allUsers = db.getUsers();
  const auditLogs = db.getAuditLogs();

  // Review items list with filters
  const reviewItems = allPopulated.filter((item) => {
    if (reviewStatusFilter !== 'all' && item.status !== reviewStatusFilter) return false;
    if (reviewCategoryFilter !== 'all' && item.mediaTypeId !== reviewCategoryFilter) return false;
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCreator = item.creator.name.toLowerCase().includes(q) || item.creator.nim.toLowerCase().includes(q);
      if (!matchTitle && !matchCreator) return false;
    }
    return true;
  });

  // Action handlers
  const handleApprovePublish = (id: string, title: string) => {
    db.updateMediaItem(id, {
      status: 'published',
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.name,
      reviewNotes: undefined,
    });
    db.addAuditLog({
      action: 'Persetujuan Publikasi Karya',
      details: `Karya "${title}" telah disetujui dan diterbitkan secara resmi.`,
      category: 'media',
    });
  };

  const handleOpenRevisionModal = (item: MediaItemPopulated) => {
    setActiveModalAction({
      itemId: item.id,
      itemTitle: item.title,
      action: 'revision',
    });
    setReviewNotesInput(item.reviewNotes || '');
  };

  const handleOpenRejectModal = (item: MediaItemPopulated) => {
    setActiveModalAction({
      itemId: item.id,
      itemTitle: item.title,
      action: 'reject',
    });
    setReviewNotesInput(item.reviewNotes || '');
  };

  const handleSubmitReviewDecision = () => {
    if (!activeModalAction) return;

    if (activeModalAction.action === 'revision') {
      const notes = reviewNotesInput.trim() || 'Mohon perbaiki pesan visual dan tinjau kembali kesesuaian materi edukasi gigi.';
      db.updateMediaItem(activeModalAction.itemId, {
        status: 'revision_needed',
        reviewNotes: notes,
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser.name,
      });
      db.addAuditLog({
        action: 'Permintaan Revisi Karya',
        details: `Karya "${activeModalAction.itemTitle}" dikembalikan untuk revisi. Catatan: ${notes}`,
        category: 'media',
      });
    } else {
      const notes = reviewNotesInput.trim() || 'Karya belum memenuhi standar etika edukasi media komunikasi kesehatan.';
      db.updateMediaItem(activeModalAction.itemId, {
        status: 'rejected',
        reviewNotes: notes,
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser.name,
      });
      db.addAuditLog({
        action: 'Penolakan Karya',
        details: `Karya "${activeModalAction.itemTitle}" ditolak kurator. Alasan: ${notes}`,
        category: 'media',
      });
    }

    setActiveModalAction(null);
    setReviewNotesInput('');
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus karya "${title}" secara permanen dari repository?`)) {
      db.deleteMediaItem(id);
      db.addAuditLog({
        action: 'Penghapusan Karya Permanen',
        details: `Karya "${title}" (ID: ${id}) dihapus dari database repository.`,
        category: 'media',
      });
    }
  };

  // Schema handlers
  const handleCreateMediaType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const newId = `mt-${Date.now()}`;
    db.saveMediaType({
      id: newId,
      name: newTypeName.trim(),
      description: newTypeDesc.trim() || 'Kategori media edukasi komunikasi kesehatan',
      iconName: 'Layers',
    });
    db.addAuditLog({
      action: 'Penambahan Jenis Media',
      details: `Kategori media baru "${newTypeName.trim()}" ditambahkan ke skema master.`,
      category: 'schema',
    });
    setNewTypeName('');
    setNewTypeDesc('');
  };

  const handleCreateSubmedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubmediaName.trim() || !selectedParentTypeId) return;
    db.saveSubmediaType({
      id: `sub-${Date.now()}`,
      mediaTypeId: selectedParentTypeId,
      name: newSubmediaName.trim(),
    });
    db.addAuditLog({
      action: 'Penambahan Submedia',
      details: `Subkategori "${newSubmediaName.trim()}" ditambahkan ke skema master.`,
      category: 'schema',
    });
    setNewSubmediaName('');
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    db.saveTopic({
      id: `top-${Date.now()}`,
      name: newTopicName.trim(),
    });
    db.addAuditLog({
      action: 'Penambahan Topik Edukasi',
      details: `Topik kesehatan gigi "${newTopicName.trim()}" ditambahkan.`,
      category: 'schema',
    });
    setNewTopicName('');
  };

  const handleCreateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetName.trim()) return;
    db.saveTargetAudience({
      id: `aud-${Date.now()}`,
      name: newTargetName.trim(),
    });
    db.addAuditLog({
      action: 'Penambahan Sasaran Audiens',
      details: `Sasaran audiens "${newTargetName.trim()}" ditambahkan.`,
      category: 'schema',
    });
    setNewTargetName('');
  };

  // Physical inventory list
  const physicalItems = allPopulated.filter(
    (item) => item.storageType === 'physical' || item.storageType === 'both'
  ).filter((item) => {
    if (!inventorySearch.trim()) return true;
    const q = inventorySearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.physicalInventory?.inventoryCode || '').toLowerCase().includes(q) ||
      (item.physicalInventory?.storageLocation || '').toLowerCase().includes(q)
    );
  });

  const handleSaveInventory = (itemId: string) => {
    const item = allPopulated.find((i) => i.id === itemId);
    if (!item) return;

    db.updateMediaItem(itemId, {
      physicalInventory: {
        inventoryCode: item.physicalInventory?.inventoryCode || `MED-${Date.now().toString().slice(-4)}`,
        storageLocation: invLocation.trim() || item.physicalInventory?.storageLocation || 'Laboratorium Media Komunikasi Gigi',
        condition: invCondition,
        copiesCount: Number(invCopies) || 1,
        notes: item.physicalInventory?.notes,
      },
    });

    db.addAuditLog({
      action: 'Pembaruan Inventaris Fisik',
      details: `Lokasi & kondisi arsip fisik "${item.title}" diperbarui di Lab.`,
      category: 'system',
    });

    setEditingInventoryId(null);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const jsonStr = db.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medkomstudio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    db.addAuditLog({
      action: 'Ekspor Cadangan Database',
      details: 'Super Admin mengunduh salinan berkas cadangan database JSON.',
      category: 'system',
    });
  };

  // Restore JSON Backup
  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRestoreError('');
    setRestoreSuccess(false);

    if (!restoreJsonInput.trim()) {
      setRestoreError('Masukkan data JSON cadangan terlebih dahulu.');
      return;
    }

    const success = db.importDatabaseJSON(restoreJsonInput.trim());
    if (success) {
      setRestoreSuccess(true);
      setRestoreJsonInput('');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setRestoreError('Format berkas JSON tidak valid atau struktur skema tidak sesuai.');
    }
  };

  // Add User handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    db.registerUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: 'admin',
      nip: newUserNip.trim() || '198501012010011001',
      prodi: 'Dosen Pengampu / Tim Kurasi Media Gigi',
    });

    db.addAuditLog({
      action: 'Penambahan Administrator Baru',
      details: `Akun admin baru ${newUserName.trim()} (${newUserEmail.trim()}) dibuat oleh Super Admin.`,
      category: 'auth',
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserNip('');
    setUserCreatedMsg(true);
    setTimeout(() => setUserCreatedMsg(false), 3000);
  };

  // Slider Management Handlers
  const openAddSlideModal = () => {
    setEditingSlideId(null);
    setSlideFormTitle('');
    setSlideFormSubtitle('');
    setSlideFormBadge('Karya Unggulan');
    setSlideFormImageUrl('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80');
    setSlideFormTargetTab('jelajahi');
    setSlideFormOrder(heroSlides.length + 1);
    setSlideFormIsActive(true);
    setIsSlideModalOpen(true);
  };

  const openEditSlideModal = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideFormTitle(slide.title);
    setSlideFormSubtitle(slide.subtitle);
    setSlideFormBadge(slide.badge);
    setSlideFormImageUrl(slide.imageUrl);
    setSlideFormTargetTab(slide.targetTab || 'jelajahi');
    setSlideFormOrder(slide.order);
    setSlideFormIsActive(slide.isActive);
    setIsSlideModalOpen(true);
  };

  const handleSaveSlideForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideFormTitle.trim() || !slideFormImageUrl.trim()) return;

    if (editingSlideId) {
      db.updateHeroSlide(editingSlideId, {
        title: slideFormTitle.trim(),
        subtitle: slideFormSubtitle.trim(),
        badge: slideFormBadge.trim(),
        imageUrl: slideFormImageUrl.trim(),
        targetTab: slideFormTargetTab,
        order: Number(slideFormOrder) || 1,
        isActive: slideFormIsActive,
      });
      setSlideSuccessMsg('Slide berhasil diperbarui.');
    } else {
      db.addHeroSlide({
        title: slideFormTitle.trim(),
        subtitle: slideFormSubtitle.trim(),
        badge: slideFormBadge.trim(),
        imageUrl: slideFormImageUrl.trim(),
        targetTab: slideFormTargetTab,
        order: Number(slideFormOrder) || heroSlides.length + 1,
        isActive: slideFormIsActive,
      });
      setSlideSuccessMsg('Slide baru berhasil ditambahkan.');
    }

    setHeroSlides(db.getHeroSlides());
    setIsSlideModalOpen(false);
    setTimeout(() => setSlideSuccessMsg(''), 3000);
  };

  const handleDeleteSlide = (id: string, title: string) => {
    if (confirm(`Hapus slide "${title}" dari slider beranda?`)) {
      db.deleteHeroSlide(id);
      setHeroSlides(db.getHeroSlides());
      setSlideSuccessMsg('Slide berhasil dihapus.');
      setTimeout(() => setSlideSuccessMsg(''), 3000);
    }
  };

  const handleToggleSlideActive = (id: string, current: boolean) => {
    db.updateHeroSlide(id, { isActive: !current });
    setHeroSlides(db.getHeroSlides());
  };

  const handleResetSlidesToDummy = () => {
    if (confirm('Kembalikan slider ke 4 slide dummy bawaan Jurusan Kesehatan Gigi?')) {
      const reset = db.resetHeroSlidesToDefault();
      setHeroSlides(reset);
      setSlideSuccessMsg('Slide beranda berhasil dikembalikan ke data dummy bawaan.');
      setTimeout(() => setSlideSuccessMsg(''), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setSlideFormImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 text-left">
      
      {/* Top Superadmin Control Bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-18 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Super Admin Backend
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <Activity className="w-3 h-3 animate-pulse text-emerald-400" /> Online • v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Repositori Media Komunikasi Kesehatan Gigi • Poltekkes Kemenkes Palembang
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Lihat Halaman Frontend</span>
            </button>
          )}

          <button
            onClick={handleExportBackup}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            title="Unduh seluruh data repository dalam format JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cadangkan DB (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (confirm('PERINGATAN: Kembalikan seluruh database ke pengaturan bawaan awal pabrik? Tindakan ini akan menyetel ulang data karya.')) {
                db.resetToFactory();
                window.location.reload();
              }
            }}
            className="text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800 px-2.5 py-1.5 rounded-lg transition-colors"
            title="Reset data ke bawaan awal"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex overflow-x-auto gap-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeSection === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>1. Ringkasan & Metrik</span>
          </button>

          <button
            onClick={() => setActiveSection('review')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeSection === 'review'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Kurasi Karya</span>
            {repoStats.pendingReviewCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSection === 'review' ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
              }`}>
                {repoStats.pendingReviewCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('schema')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeSection === 'schema'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. Master Skema Kategori</span>
          </button>

          <button
            onClick={() => setActiveSection('inventory')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeSection === 'inventory'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>4. Arsip Fisik Laboratorium</span>
          </button>

          <button
            onClick={() => setActiveSection('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeSection === 'users'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>5. Akun & Hak Akses</span>
          </button>

          <button
            onClick={() => setActiveSection('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeSection === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>6. Log Audit & Cadangan DB</span>
          </button>

          <button
            onClick={() => setActiveSection('slider')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeSection === 'slider'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>7. Slider Beranda</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeSection === 'slider' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
            }`}>
              {heroSlides.length}
            </span>
          </button>
        </div>

        {/* SECTION 1: OVERVIEW & SYSTEM METRICS */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Seluruh Karya</span>
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-3xl font-extrabold text-white font-mono">{allPopulated.length}</p>
                <div className="mt-2 text-xs text-blue-400 font-medium">
                  {repoStats.totalPublished} Karya telah terbit publik
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-600/40 shadow-md">
                <div className="flex items-center justify-between text-amber-300 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Menunggu Kurasi</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-3xl font-extrabold text-amber-300 font-mono">{repoStats.pendingReviewCount}</p>
                <div className="mt-2 text-xs text-amber-200/80 font-medium">
                  {repoStats.revisionNeededCount} butuh perbaikan mahasiswa
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Arsip Fisik di Lab</span>
                  <Box className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-extrabold text-white font-mono">{repoStats.physicalCount}</p>
                <div className="mt-2 text-xs text-emerald-400 font-medium">
                  Tersimpan di Lemari & Rak Lab Gigi
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 shadow-md">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Apresiasi & Unduhan</span>
                  <Heart className="w-4 h-4 text-teal-400" />
                </div>
                <p className="text-3xl font-extrabold text-white font-mono">{repoStats.totalDownloads + repoStats.totalAppreciations}</p>
                <div className="mt-2 text-xs text-teal-400 font-medium">
                  {repoStats.totalDownloads} download • {repoStats.totalAppreciations} like
                </div>
              </div>
            </div>

            {/* System Status & Diagnostics Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display font-bold text-white text-base">
                    Status Server Backend & Relational Engine
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Sistem Berjalan Normal (100%)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[11px]">Akun Super Admin Aktif</p>
                  <p className="font-bold text-slate-200 mt-1 truncate">{currentUser.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[11px]">Penyimpanan Relasional</p>
                  <p className="font-bold text-slate-200 mt-1">Local Relational Storage v2.0</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[11px]">Skema Master Aktif</p>
                  <p className="font-bold text-slate-200 mt-1">{mediaTypes.length} Jenis • {submediaTypes.length} Submedia</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[11px]">Keamanan & Autentikasi</p>
                  <p className="font-bold text-slate-200 mt-1">1 Akun Tunggal Super Admin</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setActiveSection('review')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mulai Kurasi Karya ({repoStats.pendingReviewCount})</span>
                </button>
                <button
                  onClick={() => setActiveSection('schema')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Kelola Skema Kategori</span>
                </button>
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-4 h-4 text-teal-400" />
                  <span>Unduh Berkas Cadangan</span>
                </button>
              </div>
            </div>

            {/* Media Distribution Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  Distribusi Kategori Media Komunikasi
                </h4>
                <div className="space-y-3 text-xs">
                  {mediaTypes.map((mt) => {
                    const count = allPopulated.filter((m) => m.mediaTypeId === mt.id).length;
                    const pct = allPopulated.length > 0 ? Math.round((count / allPopulated.length) * 100) : 0;
                    return (
                      <div key={mt.id} className="space-y-1">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-300">{mt.name}</span>
                          <span className="text-slate-400 font-mono">{count} karya ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-500 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Status Kurasi & Validasi Karya
                </h4>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Diterbitkan (Published)', count: repoStats.totalPublished, color: 'bg-emerald-500' },
                    { label: 'Menunggu Kurasi (Pending)', count: repoStats.pendingReviewCount, color: 'bg-amber-500' },
                    { label: 'Perlu Revisi (Revision)', count: repoStats.revisionNeededCount, color: 'bg-orange-500' },
                    { label: 'Draft / Konsep Mahasiswa', count: repoStats.draftCount, color: 'bg-slate-500' },
                  ].map((st) => {
                    const pct = allPopulated.length > 0 ? Math.round((st.count / allPopulated.length) * 100) : 0;
                    return (
                      <div key={st.label} className="space-y-1">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-300">{st.label}</span>
                          <span className="text-slate-400 font-mono">{st.count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`${st.color} h-full rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: MODERASI & KURASI KARYA */}
        {activeSection === 'review' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Filter Status:
                </span>
                {(
                  [
                    { id: 'all' as const, label: 'Semua', badge: 0 },
                    { id: 'pending_review' as const, label: 'Menunggu Kurasi', badge: repoStats.pendingReviewCount },
                    { id: 'published' as const, label: 'Diterbitkan', badge: 0 },
                    { id: 'revision_needed' as const, label: 'Perlu Revisi', badge: repoStats.revisionNeededCount },
                    { id: 'rejected' as const, label: 'Ditolak', badge: 0 },
                  ]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setReviewStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      reviewStatusFilter === tab.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        reviewStatusFilter === tab.id ? 'bg-slate-950 text-amber-300' : 'bg-amber-500 text-slate-950'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari karya atau mahasiswa..."
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-48 sm:w-64"
                  />
                </div>
              </div>
            </div>

            {/* List of submissions */}
            {reviewItems.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-display font-bold text-white text-base">
                  Tidak Ada Karya Pada Filter Ini
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Semua pengajuan telah dikurasi atau tidak ditemukan hasil yang cocok dengan kata kunci pencarian.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row gap-5"
                  >
                    {/* Visual Media Card Preview */}
                    <div className="w-full lg:w-48 h-36 shrink-0 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900">
                      <DentalMediaVisual
                        thumbnailKey={item.thumbnailUrl}
                        title={item.title}
                        mediaTypeName={item.mediaType?.name}
                        submediaTypeName={item.submediaType?.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-md ${
                          item.status === 'published'
                            ? 'bg-emerald-500 text-slate-950'
                            : item.status === 'pending_review'
                            ? 'bg-amber-400 text-slate-950 animate-pulse'
                            : item.status === 'revision_needed'
                            ? 'bg-orange-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}>
                          {item.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                          {item.mediaType?.name} • {item.submediaType?.name}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                          {item.topic?.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Sasaran: {item.targetAudience?.name}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-white text-base hover:text-amber-400 transition-colors cursor-pointer"
                          onClick={() => onSelectMedia(item)}>
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 font-mono">
                        <span>Kreator: <strong className="text-slate-300 font-sans">{item.creator.name}</strong> ({item.creator.nim})</span>
                        <span>Format: {item.fileFormat} • {item.fileSize}</span>
                        {item.physicalInventory && (
                          <span className="text-amber-300">
                            Arsip Fisik: {item.physicalInventory.inventoryCode} ({item.physicalInventory.condition})
                          </span>
                        )}
                      </div>

                      {item.reviewNotes && (
                        <div className="mt-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200">
                          <strong>Catatan Kurator:</strong> {item.reviewNotes}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Column */}
                    <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4">
                      <button
                        onClick={() => onSelectMedia(item)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800"
                        title="Lihat Pratinjau Lengkap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau</span>
                      </button>

                      {item.status !== 'published' && (
                        <button
                          onClick={() => handleApprovePublish(item.id, item.title)}
                          className="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                          title="Setujui dan Terbitkan"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenRevisionModal(item)}
                        className="w-full px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                        title="Minta Revisi ke Mahasiswa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Minta Revisi</span>
                      </button>

                      <button
                        onClick={() => handleOpenRejectModal(item)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                        title="Tolak Karya"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800"
                        title="Hapus Karya Permanen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: MASTER SKEMA & KATEGORI */}
        {activeSection === 'schema' && (
          <div className="space-y-8">
            {/* Media Type & Submedia CRUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Jenis Media */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Kategori Utama (Jenis Media)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{mediaTypes.length} Jenis</span>
                </div>

                <form onSubmit={handleCreateMediaType} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Kategori Baru:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Media Audio Interaktif"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Deskripsi Singkat:</label>
                    <input
                      type="text"
                      placeholder="Penjelasan ringkas kategori media..."
                      value={newTypeDesc}
                      onChange={(e) => setNewTypeDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Kategori Media</span>
                  </button>
                </form>

                <div className="divide-y divide-slate-850 pt-2 space-y-2">
                  {mediaTypes.map((mt) => (
                    <div key={mt.id} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{mt.name}</p>
                        <p className="text-[11px] text-slate-400">{mt.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus kategori "${mt.name}"? Seluruh submedia terkait juga akan dihapus.`)) {
                            db.deleteMediaType(mt.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submedia Types */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                    <Tag className="w-4 h-4 text-teal-400" />
                    Sub-Kategori Media
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{submediaTypes.length} Submedia</span>
                </div>

                <form onSubmit={handleCreateSubmedia} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Pilih Kategori Induk:</label>
                    <select
                      value={selectedParentTypeId}
                      onChange={(e) => setSelectedParentTypeId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      {mediaTypes.map((mt) => (
                        <option key={mt.id} value={mt.id}>
                          {mt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Nama Subkategori Baru:</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Flipchart / Balik Gambar"
                      value={newSubmediaName}
                      onChange={(e) => setNewSubmediaName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Subkategori</span>
                  </button>
                </form>

                <div className="max-h-60 overflow-y-auto space-y-1.5 pt-2 pr-1">
                  {submediaTypes.map((smt) => {
                    const parent = mediaTypes.find((m) => m.id === smt.mediaTypeId);
                    return (
                      <div key={smt.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-white">{smt.name}</p>
                          <p className="text-[10px] text-teal-400">Induk: {parent?.name || 'Tidak diketahui'}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus subkategori "${smt.name}"?`)) {
                              db.deleteSubmediaType(smt.id);
                            }
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Topics & Target Audiences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topik Edukasi Gigi */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-white text-base">
                    Topik Edukasi Kesehatan Gigi
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{topics.length} Topik</span>
                </div>

                <form onSubmit={handleCreateTopic} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Tambah topik (cth: Halitosis, Kawat Gigi)..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {topics.map((t) => (
                    <div key={t.id} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                      <span>{t.name}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus topik "${t.name}"?`)) {
                            db.deleteTopic(t.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sasaran Audiens */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-display font-bold text-white text-base">
                    Sasaran Target Audiens
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">{targetAudiences.length} Sasaran</span>
                </div>

                <form onSubmit={handleCreateTarget} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Tambah sasaran (cth: Anak Berkebutuhan Khusus)..."
                    value={newTargetName}
                    onChange={(e) => setNewTargetName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {targetAudiences.map((aud) => (
                    <div key={aud.id} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-center gap-2">
                      <span>{aud.name}</span>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus sasaran audiens "${aud.name}"?`)) {
                            db.deleteTargetAudience(aud.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: INVENTARIS ARSIP FISIK LAB */}
        {activeSection === 'inventory' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <Box className="w-5 h-5 text-amber-400" />
                  Penyimpanan Fisik Laboratorium Media Komunikasi Kesehatan Gigi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pengelolaan lokasi lemari, rak, kode arsip, dan kondisi fisik karya mahasiswa.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kode inventaris atau lemari..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {physicalItems.map((item) => {
                const inv = item.physicalInventory;
                const isEditing = editingInventoryId === item.id;

                return (
                  <div key={item.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                        {inv?.inventoryCode || 'MED-FISIK'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inv?.condition === 'Sangat Baik'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : inv?.condition === 'Baik'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {inv?.condition || 'Baik'}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-white text-sm line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-400">
                      Kreator: <strong className="text-slate-300">{item.creator.name}</strong> ({item.creator.class})
                    </p>

                    {isEditing ? (
                      <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Lokasi Penyimpanan:</label>
                          <input
                            type="text"
                            value={invLocation}
                            onChange={(e) => setInvLocation(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Kondisi:</label>
                            <select
                              value={invCondition}
                              onChange={(e) => setInvCondition(e.target.value as any)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                            >
                              <option value="Sangat Baik">Sangat Baik</option>
                              <option value="Baik">Baik</option>
                              <option value="Perlu Perawatan">Perlu Perawatan</option>
                              <option value="Rusak Ringan">Rusak Ringan</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Jumlah Eksemplar:</label>
                            <input
                              type="number"
                              min={1}
                              value={invCopies}
                              onChange={(e) => setInvCopies(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleSaveInventory(item.id)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition-colors"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingInventoryId(null)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
                        <p className="flex items-start gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>{inv?.storageLocation || 'Laboratorium Media Komunikasi Gigi'}</span>
                        </p>
                        <p className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span>Ketersediaan: <strong>{inv?.copiesCount || 1} Eksemplar Fisik</strong></span>
                        </p>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              setEditingInventoryId(item.id);
                              setInvLocation(inv?.storageLocation || '');
                              setInvCondition(inv?.condition || 'Baik');
                              setInvCopies(inv?.copiesCount || 1);
                            }}
                            className="text-xs text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Ubah Lokasi / Kondisi
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 5: MANAJEMEN AKUN & HAK AKSES */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            {/* Active Superadmin Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border border-amber-600/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> AKUN SUPERADMIN UTAMA
                </span>
                <span className="text-xs font-mono text-emerald-400">Hak Akses: ROOT LEVEL 0</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400">Nama Akun:</p>
                  <p className="font-bold text-base text-white mt-0.5">{currentUser.name}</p>
                  <p className="text-slate-400 mt-2">Email Resmi Superadmin:</p>
                  <p className="font-mono text-amber-300 font-bold">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-slate-400">NIP / Kode Identitas:</p>
                  <p className="font-mono text-white mt-0.5">{currentUser.nip || 'SA-2026-MEDKOM-01'}</p>
                  <p className="text-slate-400 mt-2">Wewenang Sistem:</p>
                  <p className="text-slate-300">Akses Penuh: Halaman Backend, Kurasi, Master Kategori, Inventaris Fisik, dan Ekspor/Impor Database.</p>
                </div>
              </div>
            </div>

            {/* List of Registered Accounts */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  Daftar Akun Pengguna Terdaftar ({allUsers.length})
                </h3>
              </div>

              <div className="divide-y divide-slate-850 space-y-3">
                {allUsers.map((u) => (
                  <div key={u.id} className="pt-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          u.role === 'superadmin'
                            ? 'bg-amber-400 text-slate-950'
                            : u.role === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-teal-500 text-slate-950'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 font-mono">{u.email}</p>
                      <p className="text-slate-500 text-[11px]">{u.nip ? `NIP: ${u.nip}` : `NIM: ${u.nim}`} • {u.prodi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Tambah Administrator Baru */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Tambah Administrator / Kurator Baru
              </h3>
              <p className="text-xs text-slate-400">
                Super Admin dapat menambahkan rekan dosen atau kurator laboratorium jika diperlukan.
              </p>

              {userCreatedMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Akun administrator baru berhasil dibuat!
                </div>
              )}

              <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Nama Lengkap & Gelar:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: drg. Bambang Irawan, M.Kes"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email Resmi:</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@poltekkespalembang.ac.id"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">NIP Dosen:</label>
                  <input
                    type="text"
                    placeholder="1985xxxxxxxxxxxx"
                    value={newUserNip}
                    onChange={(e) => setNewUserNip(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Daftarkan Akun Admin</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECTION 6: LOG AUDIT & CADANGAN DB */}
        {activeSection === 'audit' && (
          <div className="space-y-6">
            {/* Backup & Restore Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Export Backup Card */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">
                      Cadangkan Basis Data (JSON)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Unduh salinan arsip seluruh tabel data karya dan skema.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Berkas JSON memuat seluruh entri jenis media, topik, karya mahasiswa, inventaris laboratorium, dan log audit sistem. Sangat aman dan portabel.
                </p>

                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Cadangan Sekarang</span>
                </button>
              </div>

              {/* Restore Backup Card */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">
                      Pulihkan Basis Data (Restore JSON)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tempelkan teks JSON cadangan untuk memulihkan repository.
                    </p>
                  </div>
                </div>

                {restoreSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Database berhasil dipulihkan! Me-refresh halaman...
                  </div>
                )}

                {restoreError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400" /> {restoreError}
                  </div>
                )}

                <form onSubmit={handleRestoreSubmit} className="space-y-3 text-xs">
                  <textarea
                    rows={3}
                    placeholder="Tempelkan isi file cadangan .json di sini..."
                    value={restoreJsonInput}
                    onChange={(e) => setRestoreJsonInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-[11px] placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pulihkan Data dari JSON</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <h3 className="font-display font-bold text-white text-base">
                    Log Audit Aktivitas Administratif Real-Time
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">{auditLogs.length} Aktivitas Tercatat</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 pr-4">Waktu</th>
                      <th className="py-2.5 px-4">Tindakan / Aksi</th>
                      <th className="py-2.5 px-4">Pelaku</th>
                      <th className="py-2.5 px-4">Rincian Perubahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-sans">
                    {auditLogs.slice(0, 30).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/50">
                        <td className="py-3 pr-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] mr-1.5 ${
                            log.category === 'media'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                              : log.category === 'schema'
                              ? 'bg-teal-950 text-teal-300 border border-teal-800/40'
                              : log.category === 'auth'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                              : 'bg-purple-950 text-purple-300 border border-purple-800/40'
                          }`}>
                            {log.category.toUpperCase()}
                          </span>
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{log.performedBy}</td>
                        <td className="py-3 px-4 text-slate-400 leading-relaxed">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: SLIDER BERANDA (CAROUSEL BANNER) */}
        {activeSection === 'slider' && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/80 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-xl text-white">
                    Kelola Slider Gambar Beranda (Hero Carousel)
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                    Otomatis Berputar 4 Detik
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Atur gambar slide otomatis pada banner beranda Medkom Studio. Anda dapat mengunggah berkas baru, memasang URL gambar, mengubah judul/subjudul/badge, mengubah urutan, menonaktifkan, atau menghapus slide.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetSlidesToDummy}
                  className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  title="Kembalikan ke 4 slide dummy bawaan"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                  <span>Reset Dummy Bawaan</span>
                </button>

                <button
                  onClick={openAddSlideModal}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Slide Baru</span>
                </button>
              </div>
            </div>

            {/* Success message banner */}
            {slideSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{slideSuccessMsg}</span>
              </div>
            )}

            {/* Live Interactive Preview Box */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Pratinjau Langsung Slider Beranda (Live Preview)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {heroSlides.filter(s => s.isActive).length} slide aktif sedang ditampilkan
                </span>
              </div>

              <div className="max-w-2xl mx-auto py-2">
                <HeroSlider slides={heroSlides} />
              </div>
            </div>

            {/* Slides List Grid */}
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/80 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  <span>Daftar Slide Aktif & Tersimpan ({heroSlides.length})</span>
                </h4>
                <span className="text-xs text-slate-400">
                  Slide akan diurutkan berdasarkan nomor urut (terkecil di awal)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className={`rounded-2xl border transition-all p-4 flex flex-col justify-between gap-3 ${
                      slide.isActive
                        ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                        : 'bg-slate-900/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Image Thumbnail and status badge */}
                      <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-500 text-slate-950 shadow-xs">
                            {slide.badge || 'Slide'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-white border border-white/10">
                            Urutan #{slide.order}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => handleToggleSlideActive(slide.id, slide.isActive)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                              slide.isActive
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {slide.isActive ? '● Aktif' : '○ Nonaktif'}
                          </button>
                        </div>
                      </div>

                      {/* Title and details */}
                      <div>
                        <h5 className="font-display font-bold text-sm text-white line-clamp-1">
                          {slide.title}
                        </h5>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {slide.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Arah Navigasi: <strong className="text-teal-300">{slide.targetTab || 'beranda'}</strong></span>
                        <span className="font-mono text-[10px] text-slate-500">{new Date(slide.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => openEditSlideModal(slide)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-amber-400" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSlide(slide.id, slide.title)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Slide Add/Edit Modal */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-700 shadow-2xl space-y-4 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-teal-400" />
                <span>{editingSlideId ? 'Ubah Slide Beranda' : 'Tambah Slide Gambar Baru'}</span>
              </h3>
              <button
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlideForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Judul Slide (Headline): *
                </label>
                <input
                  type="text"
                  required
                  value={slideFormTitle}
                  onChange={(e) => setSlideFormTitle(e.target.value)}
                  placeholder="Contoh: Edukasi Kesehatan Gigi & Mulut Anak Usia Dini"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Subjudul / Deskripsi Singkat:
                </label>
                <textarea
                  rows={2}
                  value={slideFormSubtitle}
                  onChange={(e) => setSlideFormSubtitle(e.target.value)}
                  placeholder="Contoh: Karya animasi interaktif 3D, boardgame kreatif, dan media peraga edukatif mahasiswa"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Label Kategori (Badge):
                  </label>
                  <input
                    type="text"
                    value={slideFormBadge}
                    onChange={(e) => setSlideFormBadge(e.target.value)}
                    placeholder="Contoh: Koleksi Interaktif"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Tautan Tujuan (Tab):
                  </label>
                  <select
                    value={slideFormTargetTab}
                    onChange={(e) => setSlideFormTargetTab(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="jelajahi">Jelajahi Media</option>
                    <option value="upload">Upload Karya</option>
                    <option value="tentang">Tentang Medkom</option>
                  </select>
                </div>
              </div>

              {/* Image Input Options */}
              <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="block font-semibold text-slate-300">
                  Berkas / Tautan Gambar Slide: *
                </label>

                <div>
                  <input
                    type="url"
                    required
                    value={slideFormImageUrl}
                    onChange={(e) => setSlideFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Atau unggah file gambar lokal:</span>
                  <label className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg cursor-pointer transition-colors border border-slate-700 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-teal-400" />
                    <span>Pilih Berkas</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[11px] text-slate-400 mb-1.5">Pilihan Preset Cepat Gambar Kesehatan Gigi:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSlideFormImageUrl('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80')}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] rounded text-slate-300 cursor-pointer"
                    >
                      Pemeriksaan Gigi Anak
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideFormImageUrl('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80')}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] rounded text-slate-300 cursor-pointer"
                    >
                      Model Edukasi Gigi
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideFormImageUrl('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80')}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] rounded text-slate-300 cursor-pointer"
                    >
                      Lab & Ruang Praktikum
                    </button>
                    <button
                      type="button"
                      onClick={() => setSlideFormImageUrl('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80')}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] rounded text-slate-300 cursor-pointer"
                    >
                      Workshop Edukasi
                    </button>
                  </div>
                </div>

                {/* Preview Selected Image */}
                {slideFormImageUrl && (
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-400 mb-1">Pratinjau Gambar:</p>
                    <div className="h-28 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                      <img
                        src={slideFormImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Nomor Urutan Tampil:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={slideFormOrder}
                    onChange={(e) => setSlideFormOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input
                      type="checkbox"
                      checked={slideFormIsActive}
                      onChange={(e) => setSlideFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-700"
                    />
                    <span>Tampilkan di Beranda (Aktif)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingSlideId ? 'Simpan Perubahan' : 'Terbitkan Slide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Decision Modal (Revision Notes / Rejection) */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-700 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                {activeModalAction.action === 'revision' ? (
                  <>
                    <Edit2 className="w-5 h-5 text-amber-400" />
                    <span>Catatan Revisi untuk Mahasiswa</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Alasan Penolakan Karya</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => setActiveModalAction(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Karya: <strong className="text-white">{activeModalAction.itemTitle}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {activeModalAction.action === 'revision'
                  ? 'Umpan Balik / Hal yang Perlu Diperbaiki:'
                  : 'Alasan Tidak Dapat Diterbitkan:'}
              </label>
              <textarea
                rows={4}
                required
                value={reviewNotesInput}
                onChange={(e) => setReviewNotesInput(e.target.value)}
                placeholder={
                  activeModalAction.action === 'revision'
                    ? 'Contoh: Perjelas teks pada poster, gunakan terminologi gigi yang mudah dimengerti anak SD...'
                    : 'Contoh: Format file rusak atau materi belum sesuai dengan etika promosi kesehatan...'
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModalAction(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitReviewDecision}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-colors ${
                  activeModalAction.action === 'revision'
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Kirim Keputusan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
