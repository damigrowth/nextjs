import DashboardInfo from "@/components/dashboard/section/DashboardInfo";

export const metadata = {
  title: "Dashboard | Doulitsa",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;
// export const dynamicParams = true;

export default async function page() {
  return <DashboardInfo />;
}
