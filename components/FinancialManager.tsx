
import React, { useState, useMemo } from 'react';
import { FinancialRecord, FinancialCategory, Appointment } from '../types';
import { 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  X, 
  ArrowUpCircle, 
  ArrowDownCircle,
  ChevronDown
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/calculations';

interface FinancialManagerProps {
  financialRecords: FinancialRecord[];
  onAdd: (record: FinancialRecord) => void;
  onUpdate: (record: FinancialRecord) => void;
  onDelete: (recordId: string) => void;
  appointments: Appointment[];
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({ 
  financialRecords, 
  onAdd, 
  onUpdate, 
  onDelete,
  appointments
}) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [isRegisterMenuOpen, setIsRegisterMenuOpen] = useState(false);
  
  const [formData, setFormData] = useState<FinancialRecord>({
    id: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: 'Outros',
    description: '',
    type: 'expense'
  });

  const filteredRecords = useMemo(() => {
    return financialRecords.filter(record => {
      const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           record.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = record.date >= dateFilter.start && record.date <= dateFilter.end;
      return matchesSearch && matchesDate;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [financialRecords, searchTerm, dateFilter]);

  const stats = useMemo(() => {
    const revenue = filteredRecords
      .filter(r => r.type === 'income')
      .reduce((acc, r) => acc + r.amount, 0);
    const expenses = filteredRecords
      .filter(r => r.type === 'expense')
      .reduce((acc, r) => acc + r.amount, 0);
      
    const completedAppts = appointments.filter(a => a.status === 'Concluído');
    const avgTicket = completedAppts.length > 0 ? revenue / completedAppts.length : 0;
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      expenses,
      profit,
      avgTicket,
      profitMargin
    };
  }, [filteredRecords, appointments]);

  const handleOpenForm = (type: 'income' | 'expense', record?: FinancialRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData(record);
    } else {
      setEditingRecord(null);
      setFormData({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        category: type === 'income' ? 'Venda' : 'Outros',
        description: '',
        type: type
      });
    }
    setView('form');
    setIsRegisterMenuOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      onUpdate(formData);
    } else {
      onAdd(formData);
    }
    setView('list');
  };

  const categories: FinancialCategory[] = [
    'Aluguel', 'Produtos', 'Marketing', 'Utilidades', 'Serviço', 'Venda', 'Outros'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {view === 'list' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                  <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Faturamento</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(stats.revenue)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 sm:p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl">
                  <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-red-600 uppercase tracking-widest">Despesas</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(stats.expenses)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 sm:p-2 rounded-xl ${stats.profit >= 0 ? 'bg-accent/10 text-accent' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600'}`}>
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${stats.profit >= 0 ? 'text-accent' : 'text-orange-600'}`}>Lucro Líquido</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(stats.profit)}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 sm:p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Margem de Lucro</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100">{stats.profitMargin.toFixed(1)}%</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 sm:p-2 bg-accent/10 text-accent rounded-xl">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-accent uppercase tracking-widest">Ticket Médio</span>
              </div>
              <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(stats.avgTicket)}</p>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar no histórico..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none text-sm font-medium"
                />
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={dateFilter.start}
                  onChange={e => setDateFilter({...dateFilter, start: e.target.value})}
                  className="bg-transparent border-none outline-none text-[10px] font-bold uppercase text-slate-900 dark:text-slate-100"
                />
                <span className="text-slate-300">|</span>
                <input 
                  type="date" 
                  value={dateFilter.end}
                  onChange={e => setDateFilter({...dateFilter, end: e.target.value})}
                  className="bg-transparent border-none outline-none text-[10px] font-bold uppercase text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="relative w-full lg:w-auto">
              <button 
                onClick={() => setIsRegisterMenuOpen(!isRegisterMenuOpen)}
                className="w-full lg:w-auto px-6 py-3 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition"
              >
                Registrar <ChevronDown className={`w-4 h-4 transition-transform ${isRegisterMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isRegisterMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-30 overflow-hidden animate-slide-up">
                  <button 
                    onClick={() => handleOpenForm('income')}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2 transition-colors"
                  >
                    <ArrowUpCircle className="w-4 h-4" /> Receita / Entrada
                  </button>
                  <button 
                    onClick={() => handleOpenForm('expense')}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                  >
                    <ArrowDownCircle className="w-4 h-4" /> Despesa / Saída
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{formatDate(record.date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{record.description}</span>
                          {record.appointmentId && (
                            <span className="text-[9px] text-accent font-black uppercase tracking-widest">Automático via Agendamento</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          {record.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-black text-right ${record.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {record.type === 'income' ? '+' : '-'} {formatCurrency(record.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenForm(record.type, record)} className="p-2 text-slate-400 hover:text-accent"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { if(window.confirm('Excluir registro?')) onDelete(record.id) }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                        Nenhum registro encontrado para este período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'form' && (
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${formData.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {formData.type === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                  {editingRecord ? 'Editar Registro' : `Novo Registro de ${formData.type === 'income' ? 'Entrada' : 'Saída'}`}
                </h3>
              </div>
              <button type="button" onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data</label>
                  <input 
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={formData.amount || ''}
                      onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Descrição</label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: Pagamento Aluguel, Venda de Pomada..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as FinancialCategory})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button type="submit" className={`flex-1 py-4 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:brightness-110 transition-all ${formData.type === 'income' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                {editingRecord ? 'Salvar Alterações' : 'Confirmar Registro'}
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
