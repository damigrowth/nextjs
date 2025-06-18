import LinkNP from '@/components/link';

export default function SavedMenu() {
  return (
    <div className='d-none d-sm-flex'>
      <LinkNP
        href='/dashboard/saved'
        className='text-center mr5 text-thm2 fz20 d-flex'
      >
        <span className='flaticon-like d-flex' />
      </LinkNP>
    </div>
  );
}
