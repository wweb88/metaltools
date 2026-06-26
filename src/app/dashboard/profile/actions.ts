'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const username = formData.get('username') as string
  const newPassword = formData.get('password') as string

  // Actualizar el nombre en la tabla profiles
  if (username) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id)

    if (profileError) {
      return { error: 'Error al actualizar el nombre: ' + profileError.message }
    }
  }

  // Actualizar la contraseña en la autenticación (si se proporcionó una)
  if (newPassword && newPassword.length >= 6) {
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (authError) {
      return { error: 'Error al actualizar la contraseña: ' + authError.message }
    }
  } else if (newPassword && newPassword.length > 0 && newPassword.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  
  return { success: 'Perfil actualizado correctamente' }
}
