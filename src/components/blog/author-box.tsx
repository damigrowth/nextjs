import Link from 'next/link';
import UserAvatar from '@/components/shared/user-avatar';

interface Author {
  order: number;
  profile: {
    id: number;
    username: string | null;
    displayName: string | null;
    image: any;
    authorBio: string | null;
  };
}

interface AuthorBoxProps {
  authors: Author[];
}

export default function AuthorBox({ authors }: AuthorBoxProps) {
  if (!authors || authors.length === 0) return null;

  return (
    <div className="space-y-4">
      {authors.map((author) => {
        const profile = author.profile;
        const href =
          profile.username === 'doulitsa'
            ? '/articles'
            : `/profile/${profile.username}`;

        return (
          <div
            key={profile.id}
            className="flex items-start gap-4 p-6 border border-gray-200 rounded-2xl bg-white"
          >
            <Link href={href} className="shrink-0">
              <UserAvatar
                displayName={profile.displayName || undefined}
                image={profile.image}
                size="lg"
                showBorder={false}
                showShadow={false}
              />
            </Link>
            <div className="min-w-0">
              <Link
                href={href}
                className="font-semibold text-gray-900 hover:text-primary transition-colors"
              >
                {profile.displayName}
              </Link>
              {profile.authorBio && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {profile.authorBio}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
