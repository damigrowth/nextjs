'use client';

import dynamic from 'next/dynamic';

const AddModelReviewForm = dynamic(
  () => import('../form/form-reviews-create'),
  {
    ssr: false,
    loading: () => (
      <div className='review-form-loading p-3 text-center'>
        <div className='spinner-border spinner-border-sm' role='status'>
          <span className='visually-hidden'>Loading review form...</span>
        </div>
      </div>
    ),
  },
);

export default function AddModelReviewForm_D(props) {
  return <AddModelReviewForm {...props} />;
}
