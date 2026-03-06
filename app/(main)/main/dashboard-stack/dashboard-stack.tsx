'use client';

import NavigationStack from '@/lib/NavigationStack';
import DashboardPage from './dashboard-page/page';

const dashboardStackNavLink = {
  dashboard_page: DashboardPage,
};

export default function DashboardStack() {
  return (
    <NavigationStack
      id="dashboard-stack"
      navLink={dashboardStackNavLink}
      entry="dashboard_page"
      syncHistory
      transition="slide"
      persist
    />
  );
}
