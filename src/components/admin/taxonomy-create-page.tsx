import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteHeader } from '@/components/admin';

export interface TaxonomyCreatePageProps {
  title: string;
  backPath: string;
  backLabel: string;
  description: string;
  children: ReactNode;
}

export function TaxonomyCreatePage({
  title,
  backPath,
  backLabel,
  description,
  children,
}: TaxonomyCreatePageProps) {
  return (
    <>
      <SiteHeader
        title={title}
        actions={
          <Button variant='ghost' size='sm' asChild>
            <Link href={backPath}>
              <ArrowLeft className='h-4 w-4' />
              {backLabel}
            </Link>
          </Button>
        }
      />
      <div className='mx-auto w-full max-w-5xl px-4 lg:px-6 flex flex-col gap-4 pb-16 pt-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>{title}</CardTitle>
            <p className='text-sm text-muted-foreground'>{description}</p>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </>
  );
}
