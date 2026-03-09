import { supabaseBrowser } from '@/lib/supabase/client';

export async function loginWithBeneficiaryId(beneficiaryCode: string, password: string) {
  console.log('🔍 Login attempt with beneficiary code:', beneficiaryCode);
  console.log('🔍 Uppercase code:', beneficiaryCode.toUpperCase());
  
  const { data: profile, error: profileError } = await supabaseBrowser
    .from('profiles')
    .select('id, email, beneficiary_code')
    .eq('beneficiary_code', beneficiaryCode.toUpperCase())
    .single();

  console.log('📊 Profile query result:', { profile, profileError });

  if (profileError || !profile) {
    console.error('❌ Profile not found:', profileError);
    throw new Error('Invalid beneficiary code');
  }

  if (!profile.email) {
    console.error('❌ Profile has no email:', profile);
    throw new Error('This account has no email linked. Please contact admin.');
  }

  console.log('✅ Profile found, attempting password login with email:', profile.email);

  const { data, error } = await supabaseBrowser.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  console.log('🔐 Auth result:', { data: data?.session ? 'Session created' : 'No session', error });

  if (error) throw error;
  return data;
}

export async function linkEmailToProfile(userId: string, email: string) {
  const { error } = await supabaseBrowser
    .from('profiles')
    .update({ email })
    .eq('id', userId);

  if (error) throw error;
}
