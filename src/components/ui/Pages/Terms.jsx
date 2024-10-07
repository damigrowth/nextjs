import React from "react";
import SideTabs from "./SideTabs";
import TabsContent from "./TabsContent";

export default function Terms({ title, description, tabs }) {
  const content = tabs.map((item, index) => ({
    id: index,
    content: item.content,
  }));
  return (
    <>
      <section className="our-terms">
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
            <SideTabs tabs={tabs} />
            <TabsContent tabs={content} />
          </div>
        </div>
      </section>
    </>
  );
}
