import { create } from 'zustand';

export const useNotificationsStore = create((set) => ({
  // Message notifications
  totalUnreadMessages: 0,
  setTotalUnreadMessages: (count) =>
    set({ totalUnreadMessages: Math.max(0, count) }),
  // General notifications
  notifications: [],
  unreadNotificationsCount: 0,
  // Add a notification
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadNotificationsCount: state.unreadNotificationsCount + 1,
    })),
  // Mark notifications as read
  markNotificationsAsRead: () => set({ unreadNotificationsCount: 0 }),
  // Set all notifications
  setNotifications: (notifications, unreadCount) =>
    set({
      notifications,
      unreadNotificationsCount: unreadCount,
    }),
}));

// For backward compatibility with existing code
export const useMessagesStore = {
  getState: () => {
    const state = useNotificationsStore.getState();

    return {
      totalUnreadCount: state.totalUnreadMessages,
      setTotalUnreadCount: state.setTotalUnreadMessages,
    };
  },
  subscribe: (callback) => {
    return useNotificationsStore.subscribe((state, prevState) => {
      if (state.totalUnreadMessages !== prevState.totalUnreadMessages) {
        callback({
          totalUnreadCount: state.totalUnreadMessages,
        });
      }
    });
  },
};
