import DashboardInfo from "@/components/dashboard/section/DashboardInfo";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata = {
  title: "Doulitsa - Freelance Marketplace React/Next Js Template | Dashboard",
};

export default async function page() {
  // const user = await getUser();

  // console.log("USER - Dashboard ==>", user);
  return (
    <>
      <DashboardLayout>
        <DashboardInfo />
      </DashboardLayout>
    </>
  );
}
