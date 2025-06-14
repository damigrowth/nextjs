'use client';

import dynamic from 'next/dynamic';

const ServiceReportForm = dynamic(() => import('../form/form-report-service'), {
  ssr: false,
  loading: () => null, // Modal doesn't need loading state as it's hidden by default
});

export default function ServiceReportForm_D(props) {
  return <ServiceReportForm {...props} />;
}
