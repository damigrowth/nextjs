import React from 'react';
import { redirect } from 'next/navigation';

import { getAccess, getToken } from '@/actions';

import { ReportIssueFloatingButton } from '../button';
import { DashboardFooter } from '../footer';
import { ReportIssueForm } from '../form';
import { DashboardHeader } from '../header';
import { DashboardSidebar } from '../sidebar';
import { DashboardWrapper } from '../wrapper';

export default async function DashboardLayout({ children }) {
  const token = await getToken();

  if (!token) {
    // Use Next.js redirect function directly
    redirect('/login');
  }

  const hasAccess = await getAccess(['freelancer', 'company']);

  return (
    <>
      <DashboardHeader />
      <div className='dashboard_content_wrapper'>
        <DashboardWrapper>
          <DashboardSidebar hasAccess={hasAccess} />
          <div className='dashboard__main pl0-md'>{children}</div>
        </DashboardWrapper>
      </div>
      <DashboardFooter />
      <ReportIssueFloatingButton />
      <ReportIssueForm />
    </>
  );
}
