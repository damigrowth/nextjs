import { ReceivedReviewsSection } from "./ReceivedReviewsSection";
import { GivenReviewsSection } from "./GivenReviewsSection";
import { getAccess } from "@/lib/auth/user";

export default async function ReviewsInfoSection({ searchParamsData }) {
  const hasAccess = await getAccess(["freelancer", "company"]);

  return (
    <>
      {hasAccess && (
        <ReceivedReviewsSection searchParamsData={searchParamsData} />
      )}
      <GivenReviewsSection searchParamsData={searchParamsData} />
    </>
  );
}
