import LinkNP from '@/components/link';
import { Heart } from 'lucide-react';

export default function SavedMenu() {
  return (
    <div className='hidden sm:flex'>
      <LinkNP
        href='/dashboard/saved'
        className='text-center mr-1 flex'
        style={{ color: '#1f4b3f' }}
      >
        <Heart className='w-5 h-5 flex' />
      </LinkNP>
    </div>
  );
}
