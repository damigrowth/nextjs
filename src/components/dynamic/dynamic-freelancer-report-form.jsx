'use client';

import dynamic from 'next/dynamic';

const FreelancerReportForm = dynamic(
  () => import('../form/form-report-freelancer'),
  {
    ssr: false,
    loading: () => null, // Modal doesn't need loading state as it's hidden by default
  },
);

export default function FreelancerReportForm_D(props) {
  return <FreelancerReportForm {...props} />;
}
