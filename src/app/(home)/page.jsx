import BrowserCategory5 from "@/components/section/BrowserCategory5";
import CounterInfo1 from "@/components/section/CounterInfo1";
import CtaBanner5 from "@/components/section/CtaBanner5";
import Hero6 from "@/components/hero/Hero6";
import LearnFreeio1 from "@/components/section/LearnFreeio1";
import NeedSomething4 from "@/components/section/NeedSomething4";
import NewsLetterSubscribe1 from "@/components/section/NewsLetterSubscribe1";
import OurBlog1 from "@/components/section/OurBlog1";
import OurPartner1 from "@/components/section/OurPartner1";
import PopularService3 from "@/components/section/PopularService3";
import SkillArea1 from "@/components/section/SkillArea1";
import Testimonial1 from "@/components/section/Testimonial1";
import TrendingService14 from "@/components/section/TrendingService14";
import TrendingService4 from "@/components/section/TrendingService4";
import { getService } from "@/lib/service";

export const metadata = {
  title: "Doulitsa - Οι καλύτεροι επαγγελματίες στην οθόνη σου",
};

export default async function page() {
  // const data = await getService("6");
  // console.log("API DATA====>", data);
  return (
    <>
      <Hero6 />
      <NeedSomething4 />
      <BrowserCategory5 />
      <PopularService3 />
      <CtaBanner5 />
      <CounterInfo1 />
      <LearnFreeio1 />
      <SkillArea1 />
      <TrendingService14 />
      <OurBlog1 />
      <OurPartner1 />
      <NewsLetterSubscribe1 />
    </>
  );
}
