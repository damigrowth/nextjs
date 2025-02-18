"use client";

import useEditProfileStore from "@/store/dashboard/profile";

export default function TabNavigation({ tabs }) {
  const { currentTab, setCurrentTab } = useEditProfileStore();

  return (
    <nav className="nav-with-bg">
      <div className="nav mb30">
        {tabs.map((item, i) => {
          if (item !== null) {
            return (
              <button
                onClick={() => setCurrentTab(i)}
                key={i}
                className={`nav-link fw500 ps-0 ${
                  currentTab === i ? "active" : ""
                }`}
              >
                {item}
              </button>
            );
          }
          return null;
        })}
      </div>
    </nav>
  );
}
