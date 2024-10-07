import FaqSuggestion from "@/components/section/FaqSuggestion";
import { getData } from "@/lib/client/operations";
import { GET_PAGE_BY_SLUG } from "@/lib/graphql/queries/main/page";

export const metadata = {
  title: "Freeio - Freelance Marketplace React/Next Js Template | FAQ",
};

export default async function FAQPage() {
  const { pages: res } = await getData(GET_PAGE_BY_SLUG, {
    slug: "faq",
  });

  const page = res.data[0].attributes;

  return (
    <>
      <section className="our-faq pb50">
        <div className="container">
          <div className="row">
            <div
              className="col-lg-6 m-auto wow fadeInUp"
              data-wow-delay="300ms"
            >
              <div className="main-title text-center">
                <h2 className="title">{page.title}</h2>
                <div
                  className="paragraph mt10"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                ></div>
              </div>
            </div>
          </div>
          <div className="row wow fadeInUp" data-wow-delay="300ms">
            <div className="col-lg-8 mx-auto">
              {page.faq.map((item, index) => (
                <div key={index}>
                  <FaqSuggestion
                    key={index}
                    title={item.title}
                    faq={item.faq}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
