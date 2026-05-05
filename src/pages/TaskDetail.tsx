import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Clock, Download, Tag, Edit2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchTask() {
      if (!id) return
      
      try {
        // Interroghiamo Supabase chiedendo i dettagli del task specifico, 
        // espandendo le chiavi esterne per nome categoria, colore e nome autore
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            category:categories(name, color_class),
            author:profiles(full_name)
          `)
          .eq('id', id)
          .single()

        if (error) throw error
        
        if (data) {
          setTask(data)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error("Errore recupero task:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A65A4]"></div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Aggiornamento non trovato</h2>
        <p className="text-slate-500 mb-6">Il task richiesto non esiste o è stato eliminato.</p>
        <Link to="/dashboard" className="text-[#1A65A4] hover:underline font-medium">Torna alla Dashboard</Link>
      </div>
    )
  }

  // Formattazione data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    })
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto w-full h-full flex flex-col">
      
      {/* HEADER DELLA PAGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl shadow-sm transition-colors self-start"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/edit-task/${task.id}`)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors flex items-center gap-2"
          >
            <Edit2 size={16} /> Modifica
          </button>
        </div>
      </div>

      {/* CONTENUTO PRINCIPALE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
        
        {/* Intestazione Articolo */}
        <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-50/50 relative">
          
          {task.status === 'draft' && (
            <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1.5 uppercase tracking-widest rounded-bl-xl shadow-sm">
              Bozza
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {task.category ? (
               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm">
                 <span className={`w-2.5 h-2.5 rounded-full ${task.category.color_class}`}></span>
                 {task.category.name}
               </span>
            ) : (
               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-400 rounded-lg text-xs font-bold shadow-sm">
                 Senza Categoria
               </span>
            )}
           
            {task.version && (
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider font-mono">
                v {task.version}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
            {task.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" /> 
              {task.author?.full_name || 'Autore Sconosciuto'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" /> 
              {formatDate(task.created_at)}
            </div>
            {task.updated_at !== task.created_at && (
              <div className="flex items-center gap-2 text-slate-400">
                <Clock size={16} /> Modificato
              </div>
            )}
          </div>
        </div>

        {/* ALLEGATO ZOHO (Se presente) */}
        {task.attachment_url && (
          <div className="bg-blue-50/50 border-b border-blue-100 p-6 md:px-12 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                 <Tag size={20} />
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-900">Documento Allegato</p>
                 <p className="text-xs text-slate-500">Risorsa disponibile su Zoho WorkDrive</p>
               </div>
             </div>
             <a 
               href={task.attachment_url} 
               target="_blank" 
               rel="noopener noreferrer"
               className="px-5 py-2.5 bg-white border border-slate-200 text-[#1A65A4] rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors flex items-center gap-2"
             >
               <Download size={16} /> Apri Documento
             </a>
          </div>
        )}

        {/* TESTO ARTICOLO (HTML renderizzato) */}
        <div className="p-8 md:p-12 bg-white flex-1">
          <div 
            className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-[#1A65A4] prose-img:rounded-xl prose-img:border prose-img:border-slate-200"
            dangerouslySetInnerHTML={{ __html: task.content || '<p>Nessun contenuto</p>' }}
          />
        </div>

      </div>
    </div>
  )
}