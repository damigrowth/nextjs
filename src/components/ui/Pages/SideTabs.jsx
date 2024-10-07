"use client";

import usePagesStore from "@/store/pages/pagesStore";
import React from "react";

export default function SideTabs({ tabs }) {
  const { tab, setTab } = usePagesStore();
  return (
    <div className="col-md-3 col-lg-3 col-xl-2">
      <div className="terms_condition_widget mb30-sm">
        <div className="widget_list">
          <nav>
            <div className="nav nav-tabs text-start">
              {tabs.map((item, i) => (
                <button
                  onClick={() => setTab(i)}
                  key={i}
                  className={`nav-link text-start ${tab == i ? "active" : ""}`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
