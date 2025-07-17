export interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

export interface UserMenuProps {
  isMobile?: boolean;
}

export interface UserMenuLinkProps {
  item: MenuItem;
}

export interface MobileMenuContainerProps {
  children: React.ReactNode;
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

export interface NavMenuMobileWrapperProps {
  header?: NavMenuMobileProps['header'];
}

export interface MessagesBadgeProps {
  count?: number;
}

export interface SavedMenuProps {
  className?: string;
}

export interface MessagesMenuProps {
  className?: string;
}

export interface NavigationItem {
  id: number;
  name: string;
  path?: string;
  children?: NavigationItem[];
}

export interface HeaderData {
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
}

// Additional types for deeply nested components
export interface FreelancerData {
  isAuthenticated: boolean;
  isConfirmed: boolean;
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  hasAccess: boolean;
  isLoading: boolean;
}

export interface UserImageProps {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  hideDisplayName?: boolean;
  image?: string;
  width?: number;
  height?: number;
}

export interface LogoutLinkProps {
  item: MenuItem;
  custom?: boolean;
}

export interface FormLogoutProps {
  className?: string;
}

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}