import { ProfileSidebar } from '@/components';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-full'>
      <ProfileSidebar />
      <div className='flex-1 p-6'>{children}</div>
    </div>
  );
}
