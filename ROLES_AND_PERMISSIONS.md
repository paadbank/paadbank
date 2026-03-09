# PAAD Bank - Roles & Permissions Guide

## System Roles

Based on the database schema and codebase analysis, the system has **5 main roles**:

### 1. **Admin** 👑
**Full system management access**

#### Access Rights:
- ✅ Dashboard (view all statistics)
- ✅ Health/Cycle Tracking (view all beneficiaries)
- ✅ Management (full access)
- ✅ Notifications (create & manage)
- ✅ Profile (manage all profiles)
- ✅ Messaging (unrestricted)
- ✅ Reports & Analytics
- ✅ Admin Panel

#### Specific Permissions:
- **User Management**: Create, approve, reject, delete users
- **Role Assignment**: Change user roles (except super_admin)
- **Distributions**: Create, view, edit, delete all distributions
- **Expenses**: Full expense management
- **Cycle Logs**: View all beneficiary cycle data
- **Messages**: Send/receive messages with all users
- **Notifications**: Broadcast to all users
- **Reports**: Generate and export all reports
- **System Config**: Limited (no super admin features)

#### Database Policies:
```sql
-- Can view all profiles
-- Can update all profiles
-- Can delete profiles
-- Can manage all distributions
-- Can view all cycle logs
-- Can manage expense records
-- Can create notifications
-- Can view audit logs
```

---

### 2. **Manager** 🏢
**Similar to Admin but with some restrictions**

#### Access Rights:
- ✅ Dashboard
- ✅ Health/Cycle Tracking (view all)
- ✅ Management
- ✅ Notifications
- ✅ Profile
- ✅ Messaging
- ✅ Reports

#### Specific Permissions:
- **User Management**: Approve/reject users, update profiles
- **Role Assignment**: Change user roles (limited)
- **Distributions**: Manage all distributions
- **Expenses**: Full expense management
- **Cycle Logs**: View all beneficiary data
- **Messages**: Unrestricted messaging
- **Notifications**: Create notifications
- **Reports**: Generate reports

#### Differences from Admin:
- ❌ Cannot delete users
- ❌ Cannot access super admin features
- ❌ Limited system configuration

---

### 3. **Sales** 💰
**Financial and expense management**

#### Access Rights:
- ✅ Dashboard (limited view)
- ✅ Expenses (full management)
- ✅ Profile
- ✅ Notifications (view only)

#### Specific Permissions:
- **Expenses**: Create, view, edit expense records
- **Distributions**: View linked distributions
- **Reports**: View expense reports
- **Profile**: Manage own profile

#### Database Policies:
```sql
-- Can manage expense records
-- Can view profiles (authenticated)
-- Can view own notifications
```

---

### 4. **Distributor** 🚚
**Pad distribution and delivery management**

#### Access Rights:
- ✅ Dashboard (assigned beneficiaries)
- ✅ Health/Cycle Tracking (assigned beneficiaries only)
- ✅ Management (limited)
- ✅ Notifications
- ✅ Profile
- ✅ Messaging (with assigned beneficiaries)

#### Specific Permissions:
- **Distributions**: Create and manage distributions for assigned beneficiaries
- **Cycle Logs**: View cycle data for assigned beneficiaries
- **Beneficiaries**: View assigned beneficiary profiles
- **Messages**: Chat with assigned beneficiaries and admins
- **Notifications**: Receive and view notifications
- **Profile**: Manage own profile

#### Database Policies:
```sql
-- Can view assigned beneficiary profiles
-- Can view assigned beneficiary cycle logs
-- Can manage assigned distributions
-- Can send/receive messages with assigned beneficiaries
```

---

### 5. **Beneficiary** 👤
**End users receiving pad distributions**

#### Access Rights:
- ✅ Dashboard (personal stats)
- ✅ Health/Cycle Tracking (own data)
- ✅ Notifications
- ✅ Profile
- ✅ Messaging (with distributors/admins only)

#### Specific Permissions:
- **Cycle Tracking**: Log and manage own menstrual cycles
- **Distributions**: View own distribution history
- **Messages**: Chat with assigned distributor and admins
- **Notifications**: Receive notifications
- **Profile**: Update own profile information
- **Dashboard**: View personal statistics and calendar

#### Database Policies:
```sql
-- Can view own profile
-- Can update own profile
-- Can manage own cycle logs
-- Can view own distributions
-- Can view own notifications
-- Can send/receive messages (limited)
```

#### Restrictions:
- ❌ Cannot view other beneficiaries' data
- ❌ Cannot create distributions
- ❌ Cannot access admin features
- ❌ Cannot view reports
- ❌ Cannot manage expenses

---

### 6. **Logger** 📝
**Specialized role for cycle data entry**

#### Access Rights:
- ✅ Dashboard (beneficiary data)
- ✅ Cycle Tracking (all beneficiaries - full management)
- ✅ Profile

#### Specific Permissions:
- **Cycle Logs**: Create, view, edit, delete cycle logs for ALL beneficiaries
- **Beneficiaries**: View all beneficiary profiles
- **Dashboard**: View beneficiary statistics

#### Database Policies:
```sql
-- Can view all beneficiary profiles
-- Can manage all cycle logs (full CRUD)
```

#### Use Case:
- Healthcare workers or data entry staff who log menstrual cycle data on behalf of beneficiaries
- Can update cycle information without full admin access

---

### 7. **Viewer** 👁️
**Read-only access for reporting and analytics**

#### Access Rights:
- ✅ Dashboard (view only)
- ✅ Notifications
- ✅ Profile
- ✅ Reports (view only)

#### Specific Permissions:
- **Reports**: View and export all reports
- **Dashboard**: View system-wide statistics
- **Notifications**: Receive notifications
- **Profile**: Manage own profile

#### Restrictions:
- ❌ Cannot create or edit any data
- ❌ Cannot access management features
- ❌ Cannot send messages
- ❌ Cannot manage users
- ❌ Read-only access to reports

---

## Role Hierarchy

```
Super Admin (not implemented in code, but in DB)
    ↓
  Admin
    ↓
 Manager
    ↓
  Sales / Logger (specialized roles)
    ↓
Distributor
    ↓
Beneficiary / Viewer
```

---

## Navigation Access Matrix

| Feature | Admin | Manager | Sales | Distributor | Logger | Beneficiary | Viewer |
|---------|-------|---------|-------|-------------|--------|-------------|--------|
| Dashboard | ✅ All | ✅ All | ✅ Limited | ✅ Assigned | ✅ All | ✅ Own | ✅ View |
| Cycle Tracking | ✅ View All | ✅ View All | ❌ | ✅ Assigned | ✅ Manage All | ✅ Own | ❌ |
| Distributions | ✅ Manage All | ✅ Manage All | ❌ | ✅ Assigned | ❌ | ✅ View Own | ❌ |
| Expenses | ✅ Manage | ✅ Manage | ✅ Manage | ❌ | ❌ | ❌ | ✅ View |
| Messaging | ✅ All | ✅ All | ❌ | ✅ Limited | ❌ | ✅ Limited | ❌ |
| Notifications | ✅ Create | ✅ Create | ✅ View | ✅ View | ✅ View | ✅ View | ✅ View |
| Reports | ✅ All | ✅ All | ✅ Expenses | ❌ | ❌ | ❌ | ✅ View All |
| Admin Panel | ✅ Full | ✅ Limited | ❌ | ❌ | ❌ | ❌ | ❌ |
| User Management | ✅ Full | ✅ Limited | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Code Implementation

### Role Definition
**File**: `lib/roleAccess.ts`
```typescript
export type UserRole = 'super_admin' | 'admin' | 'distributor' | 'beneficiary' | 'viewer';
```

**Note**: The code defines 5 roles, but the database has 7 roles (including 'manager', 'sales', 'logger')

### Stack Access
```typescript
const ROLE_PERMISSIONS = {
  dashboard: ['super_admin', 'admin', 'distributor', 'beneficiary', 'viewer'],
  health: ['beneficiary', 'admin', 'super_admin', 'distributor'],
  management: ['super_admin', 'admin', 'distributor'],
  notifications: ['super_admin', 'admin', 'distributor', 'beneficiary', 'viewer'],
  profile: ['super_admin', 'admin', 'distributor', 'beneficiary', 'viewer'],
};
```

### Page Access
```typescript
const PAGE_PERMISSIONS = {
  'cycle-page': ['beneficiary', 'admin', 'super_admin', 'distributor'],
  'distribution-page': ['admin', 'super_admin', 'distributor'],
  'expenses-page': ['admin', 'super_admin'],
  'messaging-page': ['admin', 'super_admin', 'distributor', 'beneficiary'],
  'reports-page': ['admin', 'super_admin', 'viewer'],
  'admin-page': ['admin', 'super_admin'],
};
```

---

## Database Roles (Actual Implementation)

**File**: `supabase.sql`
```sql
CREATE TYPE user_role AS ENUM (
  'admin', 
  'manager', 
  'sales', 
  'distributor', 
  'beneficiary',
  'logger'  -- Added in database but not in TypeScript
);
```

---

## Discrepancies Found ⚠️

1. **TypeScript vs Database**:
   - TypeScript defines: `super_admin`, `admin`, `distributor`, `beneficiary`, `viewer`
   - Database defines: `admin`, `manager`, `sales`, `distributor`, `beneficiary`, `logger`
   - Missing in code: `manager`, `sales`, `logger`
   - Missing in DB: `super_admin`, `viewer`

2. **Recommendations**:
   - Update TypeScript types to match database enum
   - Or update database enum to match TypeScript
   - Ensure consistency across the stack

---

## Role Assignment

**File**: `app/(main)/main/management-stack/admin-page/page.tsx`

Admins can assign roles when creating users:
- Beneficiary
- Distributor
- Sales
- Logger
- Manager
- Admin (only if current user is admin)

---

## Security Implementation

### Row Level Security (RLS)
All tables have RLS policies that enforce role-based access at the database level.

### Helper Function
```sql
CREATE FUNCTION public.get_user_role() RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

This function is used in RLS policies to check user roles without circular dependencies.

---

## Best Practices

1. **Always check role on both client and server**
2. **Use RLS policies as the primary security layer**
3. **Client-side role checks are for UX only**
4. **Never trust client-side role validation**
5. **Audit role changes in role_change_log table**

---

## Future Enhancements

1. Add `super_admin` role to database
2. Add `viewer` role to database
3. Update TypeScript types to include `manager`, `sales`, `logger`
4. Implement role hierarchy checks
5. Add role-based feature flags
6. Create role migration system
