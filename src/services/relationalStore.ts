import {
  MediaType,
  SubmediaType,
  Topic,
  TargetAudience,
  MediaItem,
  MediaItemPopulated,
  User,
  UserAppreciation,
  MediaStatus,
  PhysicalInventory,
  AuditLog,
  HeroSlide,
} from '../types/database';
import {
  INITIAL_USERS,
  INITIAL_MEDIA_TYPES,
  INITIAL_SUBMEDIA_TYPES,
  INITIAL_TOPICS,
  INITIAL_TARGET_AUDIENCES,
  INITIAL_MEDIA_ITEMS,
  INITIAL_HERO_SLIDES,
} from '../data/seedData';

const STORAGE_KEYS = {
  MEDIA_TYPES: 'medikom_media_types_v1',
  SUBMEDIA_TYPES: 'medikom_submedia_types_v1',
  TOPICS: 'medikom_topics_v1',
  TARGET_AUDIENCES: 'medikom_target_audiences_v1',
  MEDIA_ITEMS: 'medikom_media_items_v1',
  USERS: 'medikom_users_v2',
  APPRECIATIONS: 'medikom_appreciations_v1',
  ACTIVE_USER: 'medikom_active_user_v2',
  AUDIT_LOGS: 'medikom_audit_logs_v1',
  HERO_SLIDES: 'medikom_hero_slides_v1',
};

class RelationalDatabaseStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initIfEmpty();
  }

  private initIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEYS.MEDIA_TYPES)) {
      localStorage.setItem(STORAGE_KEYS.MEDIA_TYPES, JSON.stringify(INITIAL_MEDIA_TYPES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMEDIA_TYPES)) {
      localStorage.setItem(STORAGE_KEYS.SUBMEDIA_TYPES, JSON.stringify(INITIAL_SUBMEDIA_TYPES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOPICS)) {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(INITIAL_TOPICS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TARGET_AUDIENCES)) {
      localStorage.setItem(STORAGE_KEYS.TARGET_AUDIENCES, JSON.stringify(INITIAL_TARGET_AUDIENCES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDIA_ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.MEDIA_ITEMS, JSON.stringify(INITIAL_MEDIA_ITEMS));
    }

    // Single Superadmin migration & initialization
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!storedUsers) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    } else {
      try {
        const parsed = JSON.parse(storedUsers) as User[];
        // If old demo accounts (user-mhs-1, etc.) exist or no superadmin, overwrite with single superadmin
        if (parsed.some(u => u.id === 'user-mhs-1' || u.id === 'user-admin-1') || !parsed.some(u => u.role === 'superadmin' || u.role === 'admin')) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.APPRECIATIONS)) {
      localStorage.setItem(STORAGE_KEYS.APPRECIATIONS, JSON.stringify([]));
    }

    // Active user validation
    const storedActiveUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (storedActiveUser) {
      try {
        const parsedActive = JSON.parse(storedActiveUser) as User;
        // Clean legacy demo ids
        if (parsedActive.id === 'user-mhs-1' || parsedActive.id === 'user-mhs-2' || parsedActive.id === 'user-admin-1') {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      }
    }

    // Initial audit logs
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      const initialLogs: AuditLog[] = [
        {
          id: 'log-init-1',
          action: 'Sistem Backend Diaktifkan',
          performedBy: 'Super Admin Medkom Studio',
          details: 'Pembaruan keamanan: Konfigurasi 1 Akun Tunggal Super Admin aktif dengan kontrol penuh backend.',
          timestamp: new Date().toISOString(),
          category: 'system',
        },
        {
          id: 'log-init-2',
          action: 'Sinkronisasi Skema Relasional Master',
          performedBy: 'Super Admin Medkom Studio',
          details: 'Inisialisasi 4 Kategori Media, 18 Subkategori, 8 Topik Kesehatan Gigi, dan 7 Sasaran Audiens.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          category: 'schema',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
    }

    // Hero carousel slides initialization
    if (!localStorage.getItem(STORAGE_KEYS.HERO_SLIDES)) {
      localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener notify error:', e);
      }
    });
  }

  // --- USER AUTHENTICATION ---
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  public getActiveUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public setActiveUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    }
    this.notify();
  }

  public authenticate(identifier: string, _password?: string): User | null {
    const cleanId = identifier.trim().toLowerCase();
    const users = this.getUsers();

    // 1. Check for superadmin keyword, email, nip, or username
    if (
      cleanId === 'superadmin' ||
      cleanId === 'admin' ||
      cleanId === 'superadmin@medkomstudio.ac.id' ||
      cleanId === 'sa-2026-medkom-01'
    ) {
      const sa = users.find((u) => u.role === 'superadmin' || u.role === 'admin') || INITIAL_USERS[0];
      return sa;
    }

    // 2. Check in registered users by email, nim, nip, or name
    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.nim && u.nim.toLowerCase() === cleanId) ||
        (u.nip && u.nip.toLowerCase() === cleanId) ||
        u.name.toLowerCase() === cleanId ||
        u.name.toLowerCase().replace(/\s+/g, '') === cleanId
    );

    return matched || null;
  }

  public registerUser(userData: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setActiveUser(newUser);
    return newUser;
  }

  // --- RELATIONAL SCHEMAS (CATEGORIES, TOPICS, TARGETS) ---
  public getMediaTypes(): MediaType[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDIA_TYPES);
      return data ? JSON.parse(data) : INITIAL_MEDIA_TYPES;
    } catch {
      return INITIAL_MEDIA_TYPES;
    }
  }

  public saveMediaType(mediaType: MediaType) {
    const list = this.getMediaTypes();
    const idx = list.findIndex((m) => m.id === mediaType.id);
    if (idx >= 0) {
      list[idx] = mediaType;
    } else {
      list.push(mediaType);
    }
    localStorage.setItem(STORAGE_KEYS.MEDIA_TYPES, JSON.stringify(list));
    this.notify();
  }

  public deleteMediaType(id: string) {
    const list = this.getMediaTypes().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDIA_TYPES, JSON.stringify(list));
    // Also delete orphaned submedia types
    const subs = this.getSubmediaTypes().filter((s) => s.mediaTypeId !== id);
    localStorage.setItem(STORAGE_KEYS.SUBMEDIA_TYPES, JSON.stringify(subs));
    this.notify();
  }

  public getSubmediaTypes(mediaTypeId?: string): SubmediaType[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMEDIA_TYPES);
      const list: SubmediaType[] = data ? JSON.parse(data) : INITIAL_SUBMEDIA_TYPES;
      if (mediaTypeId) {
        return list.filter((s) => s.mediaTypeId === mediaTypeId);
      }
      return list;
    } catch {
      return INITIAL_SUBMEDIA_TYPES;
    }
  }

  public saveSubmediaType(submedia: SubmediaType) {
    const list = this.getSubmediaTypes();
    const idx = list.findIndex((s) => s.id === submedia.id);
    if (idx >= 0) {
      list[idx] = submedia;
    } else {
      list.push(submedia);
    }
    localStorage.setItem(STORAGE_KEYS.SUBMEDIA_TYPES, JSON.stringify(list));
    this.notify();
  }

  public deleteSubmediaType(id: string) {
    const list = this.getSubmediaTypes().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SUBMEDIA_TYPES, JSON.stringify(list));
    this.notify();
  }

  public getTopics(): Topic[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPICS);
      return data ? JSON.parse(data) : INITIAL_TOPICS;
    } catch {
      return INITIAL_TOPICS;
    }
  }

  public saveTopic(topic: Topic) {
    const list = this.getTopics();
    const idx = list.findIndex((t) => t.id === topic.id);
    if (idx >= 0) {
      list[idx] = topic;
    } else {
      list.push(topic);
    }
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(list));
    this.notify();
  }

  public deleteTopic(id: string) {
    const list = this.getTopics().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(list));
    this.notify();
  }

  public getTargetAudiences(): TargetAudience[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TARGET_AUDIENCES);
      return data ? JSON.parse(data) : INITIAL_TARGET_AUDIENCES;
    } catch {
      return INITIAL_TARGET_AUDIENCES;
    }
  }

  public saveTargetAudience(target: TargetAudience) {
    const list = this.getTargetAudiences();
    const idx = list.findIndex((t) => t.id === target.id);
    if (idx >= 0) {
      list[idx] = target;
    } else {
      list.push(target);
    }
    localStorage.setItem(STORAGE_KEYS.TARGET_AUDIENCES, JSON.stringify(list));
    this.notify();
  }

  public deleteTargetAudience(id: string) {
    const list = this.getTargetAudiences().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TARGET_AUDIENCES, JSON.stringify(list));
    this.notify();
  }

  // --- MEDIA ITEMS & JOIN QUERIES ---
  public getRawMediaItems(): MediaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDIA_ITEMS);
      return data ? JSON.parse(data) : INITIAL_MEDIA_ITEMS;
    } catch {
      return INITIAL_MEDIA_ITEMS;
    }
  }

  public getPopulatedMediaItems(statusFilter?: MediaStatus): MediaItemPopulated[] {
    const rawItems = this.getRawMediaItems();
    const mediaTypes = this.getMediaTypes();
    const submediaTypes = this.getSubmediaTypes();
    const topics = this.getTopics();
    const targetAudiences = this.getTargetAudiences();
    const activeUser = this.getActiveUser();
    const appreciations = this.getAppreciations();

    const mediaTypeMap = new Map(mediaTypes.map((m) => [m.id, m]));
    const submediaTypeMap = new Map(submediaTypes.map((s) => [s.id, s]));
    const topicMap = new Map(topics.map((t) => [t.id, t]));
    const targetMap = new Map(targetAudiences.map((a) => [a.id, a]));

    const filtered = statusFilter
      ? rawItems.filter((item) => item.status === statusFilter)
      : rawItems;

    return filtered.map((item) => {
      const isAppreciated = activeUser
        ? appreciations.some((a) => a.userId === activeUser.id && a.mediaId === item.id)
        : false;

      return {
        ...item,
        mediaType: mediaTypeMap.get(item.mediaTypeId) || {
          id: item.mediaTypeId,
          name: 'Media',
          description: '',
          iconName: 'FileText',
        },
        submediaType: submediaTypeMap.get(item.submediaTypeId) || {
          id: item.submediaTypeId,
          mediaTypeId: item.mediaTypeId,
          name: 'Karya',
        },
        topic: topicMap.get(item.topicId) || {
          id: item.topicId,
          name: 'Kesehatan Gigi',
        },
        targetAudience: targetMap.get(item.targetAudienceId) || {
          id: item.targetAudienceId,
          name: 'Umum',
        },
        isAppreciatedByCurrentUser: isAppreciated,
      };
    });
  }

  public getPopulatedItemById(id: string): MediaItemPopulated | null {
    const all = this.getPopulatedMediaItems();
    return all.find((item) => item.id === id) || null;
  }

  public createMediaItem(itemData: Omit<MediaItem, 'id' | 'downloadsCount' | 'appreciationsCount' | 'uploadedAt'>): MediaItem {
    const list = this.getRawMediaItems();
    const newItem: MediaItem = {
      id: `med-${String(list.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      downloadsCount: 0,
      appreciationsCount: 0,
      uploadedAt: new Date().toISOString(),
      ...itemData,
    };
    if (newItem.status === 'published' && !newItem.publishedAt) {
      newItem.publishedAt = new Date().toISOString();
    }
    list.unshift(newItem);
    localStorage.setItem(STORAGE_KEYS.MEDIA_ITEMS, JSON.stringify(list));
    this.notify();
    return newItem;
  }

  public updateMediaItem(id: string, updates: Partial<MediaItem>): boolean {
    const list = this.getRawMediaItems();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) return false;

    const existing = list[idx];
    const updated: MediaItem = {
      ...existing,
      ...updates,
    };

    if (updates.status === 'published' && !existing.publishedAt) {
      updated.publishedAt = new Date().toISOString();
    }

    list[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.MEDIA_ITEMS, JSON.stringify(list));
    this.notify();
    return true;
  }

  public deleteMediaItem(id: string): boolean {
    const list = this.getRawMediaItems().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDIA_ITEMS, JSON.stringify(list));
    this.notify();
    return true;
  }

  // --- APPRECIATIONS (1 per user per media) ---
  public getAppreciations(): UserAppreciation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPRECIATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public toggleAppreciation(mediaId: string): { isAppreciated: boolean; newCount: number } {
    const activeUser = this.getActiveUser();
    if (!activeUser) {
      throw new Error('Harap login terlebih dahulu untuk memberikan apresiasi.');
    }

    const appreciations = this.getAppreciations();
    const existingIndex = appreciations.findIndex(
      (a) => a.userId === activeUser.id && a.mediaId === mediaId
    );

    const items = this.getRawMediaItems();
    const itemIndex = items.findIndex((i) => i.id === mediaId);
    let newCount = 0;
    let isAppreciated = false;

    if (existingIndex >= 0) {
      // Remove appreciation
      appreciations.splice(existingIndex, 1);
      if (itemIndex >= 0) {
        items[itemIndex].appreciationsCount = Math.max(0, items[itemIndex].appreciationsCount - 1);
        newCount = items[itemIndex].appreciationsCount;
      }
      isAppreciated = false;
    } else {
      // Add appreciation
      appreciations.push({
        id: `apprec-${Date.now()}`,
        userId: activeUser.id,
        mediaId,
        createdAt: new Date().toISOString(),
      });
      if (itemIndex >= 0) {
        items[itemIndex].appreciationsCount = (items[itemIndex].appreciationsCount || 0) + 1;
        newCount = items[itemIndex].appreciationsCount;
      }
      isAppreciated = true;
    }

    localStorage.setItem(STORAGE_KEYS.APPRECIATIONS, JSON.stringify(appreciations));
    localStorage.setItem(STORAGE_KEYS.MEDIA_ITEMS, JSON.stringify(items));
    this.notify();
    return { isAppreciated, newCount };
  }

  public incrementDownload(mediaId: string): number {
    const items = this.getRawMediaItems();
    const itemIndex = items.findIndex((i) => i.id === mediaId);
    if (itemIndex >= 0) {
      items[itemIndex].downloadsCount = (items[itemIndex].downloadsCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.MEDIA_ITEMS, JSON.stringify(items));
      this.notify();
      return items[itemIndex].downloadsCount;
    }
    return 0;
  }

  // --- STATS CALCULATION ---
  public getRepositoryStats() {
    const rawItems = this.getRawMediaItems();
    const published = rawItems.filter((i) => i.status === 'published');
    const digitalCount = published.filter(
      (i) => i.storageType === 'digital' || i.storageType === 'both'
    ).length;
    const physicalCount = published.filter(
      (i) => i.storageType === 'physical' || i.storageType === 'both'
    ).length;

    // Unique student creators
    const creators = new Set(rawItems.map((i) => i.creator.name.toLowerCase()));

    const totalDownloads = published.reduce((sum, item) => sum + (item.downloadsCount || 0), 0);
    const totalAppreciations = published.reduce(
      (sum, item) => sum + (item.appreciationsCount || 0),
      0
    );

    return {
      totalPublished: published.length,
      digitalCount,
      physicalCount,
      uniqueCreatorsCount: creators.size,
      totalDownloads,
      totalAppreciations,
      pendingReviewCount: rawItems.filter((i) => i.status === 'pending_review').length,
      revisionNeededCount: rawItems.filter((i) => i.status === 'revision_needed').length,
      draftCount: rawItems.filter((i) => i.status === 'draft').length,
    };
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addAuditLog(entry: {
    action: string;
    details: string;
    category: 'media' | 'schema' | 'auth' | 'system';
    performedBy?: string;
  }) {
    const logs = this.getAuditLogs();
    const active = this.getActiveUser();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action: entry.action,
      details: entry.details,
      category: entry.category,
      performedBy: entry.performedBy || active?.name || 'Super Admin Medkom Studio',
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 150 logs
    if (logs.length > 150) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    this.notify();
  }

  // --- DATABASE EXPORT & BACKUP TOOLS ---
  public exportDatabaseJSON(): string {
    const backup = {
      exportedAt: new Date().toISOString(),
      system: 'Medkom Studio Relational Repository',
      version: '2.0.0',
      activeSuperadmin: this.getUsers().find(u => u.role === 'superadmin' || u.role === 'admin')?.email,
      data: {
        mediaTypes: this.getMediaTypes(),
        submediaTypes: this.getSubmediaTypes(),
        topics: this.getTopics(),
        targetAudiences: this.getTargetAudiences(),
        mediaItems: this.getRawMediaItems(),
        users: this.getUsers(),
        auditLogs: this.getAuditLogs(),
      }
    };
    return JSON.stringify(backup, null, 2);
  }

  public importDatabaseJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.data) return false;
      if (parsed.data.mediaTypes) localStorage.setItem(STORAGE_KEYS.MEDIA_TYPES, JSON.stringify(parsed.data.mediaTypes));
      if (parsed.data.submediaTypes) localStorage.setItem(STORAGE_KEYS.SUBMEDIA_TYPES, JSON.stringify(parsed.data.submediaTypes));
      if (parsed.data.topics) localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(parsed.data.topics));
      if (parsed.data.targetAudiences) localStorage.setItem(STORAGE_KEYS.TARGET_AUDIENCES, JSON.stringify(parsed.data.targetAudiences));
      if (parsed.data.mediaItems) localStorage.setItem(STORAGE_KEYS.MEDIA_ITEMS, JSON.stringify(parsed.data.mediaItems));
      if (parsed.data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed.data.users));
      if (parsed.data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(parsed.data.auditLogs));
      this.addAuditLog({
        action: 'Database Di-restore dari Berkas Cadangan',
        details: 'Seluruh tabel repositori master berhasil dipulihkan dari berkas JSON.',
        category: 'system'
      });
      this.notify();
      return true;
    } catch (e) {
      console.error('Import DB failed:', e);
      return false;
    }
  }

  // Reset helper
  public resetToFactory() {
    localStorage.removeItem(STORAGE_KEYS.MEDIA_TYPES);
    localStorage.removeItem(STORAGE_KEYS.SUBMEDIA_TYPES);
    localStorage.removeItem(STORAGE_KEYS.TOPICS);
    localStorage.removeItem(STORAGE_KEYS.TARGET_AUDIENCES);
    localStorage.removeItem(STORAGE_KEYS.MEDIA_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.APPRECIATIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.HERO_SLIDES);
    this.initIfEmpty();
    this.notify();
  }

  // ==========================================
  // HERO SLIDES MANAGEMENT (SLIDER BERANDA)
  // ==========================================
  public getHeroSlides(): HeroSlide[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HERO_SLIDES);
      if (stored) {
        const parsed = JSON.parse(stored) as HeroSlide[];
        return parsed.sort((a, b) => a.order - b.order);
      }
    } catch {
      // fallback
    }
    return INITIAL_HERO_SLIDES;
  }

  public getActiveHeroSlides(): HeroSlide[] {
    return this.getHeroSlides().filter((s) => s.isActive);
  }

  public addHeroSlide(slide: Omit<HeroSlide, 'id' | 'createdAt'>): HeroSlide {
    const slides = this.getHeroSlides();
    const newSlide: HeroSlide = {
      ...slide,
      id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      order: slide.order ?? slides.length + 1,
      isActive: slide.isActive ?? true,
    };
    slides.push(newSlide);
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
    this.addAuditLog({
      action: 'Slide Beranda Baru Ditambahkan',
      details: `Slide "${newSlide.title}" berhasil diunggah/dibuat untuk carousel utama beranda.`,
      category: 'system',
    });
    this.notify();
    return newSlide;
  }

  public updateHeroSlide(id: string, updates: Partial<HeroSlide>): HeroSlide | null {
    const slides = this.getHeroSlides();
    const idx = slides.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    slides[idx] = { ...slides[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
    this.addAuditLog({
      action: 'Slide Beranda Diperbarui',
      details: `Informasi slide "${slides[idx].title}" berhasil diperbarui di backend.`,
      category: 'system',
    });
    this.notify();
    return slides[idx];
  }

  public deleteHeroSlide(id: string): boolean {
    const slides = this.getHeroSlides();
    const target = slides.find((s) => s.id === id);
    if (!target) return false;
    const filtered = slides.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(filtered));
    this.addAuditLog({
      action: 'Slide Beranda Dihapus',
      details: `Slide "${target.title}" telah dihapus dari slider beranda.`,
      category: 'system',
    });
    this.notify();
    return true;
  }

  public resetHeroSlidesToDefault(): HeroSlide[] {
    localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(INITIAL_HERO_SLIDES));
    this.addAuditLog({
      action: 'Slide Beranda Direset ke Data Dummy Bawaan',
      details: 'Daftar slide beranda telah dikembalikan ke 4 slide dummy bawaan.',
      category: 'system',
    });
    this.notify();
    return INITIAL_HERO_SLIDES;
  }
}

export const db = new RelationalDatabaseStore();
