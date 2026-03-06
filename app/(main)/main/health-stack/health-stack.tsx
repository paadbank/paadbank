'use client';

import NavigationStack from '@/lib/NavigationStack';
import CyclePage from './cycle-page/page';

const healthStackNavLink = {
  cycle_page: CyclePage,
};

export const HealthStack = () => (
  <NavigationStack
    id="health-stack"
    navLink={healthStackNavLink}
    entry="cycle_page"
    syncHistory
    transition="slide"
    persist
  />
);
