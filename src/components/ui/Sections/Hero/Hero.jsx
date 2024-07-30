import { inspect } from "@/utils/inspect";
import HeroContent from "./HeroContent";
import HeroImages from "./HeroImages";

export default async function Hero({ categories }) {
  return (
    <section className="hero-home12 p-0 overflow-hidden">
      <div className="container">
        <div className="row">
          <div className="col-xl-7">
            <HeroContent categories={categories} />
          </div>
          <div className="col-xl-5 d-none d-xl-block">
            <HeroImages />
          </div>
        </div>
      </div>
    </section>
  );
}
