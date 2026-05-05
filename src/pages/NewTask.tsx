import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Save, Send, ArrowLeft, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function NewTask() {
  const navigate = useNavigate()
  
  // --- STATI DEL FORM ---
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [version, setVersion] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [content, setContent] = useState('')
  
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Carica le categorie reali dal database all'avvio
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('id, name').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  // Moduli per configurare la barra degli strumenti di Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }

  // --- FUNZIONE DI SALVATAGGIO REALE ---
  const handleSave = async (status: 'draft' | 'published') => {
    if (!title || !categoryId || !content) {
      setError('Compila i campi obbligatori: Titolo, Categoria e Contenuto.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    setLoading(true)
    setError('')

    try {
      // 1. Recupera l'ID dell'utente attualmente loggato
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utente non autenticato. Fai il login.')

      // 2. Genera il riassunto pulito per la card (rimuove HTML e taglia a 150 char)
      const plainText = content.replace(/<[^>]+>/g, '')
      const excerpt = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText

      // 3. Salva nel database Supabase
      const { error: dbError } = await supabase.from('tasks').insert([
        {
          title,
          content,
          excerpt,
          category_id: categoryId,
          version: version || '1.0.0',
          attachment_url: attachmentUrl || null,
          status,
          author_id: user.id
        }
      ])

      if (dbError) throw dbError
      
      // 4. Ritorna alla Dashboard se è andato tutto bene
      navigate('/dashboard')

    } catch (err: any) {
      setError("Errore durante il salvataggio: " + err.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 md:p-12 max-w-5xl mx-auto w-full h-full flex flex-col">
      
      {/* HEADER DELLA PAGINA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nuovo Aggiornamento</h1>
            <p className="text-sm text-slate-500 mt-1">Crea un nuovo task, guida o report tecnico.</p>
          </div>
        </div>
        
        {/* PULSANTI DI AZIONE */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} /> {loading ? 'Salvataggio...' : 'Salva Bozza'}
          </button>
          <button 
            onClick={() => handleSave('published')}
            disabled={loading}
            className="px-5 py-2.5 bg-[#1A65A4] text-white rounded-xl text-sm font-semibold hover:bg-[#134D7D] shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={16} /> {loading ? 'Pubblica Ora' : 'Pubblica'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-semibold">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* FORM AREA */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col gap-8 relative z-10">
        
        <input 
          type="text" 
          placeholder="Titolo dell'aggiornamento o della guida..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl md:text-4xl font-bold text-slate-900 placeholder:text-slate-300 outline-none border-b border-transparent focus:border-slate-100 pb-2 transition-colors"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categoria *</label>
            <select 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4] cursor-pointer"
            >
              <option value="" disabled>Seleziona...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Versione</label>
            <input 
              type="text" 
              placeholder="es. v2.8.0 o Tutte" 
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <LinkIcon size={14} /> Link Zoho WorkDrive
            </label>
            <input 
              type="url" 
              placeholder="https://workdrive.zoho.eu/..." 
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4]"
            />
          </div>
        </div>

        {/* EDITOR QUILL */}
        <div className="flex-1 flex flex-col min-h-[400px]">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contenuto *</label>
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 quill-container">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              modules={modules}
              className="h-full bg-white flex flex-col"
              placeholder="Scrivi qui i dettagli, le istruzioni o gli screenshot..."
            />
          </div>
          
          {/* Stili custom per forzare l'altezza di Quill */}
          <style>{`
            .quill-container .quill { display: flex; flex-direction: column; height: 100%; }
            .quill-container .ql-toolbar { border: none; border-bottom: 1px solid #e2e8f0; background: #f8fafc; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; padding: 12px; }
            .quill-container .ql-container { flex: 1; border: none; font-size: 1rem; font-family: inherit; }
            .quill-container .ql-editor { min-height: 300px; padding: 1.5rem; color: #334155; }
            .quill-container .ql-editor.ql-blank::before { color: #94a3b8; font-style: normal; }
          `}</style>
        </div>

      </div>
    </div>
  )
}