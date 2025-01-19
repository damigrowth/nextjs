import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileNavigation2 from "@/components/header/MobileNavigation2";
import SavedInfo from "@/components/ui/AddService/SavedInfo";

export const metadata = {
  title: "Αποθηκευμένα",
};

export default function page() {
  return <SavedInfo />;
}
