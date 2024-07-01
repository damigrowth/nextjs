import { freelancer1, product1 } from "@/data/product";
import FreelancerAbout1 from "../element/FreelancerAbout1";
import FreelancerSkill1 from "../element/FreelancerSkill1";
import ServiceDetailComment1 from "../element/ServiceDetailComment1";
// import ServiceDetailReviewInfo1 from "../element/ServiceDetailReviewInfo1";
import FreelancerFutureCard1 from "../card/FreelancerFutureCard1";
import { Sticky, StickyContainer } from "react-sticky";
import useScreen from "@/hook/useScreen";
import Image from "next/image";
import { useParams } from "next/navigation";
import Meta from "../ui/profiles/freelancer/Meta";
import Metrics from "../ui/profiles/freelancer/Metrics";
import Description from "../ui/profiles/freelancer/Terms";
import Education from "../ui/profiles/freelancer/Education";
import Experience from "../ui/profiles/freelancer/Experience";
import Certificates from "../ui/profiles/freelancer/Certificates";
import Featured from "../ui/profiles/freelancer/Featured";
import Reviews from "../ui/profiles/freelancer/Reviews";
import Skills from "../ui/profiles/freelancer/Skills";
import Info from "../ui/profiles/freelancer/Info";
import StickySidebar from "../ui/sticky/StickySidebar";

export default function FreelancerDetail1() {
  const { id } = useParams();

  const data = freelancer1.find((item) => item.id == id);

  //TODO http://localhost:3000/freelancer/akielgraf CREATE THE FIELDSI IN BACKEND
  return (
    <section className="pt10 pb90 pb30-md">
      <div className="container">
        <div className="row wow fadeInUp">
          <div className="col-lg-8">
            <Meta data={data} />
            <Metrics />
            <div className="service-about">
              <Description />
              <hr className="opacity-100 mb60 mt60" />
              <Education />
              <hr className="opacity-100 mb60" />
              <Experience />
              <hr className="opacity-100 mb60" />
              <Certificates />
              <hr className="opacity-100 mb60" />
              <Featured />
              <hr className="opacity-100" />
              <Reviews />
            </div>
          </div>
          {/* <div className="col-lg-4">
                <StickySidebar>
                  <Info />
                  <Skills />
                </StickySidebar>
              </div> */}
        </div>
      </div>
    </section>
  );
}
