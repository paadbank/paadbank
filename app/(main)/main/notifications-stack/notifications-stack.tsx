'use client';

import NavigationStack from '@/lib/NavigationStack';
import NotificationsPage from './notifications-page/page';

const notificationsStackNavLink = {
  notifications_page: NotificationsPage,
};

export default function NotificationsStack() {
  return (
    <NavigationStack
      id="notifications-stack"
      navLink={notificationsStackNavLink}
      entry="notifications_page"
      syncHistory
      transition="slide"
      persist
    />
  );
}
