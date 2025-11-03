'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Fragment } from 'react';

const routeLabels: Record<string, string> = {
  dashboard: 'Πίνακας Ελέγχου',
  messages: 'Μηνύματα',
  saved: 'Αποθηκευμένα',
  reviews: 'Αξιολογήσεις',
  orders: 'Παραγγελίες',
  services: 'Διαχείριση Υπηρεσιών',
  profile: 'Διαχείριση',
  documents: 'Παραστατικά',
  create: 'Δημιουργία Υπηρεσίας',
  edit: 'Επεξεργασία',
  account: 'Λογαριασμός',
  basic: 'Βασικά στοιχεία',
  coverage: 'Τρόποι Παροχής',
  additional: 'Πρόσθετα Στοιχεία',
  presentation: 'Παρουσίαση',
  verification: 'Πιστοποίηση',
  billing: 'Στοιχεία Τιμολόγησης',
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumb items from path segments
  const breadcrumbItems = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return { path, label, isLast };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">
            Αρχική
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.map((item, index) => (
          <Fragment key={item.path}>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.path}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}