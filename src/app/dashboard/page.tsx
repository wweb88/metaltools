import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardIndex() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
  }

  // Fetch role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'SUPER_ADMIN' || profile?.role === 'ADMIN' || profile?.role === 'STAFF') {
    redirect('/dashboard/squadrons');
  } else {
    redirect('/dashboard/hangar');
  }
}
