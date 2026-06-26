import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SquadronsClient } from './SquadronsClient';
import { Shield } from 'lucide-react';

export default async function SquadronsPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'SUPER_ADMIN' && profile?.role !== 'ADMIN' && profile?.role !== 'STAFF') {
    redirect('/dashboard/hangar');
  }

  // Fetch squadrons and their associated pilots
  const { data: squadronsData } = await supabase
    .from('squadrons')
    .select(`
      id, 
      name,
      profiles ( id, username, role, is_active )
    `)
    .order('created_at', { ascending: true });

  const formattedSquadrons = (squadronsData || []).map(sq => {
    let pilots = Array.isArray(sq.profiles) ? sq.profiles : [];
    // Ocultar pilotos inactivos a menos que seas SUPER_ADMIN
    if (profile?.role !== 'SUPER_ADMIN') {
      pilots = pilots.filter((p: any) => p.is_active !== false);
    }
    return {
      id: sq.id,
      name: sq.name,
      pilots
    };
  });

  // Fetch ALL profiles for the "Assign Pilots" view
  let profilesQuery = supabase
    .from('profiles')
    .select('id, username, role, squadron_id, is_active')
    .order('created_at', { ascending: true });

  // Si no es SUPER_ADMIN, solo ve los activos
  if (profile?.role !== 'SUPER_ADMIN') {
    profilesQuery = profilesQuery.eq('is_active', true);
  }

  const { data: allProfilesData } = await profilesQuery;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-[var(--color-gaming-secondary)]" />
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">Gestión de Escuadrones</h2>
          <p className="text-gray-400 font-bold tracking-wider">Administra los grupos y asigna a los miembros</p>
        </div>
      </div>

      <SquadronsClient 
        squadrons={formattedSquadrons} 
        allProfiles={allProfilesData || []} 
        currentUserRole={profile?.role || 'STAFF'} 
      />
    </div>
  );
}
