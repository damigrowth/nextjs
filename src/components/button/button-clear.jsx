'use client';

import React, { useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IconTrashCan } from '@/components/icon/fa';

export default function ClearBtn() {
  const router = useRouter();

  const pathname = usePathname(); // Use the current pathname

  const [isPending, startTransition] = useTransition();

  const clearHandler = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  return (
    <a
      href='#archive'
      disabled={isPending}
      onClick={clearHandler}
      className='ud-btn btn-thm ui-clear-btn w-100 no-rotate'
    >
      Καθαρισμός φίλτρων
      {isPending ? (
        <div className='spinner-border spinner-border-sm ml10' role='status'>
          <span className='sr-only'></span>
        </div>
      ) : (
        <IconTrashCan />
      )}
    </a>
  );
}
