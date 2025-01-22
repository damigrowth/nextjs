"use client";

import useSavedStore from "@/store/saved/savedStore";
import React from "react";

export default function TabWrapper({ children }) {
  const { currentTab } = useSavedStore();

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
