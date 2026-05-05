import { useState, useEffect } from 'react'
import { 
  Plus, Trash2, Tag, Users, Shield, 
  CheckCircle2, X, Check, User as UserIcon, 
  Camera, Mail, Key, Edit2, ChevronDown, Lock, AlertTriangle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

const CATEGORY_COLORS = [
  'bg-slate-500', 'bg-red-500', 'bg-amber-500', 
  'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'
]

type Category = { id: string, name: string, colorClass: string }
type Profile = { id: string, name: string, email: string, role: string, type: string, initials: string, requestDate?: string }

export default function Settings() {
  const [activeTab, setActiveTab] = useState('categories') 
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMsg, setNotificationMsg] = useState('')
  
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' })

  const [myId, setMyId] = useState('')
  const [myEmail, setMyEmail] = useState('')
  const [myPassword, setMyPassword] = useState('')
  const [myName, setMyName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  const [categories, setCategories] = useState<Category[]>([])
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[4])
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingColor, setEditingColor] = useState('')

  const [users, setUsers] = useState<Profile[]>([])
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([])

  const [userToEdit, setUserToEdit] = useState<Profile | null>(null)
  const [newEmailForUser, setNewEmailForUser] = useState('')
  const [newPassForUser, setNewPassForUser] = useState('')

  useEffect(() => {
    fetchUserData()
    fetchCategories()
    fetchProfiles()
  }, [])

  async function fetchUserData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setMyId(user.id)
      setMyEmail(user.email || '')
      setMyName(user.user_metadata?.full_name || 'Utente Hub')
    }
  }

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('created_at')
    if (data && !error) {
      setCategories(data.map(c => ({ id: c.id, name: c.name, colorClass: c.color_class })))
    }
  }

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    if (data) {
      const pending: Profile[] = []
      const active: Profile[] = []

      data.forEach(u => {
        const profile = {
          id: u.id,
          name: u.full_name || 'Sconosciuto',
          email: u.email || '',
          role: u.role,
          type: u.department || 'Commerciale',
          initials: (u.full_name || 'U').substring(0, 2).toUpperCase(),
          requestDate: new Date(u.created_at).toLocaleDateString()
        }
        if (u.role === 'pending') pending.push(profile)
        else active.push(profile)
      })

      setPendingUsers(pending)
      setUsers(active)
    }
  }

  const notify = (msg: string) => {
    setNotificationMsg(msg)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const showError = (msg: string) => {
    setErrorModal({ isOpen: true, message: msg })
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    try {
      const { data, error } = await supabase.from('categories').insert([{ name: newCatName, color_class: newCatColor }]).select()
      if (error) throw error
      if (data) {
        setCategories([...categories, { id: data[0].id, name: data[0].name, colorClass: data[0].color_class }])
        setNewCatName('')
        notify('Categoria salvata nel DB!')
      }
    } catch (err: any) {
      showError("Impossibile creare la categoria. Dettagli sistema: " + err.message)
    }
  }

  const saveEditCategory = async () => {
    if (!editingName.trim() || !editingId) return
    try {
      const { error } = await supabase.from('categories').update({ name: editingName, color_class: editingColor }).eq('id', editingId)
      if (error) throw error
      setCategories(categories.map(c => c.id === editingId ? { ...c, name: editingName, colorClass: editingColor } : c))
      setEditingId(null)
      notify('Categoria aggiornata')
    } catch (err: any) {
      showError("Impossibile modificare la categoria. Dettagli: " + err.message)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      setCategories(categories.filter(c => c.id !== id))
      notify('Categoria eliminata dal DB')
    } catch (err: any) {
      showError("Impossibile eliminare la categoria. Dettagli: " + err.message)
    }
  }

  const handleTypeChange = async (userId: string, newType: string) => {
    const { error } = await supabase.from('profiles').update({ department: newType }).eq('id', userId)
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, type: newType } : u))
      notify(`Reparto aggiornato a: ${newType}`)
    } else {
      showError("Errore nell'aggiornamento del reparto: " + error.message)
    }
  }

  const handleApproveUser = async (user: Profile) => {
    const { error } = await supabase.from('profiles').update({ role: 'Assistenza', department: 'Commerciale' }).eq('id', user.id)
    if (!error) {
      setPendingUsers(pendingUsers.filter(u => u.id !== user.id))
      setUsers([...users, { ...user, role: 'Assistenza', type: 'Commerciale' }])
      notify(`${user.name} è stato attivato.`)
    } else {
       showError("Errore nell'approvazione utente: " + error.message)
    }
  }

  const openEditModal = (user: any) => {
    setUserToEdit(user)
    setNewEmailForUser(user.email)
    setNewPassForUser('')
  }

  const handleMasterUpdateUser = () => {
    setUserToEdit(null)
    notify(`Funzione Edge Server richiesta per forzare password di altri.`)
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-10 lg:gap-14 relative min-h-screen">
      
      {showNotification && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white shadow-xl rounded-xl p-4 flex items-center gap-3 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 size={18} className="text-green-400" />
          <span className="text-sm font-medium pr-2">{notificationMsg}</span>
        </div>
      )}

      {errorModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 border border-red-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Ops! Qualcosa è andato storto</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {errorModal.message}
              </p>
              <button 
                onClick={() => setErrorModal({ isOpen: false, message: '' })}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                Ho capito
              </button>
            </div>
          </div>
        </div>
      )}

      {userToEdit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Gestione Utente</h3>
              <button onClick={() => setUserToEdit(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Modifica le credenziali di accesso per <strong className="text-slate-800">{userToEdit.name}</strong>.</p>
            <div className="space-y-5">
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email</label><input type="email" value={newEmailForUser} onChange={(e) => setNewEmailForUser(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#1A65A4] outline-none transition-all" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nuova Password</label><input type="password" placeholder="Inserisci per resettare..." value={newPassForUser} onChange={(e) => setNewPassForUser(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#1A65A4] outline-none transition-all placeholder:text-slate-400" /></div>
              <div className="pt-2"><button onClick={handleMasterUpdateUser} className="w-full py-3 bg-[#1A65A4] text-white rounded-xl font-semibold text-sm hover:bg-[#134D7D] transition-colors shadow-sm">Salva Credenziali</button></div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR DI NAVIGAZIONE */}
      <div className="w-full md:w-64 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Settings</h1>
        <nav className="space-y-1">
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-white text-[#1A65A4] shadow-sm ring-1 ring-slate-200/50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><UserIcon size={18} /> Profilo Personale</button>
          
          <div className="py-4"><div className="h-px bg-slate-200 w-full"></div></div>
          
          <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace Control</p>
          <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'categories' ? 'bg-white text-[#1A65A4] shadow-sm ring-1 ring-slate-200/50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Tag size={18} /> Categorie</button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-white text-[#1A65A4] shadow-sm ring-1 ring-slate-200/50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 relative'}`}>
            <Users size={18} /> Utenti e Ruoli 
            {pendingUsers.length > 0 && <span className="absolute right-4 w-2 h-2 rounded-full bg-red-500"></span>}
          </button>
        </nav>
      </div>

      {/* CONTENUTO PRINCIPALE */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 md:p-10 lg:p-12 overflow-y-auto">
        
        {/* --- TAB CATEGORIE --- */}
        {activeTab === 'categories' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-50/50 p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#1A65A4]/20 focus-within:border-[#1A65A4] transition-all">
                <div className="flex gap-1.5 border-r border-slate-100 pr-3 py-2">
                  {CATEGORY_COLORS.map(color => (
                    <button key={color} onClick={() => setNewCatColor(color)} className={`w-3.5 h-3.5 rounded-full ${color} transition-all ${newCatColor === color ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-40 hover:opacity-100'}`} />
                  ))}
                </div>
                <input type="text" placeholder="Nome nuova categoria..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} className="flex-1 py-2 text-sm outline-none bg-transparent" />
              </div>
              <button onClick={handleAddCategory} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors shrink-0"><Plus size={16} /> Aggiungi</button>
            </div>

            <div className="grid gap-2.5">
              {categories.map(cat => (
                <div key={cat.id} className={`group flex justify-between items-center p-4 border rounded-xl transition-all ${editingId === cat.id ? 'border-[#1A65A4] bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'}`}>
                  <div className="flex items-center gap-4 flex-1">
                    {editingId === cat.id ? (
                      <div className="flex items-center gap-3 w-full max-w-sm">
                        <div className="flex gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                          {CATEGORY_COLORS.map(color => (
                            <button key={color} onClick={() => setEditingColor(color)} className={`w-3.5 h-3.5 rounded-full ${color} transition-all ${editingColor === color ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-40 hover:opacity-100'}`} />
                          ))}
                        </div>
                        <input autoFocus value={editingName} onChange={(e) => setEditingName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEditCategory()} className="bg-white border border-slate-300 rounded-md px-3 py-1.5 text-sm w-full outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4]" />
                      </div>
                    ) : (
                      <><div className={`w-2.5 h-2.5 rounded-full ${cat.colorClass}`}></div><span className="font-semibold text-slate-700 text-sm">{cat.name}</span></>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingId === cat.id ? (
                      <button onClick={saveEditCategory} className="p-1.5 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition-colors"><Check size={16}/></button>
                    ) : (
                      <>
                        <button onClick={() => {setEditingId(cat.id); setEditingName(cat.name); setEditingColor(cat.colorClass)}} className="p-2 text-slate-400 hover:text-[#1A65A4] hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-colors"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-colors"><Trash2 size={16}/></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB UTENTI --- */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Team Governance</h2>
            <p className="text-sm text-slate-500 mb-8">Gestisci gli accessi, i reparti e le credenziali del tuo team.</p>
            {pendingUsers.length > 0 && (
              <div className="mb-10 bg-amber-50 border border-amber-200/60 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-amber-100/30 border-b border-amber-200/60 flex items-center gap-2.5"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span></span><h3 className="font-semibold text-amber-800 text-xs uppercase tracking-wider">Richieste in Attesa</h3></div>
                <div className="divide-y divide-amber-100/60">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="px-6 py-4 flex items-center justify-between"><div className="flex items-center gap-4"><div className="h-10 w-10 rounded-full bg-white border border-amber-200 flex items-center justify-center font-bold text-amber-600 shadow-sm text-sm">{user.initials}</div><div><p className="font-semibold text-slate-900 text-sm">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div></div><button onClick={() => handleApproveUser(user)} className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg font-semibold text-xs hover:bg-green-50 shadow-sm transition-colors flex items-center gap-1.5"><Check size={14}/> Approva</button></div>
                  ))}
                </div>
              </div>
            )}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Collaboratore</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reparto</th><th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Azioni</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4"><div className="flex items-center gap-3.5"><div className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm ${u.type === 'Admin' ? 'bg-[#1A65A4]' : 'bg-slate-400'}`}>{u.initials}</div><div><p className="font-semibold text-slate-900">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div></div></td>
                      <td className="px-6 py-4"><div className="relative max-w-[160px]"><select value={u.type} onChange={(e) => handleTypeChange(u.id, e.target.value)} className="appearance-none w-full bg-slate-50 border border-slate-200 py-2 px-3 pr-8 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4] focus:bg-white transition-all cursor-pointer hover:bg-slate-100">{['Admin', 'Commerciale', 'Zucchetti', 'Marketing'].map(t => <option key={t} value={t}>{t}</option>)}</select><ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" /></div></td>
                      <td className="px-6 py-4 text-right">{u.id !== myId ? <button onClick={() => openEditModal(u)} className="p-2 text-slate-400 hover:text-[#1A65A4] hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center" title="Modifica Credenziali"><Lock size={16} /></button> : <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">Tu</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB PROFILO --- */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Il mio Profilo</h2>
            <p className="text-sm text-slate-500 mb-8">Modifica le tue informazioni personali e le credenziali d'accesso.</p>
            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-100">
              <div className="relative group"><div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-[#1A65A4] font-bold text-2xl shadow-sm">{avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" /> : myName.charAt(0)}</div></div>
              <div><h3 className="text-lg font-bold text-slate-900">{myName}</h3><p className="text-xs text-slate-500 mt-0.5">Admin Workspace</p></div>
            </div>
            <div className="space-y-6">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email</label><div className="relative"><Mail className="absolute left-4 top-3 text-slate-400" size={18} /><input type="email" value={myEmail} onChange={(e) => setMyEmail(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4] text-sm transition-all" /></div></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Nuova Password</label><div className="relative"><Key className="absolute left-4 top-3 text-slate-400" size={18} /><input type="password" placeholder="Lascia vuoto per non modificare" value={myPassword} onChange={(e) => setMyPassword(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A65A4]/20 focus:border-[#1A65A4] text-sm transition-all placeholder:text-slate-400" /></div></div>
              <div className="pt-2"><button onClick={() => notify('Profilo aggiornato!')} className="px-6 py-2.5 bg-[#1A65A4] text-white rounded-xl font-semibold text-sm shadow-sm hover:bg-[#134D7D] transition-colors">Salva Modifiche</button></div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}