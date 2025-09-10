/**
 * COMPONENT TYPE DEFINITIONS
 * All component prop and interface types
 */

import { DatasetItem } from './datasets';

// Navigation and Menu types
export interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

export interface NavigationItem {
  id: number;
  name: string;
  path?: string;
  children?: NavigationItem[];
}

export interface UserMenuProps {
  isMobile?: boolean;
}

export interface UserMenuLinkProps {
  item: MenuItem;
}

// Media Upload Components
export interface MediaUploadProps {
  value:
    | import('./cloudinary').CloudinaryResource
    | import('./cloudinary').CloudinaryResource[]
    | string
    | null;
  onChange: (
    resources:
      | import('./cloudinary').CloudinaryResource
      | import('./cloudinary').CloudinaryResource[]
      | string
      | null,
  ) => void;
  uploadPreset?: string;
  multiple?: boolean;
  folder?: string;
  maxFiles?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  className?: string;
  placeholder?: string;
  error?:
    | string
    | import('react-hook-form').FieldError
    | import('react-hook-form').Merge<
        import('react-hook-form').FieldError,
        import('react-hook-form').FieldErrorsImpl<any>
      >;
  type?: 'image' | 'auto';
  signed?: boolean;
  signatureEndpoint?: string;
}

export interface MediaUploadRef {
  uploadFiles: () => Promise<void>;
  hasFiles: () => boolean;
  clearQueue: () => void;
}

export interface ProfileImageUploadProps {
  resource:
    | import('../utils/media').CloudinaryResourceOrPending
    | string
    | null;
  queuedFile: import('../utils/media').QueuedFile | null;
  onFileSelect: (files: FileList) => void;
  onRemove: () => void;
  isUploading: boolean;
  error: string | null;
  maxFileSize: number;
  formats: string[];
  className?: string;
}

export interface GalleryUploadProps {
  resources: import('../utils/media').CloudinaryResourceOrPending[];
  queuedFiles: import('../utils/media').QueuedFile[];
  onFilesSelected: (files: FileList) => void;
  onRemoveResource: (publicId: string) => void;
  onRemoveFromQueue: (fileId: string) => void;
  onReorderResources: (
    resources: import('../utils/media').CloudinaryResourceOrPending[],
  ) => void;
  isUploading: boolean;
  error: string | null;
  maxFiles: number;
  maxFileSize: number;
  formats: string[];
  canAddMore: boolean;
  className?: string;
  type: 'image' | 'auto';
}

export interface ResourcePreviewProps {
  resource: import('../utils/media').CloudinaryResourceOrPending;
  index: number;
  onRemove: (publicId: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
  width?: number;
  height?: number;
}

export interface ProfileInfoProps {
  rate?: number;
  coverage?: PrismaJson.Coverage;
  commencement?: string;
  website?: string;
  phone?: string;
  viber?: string;
  whatsapp?: string;
  email?: string;
  visibility?: PrismaJson.VisibilitySettings;
  isOwner?: boolean;
}

// Profile meta component props
export interface ProfileMetaProps {
  displayName: string;
  firstName?: string;
  lastName?: string;
  tagline?: string;
  image?: PrismaJson.CloudinaryResource | string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  top?: boolean;
  coverage?: PrismaJson.Coverage;
  visibility?: PrismaJson.VisibilitySettings;
  socials?: PrismaJson.SocialMedia;
}

export interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value?: string | number;
  isFullWidth?: boolean;
}

// Profile metrics component props
export interface ProfileMetricsProps {
  subcategory?: DatasetItem;
  servicesCount?: number;
  commencement?: string;
  experience?: number;
}

export interface ProfileRatingProps {
  totalReviews: number;
  rating: number;
  clickable?: boolean;
}

// Skills component props
export interface ProfileSkillsProps {
  skills: DatasetItem[]; // Array of skill IDs
  speciality?: string; // Speciality ID
}

// Features component props
export interface ProfileFeaturesProps {
  contactMethods?: string[];
  paymentMethods?: string[];
  settlementMethods?: string[];
  size?: string;
  budget?: string;
  industries?: string[];
  // Resolved data from taxonomies
  contactMethodsData?: DatasetItem[];
  paymentMethodsData?: DatasetItem[];
  settlementMethodsData?: DatasetItem[];
  industriesData?: DatasetItem[];
}

export interface TaxonomyTab {
  id: string;
  slug: string;
  label: string;
  plural?: string;
  [key: string]: any; // Allow additional properties
}

export interface TaxonomyTabsProps {
  items: TaxonomyTab[];
  basePath: string;
  allItemsLabel: string;
  activeItemSlug?: string;
  usePluralLabels?: boolean;
  className?: string;
}

export interface BreadcrumbButtonsProps {
  subjectTitle: string;
  id: string;
  savedStatus?: boolean;
  saveType?: string; // This matches the flexible role system
  hideSaveButton?: boolean;
  isAuthenticated?: boolean;
}

export type ProfileBreadcrumbProfileData = {
  id: string;
  username: string;
  displayName: string;
  role: string; // This matches the Prisma schema where role is String
};

export interface ProfileBreadcrumbProps {
  profile: ProfileBreadcrumbProfileData;
  category?: DatasetItem;
  subcategory?: DatasetItem;
  savedStatus?: boolean;
  hideSaveButton?: boolean;
  isAuthenticated?: boolean;
}
