import { useState, useEffect } from 'react'
import { Search, Plus, ChevronRight, FileText, Calendar, User, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Stati per notifiche
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMsg, setNotificationMsg] = useState('')

  // Stati per i filtri
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tutti')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    
    const { data: catsData } = await supabase.from('categories').select('*').order('name')
    if (catsData) setCategories(catsData)

    const { data: tasksData, error } = await supabase
      .from('tasks')
      .select(`
        *,
        category:categories(name, color_class),
        author:profiles(full_name)
      `)
      .order('created_at', { ascending: false })

    if (tasksData) {
      setTasks(tasksData)
    } else if (error) {
      console.error("Errore nel caricamento task:", error)
    }
    
    setLoading(false)
  }

  const notify = (msg: string) => {
    setNotificationMsg(msg)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  // --- FUNZIONE ELIMINA TASK ---
  const handleDeleteTask = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Evita che il click apra l'articolo
    
    if (!window.confirm('Sei sicuro di voler eliminare definitivamente questo aggiornamento?')) return

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      
      setTasks(tasks.filter(t => t.id !== id))
      notify('Aggiornamento eliminato con successo')
    } catch (err: any) {
      alert("Impossibile eliminare: " + err.message)
    }
  }

  // --- FUNZIONE MODIFICA TASK ---
  const handleEditTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Evita che il click apra l'articolo
    navigate(`/edit-task/${id}`)
  }

  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        task.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = activeCategory === 'Tutti' || task.category?.name === activeCategory
    return matchSearch && matchCat
  })

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
    return new Date(dateString).toLocaleDateString('it-IT', options)
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full relative">
      
      {/* NOTIFICA TOAST */}
      {showNotification && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white shadow-xl rounded-xl p-4 flex items-center gap-3 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 size={18} className="text-green-400" />
          <span className="text-sm font-medium pr-2">{notificationMsg}</span>
        </div>
      )}

      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hub Aggiornamenti</h1>
          <p className="text-sm text-slate-500 mt-2">Cerca, consulta e gestisci il registro tecnico di Pienissimo PRO.</p>
        </div>
        <Link 
          to="/new-task" 
          className="px-6 py-3 bg-[#1A65A4] text-white rounded-xl text-sm font-semibold hover:bg-[#134D7D] shadow-sm transition-colors flex items-center justify-center gap-2 w-full md:w-auto shrink-0"
        >
          <Plus size={18} /> Scrivi Aggiornamento
        </Link>
      </div>

      {/* BARRA DI RICERCA E FILTRI */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cerca per titolo o contenuto..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4] shadow-sm transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setActiveCategory('Tutti')}
            className={`px-5 py-3 rounded-xl text-sm font-semibold transition-colors border ${activeCategory === 'Tutti' ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            Tutti
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-5 py-3 rounded-xl text-sm font-semibold transition-colors border flex items-center gap-2 ${activeCategory === cat.name ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <div className={`w-2 h-2 rounded-full ${cat.color_class}`}></div>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* STATO DI CARICAMENTO */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A65A4]"></div>
        </div>
      )}

      {/* NESSUN RISULTATO */}
      {!loading && filteredTasks.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Nessun aggiornamento trovato</h3>
          <p className="text-sm text-slate-500 mt-1">Prova a cambiare i filtri o crea il tuo primo task!</p>
        </div>
      )}

      {/* GRIGLIA TASK (DATI REALI) */}
      {!loading && filteredTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => navigate(`/task/${task.id}`)} // ORA CLICCABILE!
              className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all relative overflow-hidden flex flex-col h-full cursor-pointer"
            >
              
              {task.status === 'draft' && (
                <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold px-8 py-1 uppercase tracking-widest transform translate-x-6 translate-y-3 rotate-45 shadow-sm">
                  Bozza
                </div>
              )}

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  {task.category ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                      <span className={`w-2 h-2 rounded-full ${task.category.color_class}`}></span>
                      {task.category.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg text-xs font-bold">
                      Senza Categoria
                    </span>
                  )}

                  {task.version && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono">
                      {task.version}
                    </span>
                  )}
                </div>
                
                {/* BOTTONI MODIFICA / ELIMINA (Visibili all'hover) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleEditTask(e, task.id)}
                    className="p-1.5 text-slate-400 hover:text-[#1A65A4] hover:bg-blue-50 rounded-md transition-colors"
                    title="Modifica"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteTask(e, task.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Elimina"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#1A65A4] transition-colors line-clamp-2">
                {task.title}
              </h2>
              
              <p className="text-sm text-slate-500 mb-8 line-clamp-3 leading-relaxed flex-1">
                {task.excerpt || 'Nessuna descrizione disponibile.'}
              </p>

              <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar size={14} /> {formatDate(task.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                    <User size={14} className="text-slate-400" /> {task.author?.full_name || 'Sconosciuto'}
                  </span>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#1A65A4] text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                  <ChevronRight size={18} />
                </div>
              </div>
              
            </div>
          ))}
        </div>
      )}
      
    </div>
  )
}