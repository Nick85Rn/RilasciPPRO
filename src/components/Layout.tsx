import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings as SettingsIcon, LogOut, FilePlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Layout() {
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const navItems = [
    { name: 'Tutti i Task', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Nuovo Aggiornamento', path: '/new-task', icon: FilePlus },
  ]

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR DI SINISTRA */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
        
        {/* LOGO AREA - Ora allargata al massimo della sidebar */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 shrink-0">
          <img 
            src="/logo.png" 
            alt="Pienissimo PRO" 
            className="w-full h-auto max-h-12 object-contain object-left"
          />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8">
          
          <div className="px-4">
            <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Assistenza</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive 
                        ? 'bg-slate-100 text-[#1A65A4]' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-[#1A65A4]' : 'text-slate-400'} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="px-4">
            <p className="px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Sistema</p>
            <nav className="space-y-1">
              <Link
                to="/settings"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === '/settings' 
                    ? 'bg-slate-100 text-[#1A65A4]' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <SettingsIcon size={18} className={location.pathname === '/settings' ? 'text-[#1A65A4]' : 'text-slate-400'} />
                Impostazioni
              </Link>
            </nav>
          </div>

        </div>

        {/* Footer Sidebar (Logout) */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Esci dall'Hub
          </button>
        </div>
      </aside>

      {/* AREA PRINCIPALE */}
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
        <Outlet />
      </main>

    </div>
  )
}