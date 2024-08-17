"use client";

import { useState } from "react";
import SideTabs from "./SideTabs";

const tab = [
  "Account & Payments",
  "Manage Orders",
  "Returns & Refunds",
  "COVID-19",
  "Other",
];

export default function Content({ data }) {
  const { title, description, content } = data;

  // const extractHeadings = (content) => {
  //   const headings = [];
  //   const regex = /<h([1-5])>(.*?)<\/h\1>/g;
  //   let match;

  //   while ((match = regex.exec(content)) !== null) {
  //     headings.push({ level: match[1], text: match[2] });
  //   }

  //   return headings;
  // };

  // const headings = extractHeadings(content);

  // const [currentTab, setCurrentTab] = useState("Other");

  return (
    <>
      {/* <section className="our-terms">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="main-title">
                <h2>{title}</h2>
                <p className="text">{description}</p>
              </div>
            </div>
          </div>
          <div className="row">
            <SideTabs tabs={tab} />
            <div className="col-md-9 col-lg-9 col-xl-9 offset-xl-1">
              <div className="terms_condition_grid text-start">
                <div className="tab-content">
                  <div
                    className={`tab-pane fade ${
                      tab.indexOf(currentTab) === 4 ? "show active" : ""
                    }`}
                  >
                    <div className="grids mb90 mb40-md">
                      <h4 className="title">1. Introduction</h4>
                      <p className="mb25 text fz15">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Risus nascetur morbi nisl, mi, in semper metus porttitor
                        non. Augue nunc amet fringilla sit. Fringilla eget arcu
                        sodales sed a, parturient fermentum amet scelerisque.
                        Amet purus urna, dictumst aliquet aliquam natoque non,
                        morbi pretium. Integer amet fermentum nibh viverra
                        mollis consectetur arcu, ultrices dolor. Gravida purus
                        arcu viverra eget. Aliquet tincidunt dignissim aliquam
                        tempor nec id. Habitant suscipit sit semper duis odio
                        amet, at.
                      </p>
                      <p className="text fz15">
                        Massa ultricies a arcu velit eget gravida purus ultrices
                        eget. Orci, fames eu facilisi justo. Lacus netus a at
                        sed justo vel leo leo pellentesque. Nulla ut laoreet
                        luctus cum turpis et amet ac viverra. Vitae neque orci
                        dui eu ac tincidunt. Egestas placerat egestas netus nec
                        velit gravida consectetur laoreet vitae. Velit sed enim
                        habitant habitant non diam. Semper tellus turpis tempus
                        ac leo tempor. Ultricies amet, habitasse adipiscing
                        bibendum consequat amet, sed. Id convallis suspendisse
                        vitae, lacinia mattis cursus montes, dui. Tortor
                        lobortis dignissim eget egestas. Eget enim auctor nunc
                        eget mattis sollicitudin senectus diam. Tincidunt morbi
                        egestas dignissim eget id aliquam.{" "}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </>
  );
}
