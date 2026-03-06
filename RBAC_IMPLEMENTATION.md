# Role-Based Access Control (RBAC) Implementation

## Roles Enum
```sql
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'sales', 'distributor', 'beneficiary');
```

## Role Permissions Summary

### 1. Beneficiary
**Access:**
- ✅ Cycle logs (full CRUD on own records)
- ✅ Messages (send/receive)
- ✅ View own distributions
- ✅ View own notifications
- ❌ NO distribution management
- ❌ NO expense management

**Policies:**
- `cycle_logs`: Can manage own cycle logs
- `distributions`: Can view own distributions only
- `messages`: Can send and receive messages
- `notifications`: Can view and update own notifications

### 2. Distributor
**Access:**
- ✅ Manage distributions (assigned beneficiaries)
- ✅ View assigned beneficiary cycle logs
- ✅ Messages (send/receive)
- ✅ View assigned beneficiary profiles
- ❌ NO expense management
- ❌ NO cycle log creation

**Policies:**
- `distributions`: Can manage distributions where distributor_id = auth.uid()
- `cycle_logs`: Can view logs of assigned beneficiaries
- `profiles`: Can view assigned beneficiaries
- `messages`: Can send and receive messages

### 3. Sales
**Access:**
- ✅ Manage expense records (purchases, distribution, salaries, others)
- ✅ View all profiles
- ✅ Messages (send/receive)
- ❌ NO delete permissions
- ❌ NO distribution management

**Policies:**
- `expense_records`: Full CRUD access
- `profiles`: Can view all profiles
- `messages`: Can send and receive messages

### 4. Manager
**Access:**
- ✅ Full access to all tables
- ✅ View all cycle logs
- ✅ Manage all distributions
- ✅ Manage expense records
- ✅ Create notifications
- ✅ Manage message groups
- ✅ View audit logs
- ❌ NO delete permissions

**Policies:**
- All SELECT policies include manager role
- All UPDATE policies include manager role
- All INSERT policies include manager role
- DELETE policies excluded (admin only)

### 5. Admin
**Access:**
- ✅ Full access to all tables
- ✅ Delete permissions on all tables
- ✅ All manager permissions
- ✅ Can delete profiles
- ✅ Can delete distributions
- ✅ Can delete expense records

**Policies:**
- All policies include admin role
- Exclusive DELETE policies for admin only

## Database Policies Implementation

### Profiles
- Users can view/update own profile
- Admin, Manager, Sales can view all profiles
- Admin, Manager can update any profile
- Admin can delete profiles
- Distributors can view assigned beneficiaries

### Cycle Logs
- Beneficiaries can manage own logs
- Admin, Manager can view all logs
- Distributors can view assigned beneficiary logs

### Distributions
- Beneficiaries can view own distributions
- Distributors can manage assigned distributions
- Admin, Manager can manage all distributions
- Admin can delete distributions

### Expense Records
- Admin, Manager, Sales can manage expense records
- Admin can delete expense records

### Messages
- All users can send/receive messages
- Group messages visible to group members
- Admin, Manager can manage message groups

### Notifications
- Users can view/update own notifications
- Admin, Manager can create notifications

## UI Access Control

The UI should check user role from `profiles.role` and:
- Show/hide navigation items based on role
- Disable actions not permitted by role
- Display appropriate error messages for unauthorized actions
