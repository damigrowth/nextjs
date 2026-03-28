import { requirePermission } from '@/actions/auth/server';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { getAllBlogCategories } from '@/constants/datasets/blog-categories';
import { prisma } from '@/lib/prisma/client';

import { SiteHeader } from '@/components/admin/site-header';
import { ArticleForm } from '@/components/admin/article-form';

export const dynamic = 'force-dynamic';

export default async function CreateArticlePage() {
  await requirePermission(ADMIN_RESOURCES.BLOG, '/admin');

  const categories = getAllBlogCategories();

  const profiles = await prisma.profile.findMany({
    where: { published: true },
    select: {
      id: true,
      displayName: true,
      username: true,
      email: true,
      image: true,
    },
    orderBy: { displayName: 'asc' },
  });

  const profileOptions = profiles.map((p) => ({
    id: p.id,
    label: p.displayName || p.username || 'Unknown',
    email: p.email || '',
    image: p.image || '',
  }));

  return (
    <>
      <SiteHeader title='Νέο Άρθρο' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='mx-auto w-full max-w-5xl px-4 lg:px-6'>
          <ArticleForm
            categories={categories}
            profileOptions={profileOptions}
          />
        </div>
      </div>
    </>
  );
}
