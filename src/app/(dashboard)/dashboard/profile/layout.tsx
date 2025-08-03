import { ProfileSidebar } from '@/components/features/profile/profile-sidebar';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <ProfileSidebar />
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}