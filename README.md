# PAAD Bank - Menstrual Health Management Platform

A comprehensive Next.js 14+ application for managing menstrual health, pad distribution, expenses, and reporting with role-based access control.

## Features

### Authentication & Authorization
- **Secure Login/Signup** with email verification
- **Role-Based Access Control (RBAC)**:
  - Super Admin
  - Admin
  - Distributor
  - Beneficiary
  - Viewer
- **Password Reset** with OTP verification
- **Account Approval Workflow** for new registrations

### Core Modules

#### 1. Dashboard (Role-Aware)
- **Beneficiary**: Cycle calendar, pad allocation status, upcoming deliveries
- **Distributor**: Pending distributions, completion status
- **Admin/SuperAdmin**: System-wide statistics, charts, activity logs

#### 2. Cycle Tracking (Beneficiaries)
- Visual calendar with color-coded periods
- Log period details (start/end date, flow intensity, notes)
- Auto-prediction of next period
- Average cycle length and duration statistics
- Business rule: Only one open cycle log at a time

#### 3. Distribution Management
- Create and track pad distributions
- **Pick-Up Mode**: Generate reference codes
- **Dispatch Mode**: Capture delivery address and costs
- Status workflow: Pending → In Transit → Completed/Failed
- Lock completed records (admin override available)

#### 4. Expense Management (Admin Only)
- Track expense records by category
- Auto-calculated remaining balance
- Budget enforcement with Super Admin override
- Category breakdown charts
- Document attachment support

#### 5. Messaging System
- Direct messages between users
- Group conversations (admin-created)
- Read receipts and file attachments (≤5MB)
- Message flagging for review
- Access control: Beneficiary ↔ Distributor/Admin only

#### 6. Notifications
- In-app and email notifications
- Unread badge in navigation
- Mark as read (individual or bulk)
- Opt-out preferences (except critical events)

#### 7. Reports & Analytics (Admin/Viewer)
- Distribution reports
- Expense reports
- Cycle tracking reports
- User activity reports
- Export to PDF and CSV
- Visual charts using Recharts

#### 8. Admin Panel (Admin/SuperAdmin)
- User management (approve/reject registrations)
- Role assignment and change history
- Bulk distribution creation
- Broadcast notifications
- System configuration (Super Admin only)
- Audit log viewer

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: CSS Modules
- **State Management**: React Context API
- **Charts**: Recharts (for analytics)

## Project Structure

```
paadbank/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   │   └── verification/
│   │   └── forgot-password/
│   │       ├── request-reset/
│   │       ├── verify-otp/
│   │       └── reset-password/
│   ├── (main)/
│   │   └── main/
│   │       ├── dashboard-stack/
│   │       ├── cycle-stack/
│   │       ├── distribution-stack/
│   │       ├── expense-stack/
│   │       ├── messaging-stack/
│   │       ├── notifications-stack/
│   │       ├── reports-stack/
│   │       ├── profile-stack/
│   │       └── admin-stack/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AuthBlocker/
│   └── LoadingSpinner/
├── context/
│   ├── ThemeContext.tsx
│   └── LanguageContext.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.tsx
│   │   ├── server.tsx
│   │   └── admin.tsx
│   ├── NavigationStack.tsx
│   ├── NavigationBar.tsx
│   ├── SideBar.tsx
│   ├── DialogViewer.tsx
│   ├── BottomViewer.tsx
│   └── SelectionViewer.tsx
├── providers/
│   └── AuthProvider.tsx
├── i18n/
│   ├── en.json
│   └── fr.json
├── supabase.sql
└── .env.local
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cxpuwueyjkotzbxmphvk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cHV3dWV5amtvdHpieG1waHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTQ2ODQsImV4cCI6MjA4ODM3MDY4NH0.mp-EXZNMrTp5oZfAr6CJWjfkZpeefj2HFXIPDhyFOfA
```

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase.sql`
4. Execute the SQL script

This will:
- Create all necessary tables
- Set up enums for type safety
- Configure Row Level Security (RLS) policies
- Create indexes for performance
- Set up triggers for auto-profile creation

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Core Tables

- **profiles**: User profiles with role and status
- **cycle_logs**: Menstrual cycle tracking records
- **distributions**: Pad distribution records
- **expense_records**: Financial expense tracking
- **notifications**: User notifications
- **messages**: Direct and group messages
- **message_groups**: Group conversation metadata
- **message_group_members**: Group membership
- **role_change_log**: Audit trail for role changes
- **audit_log**: System-wide audit trail

### Enums

- `user_role`: super_admin, admin, distributor, beneficiary, viewer
- `user_status`: pending, active, inactive
- `distribution_status`: pending, in_transit, completed, failed
- `transport_mode`: pickup, dispatch
- `expense_category`: pad_purchase, delivery_cost, operational, other
- `flow_intensity`: light, moderate, heavy
- `cycle_status`: open, closed, requires_update
- `notification_channel`: in_app, email, both

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:

- **Beneficiaries**: Can only access their own data
- **Distributors**: Can access assigned beneficiary data
- **Admins**: Can read all data, write to most tables
- **Super Admins**: Full access to all operations
- **Viewers**: Read-only access to reports and analytics

### Authentication

- Email/password authentication via Supabase Auth
- Failed login attempt tracking (max 5 attempts)
- Secure password reset with email verification
- Account approval workflow for new users

## User Roles & Permissions

| Feature | Beneficiary | Distributor | Admin | Super Admin | Viewer |
|---------|------------|-------------|-------|-------------|--------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cycle Tracking | ✓ | View Only | View All | View All | ✗ |
| Distributions | View Own | Manage Assigned | Manage All | Manage All | ✗ |
| Expenses | ✗ | ✗ | Manage | Manage | View Only |
| Messaging | Limited | ✓ | ✓ | ✓ | ✗ |
| Notifications | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reports | ✗ | ✗ | ✓ | ✓ | ✓ |
| Admin Panel | ✗ | ✗ | ✓ | ✓ | ✗ |

## Internationalization

The app supports multiple languages through the `LanguageContext`:

- English (en)
- French (fr)

Add translations in `i18n/en.json` and `i18n/fr.json`.

## Theming

Light and dark themes are supported via `ThemeContext`. Users can toggle themes in their profile settings.

## Development Guidelines

### Adding New Features

1. Create component in appropriate stack directory
2. Add CSS module with co-located `.module.css` file
3. Use `useTheme()` for theme-aware styling
4. Use `useLanguage()` `t()` function for all user-facing strings
5. Use `supabaseBrowser` for client components
6. Use `supabaseServer` for server components/actions

### Code Standards

- All components use TypeScript
- CSS Modules for styling (co-located with components)
- Client components marked with `'use client'`
- Consistent error handling and loading states
- Follow existing navigation patterns

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure Node.js 18+ and set environment variables before deployment.

## Support

For issues or questions, contact the development team or create an issue in the repository.

## License

© 2025 PAAD Bank. All rights reserved.
