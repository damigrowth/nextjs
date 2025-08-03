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
