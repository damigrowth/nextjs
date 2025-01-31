import MyProfileInfo from "@/components/dashboard/section/MyProfileInfo";
import { getFreelancer } from "@/lib/users/freelancer";

export const metadata = {
  title: "Διαχείριση Προφίλ",
};

export default async function page() {
  const freelancer = await getFreelancer();
  return <MyProfileInfo freelancer={freelancer} />;
}
