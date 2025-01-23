"use client";

import useSavedStore from "@/store/saved/savedStore";

export default function TabNavigation() {
  const { currentTab, setCurrentTab } = useSavedStore();
  const tabs = ["Υπηρεσίες", "Προφίλ"];

  return (
    <nav>
      <div className="nav mb30">
        {tabs.map((item, i) => (
          <button
            onClick={() => setCurrentTab(i)}
            key={i}
            className={`nav-link fw500 ps-0 ${
              currentTab === i ? "active" : ""
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}
