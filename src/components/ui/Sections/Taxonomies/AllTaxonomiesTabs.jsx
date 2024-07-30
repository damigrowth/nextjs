"use client";

import React from "react";
import useHomeStore from "@/store/home/homeStore";

export default function AllTaxonomiesTabs({ taxonomies }) {
  const { taxonomy, setTaxonomy } = useHomeStore();

  return (
    <nav>
      <div className="nav nav-tabs mb50">
        {taxonomies.map((item, i) => (
          <button
            onClick={() => setTaxonomy(i)}
            key={i}
            className={`nav-link fw600 ${taxonomy === i ? "active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
