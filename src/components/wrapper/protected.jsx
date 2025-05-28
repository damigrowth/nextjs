import Link from 'next/link';

import { getUserMe } from '@/actions';

export default async function Protected({ children, message }) {
  const user = await getUserMe();

  const authenticated = user.ok;

  if (authenticated === true) {
    return children;
  } else {
    if (message === undefined) {
      return null;
    } else {
      return (
        <div className='text-center p30 mt40 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1'>
          <p>{message}</p>
          <Link href='/login' className='ud-btn btn-thm2'>
            Σύνδεση
          </Link>
        </div>
      );
    }
  }
}
