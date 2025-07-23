/**
 * COMPONENT TYPE DEFINITIONS
 * All component prop and interface types
 */

import { ReactNode } from 'react';
import { AuthUser, UserProfile } from './auth';

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

// Consent and Auth Types
export interface ConsentOption {
  id: string;
  label: React.ReactNode;
}

// Import auth types from the store to avoid duplication
export type { AuthType, AuthRole as UserRole } from '@/lib/stores/authStore';

// Form Button Types
export type FormButtonIconType = 
  | 'save' 
  | 'delete' 
  | 'arrow-right' 
  | 'arrow-left' 
  | 'arrow-up' 
  | 'arrow-down' 
  | 'angle-right' 
  | 'angle-left' 
  | 'check' 
  | 'times' 
  | 'submit' 
  | 'send' 
  | 'heart' 
  | 'plus' 
  | 'minus' 
  | 'edit' 
  | 'settings' 
  | 'refresh' 
  | 'loading';

export interface FormButtonProps {
  /** Button text content */
  text: string;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Icon to display (predefined icon names) */
  icon?: FormButtonIconType;
  /** Custom icon component (overrides the icon prop) */
  customIcon?: React.ComponentType<{ className?: string }>;
  /** Icon position relative to text */
  iconPosition?: 'left' | 'right';
  /** Loading text to show when loading is true */
  loadingText?: string;
  /** Full width button */
  fullWidth?: boolean;
  /** Additional className for the button */
  className?: string;
  /** Button type (submit, button, reset) */
  type?: 'submit' | 'button' | 'reset';
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button variant from shadcn */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Button size from shadcn */
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRoles?: string[];
  fallback?: ReactNode;
}

// Badge and Status Components
export interface MessagesBadgeProps {
  count?: number;
}

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'verified' | 'banned';
  size?: 'sm' | 'md' | 'lg';
}

// Data Display Components
export interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (item: T) => void;
}

export interface DataTableColumn<T = any> {
  key: string;
  header: string;
  cell?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

// Modal and Dialog Components
export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
}

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Loading and Error Components
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

// Search and Filter Components
export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  className?: string;
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
  options?: { value: string; label: string; }[];
}

// Provider Components
export interface AuthProviderProps {
  children: ReactNode;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
}

export interface NotificationProviderProps {
  children: ReactNode;
}

// Tooltip and Popover Components
export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

// Profile Components
export interface ProfileFormProps {
  user?: AuthUser;
  profile?: UserProfile;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export interface ProfileAvatarProps {
  user?: AuthUser;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUpload?: (file: File) => void;
}

// Dashboard Components
export interface DashboardStatsProps {
  stats: {
    total: number;
    active: number;
    pending: number;
    completed: number;
  };
}

export interface RecentActivityProps {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
  limit?: number;
}

// Admin Components
export interface UserManagementProps {
  users: AuthUser[];
  onUserAction: (action: string, userId: string) => void;
  isLoading?: boolean;
}

export interface ApiKeyManagementProps {
  apiKeys: Array<{
    id: string;
    name: string;
    key: string;
    createdAt: Date;
    expiresAt?: Date;
  }>;
  onCreateKey: (name: string) => void;
  onDeleteKey: (id: string) => void;
}

// Generic component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}