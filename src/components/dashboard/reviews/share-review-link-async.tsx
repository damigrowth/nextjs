import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ShareReviewLink } from './share-review-link';

export async function ShareReviewLinkAsync() {
  // Check if user is a professional (only professionals see share link)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isProfessional =
    session?.user?.role === 'freelancer' ||
    session?.user?.role === 'company';

  // Return null if not a professional
  if (!isProfessional || !session?.user?.username) {
    return null;
  }

  return <ShareReviewLink username={session.user.username} />;
}
