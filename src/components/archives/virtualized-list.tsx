'use client';

import { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  threshold?: number; // Threshold above which to enable virtualization
}

// Memoized list item component
const ListItem = memo(function ListItem<T>({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
  };
}) {
  const { items, renderItem } = data;
  const item = items[index];

  return (
    <div style={style}>
      {renderItem(item, index)}
    </div>
  );
});

ListItem.displayName = 'ListItem';

// Main virtualized list component
export const VirtualizedList = memo(function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  threshold = 100,
}: VirtualizedListProps<T>) {
  // Only use virtualization for large lists
  const shouldVirtualize = items.length > threshold;

  // Memoize render data to prevent unnecessary re-renders
  const itemData = useMemo(() => ({
    items,
    renderItem,
  }), [items, renderItem]);

  // Memoized item renderer for react-window
  const Item = useCallback(
    (props: any) => <ListItem {...props} data={itemData} />,
    [itemData]
  );

  if (!shouldVirtualize) {
    // For smaller lists, render normally without virtualization
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  // For large lists, use react-window for virtualization
  return (
    <div className={className}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5} // Render 5 extra items for smooth scrolling
      >
        {Item}
      </List>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';