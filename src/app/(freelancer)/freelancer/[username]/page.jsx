import Breadcumb10 from "@/components/breadcumb/Breadcumb10";
import FreelancerProfile from "@/components/profiles/freelancer/FreelancerProfile";
import TabSection1 from "@/components/section/TabSection1";
import { getData } from "@/lib/client/operations";
import { FREELANCER_BY_USERNAME } from "@/lib/graphql/queries";

export const metadata = {
  title:
    "Freeio - Freelance Marketplace React/Next Js Template | Freelancer Single",
};

export default async function page({ params }) {
  const username = params.username;

  const { freelancers } = await getData(FREELANCER_BY_USERNAME(username));

  console.log("FREELANCER", freelancers);
  return (
    <>
      <TabSection1 />
      <Breadcumb10 path={["Home", "Services", "Design & Creative"]} />
      <FreelancerProfile />
    </>
  );
}
