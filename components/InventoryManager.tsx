
import React, { useState } from 'react';
import { Product, Appointment } from '../types';
import { formatCurrency, getReservedStock, getAvailableStock } from '../utils/calculations';
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  appointments: Appointment[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  products, 
  appointments,
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct 
}) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    quantity: 0,
    minQuantity: 5,
    price: 0,
    category: 'Consumo'
  });

  const handleOpenForm = (prod?: Product) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData(prod);
    } else {
      setEditingProduct(null);
      setFormData({
        id: crypto.randomUUID(),
        name: '',
        quantity: 0,
        minQuantity: 5,
        price: 0,
        category: 'Consumo'
      });
    }
    setView('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(formData);
    } else {
      onAddProduct(formData);
    }
    setView('list');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {view === 'list' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-accent rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em] mb-1">Valor Total em Estoque</p>
                <p className="text-2xl font-black">{formatCurrency(totalInventoryValue)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Itens em Alerta</p>
                <p className="text-2xl font-black text-red-500">{products.filter(p => getAvailableStock(p, appointments) <= p.minQuantity).length}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total de Produtos</p>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{products.length}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar produto..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none text-sm font-medium text-slate-900 dark:text-slate-100"
              />
            </div>
            <button 
              onClick={() => handleOpenForm()}
              className="w-full sm:w-auto px-6 py-3 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-sm hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" /> Novo Produto
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map(product => {
              const availableQty = getAvailableStock(product, appointments);
              const reservedQty = getReservedStock(product.id, appointments);
              const isLowStock = availableQty <= product.minQuantity;
              
              return (
                <div 
                  key={product.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-accent transition-all group shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${isLowStock ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'} dark:bg-slate-800 group-hover:bg-accent group-hover:text-white transition-all`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenForm(product)} className="p-2 text-slate-400 hover:text-accent"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => { if(window.confirm('Excluir produto?')) onDeleteProduct(product.id) }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm truncate tracking-tight mb-1">{product.name}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-4">{product.category}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" title="Estoque Físico Total">Físico</span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {product.quantity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" title="Preso em Agendamentos Futuros">Reservado</span>
                      <span className="text-sm font-bold text-amber-500">
                        {reservedQty > 0 ? `-${reservedQty}` : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/50">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Disponível</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${isLowStock ? 'text-red-500' : 'text-emerald-600'}`}>
                          {availableQty}
                        </span>
                        {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preço</span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === 'form' && (
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button type="button" onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome do Produto</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="Consumo">Consumo Interno</option>
                    <option value="Venda">Venda ao Cliente</option>
                    <option value="Equipamento">Equipamento</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Preço Unitário</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Qtd em Estoque</label>
                  <input 
                    required
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Qtd Mínima (Alerta)</label>
                  <input 
                    required
                    type="number"
                    value={formData.minQuantity}
                    onChange={e => setFormData({...formData, minQuantity: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button type="submit" className="flex-1 py-4 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:brightness-110 transition-all">
                {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
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
