"use client";

import useEditProfileStore from "@/store/dashboard/profile";
import { useEffect } from "react";
import { tabNameToHash, hashToTabName } from "@/lib/constants/tabs";

export default function TabNavigation({ tabs }) {
  const { currentTab, setCurrentTab } = useEditProfileStore();

  // Handle hash changes on mount and when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        const tabName = hashToTabName[hash];
        if (tabName) {
          const tabIndex = tabs.findIndex(tab => tab === tabName);
          if (tabIndex !== -1) {
            setCurrentTab(tabIndex);
          }
        }
      }
    };

    // Handle initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [tabs, setCurrentTab]);

  // Update hash when tab changes
  const handleTabClick = (index) => {
    const tabName = tabs[index];
    const hash = tabNameToHash[tabName];
    if (hash) {
      window.location.hash = hash;
      setCurrentTab(index);
    }
  };

  // Save current tab to URL before form submission
  useEffect(() => {
    const handleBeforeUnload = () => {
      const tabName = tabs[currentTab];
      const hash = tabNameToHash[tabName];
      if (hash) {
        window.location.hash = hash;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentTab, tabs]);

  return (
    <nav className="nav-with-bg">
      <div className="nav mb30">
        {tabs.map((item, i) => {
          if (item !== null) {
            return (
              <button
                onClick={() => handleTabClick(i)}
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
