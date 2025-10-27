'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import {
  Grid3x3,
  ChevronRight,
  ChevronDown,
  Palette,
  Calendar,
  Heart,
  Star,
  Megaphone,
  Code,
  Ruler,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map category icons to Lucide React icons
const categoryIconMap: Record<string, React.ComponentType<any>> = {
  'flaticon-content': Palette,
  'flaticon-place': Calendar,
  'flaticon-like': Heart,
  'flaticon-star': Star,
  'flaticon-digital-marketing': Megaphone,
  'flaticon-developer': Code,
  'flaticon-ruler': Ruler,
  'flaticon-customer-service': Headphones,
};

const regularMenuItems = [
  { href: '/categories', label: 'Υπηρεσίες' },
  { href: '/dir', label: 'Επαγγελματικός Κατάλογος' },
];

interface NavMenuProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function NavMenu({ isMobile = false, onClose }: NavMenuProps) {
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Mobile version - simple vertical list
  if (isMobile) {
    return (
      <nav className="space-y-2">
        {/* Categories with collapsible submenu */}
        <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between px-0 h-auto py-3"
            >
              <span className="text-base font-medium">Κατηγορίες</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {serviceTaxonomies.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                onClick={handleLinkClick}
                className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                {category.label}
              </Link>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Regular menu items */}
        {regularMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleLinkClick}
            className="block px-0 py-3 text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    );
  }

  // Desktop version - full NavigationMenu with mega menu
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Mega Menu Dropdown for Categories */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className='flex items-center'>
            <Grid3x3 className='h-4 w-4 mr-2' />
            Κατηγορίες
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div
              className='relative flex'
              onMouseLeave={() => {
                const id = setTimeout(() => {
                  setHoveredCategory(null);
                }, 150);
                setTimeoutId(id);
              }}
              onMouseEnter={() => {
                if (timeoutId) {
                  clearTimeout(timeoutId);
                  setTimeoutId(null);
                }
              }}
            >
              {/* Left Panel - Categories List */}
              <div className='w-64 border-r p-2'>
                <div className='space-y-1'>
                  {serviceTaxonomies.map((category) => {
                    const IconComponent =
                      categoryIconMap[category.icon] || Grid3x3;
                    return (
                      <div
                        key={category.id}
                        className='relative'
                        onMouseEnter={() => {
                          setHoveredCategory(category.id);
                        }}
                      >
                        <Link
                          href={`/categories/${category.slug}`}
                          className='flex items-center justify-between rounded-md p-3 text-sm transition-colors hover:bg-accent'
                        >
                          <div className='flex items-center gap-3'>
                            <IconComponent className='h-4 w-4 text-muted-foreground' />
                            <span className='font-medium'>
                              {category.label}
                            </span>
                          </div>
                          <ChevronRight className='h-4 w-4 text-muted-foreground' />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel - Subcategories */}
              {hoveredCategory && (
                <div className='w-[600px] p-6'>
                  {serviceTaxonomies
                    .filter((cat) => cat.id === hoveredCategory)
                    .map((category) => (
                      <div key={category.id}>
                        <h3 className='mb-4 text-lg font-semibold'>
                          {category.label}
                        </h3>
                        <div className='grid grid-cols-3 gap-6'>
                          {category.children?.slice(0, 6).map((subcategory) => (
                            <div key={subcategory.id} className='space-y-2'>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={`/ipiresies/${subcategory.slug}`}
                                  className='block font-medium text-sm hover:text-primary transition-colors'
                                >
                                  {subcategory.label}
                                </Link>
                              </NavigationMenuLink>
                              <div className='space-y-1'>
                                {subcategory.children
                                  ?.slice(0, 3)
                                  .map((subdivision) => (
                                    <NavigationMenuLink
                                      key={subdivision.id}
                                      asChild
                                    >
                                      <Link
                                        href={`/ipiresies/${subcategory.slug}/${subdivision.slug}`}
                                        className='block text-xs text-muted-foreground hover:text-foreground transition-colors'
                                      >
                                        {subdivision.label}
                                      </Link>
                                    </NavigationMenuLink>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Regular Menu Items */}
        {regularMenuItems.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href={item.href}>{item.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}