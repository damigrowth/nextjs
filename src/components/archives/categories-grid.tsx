import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { CategoryWithSubcategories } from '@/actions/services/get-categories';
import { Separator } from '../ui/separator';

interface CategoriesGridProps {
  categories: CategoryWithSubcategories[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  if (categories.length === 0) {
    return (
      <section className='py-8'>
        <div className='text-center py-12'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Δεν βρέθηκαν κατηγορίες
          </h3>
          <p className='text-gray-600'>
            Δεν υπάρχουν διαθέσιμες κατηγορίες υπηρεσιών αυτή τη στιγμή
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className='mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Κατηγορίες</h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {categories.map((category) => (
          <Card
            key={category.id}
            className='h-full hover:shadow-lg transition-shadow overflow-hidden'
          >
            {/* Category Image */}
            {category.image && (
              <div className='relative w-full h-48 bg-gray-100'>
                <Image
                  src={category.image.secure_url}
                  alt={category.label}
                  fill
                  className='object-cover'
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />
              </div>
            )}
            <CardHeader className='pb-0 '>
              <div className='flex items-start space-x-3'>
                <div className='flex-1 min-w-0'>
                  <CardTitle className='text-lg mb-2'>
                    <Link
                      href={category.href}
                      className='hover:text-primary transition-colors'
                    >
                      {category.label}
                    </Link>
                  </CardTitle>
                  {category.description && (
                    <CardDescription className='text-sm text-gray-600 line-clamp-2'>
                      {category.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <Separator className='my-6' />
              {category.subcategories.length > 0 && (
                <div className='space-y-2'>
                  {category.subcategories.slice(0, 6).map((subcategory) => (
                    <div key={subcategory.id}>
                      <Link
                        href={subcategory.href}
                        className='text-sm font-medium text-gray-700 hover:text-primary transition-colors truncate block'
                      >
                        {subcategory.label}
                      </Link>
                    </div>
                  ))}
                  {category.subcategories.length > 6 && (
                    <div className='pt-2'>
                      <Link
                        href={category.href}
                        className='text-sm text-primary hover:text-primary/80 font-medium'
                      >
                        Δες όλες τις υποκατηγορίες (
                        {category.subcategories.length - 6}+)
                      </Link>
                    </div>
                  )}
                </div>
              )}
              {category.subcategories.length === 0 && (
                <div className='text-center py-4'>
                  <p className='text-sm text-gray-500'>
                    Δεν υπάρχουν διαθέσιμες υποκατηγορίες
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
