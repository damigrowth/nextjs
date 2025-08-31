/**
 * COMPONENT TYPE DEFINITIONS
 * All component prop and interface types
 */

import { ReactNode } from 'react';
import { AuthUser } from './auth';

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

export interface MobileMenuContainerProps {
  children: ReactNode;
}

export interface NavMenuMobileProps {
  header?: {
    data?: {
      attributes?: {
        categories?: {
          data?: Array<{
            attributes: {
              label: string;
              slug: string;
            };
          }>;
        };
      };
    };
  };
}

// User Interface Components
export interface UserImageProps {
  name?: string;
  displayName?: string;
  hideDisplayName?: boolean;
  image?: string;
  width?: number;
  height?: number;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

export interface FreelancerData {
  isAuthenticated: boolean;
  isConfirmed: boolean;
  username?: string;
  displayName?: string;
  name?: string;
  image?: string;
  hasAccess: boolean;
  isLoading: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
}

// Form Components
export interface FormProps {
  className?: string;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
  children?: ReactNode;
}

export interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  children?: ReactNode;
}

export interface FormErrorProps {
  message?: string;
  errors?: string[];
}

export interface FormSuccessProps {
  message?: string;
}

// Layout Components
export interface HeaderProps {
  user?: AuthUser;
  className?: string;
}

export interface FooterProps {
  className?: string;
}

export interface SidebarProps {
  user?: AuthUser;
  isOpen?: boolean;
  onToggle?: () => void;
}

// Auth Components
export interface LoginFormProps {
  redirectTo?: string;
  className?: string;
}

export interface RegisterFormProps {
  redirectTo?: string;
  className?: string;
}

// Auth Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

// Auth Form State Types
export interface LoginFormState {
  errors: Record<string, string[]>;
  message: string | null;
  success: boolean;
  isEmailVerificationError: boolean;
}

export interface RegisterFormState {
  errors: Record<string, string[]>;
  message: string | null;
  success: boolean;
}

export interface FilterProps<T = any> {
  filters: T;
  onFiltersChange: (filters: T) => void;
  options: FilterOption[];
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'checkbox' | 'date' | 'range';
  options?: { value: string; label: string }[];
}

// Media Upload Components
export interface MediaUploadProps {
  value: import('./cloudinary').CloudinaryResource | import('./cloudinary').CloudinaryResource[] | null;
  onChange: (
    resources: import('./cloudinary').CloudinaryResource | import('./cloudinary').CloudinaryResource[] | null,
  ) => void;
  uploadPreset?: string;
  multiple?: boolean;
  folder?: string;
  maxFiles?: number;
  maxFileSize?: number;
  allowedFormats?: string[];
  className?: string;
  placeholder?: string;
  error?: string | import('react-hook-form').FieldError | import('react-hook-form').Merge<import('react-hook-form').FieldError, import('react-hook-form').FieldErrorsImpl<any>>;
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
  resource: import('../utils/media').CloudinaryResourceOrPending | null;
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
  onReorderResources: (resources: import('../utils/media').CloudinaryResourceOrPending[]) => void;
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

export interface UploadDropzoneProps {
  onFilesSelected: (files: FileList) => void;
  canAddMore: boolean;
  isUploading: boolean;
  totalFiles: number;
  queuedFiles: import('../utils/media').QueuedFile[];
  maxFiles: number;
  maxFileSize: number;
  formats: string[];
  error: string | null;
  type: 'image' | 'auto';
  multiple: boolean;
}
