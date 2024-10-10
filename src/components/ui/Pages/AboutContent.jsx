import React from "react";
import About from "@/components/ui/Pages/About";
import Breadcrumb from "@/components/ui/Pages/Breadcrumb";
import Counter from "@/components/ui/Pages/Counter";
import Cta1 from "@/components/ui/Pages/Cta1";
import Cta2 from "@/components/ui/Pages/Cta2";
import FunFact from "@/components/ui/Pages/FunFact";
import Partners from "@/components/ui/Pages/Partners";
import Pricing from "@/components/ui/Pages/Pricing";
import Testimonials from "@/components/ui/Pages/Testimonials";
import Faq from "./Faq";

export default function AboutContent({ data }) {
  return (
    <>
      <Breadcrumb data={data.breadcrumb} />
      <About data={data.about} />
      <Counter data={data.counter.data} />
      <Cta1 data={data.cta1} />
      <FunFact data={data.funFact} />
      <Testimonials data={data.testimonials} />
      <Cta2 data={data.cta2} />
      <Faq data={data.faq} />
      <Partners data={data.partners} />
      <Pricing data={data.pricing} />
    </>
  );
}
