'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
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
import { categoryIconMap } from '@/constants/datasets/category-icons';
import { Grid3x3, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavigationMenuCategory } from '@/lib/types/components';
import NextLink from '../../next-link';

const regularMenuItems = [
  { href: '/categories', label: 'Κατάλογος Υπηρεσιών' },
  { href: '/directory', label: 'Επαγγελματικός Κατάλογος' },
];

interface NavMenuProps {
  navigationData: NavigationMenuCategory[];
  isMobile?: boolean;
  onClose?: () => void;
}

export default function NavMenu({
  navigationData,
  isMobile = false,
  onClose,
}: NavMenuProps) {
  const pathname = usePathname();
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(
    null,
  );
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
      <nav className='space-y-2'>
        {/* Categories with collapsible submenu */}
        <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant='ghost'
              className='w-full justify-between px-0 h-auto py-3'
            >
              <span className='text-base font-medium'>Κατηγορίες</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className='space-y-2 mt-2'>
            {navigationData.map((category) => (
              <NextLink
                key={category.id}
                href={`/categories/${category.slug}`}
                onClick={handleLinkClick}
                className='block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors'
              >
                {category.label}
              </NextLink>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Regular menu items */}
        {regularMenuItems.map((item) => (
          <NextLink
            key={item.href}
            href={item.href}
            onClick={handleLinkClick}
            className='block px-0 py-3 text-base font-medium text-gray-900 hover:text-primary transition-colors'
          >
            {item.label}
          </NextLink>
        ))}
      </nav>
    );
  }

  // Desktop version - full NavigationMenu with mega menu
  return (
    <NavigationMenu>
      <NavigationMenuList className='gap-2'>
        {/* Mega Menu Dropdown for Categories */}
        <NavigationMenuItem>
          <NavigationMenuTrigger variant='pale' className='flex items-center'>
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
                  {navigationData.map((category) => {
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
                        <NextLink
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
                        </NextLink>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel - Subcategories */}
              {hoveredCategory && (
                <div className='w-[600px] p-6 relative'>
                  {navigationData
                    .filter((cat) => cat.id === hoveredCategory)
                    .map((category) => (
                      <div key={category.id}>
                        <NextLink
                          href={`/categories/${category.slug}`}
                          className='mb-4 text-lg font-semibold text-primary hover:text-primary/80 transition-colors inline-block'
                        >
                          {category.label}
                        </NextLink>
                        <div className='grid grid-cols-3 gap-4 pb-12'>
                          {category.subcategories.map((subcategory) => (
                            <div key={subcategory.id} className='space-y-2'>
                              <NavigationMenuLink asChild>
                                <NextLink
                                  href={subcategory.href}
                                  className='block font-medium text-sm hover:text-primary transition-colors'
                                >
                                  {subcategory.label}
                                </NextLink>
                              </NavigationMenuLink>
                              <div className='space-y-2'>
                                {subcategory.topSubdivisions.map(
                                  (subdivision) => (
                                    <NavigationMenuLink
                                      key={subdivision.id}
                                      asChild
                                    >
                                      <NextLink
                                        href={subdivision.href}
                                        className='block text-sm text-muted-foreground hover:text-foreground transition-colors'
                                      >
                                        - {subdivision.label}
                                      </NextLink>
                                    </NavigationMenuLink>
                                  ),
                                )}
                                {subcategory.hasMoreSubdivisions && (
                                  <NextLink
                                    href={subcategory.href}
                                    className='block text-sm text-primary hover:text-primary/80 font-medium pt-2'
                                  >
                                    Προβολή όλων (
                                    {subcategory.totalSubdivisions})
                                  </NextLink>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Show all subcategories button - bottom right */}
                        {category.hasMoreSubcategories && (
                          <div className='absolute bottom-4 right-6'>
                            <NextLink
                              href={category.href}
                              className='inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors'
                            >
                              Προβολή όλων των Υποκατηγοριών
                              <ArrowRight className='h-4 w-4' />
                            </NextLink>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Regular Menu Items */}
        {regularMenuItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const isCategoriesLink = item.href === '/categories';
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle({ variant: 'pale' }),
                  isActive && 'bg-pale text-pale-foreground',
                  isCategoriesLink && 'border border-current',
                )}
              >
                <NextLink href={item.href}>{item.label}</NextLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
