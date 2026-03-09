import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, password } = await request.json();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Update auth user email and password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        email,
        password,
        email_confirm: true
      }
    );

    if (updateError) throw updateError;

    // Update profile email
    await supabaseAdmin.from('profiles').update({ email }).eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
