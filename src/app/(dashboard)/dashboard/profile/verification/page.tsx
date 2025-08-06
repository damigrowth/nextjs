import { VerificationForm } from '@/components/forms/profile';
import { VerificationStatus } from '@/components/profile/verification-status';
import { getVerificationStatus } from '@/actions/profiles/verification';

export default async function VerificationPage() {
  // Fetch verification data server-side
  const verificationResult = await getVerificationStatus();
  const verificationData = verificationResult.success ? verificationResult.data : null;

  return (
    <div className='space-y-6'>
      <VerificationStatus verificationData={verificationData} />
      <VerificationForm verificationData={verificationData} />
    </div>
  );
}
