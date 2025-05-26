'use client';

import React from 'react';

import useSavedStore from '@/stores/saved/savedStore';

export default function TabWrapperSaved({ children }) {
  const { currentTab } = useSavedStore();

  const [navigation, content] = React.Children.toArray(children);

  const tabs = React.Children.toArray(content.props.children);

  const currentContent = tabs.find(
    (tab) => tab.props['data-tab'] === currentTab.toString(),
  );

  return (
    <>
      {navigation}
      {currentContent}
    </>
  );
}
