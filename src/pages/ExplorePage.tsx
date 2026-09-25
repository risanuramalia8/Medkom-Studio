import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  X,
  Layers,
} from 'lucide-react';
import {
  MediaItemPopulated,
  MediaType,
  SubmediaType,
  Topic,
  TargetAudience,
} from '../types/database';
import { MediaCard } from '../components/MediaCard';

interface ExplorePageProps {
  items: MediaItemPopulated[];
  mediaTypes: MediaType[];
  submediaTypes: SubmediaType[];
  topics: Topic[];
  targetAudiences: TargetAudience[];
  selectedMediaTypeId: string;
  onSelectMediaTypeId: (id: string) => void;
  onSelectMedia: (item: MediaItemPopulated) => void;
  onToggleAppreciation: (e: React.MouseEvent, id: string) => void;
  onDownload: (e: React.MouseEvent, item: MediaItemPopulated) => void;
  initialSearchQuery?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  items,
  mediaTypes,
  submediaTypes,
  topics,
  targetAudiences,
  selectedMediaTypeId,
  onSelectMediaTypeId,
  onSelectMedia,
  onToggleAppreciation,
  onDownload,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedSubmediaId, setSelectedSubmediaId] = useState<string>('all');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'terbaru' | 'terpopuler' | 'download'>('terbaru');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Available submedia types cascaded for the selected media type
  const activeSubmediaList = useMemo(() => {
    if (selectedMediaTypeId === 'all') {
      return submediaTypes;
    }
    return submediaTypes.filter((s) => s.mediaTypeId === selectedMediaTypeId);
  }, [submediaTypes, selectedMediaTypeId]);

  // Unique years extracted from available items
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(items.map((i) => i.year))).sort((a, b) => b - a);
    return years;
  }, [items]);

  // Reset Submedia if it doesn't belong to newly selected Media Type
  const handleMediaTypeChange = (typeId: string) => {
    onSelectMediaTypeId(typeId);
    setSelectedSubmediaId('all');
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Status filter: only published items appear in public repository
        if (item.status !== 'published') return false;

        // Search Query (matches title, description, course, or topic)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchTopic = item.topic.name.toLowerCase().includes(q);
          const matchSub = item.submediaType.name.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchTopic && !matchSub) {
            return false;
          }
        }

        // Jenis Media
        if (selectedMediaTypeId !== 'all' && item.mediaTypeId !== selectedMediaTypeId) {
          return false;
        }

        // Subjenis Media
        if (selectedSubmediaId !== 'all' && item.submediaTypeId !== selectedSubmediaId) {
          return false;
        }

        // Topik
        if (selectedTopicId !== 'all' && item.topicId !== selectedTopicId) {
          return false;
        }

        // Sasaran
        if (selectedTargetId !== 'all' && item.targetAudienceId !== selectedTargetId) {
          return false;
        }

        // Tahun
        if (selectedYear !== 'all' && item.year.toString() !== selectedYear) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'terpopuler') {
          return (b.appreciationsCount || 0) - (a.appreciationsCount || 0);
        }
        if (sortBy === 'download') {
          return (b.downloadsCount || 0) - (a.downloadsCount || 0);
        }
        // Default: terbaru
        return (
          new Date(b.publishedAt || b.uploadedAt).getTime() -
          new Date(a.publishedAt || a.uploadedAt).getTime()
        );
      });
  }, [
    items,
    searchQuery,
    selectedMediaTypeId,
    selectedSubmediaId,
    selectedTopicId,
    selectedTargetId,
    selectedYear,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedMediaTypeId !== 'all' ||
    selectedSubmediaId !== 'all' ||
    selectedTopicId !== 'all' ||
    selectedTargetId !== 'all' ||
    selectedYear !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    onSelectMediaTypeId('all');
    setSelectedSubmediaId('all');
    setSelectedTopicId('all');
    setSelectedTargetId('all');
    setSelectedYear('all');
    setSortBy('terbaru');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Jelajahi Media
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Temukan berbagai media komunikasi kesehatan berdasarkan jenis, topik, dan sasaran.
        </p>
      </div>

      {/* Large Intuitive Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Cari media, judul, atau kata kunci..."
            className="w-full pl-12 pr-12 py-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Category Segmented Control (Interactive Filter Tabs) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-xl overflow-x-auto">
        <button
          onClick={() => handleMediaTypeChange('all')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
            selectedMediaTypeId === 'all'
              ? 'bg-white text-teal-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Jenis Media
        </button>
        {mediaTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleMediaTypeChange(type.id)}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
              selectedMediaTypeId === type.id
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Secondary Cascading Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <SlidersHorizontal className="w-4 h-4 text-teal-600" />
            <span>Filter Spesifik</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Subjenis Media */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subjenis Media:
            </label>
            <div className="relative">
              <select
                value={selectedSubmediaId}
                onChange={(e) => setSelectedSubmediaId(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Semua Subjenis</option>
                {activeSubmediaList.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Topik */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Topik Kesehatan Gigi:
            </label>
            <div className="relative">
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Semua Topik</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Sasaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Sasaran Audiens:
            </label>
            <div className="relative">
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Semua Sasaran</option>
                {targetAudiences.map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tahun Pembuatan:
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year.toString()}>
                    Tahun {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* Results Header: Count & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-500">
          Menampilkan <span className="font-bold text-slate-900 tabular-nums">{filteredItems.length}</span> karya media edukasi
          {hasActiveFilters && ' (terfilter)'}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Urutkan:</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setSortBy('terbaru')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                sortBy === 'terbaru' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Terbaru
            </button>
            <button
              onClick={() => setSortBy('terpopuler')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                sortBy === 'terpopuler' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Apresiasi Terbanyak
            </button>
            <button
              onClick={() => setSortBy('download')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                sortBy === 'download' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Paling Banyak Diunduh
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={onSelectMedia}
              onToggleAppreciation={onToggleAppreciation}
              onDownload={onDownload}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Tidak ditemukan media yang sesuai
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Coba ubah kata kunci atau sesuaikan filter jenis media, topik, atau sasaran.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

    </div>
  );
};
