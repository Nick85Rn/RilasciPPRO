import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

// --- IMPORTAZIONE COMPONENTI E PAGINE ---
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NewTask from './pages/NewTask'
import EditTask from './pages/EditTask'
import TaskDetail from './pages/TaskDetail'
import Settings from './pages/Settings'
import Login from './pages/Login'

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Controlla la sessione utente al primo caricamento dell'app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 2. Ascolta in tempo reale i cambiamenti (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Mostra un indicatore di caricamento mentre verifica se l'utente è loggato
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A65A4]"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        
        {/* =========================================
            ROTTE PUBBLICHE (Accessibili a tutti)
            Se sei GIÀ loggato e provi ad andare su /login, 
            il sistema ti rimbalza automaticamente sulla Dashboard.
        ========================================= */}
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/dashboard" replace />} 
        />

        {/* =========================================
            ROTTE PROTETTE (Richiedono il Login)
            Tutte queste pagine usano il <Layout /> (con la sidebar).
            Se NON sei loggato, vieni reindirizzato subito su /login.
        ========================================= */}
        <Route element={session ? <Layout /> : <Navigate to="/login" replace />}>
          
          {/* La rotta base "/" reindirizza alla dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Pagine principali del gestionale */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-task" element={<NewTask />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Pagine dinamiche (con l'ID del task nell'URL) */}
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/edit-task/:id" element={<EditTask />} />
          
        </Route>

        {/* =========================================
            FALLBACK (Rotta di emergenza)
            Se un utente digita un URL che non esiste (es: /pagina-a-caso),
            viene riportato alla rotta principale senza far crashare l'app.
        ========================================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}