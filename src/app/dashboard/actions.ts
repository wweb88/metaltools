'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function togglePlane(airplaneId: string, isUnlocked: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  if (isUnlocked) {
    // Upsert a new record unlocking the plane with level 1 by default
    const { error } = await supabase
      .from('pilot_airplanes')
      .upsert({
        profile_id: user.id,
        airplane_id: airplaneId,
        is_unlocked: true,
        level: 1,
        special_ability_level: 0,
        passive_ability_level: 0
      }, { onConflict: 'profile_id, airplane_id' })
      
    if (error) console.error('Error unlocking plane:', error)
  } else {
    // Delete the record if they lock it back
    const { error } = await supabase
      .from('pilot_airplanes')
      .delete()
      .eq('profile_id', user.id)
      .eq('airplane_id', airplaneId)
      
    if (error) console.error('Error locking plane:', error)
  }

  revalidatePath('/dashboard')
}

export async function updatePlaneLevel(airplaneId: string, field: 'level' | 'special_ability_level' | 'passive_ability_level', value: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('pilot_airplanes')
    .update({ [field]: value })
    .eq('profile_id', user.id)
    .eq('airplane_id', airplaneId)

  if (error) console.error(`Error updating ${field}:`, error)

  revalidatePath('/dashboard')
}
