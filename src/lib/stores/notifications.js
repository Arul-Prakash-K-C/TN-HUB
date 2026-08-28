import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

const initialState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  userKey: null
};

const store = writable(initialState);
let inFlight = null;

function getUserKey(user) {
  return user?.uid || user?.email || user?.id || null;
}

function getUnreadCount(items) {
  return items.filter((notification) => notification.isRead !== true).length;
}

export const notificationState = {
  subscribe: store.subscribe
};

export const notifications = derived(notificationState, ($state) => $state.items);
export const notificationUnreadCount = derived(notificationState, ($state) => $state.unreadCount);

export function resetNotifications() {
  inFlight = null;
  store.set(initialState);
}

export function setNotificationsForUser(user, items) {
  const userKey = getUserKey(user);
  store.set({
    items: Array.isArray(items) ? items : [],
    unreadCount: getUnreadCount(Array.isArray(items) ? items : []),
    isLoading: false,
    error: null,
    userKey
  });
}

export async function refreshNotifications(user) {
  if (!browser) return [];

  const userKey = getUserKey(user);
  if (!userKey) {
    resetNotifications();
    return [];
  }

  if (inFlight?.userKey === userKey) {
    return inFlight.promise;
  }

  store.update((state) => {
    if (state.userKey !== userKey) {
      return { ...initialState, isLoading: true, userKey };
    }
    return { ...state, isLoading: true, error: null };
  });

  const promise = fetch('/api/notifications', { credentials: 'same-origin' })
    .then(async (response) => {
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Unable to load notifications.');
      }

      const body = await response.json();
      const items = Array.isArray(body.notifications) ? body.notifications : [];
      store.set({
        items,
        unreadCount: getUnreadCount(items),
        isLoading: false,
        error: null,
        userKey
      });
      return items;
    })
    .catch((error) => {
      store.update((state) => {
        if (state.userKey !== userKey) return state;
        return {
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load notifications.'
        };
      });
      throw error;
    })
    .finally(() => {
      if (inFlight?.promise === promise) {
        inFlight = null;
      }
    });

  inFlight = { userKey, promise };
  return promise;
}

export function markNotificationReadLocally(id) {
  store.update((state) => {
    const items = state.items.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification
    );
    return { ...state, items, unreadCount: getUnreadCount(items) };
  });
}

export function markAllNotificationsReadLocally() {
  store.update((state) => {
    const items = state.items.map((notification) => ({ ...notification, isRead: true }));
    return { ...state, items, unreadCount: 0 };
  });
}
