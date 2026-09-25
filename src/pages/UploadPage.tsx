import React, { useState, useMemo } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Box,
  Monitor,
  Layers,
  ArrowRight,
  Send,
  Save,
} from 'lucide-react';
import {
  User,
  MediaType,
  SubmediaType,
  Topic,
  TargetAudience,
  StorageType,
  PhysicalCondition,
  MediaItem,
} from '../types/database';
import { db } from '../services/relationalStore';

interface UploadPageProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onNavigate: (tab: 'beranda' | 'jelajahi' | 'upload' | 'tentang' | 'dashboard-mhs' | 'dashboard-admin') => void;
  mediaTypes: MediaType[];
  submediaTypes: SubmediaType[];
  topics: Topic[];
  targetAudiences: TargetAudience[];
  initialEditItem?: MediaItem | null;
  onFinishEdit?: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  currentUser,
  onOpenLogin,
  onNavigate,
  mediaTypes,
  submediaTypes,
  topics,
  targetAudiences,
  initialEditItem,
  onFinishEdit,
}) => {
  // Form State
  const [title, setTitle] = useState(initialEditItem?.title || '');
  const [description, setDescription] = useState(initialEditItem?.description || '');
  const [course, setCourse] = useState(initialEditItem?.course || 'Media Komunikasi Kesehatan');
  const [year, setYear] = useState<number>(initialEditItem?.year || new Date().getFullYear());
  const [mediaTypeId, setMediaTypeId] = useState<string>(
    initialEditItem?.mediaTypeId || mediaTypes[0]?.id || 'mt-cetak'
  );
  const [submediaTypeId, setSubmediaTypeId] = useState<string>(
    initialEditItem?.submediaTypeId || submediaTypes[0]?.id || 'sub-poster'
  );
  const [topicId, setTopicId] = useState<string>(
    initialEditItem?.topicId || topics[0]?.id || 'top-kebersihan'
  );
  const [targetAudienceId, setTargetAudienceId] = useState<string>(
    initialEditItem?.targetAudienceId || targetAudiences[0]?.id || 'aud-sd'
  );

  // File attributes
  const [thumbnailKey, setThumbnailKey] = useState<string>(
    initialEditItem?.thumbnailUrl || 'poster_karies_gigi'
  );
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string>('');
  const [fileName, setFileName] = useState(initialEditItem?.fileUrl ? 'karya-media.pdf' : '');
  const [fileFormat, setFileFormat] = useState(initialEditItem?.fileFormat || 'PDF');
  const [fileSize, setFileSize] = useState(initialEditItem?.fileSize || '8.2 MB');

  // Storage attributes
  const [storageType, setStorageType] = useState<StorageType>(
    initialEditItem?.storageType || 'digital'
  );
  const [copiesCount, setCopiesCount] = useState<number>(
    initialEditItem?.physicalInventory?.copiesCount || 1
  );
  const [storageLocation, setStorageLocation] = useState(
    initialEditItem?.physicalInventory?.storageLocation ||
      'Laboratorium Media Komunikasi Kesehatan Gigi, Lemari Display A-2'
  );
  const [inventoryCode, setInventoryCode] = useState(
    initialEditItem?.physicalInventory?.inventoryCode || `MED-${new Date().getFullYear()}-00`
  );
  const [condition, setCondition] = useState<PhysicalCondition>(
    initialEditItem?.physicalInventory?.condition || 'Sangat Baik'
  );
  const [physicalNotes, setPhysicalNotes] = useState(
    initialEditItem?.physicalInventory?.notes || ''
  );

  // Declaration
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<'draft' | 'pending_review'>('pending_review');

  // Filter submedia types according to selected media type
  const activeSubmediaList = useMemo(() => {
    return submediaTypes.filter((s) => s.mediaTypeId === mediaTypeId);
  }, [submediaTypes, mediaTypeId]);

  // If submedia type doesn't match the new media type, update it
  const handleMediaTypeChange = (id: string) => {
    setMediaTypeId(id);
    const firstSub = submediaTypes.find((s) => s.mediaTypeId === id);
    if (firstSub) {
      setSubmediaTypeId(firstSub.id);
    }
  };

  // Preset Visual Thumbnails
  const visualPresets = [
    { key: 'poster_karies_gigi', name: 'Poster Edukasi Sikat Gigi' },
    { key: 'boardgame_edukasi', name: 'Boardgame Jelajah Gigi' },
    { key: 'video_animasi_gigi', name: 'Animasi 3D Gigi Geraham' },
    { key: 'booklet_bumil', name: 'Booklet Senyum Bunda' },
    { key: 'flashcard_nutrisi', name: 'Flashcard Nutrisi Gigi' },
    { key: 'leaflet_periodontitis', name: 'Leaflet Periodontitis' },
    { key: 'boneka_jari_gigi', name: 'Boneka Jari Karakter' },
    { key: 'komik_digital_behel', name: 'Komik Remaja Ortodonti' },
    { key: 'popup_anatomi_karies', name: 'Pop-Up Anatomi 3D' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
      setFileFormat(ext);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setFileSize(sizeMb);
    }
  };

  const handleCustomThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomThumbnailUrl(reader.result);
          setThumbnailKey(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (targetStatus: 'draft' | 'pending_review') => {
    setErrorMsg(null);

    if (!currentUser) {
      setErrorMsg('Harap login sebagai mahasiswa untuk mengunggah karya.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Judul karya wajib diisi.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Deskripsi karya wajib diisi.');
      return;
    }

    if (!agreed) {
      setErrorMsg('Harap centang pernyataan orisinalitas karya.');
      return;
    }

    const physicalInventoryData =
      storageType === 'physical' || storageType === 'both'
        ? {
            copiesCount: Number(copiesCount) || 1,
            storageLocation: storageLocation.trim() || 'Laboratorium Media Komunikasi Kesehatan Gigi',
            inventoryCode:
              inventoryCode.trim() || `MED-${year}-KG-${Math.floor(Math.random() * 900 + 100)}`,
            condition,
            notes: physicalNotes.trim(),
          }
        : undefined;

    if (initialEditItem) {
      // Update existing
      db.updateMediaItem(initialEditItem.id, {
        title: title.trim(),
        description: description.trim(),
        course,
        year: Number(year),
        mediaTypeId,
        submediaTypeId,
        topicId,
        targetAudienceId,
        thumbnailUrl: thumbnailKey,
        fileFormat,
        fileSize,
        storageType,
        physicalInventory: physicalInventoryData,
        status: targetStatus,
        reviewNotes: undefined, // Clear previous revision notes upon resubmission
      });
      if (onFinishEdit) onFinishEdit();
      setSubmittedStatus(targetStatus);
      setIsSuccess(true);
    } else {
      // Create new
      db.createMediaItem({
        title: title.trim(),
        description: description.trim(),
        creator: {
          userId: currentUser.id,
          name: currentUser.name,
          nim: currentUser.nim || 'PO.71.25.1.23.042',
          class: 'Tingkat 2B',
          prodi: currentUser.prodi || 'D-III Kesehatan Gigi',
        },
        course,
        year: Number(year),
        mediaTypeId,
        submediaTypeId,
        topicId,
        targetAudienceId,
        thumbnailUrl: thumbnailKey,
        fileUrl: `/files/uploads/${title.toLowerCase().replace(/\s+/g, '-')}.${fileFormat.toLowerCase()}`,
        fileFormat,
        fileSize,
        status: targetStatus,
        storageType,
        physicalInventory: physicalInventoryData,
        digitalStorageLocation: 'Cluster Repository Server Poltekkes Palembang',
      });
      setSubmittedStatus(targetStatus);
      setIsSuccess(true);
    }
  };

  // If not logged in, show friendly authentication gate
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            Login Diperlukan untuk Upload
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Halaman ini khusus untuk mahasiswa yang ingin mengunggah karya media komunikasi kesehatan.
          </p>
        </div>

        <button
          onClick={onOpenLogin}
          className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all inline-flex items-center gap-2"
        >
          <span>Masuk Sebagai Mahasiswa (1-Klik)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Success Confirmation State
  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
            {submittedStatus === 'pending_review'
              ? 'Karya Berhasil Dikirim untuk Review!'
              : 'Draft Karya Berhasil Disimpan!'}
          </h2>
          <p className="text-sm text-slate-600">
            {submittedStatus === 'pending_review'
              ? 'Karya Anda sedang menunggu kurasi dan review oleh Dosen Pembina Mata Kuliah sebelum dipublikasikan secara resmi ke galeri.'
              : 'Anda dapat mengedit dan mengirimkan karya ini kapan saja melalui Dashboard Karya Saya.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('dashboard-mhs')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs"
          >
            Lihat Status di Dashboard Saya
          </button>
          <button
            onClick={() => {
              setIsSuccess(false);
              setTitle('');
              setDescription('');
              setAgreed(false);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs"
          >
            Upload Karya Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Title Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
          <span>{currentUser.name}</span>
          <span aria-hidden="true">·</span>
          <span>NIM: {currentUser.nim}</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          {initialEditItem ? 'Edit Karya Media' : 'Upload Karya'}
        </h1>
        <p className="text-sm text-slate-600">
          Bagikan karya media komunikasi kesehatan Anda melalui Medkom Studio.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Upload Form Container */}
      <div className="space-y-8">
        
        {/* BAGIAN 1: INFORMASI KARYA */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-lg text-slate-900">
              1. Informasi Karya
            </h2>
            <p className="text-xs text-slate-500">
              Masukkan identitas karya media komunikasi kesehatan gigi
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Judul Karya Media <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Poster Edukasi: Jurus 2 Menit Sikat Gigi Tepat"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Deskripsi Lengkap Karya <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Jelaskan pesan edukasi utama, latar belakang, alat dan bahan, serta petunjuk penggunaannya..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Mata Kuliah:
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Tahun Pembuatan:
                </label>
                <input
                  type="number"
                  min={2020}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Jenis Media */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Jenis Media:
                </label>
                <select
                  value={mediaTypeId}
                  onChange={(e) => handleMediaTypeChange(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {mediaTypes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subjenis Media (Cascaded) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Subjenis Media:
                </label>
                <select
                  value={submediaTypeId}
                  onChange={(e) => setSubmediaTypeId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {activeSubmediaList.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Topik */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Topik Kesehatan Gigi:
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sasaran */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Sasaran Audiens:
                </label>
                <select
                  value={targetAudienceId}
                  onChange={(e) => setTargetAudienceId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {targetAudiences.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: FILE KARYA & THUMBNAIL */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-lg text-slate-900">
              2. File Karya & Visual Cover
            </h2>
            <p className="text-xs text-slate-500">
              Pilih template visual atau unggah file master media Anda
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Visual Cover Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                Pilih Cover Visual Edukasi Gigi:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {visualPresets.map((vp) => (
                  <button
                    type="button"
                    key={vp.key}
                    onClick={() => {
                      setThumbnailKey(vp.key);
                      setCustomThumbnailUrl('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      thumbnailKey === vp.key && !customThumbnailUrl
                        ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-500 font-bold text-teal-900'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-teal-600 flex items-center justify-center shrink-0">
                        {thumbnailKey === vp.key && !customThumbnailUrl && (
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                        )}
                      </div>
                      <span className="truncate">{vp.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom thumbnail upload option */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Atau Unggah Gambar Cover Sendiri (Opsional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomThumbnailUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>

            {/* File Utama Upload */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Upload File Utama Karya (PDF, MP4, Audio, ZIP Desain):
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors">
                <UploadCloud className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800 text-sm">
                  {fileName ? fileName : 'Pilih file master media Anda'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Format yang didukung: PDF, MP4, MP3, ZIP, PNG. Maksimal 100 MB.
                </p>
                <label className="mt-3 inline-block px-4 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold rounded-lg cursor-pointer transition-colors text-xs">
                  <span>Browse File</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* File details */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <span className="text-slate-600 text-xs font-medium">Format Terdeteksi:</span>
                  <input
                    type="text"
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-600 text-xs font-medium">Ukuran File:</span>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono mt-1"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BAGIAN 3: INFORMASI MEDIA FISIK */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-display font-bold text-lg text-slate-900">
              3. Informasi Media Fisik & Penyimpanan
            </h2>
            <p className="text-xs text-slate-500">
              Tentukan ketersediaan file secara digital dan/atau alat peraga fisik di laboratorium
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-2 text-sm">
                Tipe Ketersediaan Media:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                <button
                  type="button"
                  onClick={() => setStorageType('digital')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    storageType === 'digital'
                      ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-500 font-bold text-teal-900'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Monitor className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Media Digital</p>
                    <p className="text-xs text-slate-500 font-normal">Hanya file digital</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStorageType('physical')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    storageType === 'physical'
                      ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-500 font-bold text-teal-900'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Box className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Media Fisik</p>
                    <p className="text-xs text-slate-500 font-normal">Hanya fisik lab</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStorageType('both')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    storageType === 'both'
                      ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-500 font-bold text-teal-900'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Layers className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Digital & Fisik</p>
                    <p className="text-xs text-slate-500 font-normal">Tersedia keduanya</p>
                  </div>
                </button>

              </div>
            </div>

            {/* If Physical or Both is selected */}
            {(storageType === 'physical' || storageType === 'both') && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3.5 mt-4">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Box className="w-4 h-4 text-amber-700" />
                  <span>Detail Inventaris Media Fisik Laboratorium</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Jumlah Eksemplar Fisik:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={copiesCount}
                      onChange={(e) => setCopiesCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Kondisi Fisik Media:
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as PhysicalCondition)}
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                    >
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Perlu Perawatan">Perlu Perawatan</option>
                      <option value="Rusak Ringan">Rusak Ringan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Lokasi Penyimpanan di Lab:
                  </label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="Contoh: Laboratorium Media Komunikasi Kesehatan Gigi, Lemari Display A-2"
                    className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Kode Inventaris (Jika Tersedia):
                    </label>
                    <input
                      type="text"
                      value={inventoryCode}
                      onChange={(e) => setInventoryCode(e.target.value)}
                      placeholder="MED-2026-KG-001"
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Catatan Spesifikasi Media Fisik:
                    </label>
                    <input
                      type="text"
                      value={physicalNotes}
                      onChange={(e) => setPhysicalNotes(e.target.value)}
                      placeholder="Contoh: Cetak Art Carton 260gsm, Ukuran A2, Pigura Kayu"
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* BAGIAN 4: PERNYATAAN ORISINALITAS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Saya menyatakan bahwa karya ini merupakan karya yang dapat dibagikan untuk kepentingan pendidikan dan telah mengikuti ketentuan yang berlaku di Jurusan Kesehatan Gigi Poltekkes Kemenkes Palembang.
            </span>
          </label>
        </div>

        {/* Action Buttons: Simpan Draft vs Kirim untuk Review */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Simpan Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('pending_review')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Kirim untuk Review</span>
          </button>
        </div>

      </div>

    </div>
  );
};
