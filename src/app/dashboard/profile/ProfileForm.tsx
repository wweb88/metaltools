'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from './actions'
import { Loader2, AlertCircle, CheckCircle, Save } from 'lucide-react'

export function ProfileForm({ initialUsername }: { initialUsername: string }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setMessage(null)
    
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result.success) {
        setMessage({ type: 'success', text: result.success })
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6 bg-black/40 border border-white/10 p-6 md:p-8 rounded-2xl max-w-2xl">
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Nombre de Piloto (Display Name)
        </label>
        <input 
          type="text" 
          name="username"
          defaultValue={initialUsername}
          placeholder="Ej: Maverick"
          required
          className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)] transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Nueva Contraseña (Opcional)
        </label>
        <input 
          type="password" 
          name="password"
          placeholder="Deja en blanco para no cambiarla"
          className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-gaming-accent)] transition-colors"
        />
        <p className="text-xs text-gray-500">Mínimo 6 caracteres.</p>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-[var(--color-gaming-accent)] text-black font-bold uppercase rounded-xl hover:bg-[var(--color-gaming-accent-hover)] transition-all disabled:opacity-50"
      >
        {isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
        Guardar Cambios
      </button>
    </form>
  )
}
