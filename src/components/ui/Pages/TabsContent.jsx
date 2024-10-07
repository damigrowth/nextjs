"use client";

import usePagesStore from "@/store/pages/pagesStore";
import React from "react";

export default function TabsContent({ tabs }) {
  const { tab } = usePagesStore();

  return (
    <div className="col-md-9 col-lg-9 col-xl-9 offset-xl-1">
      <div className="terms_condition_grid text-start">
        <div className="tab-content">
          {tabs.map((item, i) => (
            <div className={`tab-pane fade ${tab === i ? "show active" : ""}`}>
              <div className="grids mb90 mb40-md">
                <div key={i}>
                  {item.content.map((item, i) => (
                    <div key={i} className="pb30">
                      <h4 className="title">{item.heading}</h4>
                      <p className="text fz15">{item.paragraph}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
