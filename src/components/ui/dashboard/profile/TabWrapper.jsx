"use client";

import useEditProfileStore from "@/store/dashboard/profile";
import React from "react";

export default function TabWrapper({ children }) {
  const { currentTab } = useEditProfileStore();

  const [navigation, content] = React.Children.toArray(children);
  const tabs = React.Children.toArray(content.props.children);

  const currentContent = tabs.find(
    (tab) => tab.props["data-tab"] === currentTab.toString()
  );

  return (
    <>
      {navigation}
      {currentContent}
    </>
  );
}
