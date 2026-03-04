
import React, { useState } from 'react';
import { Professional } from '../types';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2,
  Briefcase
} from 'lucide-react';

interface ProfessionalManagerProps {
  professionals: Professional[];
  onAddProfessional: (professional: Professional) => void;
  onUpdateProfessional: (professional: Professional) => void;
  onDeleteProfessional: (professionalId: string) => void;
}

export const ProfessionalManager: React.FC<ProfessionalManagerProps> = ({ 
  professionals, 
  onAddProfessional, 
  onUpdateProfessional, 
  onDeleteProfessional 
}) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState<Professional>({
    id: '',
    name: '',
    specialty: '',
    phone: '',
    email: '',
    status: 'active'
  });

  const handleOpenForm = (prof?: Professional) => {
    if (prof) {
      setEditingProfessional(prof);
      setFormData(prof);
    } else {
      setEditingProfessional(null);
      setFormData({
        id: crypto.randomUUID(),
        name: '',
        specialty: '',
        phone: '',
        email: '',
        status: 'active'
      });
    }
    setView('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProfessional) {
      onUpdateProfessional(formData);
    } else {
      onAddProfessional(formData);
    }
    setView('list');
  };

  const filteredProfessionals = professionals.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {view === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar profissional..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none text-sm font-medium"
              />
            </div>
            <button 
              onClick={() => handleOpenForm()}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-sm hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" /> Novo Profissional
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProfessionals.map(professional => (
              <div 
                key={professional.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 transition-all group shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 font-black text-lg flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                    {professional.name.charAt(0)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenForm(professional)} className="p-2 text-slate-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { if(window.confirm('Excluir profissional?')) onDeleteProfessional(professional.id) }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm truncate tracking-tight mb-1">{professional.name}</h3>
                <div className="flex items-center gap-1.5 mb-4">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{professional.specialty}</span>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <Phone className="w-3.5 h-3.5 opacity-50" />
                    <span>{professional.phone || 'Sem contato'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5 opacity-50" />
                    <span className="truncate">{professional.email || 'Sem email'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${professional.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    {professional.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'form' && (
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </h3>
              <button type="button" onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Especialidade</label>
                  <input 
                    required
                    type="text"
                    placeholder="Ex: Barbeiro, Trancista..."
                    value={formData.specialty}
                    onChange={e => setFormData({...formData, specialty: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone</label>
                  <input 
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:brightness-110 transition-all">
                {editingProfessional ? 'Salvar Alterações' : 'Cadastrar Profissional'}
              </button>
              <button type="button" onClick={() => setView('list')} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
