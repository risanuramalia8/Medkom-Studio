export type UserRole = 'superadmin' | 'admin' | 'mahasiswa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nim?: string;
  nip?: string;
  prodi?: string;
  avatarUrl?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
  category: 'media' | 'schema' | 'auth' | 'system';
}

export interface MediaType {
  id: string;
  name: string;
  description: string;
  iconName: string;
  badgeColor?: string;
}

export interface SubmediaType {
  id: string;
  mediaTypeId: string; // Foreign Key to MediaType.id
  name: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
}

export interface TargetAudience {
  id: string;
  name: string;
  description?: string;
}

export type MediaStatus = 'draft' | 'pending_review' | 'revision_needed' | 'published' | 'rejected';

export type StorageType = 'digital' | 'physical' | 'both';

export type PhysicalCondition = 'Sangat Baik' | 'Baik' | 'Perlu Perawatan' | 'Rusak Ringan';

export interface PhysicalInventory {
  copiesCount: number;
  storageLocation: string; // e.g. "Laboratorium Media Komunikasi Kesehatan Gigi, Lemari C2-Rak 3"
  inventoryCode: string; // e.g. "MED-2026-KG-001"
  condition: PhysicalCondition;
  notes?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  creator: {
    userId: string;
    name: string;
    nim: string;
    class: string;
    prodi: string;
    avatarUrl?: string;
  };
  course: string;
  year: number;
  mediaTypeId: string;
  submediaTypeId: string;
  topicId: string;
  targetAudienceId: string;
  thumbnailUrl: string;
  fileUrl: string;
  fileFormat: string;
  fileSize: string;
  status: MediaStatus;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  downloadsCount: number;
  appreciationsCount: number;
  uploadedAt: string;
  publishedAt?: string;
  isFeatured?: boolean;
  storageType: StorageType;
  physicalInventory?: PhysicalInventory;
  digitalStorageLocation?: string;
}

export interface UserAppreciation {
  id: string;
  userId: string;
  mediaId: string;
  createdAt: string;
}

// Joined View with relational lookups for fast rendering
export interface MediaItemPopulated extends MediaItem {
  mediaType: MediaType;
  submediaType: SubmediaType;
  topic: Topic;
  targetAudience: TargetAudience;
  isAppreciatedByCurrentUser?: boolean;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  linkUrl?: string;
  targetTab?: 'jelajahi' | 'upload' | 'tentang';
  order: number;
  isActive: boolean;
  createdAt: string;
}
