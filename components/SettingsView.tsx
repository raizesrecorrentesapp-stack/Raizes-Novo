
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Settings, Clock, Layout, Save, CheckCircle2, ShieldAlert, Palette, Sparkles } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const THEME_COLORS = [
  { name: 'Rosa Chic', value: '#db2777', label: 'Pink' },
  { name: 'Lavanda Luxo', value: '#7c3aed', label: 'Violet' },
  { name: 'Coral Soft', value: '#f43f5e', label: 'Rose' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleVisibility = (key: keyof AppSettings['dashboardVisibility']) => {
    setFormData({
      ...formData,
      dashboardVisibility: {
        ...formData.dashboardVisibility,
        [key]: !formData.dashboardVisibility[key]
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20 sm:pb-0">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-slate-900 dark:bg-white rounded-2xl text-white dark:text-slate-900 shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Personalização do Studio</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Configure a identidade visual e regras do seu negócio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Seção de Identidade Visual */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em]">
              <Palette className="w-4 h-4 text-pink-500" /> Cor de Destaque
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, accentColor: color.value })}
                  className={`
                    relative p-4 rounded-2xl border-2 transition-all flex items-center gap-4 group
                    ${formData.accentColor === color.value 
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/50' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}
                  `}
                >
                  <div 
                    className="w-10 h-10 rounded-xl shadow-inner shrink-0" 
                    style={{ backgroundColor: color.value }}
                  />
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">{color.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{color.label}</p>
                  </div>
                  {formData.accentColor === color.value && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Seção Operacional */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em]">
              <Clock className="w-4 h-4 text-blue-500" /> Horário de Funcionamento
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Início do Expediente</label>
                <input 
                  type="time"
                  value={formData.businessHours.start} 
                  onChange={e => setFormData({...formData, businessHours: {...formData.businessHours, start: e.target.value}})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-200 dark:focus:border-slate-700 rounded-2xl outline-none font-black text-slate-900 dark:text-slate-100 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fim do Expediente</label>
                <input 
                  type="time"
                  value={formData.businessHours.end} 
                  onChange={e => setFormData({...formData, businessHours: {...formData.businessHours, end: e.target.value}})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-200 dark:focus:border-slate-700 rounded-2xl outline-none font-black text-slate-900 dark:text-slate-100 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Intervalo entre Serviços</label>
                <select 
                  value={formData.intervalMinutes} 
                  onChange={e => setFormData({...formData, intervalMinutes: Number(e.target.value)})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-200 dark:focus:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-slate-100 transition-all appearance-none"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>
            </div>
          </section>

          {/* Seção de Dashboard */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em]">
              <Layout className="w-4 h-4 text-orange-500" /> Visibilidade do Painel
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <VisibilityToggle label="Receita" active={formData.dashboardVisibility.receitaMensal} onClick={() => toggleVisibility('receitaMensal')} />
              <VisibilityToggle label="Agenda" active={formData.dashboardVisibility.agendamentosHoje} onClick={() => toggleVisibility('agendamentosHoje')} />
              <VisibilityToggle label="Ticket" active={formData.dashboardVisibility.ticketMedio} onClick={() => toggleVisibility('ticketMedio')} />
              <VisibilityToggle label="Estoque" active={formData.dashboardVisibility.estoqueBaixo} onClick={() => toggleVisibility('estoqueBaixo')} />
            </div>
          </section>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <Sparkles className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Feminino & Elegante</p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {showSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest animate-slide-up">
                  <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
                </div>
              )}
              <button 
                type="submit" 
                className="flex-1 sm:flex-none px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const VisibilityToggle = ({ label, active, onClick }: any) => (
  <button 
    type="button" 
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 text-left transition-all ${active ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
      {active ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
    </div>
    <p className={`text-[8px] font-black uppercase tracking-widest ${active ? 'opacity-60' : 'opacity-40'}`}>{active ? 'Ativo' : 'Inativo'}</p>
  </button>
);
