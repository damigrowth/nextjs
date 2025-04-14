import AboutArea1 from "@/components/section/AboutArea1";
import Breadcumb1 from "@/components/breadcumb/Breadcumb1";
import CounterInfo1 from "@/components/section/CounterInfo1";
import CtaBanner1 from "@/components/section/CtaBanner1";
import OurFaq1 from "@/components/section/OurFaq1";
import OurFeature1 from "@/components/section/OurFeature1";

export const metadata = {
  title:
    "Doulitsa - Freelance Marketplace React/Next Js Template | Become seller",
};

export default function page() {
  return (
    <>
      <Breadcumb1
        title={"Επαγγελματικά Προφίλ"}
        brief={` Εάν είστε Επαγγελματίας ή Επιχείρηση, μπορείτε να αποκτήσετε εύκολα προβολή στην πλατφόρμα μας.`}
      />
      <AboutArea1 />
      <OurFeature1 />
      <CtaBanner1 />
      <CounterInfo1 />
      <OurFaq1 />
    </>
  );
}
