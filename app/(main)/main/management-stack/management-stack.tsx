'use client';

import NavigationStack from '@/lib/NavigationStack';
import ManagementHome from './management-home/page';
import DistributionPage from './distribution-page/page';
import ExpensesPage from './expenses-page/page';
import ReportsPage from './reports-page/page';
import MessagingPage from './messaging-page/page';
import AdminPage from './admin-page/page';
import ChatPage from './chat-page/page';

const managementStackNavLink = {
  management_home: ManagementHome,
  distribution_page: DistributionPage,
  expenses_page: ExpensesPage,
  reports_page: ReportsPage,
  messaging_page: MessagingPage,
  admin_page: AdminPage,
  chat_page: ChatPage,
};

export const ManagementStack = () => (
  <NavigationStack
    id="management-stack"
    navLink={managementStackNavLink}
    entry="management_home"
    syncHistory
    transition="slide"
    persist
  />
);
