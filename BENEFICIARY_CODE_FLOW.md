# Beneficiary Code Authentication Flow

## Overview
The system supports two authentication methods:
1. **Email + Password** (standard signup)
2. **Beneficiary Code + Password** (for admin-created users)

## Database Schema

### Profiles Table
- `beneficiary_code` VARCHAR(20) UNIQUE - 8-character alphanumeric code
- RLS Policy: "Allow beneficiary code lookup for login" - allows unauthenticated queries


## Admin Creates User Flow

### File: `app/(main)/main/management-stack/admin-page/actions/createUser.ts`

1. Admin fills form with:
   - Full name
   - Password
   - Role
   - Phone (optional)
   - Location (optional)

2. System generates 8-character beneficiary code:
   ```typescript
   const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
   // Generates code like: ABCBWYSK
   ```

3. Creates auth user with temporary email:
   ```typescript
   email: `${beneficiaryCode.toLowerCase()}@paadbank.local`
   // Example: abcbwysk@paadbank.local
   ```

4. Updates profile with:
   - User details
   - `beneficiary_code: ABCBWYSK`
   - `status: 'active'`

5. Returns credentials to admin:
   - Beneficiary Code: ABCBWYSK
   - Password: (as entered)

## User Login Flow

### File: `lib/auth/beneficiaryAuth.ts`

**Login with Beneficiary Code:**

1. User enters:
   - Beneficiary Code: ABCBWYSK
   - Password: ******

2. System queries profiles table:
   ```typescript
   .from('profiles')
   .select('id, email, beneficiary_code')
   .eq('beneficiary_code', 'ABCBWYSK')
   .single()
   ```

3. If found, signs in with the linked email:
   ```typescript
   supabase.auth.signInWithPassword({
     email: profile.email, // abcbwysk@paadbank.local
     password: password
   })
   ```

4. User is authenticated ✅

## User Signup Flow (Link Email)

### File: `app/(auth)/signup/page.tsx`

**When user has a beneficiary code:**

1. User fills signup form:
   - Full name
   - Phone, location, etc.
   - Email: user@example.com
   - **Profile Code: ABCBWYSK** (optional field)
   - Password: ******

2. System looks up beneficiary code:
   ```typescript
   .from('profiles')
   .select('id, email, beneficiary_code')
   .eq('beneficiary_code', 'ABCBWYSK')
   .single()
   ```

3. Validates:
   - Code exists ✓
   - Email is temporary (@paadbank.local) ✓

4. Calls API to link email:
   ```typescript
   POST /api/link-email
   {
     userId: profile.id,
     email: 'user@example.com',
     password: '******'
   }
   ```

### File: `app/api/link-email/route.ts`

5. API updates auth user (server-side):
   ```typescript
   supabaseAdmin.auth.admin.updateUserById(userId, {
     email: 'user@example.com',
     password: password,
     email_confirm: true
   })
   ```

6. Updates profile table:
   ```typescript
   .from('profiles')
   .update({ email: 'user@example.com' })
   .eq('id', userId)
   ```

7. User signs in with new email:
   ```typescript
   supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: password
   })
   ```

8. User is authenticated ✅

## After Email Linking

User can now login with EITHER:
- **Beneficiary Code + Password** (ABCBWYSK + password)
- **Email + Password** (user@example.com + password)

Both methods authenticate the same user account.

## Security Features

1. **RLS Policy**: Allows unauthenticated lookup of profiles by beneficiary_code only
2. **Temporary Email**: Uses @paadbank.local domain to prevent conflicts
3. **Email Confirmation**: Automatically confirmed when linked via admin
4. **Server-Side Updates**: Email linking uses service role key (admin privileges)

## Debug Logs

Console logs are added to track the flow:
- 🔍 Login attempt with beneficiary code
- 📊 Profile query result
- ✅ Profile found
- 🔐 Auth result
- ❌ Error messages

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Common Issues

### "Invalid beneficiary code"
- Code doesn't exist in database
- Code is case-sensitive (stored as uppercase)
- RLS policy blocking query (check policy exists)

### "This profile is already linked to an email"
- User already completed signup
- Email is not @paadbank.local
- User should login with their email instead

### "Failed to link email"
- Service role key not set
- API route error
- Email already in use by another account

## Testing

1. **Admin creates user**:
   - Go to Management → Admin Page
   - Click "Create User"
   - Fill form and submit
   - Note the beneficiary code shown

2. **User logs in with code**:
   - Go to Login page
   - Switch to "Beneficiary Code" tab
   - Enter code and password
   - Should login successfully

3. **User links email**:
   - Go to Signup page
   - Fill form including profile code
   - Submit
   - Should login with new email

4. **User logs in with email**:
   - Logout
   - Go to Login page
   - Use "Email" tab
   - Enter linked email and password
   - Should login successfully
