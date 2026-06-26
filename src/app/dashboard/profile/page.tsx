import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './ProfileForm'
import { Settings, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wider text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-[var(--color-gaming-accent)]" />
          Configuración de Perfil
        </h1>
        <p className="text-gray-400">
          Actualiza tu nombre de piloto o cambia tu contraseña de acceso.
        </p>
      </div>

      <div className="flex items-start gap-4">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hidden md:block">
          <User className="w-16 h-16 text-gray-500" />
        </div>
        <div className="flex-1">
          <ProfileForm initialUsername={profile?.username || ''} />
        </div>
      </div>
    </div>
  )
}
