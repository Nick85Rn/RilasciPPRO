import { useState } from 'react'
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        })
        if (error) throw error
        alert('Registrazione completata! Ora puoi accedere.')
        setIsLogin(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-black tracking-tight text-[#1A65A4] mb-2">Pienissimo Hub</h1>
        <h2 className="text-xl font-bold text-slate-900">
          {isLogin ? 'Accedi al tuo account' : 'Richiedi l\'accesso al sistema'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-semibold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo</label>
                <input 
                  type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4] text-sm transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Aziendale</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4] text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4] text-sm transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1A65A4] hover:bg-[#134D7D] focus:outline-none disabled:opacity-50 transition-colors"
            >
              {loading ? 'Elaborazione...' : isLogin ? 'Entra nel Workspace' : 'Invia Richiesta'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm font-semibold text-slate-500 hover:text-[#1A65A4] transition-colors"
            >
              {isLogin ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}