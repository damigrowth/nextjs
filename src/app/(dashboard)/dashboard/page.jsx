import DashboardInfo from "@/components/dashboard/section/DashboardInfo";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";

export const metadata = {
  title: "Doulitsa - Freelance Marketplace React/Next Js Template | Dashboard",
};

export default async function page() {
  // const user = await getUser();

  // console.log("USER - Dashboard ==>", user);
  return (
    <>
      <MobileNavigation2 />
      <DashboardLayout>
        <DashboardInfo />
      </DashboardLayout>
    </>
  );
}
