
import React, { useState } from 'react';
import { Service, Product, ServiceMaterial } from '../types';
import { formatCurrency, formatDuration } from '../utils/calculations';
import {
  Plus,
  Search,
  Scissors,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  X,
  CheckCircle2
} from 'lucide-react';

interface ServiceManagerProps {
  services: Service[];
  products: Product[];
  onAddService: (service: Service) => void;
  onUpdateService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
}

export const ServiceManager: React.FC<ServiceManagerProps> = ({
  services,
  products,
  onAddService,
  onUpdateService,
  onDeleteService
}) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Service>({
    id: '',
    name: '',
    duration: 30,
    price: 0,
    category: 'Cabelo'
  });

  const handleOpenForm = (serv?: Service) => {
    if (serv) {
      setEditingService(serv);
      setFormData(serv);
    } else {
      setEditingService(null);
      setFormData({
        id: crypto.randomUUID(),
        name: '',
        duration: 30,
        price: 0,
        category: 'Cabelo',
        materials: []
      });
    }
    setView('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      onUpdateService(formData);
    } else {
      onAddService(formData);
    }
    setView('list');
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                placeholder="Buscar serviço..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none text-sm font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="w-full sm:w-auto px-6 py-3 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-sm hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" /> Novo Serviço
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredServices.map(service => (
              <div
                key={service.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-accent transition-all group shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-accent group-hover:text-white transition-all">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenForm(service)} className="p-2 text-slate-400 hover:text-accent"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { if (window.confirm('Excluir serviço?')) onDeleteService(service.id) }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm truncate tracking-tight mb-1">{service.name}</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">{service.category}</p>

                <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duração</span>
                    <div className="flex items-center gap-1.5 text-sm font-black text-slate-800 dark:text-slate-100">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      {formatDuration(service.duration)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referência</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                      {service.price != null && service.price > 0 ? formatCurrency(service.price) : <span className="text-slate-400 font-medium text-xs italic">Livre</span>}
                    </span>
                  </div>
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
                {editingService ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button type="button" onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome do Serviço</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="Cabelo">Cabelo</option>
                    <option value="Barba">Barba</option>
                    <option value="Trança">Trança</option>
                    <option value="Combo">Combo / Pacote</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Preço Sugerido <span className="text-slate-400 font-medium">(opcional)</span></label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00 — Deixe vazio para preço livre"
                    value={formData.price ?? ''}
                    onChange={e => setFormData({ ...formData, price: e.target.value === '' ? undefined : Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Duração Estimada</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      value={Math.floor(formData.duration / 60)}
                      onChange={e => {
                        const h = parseInt(e.target.value);
                        const m = formData.duration % 60;
                        setFormData({ ...formData, duration: (h * 60) + m });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 appearance-none"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                        <option key={h} value={h}>{h} {h === 1 ? 'Hora' : 'Horas'}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={formData.duration % 60}
                      onChange={e => {
                        const m = parseInt(e.target.value);
                        const h = Math.floor(formData.duration / 60);
                        setFormData({ ...formData, duration: (h * 60) + m });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 appearance-none"
                    >
                      {[0, 15, 30, 45].map(m => (
                        <option key={m} value={m}>{m} min</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Materiais Sec */}
              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Materiais Necessários (Estoque)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        materials: [...(formData.materials || []), { id: crypto.randomUUID(), name: '', options: [], quantity: 1 }]
                      });
                    }}
                    className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Material
                  </button>
                </div>

                {formData.materials && formData.materials.length > 0 ? (
                  <div className="space-y-4">
                    {formData.materials.map((mat, index) => (
                      <div key={mat.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 relative group">
                        <button
                          type="button"
                          onClick={() => {
                            const newMaterials = [...(formData.materials || [])];
                            newMaterials.splice(index, 1);
                            setFormData({ ...formData, materials: newMaterials });
                          }}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        <div className="grid grid-cols-[1fr_80px] gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nome (ex: Tintura)</label>
                            <input
                              type="text"
                              required
                              value={mat.name}
                              onChange={e => {
                                const newMaterials = [...(formData.materials || [])];
                                newMaterials[index].name = e.target.value;
                                setFormData({ ...formData, materials: newMaterials });
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-xs font-bold text-slate-900 dark:text-slate-100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Qtd.</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={mat.quantity}
                              onChange={e => {
                                const newMaterials = [...(formData.materials || [])];
                                newMaterials[index].quantity = Number(e.target.value);
                                setFormData({ ...formData, materials: newMaterials });
                              }}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-xs font-bold text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Produtos Compatíveis do Estoque</label>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                            {products.length > 0 ? products.map(p => {
                              const isSelected = mat.options.includes(p.id);
                              return (
                                <button
                                  type="button"
                                  key={p.id}
                                  onClick={() => {
                                    const newMaterials = [...(formData.materials || [])];
                                    if (isSelected) {
                                      newMaterials[index].options = newMaterials[index].options.filter(id => id !== p.id);
                                    } else {
                                      newMaterials[index].options.push(p.id);
                                    }
                                    setFormData({ ...formData, materials: newMaterials });
                                  }}
                                  className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${isSelected
                                      ? 'bg-accent text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                  {p.name}
                                </button>
                              );
                            }) : <span className="text-[10px] text-slate-400 italic">Nenhum produto cadastrado no estoque.</span>}
                          </div>
                          {mat.options.length === 0 && products.length > 0 && (
                            <p className="text-[9px] text-red-500 mt-1">Selecione ao menos um produto compatível.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400 font-medium">Nenhum material associado a este serviço.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button type="submit" className="flex-1 py-4 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:brightness-110 transition-all">
                {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
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
