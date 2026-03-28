import Link from 'next/link';
import UserAvatar from '@/components/shared/user-avatar';
import type { BlogArticleDetailAuthor } from '@/lib/types/blog';

interface AuthorBoxProps {
  authors: BlogArticleDetailAuthor[];
}

export default function AuthorBox({ authors }: AuthorBoxProps) {
  if (!authors || authors.length === 0) return null;

  // Filter out "Doulitsa Team" author — only show team name, no full box
  const isDoulitsaTeamOnly =
    authors.length === 1 && authors[0].profile.username === 'doulitsa';

  if (isDoulitsaTeamOnly) {
    return (
      <p className="text-sm text-muted-foreground">
        Από την ομάδα{' '}
        <Link
          href="/articles"
          className="font-medium text-primary hover:underline"
        >
          Doulitsa
        </Link>
      </p>
    );
  }

  // For mixed authors, skip the Doulitsa Team profile
  const visibleAuthors = authors.filter(
    (a) => a.profile.username !== 'doulitsa',
  );

  if (visibleAuthors.length === 0) return null;

  return (
    <div className="space-y-4">
      {visibleAuthors.map((author) => {
        const profile = author.profile;
        const href = `/profile/${profile.username}`;

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
