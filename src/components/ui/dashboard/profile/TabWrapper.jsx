"use client";

import useEditProfileStore from "@/store/dashboard/profile";
import React, { useEffect } from "react";

export default function TabWrapper({ children, freelancer }) {
  const { currentTab, setProfile } = useEditProfileStore();

  useEffect(() => {
    setProfile(freelancer);
  }, [freelancer, setProfile]);

  const [navigation, content] = React.Children.toArray(children);
  const tabs = React.Children.toArray(content.props.children);

  const currentContent = tabs.find(
    (tab) => tab.props["data-tab"] === currentTab.toString()
  );

  return (
    <div className="navtab-style1">
      {navigation}
      {currentContent}
    </div>
  );
}
