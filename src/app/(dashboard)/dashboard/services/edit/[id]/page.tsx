import React from 'react';
import { NextLink as Link } from '@/components/shared';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth/server';
import { getServiceForEdit } from '@/actions/services/get-service';
import { FormServiceEdit } from '@/components/forms/service';
import FormServiceEditMedia from '@/components/forms/service/form-service-edit-media';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatusLabels, StatusColors } from '@/lib/types/common';
import { getDashboardMetadata } from '@/lib/seo/pages';

export const metadata = getDashboardMetadata('Επεξεργασία Υπηρεσίας');

interface EditServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  const { id } = await params;

  // Check authentication
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.data.user) {
    redirect('/login');
  }

  const { user, profile } = userResult.data;

  // Check if user can edit services (only professionals)
  if (user.role !== 'freelancer' && user.role !== 'company') {
    redirect('/dashboard');
  }

  // Get the service
  const serviceResult = await getServiceForEdit(Number(id));

  if (!serviceResult.success || !serviceResult.data) {
    notFound();
  }

  const service = serviceResult.data;

  return (
    <div className='max-w-5xl w-full mx-auto space-y-6 p-2 pr-0'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Επεξεργασία Υπηρεσίας
            </h1>
            <Badge
              className={`${StatusColors[service.status].bg} ${
                StatusColors[service.status].text
              } ${StatusColors[service.status].border}`}
              variant='outline'
            >
              {StatusLabels[service.status]}
            </Badge>
          </div>
          <p className='text-muted-foreground'>
            Επεξεργασία της υπηρεσίας {service.title}
          </p>
        </div>
        <Button variant='default' asChild>
          <Link href='/dashboard/services'>Διαχείριση Υπηρεσιών</Link>
        </Button>
      </div>

      <div className='space-y-6'>
        {/* Service Info Form */}
        <FormServiceEdit
          service={service}
          initialUser={user}
          initialProfile={profile}
        />

        {/* Service Media Form */}
        <FormServiceEditMedia
          service={service}
          initialUser={user}
          initialProfile={profile}
          showHeading={false}
        />
      </div>
    </div>
  );
}
