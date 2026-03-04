
import React from 'react';
import { Appointment, Client, Product, FinancialRecord, AppSettings, Service } from '../types';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Package, 
  DollarSign,
  Clock,
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { formatCurrency, formatDuration } from '../utils/calculations';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardProps {
  appointments: Appointment[];
  clients: Client[];
  products: Product[];
  financialRecords: FinancialRecord[];
  services: Service[];
  professionals: any[]; // Keep as any[] for now to avoid breaking if still passed
  settings: AppSettings;
  userName: string;
  onNavigate: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  appointments, 
  clients, 
  products, 
  financialRecords,
  services,
  professionals,
  settings,
  userName,
  onNavigate
}) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const currentMonthName = now.toLocaleDateString('pt-BR', { month: 'long' });
  
  const todayAppointments = appointments.filter(a => a.date === today);
  const monthAppointments = appointments.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const completedMonthAppointments = monthAppointments.filter(a => a.status === 'Concluído');
  const lostMonthAppointments = monthAppointments.filter(a => a.status === 'Cancelado' || a.status === 'Faltou');
  
  const monthlyRevenue = financialRecords
    .filter(r => {
      const d = new Date(r.date);
      return r.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, r) => acc + r.amount, 0);

  const monthlyExpenses = financialRecords
    .filter(r => {
      const d = new Date(r.date);
      return r.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, r) => acc + r.amount, 0);

  const netProfit = monthlyRevenue - monthlyExpenses;
  
  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
  
  const maintenanceClients = clients.filter(c => {
    const clientAppts = appointments
      .filter(a => a.clientId === c.id && a.status === 'Concluído')
      .sort((a, b) => b.date.localeCompare(a.date));
    
    const lastAppt = clientAppts[0];
    if (!lastAppt) return false;

    const lastDate = new Date(lastAppt.date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 30 && diffDays <= 45;
  });

  // Data for charts
  const revenueByService = services.map(s => {
    const revenue = monthAppointments
      .filter(a => a.serviceId === s.id && a.status === 'Concluído')
      .reduce((acc, a) => acc + a.totalValue, 0);
    return { name: s.name, value: revenue };
  }).filter(d => d.value > 0);

  const appointmentsByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = appointments.filter(a => a.date === dateStr).length;
    return { day: d.toLocaleDateString('pt-BR', { weekday: 'short' }), count };
  }).reverse();

  const COLORS = ['#db2777', '#1E8E5A', '#C74A4A', '#F27D26', '#8B5CF6', '#3b82f6', '#0f172a'];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {getGreeting()}, <span className="text-accent">{userName.split(' ')[0]}</span>! ✨
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-1">
            Seu resumo de <span className="text-slate-800 dark:text-slate-200">{currentMonthName}</span>
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Hoje</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          icon={DollarSign} 
          label="Receita Mensal" 
          value={formatCurrency(monthlyRevenue)} 
          trend={`${currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)}`} 
          color="text-accent"
          bg="bg-accent/10"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Agendamentos Concluídos" 
          value={completedMonthAppointments.length.toString()} 
          trend="No Mês" 
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard 
          icon={XCircle} 
          label="Agendamentos Perdidos" 
          value={lostMonthAppointments.length.toString()} 
          trend="No Mês" 
          color="text-red-600"
          bg="bg-red-50"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Lucro Líquido" 
          value={formatCurrency(netProfit)} 
          trend="No Mês" 
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Volume de Agendamentos (7 dias)</h3>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              Agendamentos
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appointmentsByDay}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#1e293b' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  cursor={{ stroke: 'var(--accent-color)', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--accent-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Service */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-6">Receita por Serviço</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            {revenueByService.length > 0 ? (
              <>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByService}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {revenueByService.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 w-full space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                  {revenueByService.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px] sm:text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 ml-2 shrink-0">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-4">
                  <TrendingUp className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sem dados de receita<br/>para este mês</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Próximos Agendamentos</h3>
            <button 
              onClick={() => onNavigate('CALENDAR')}
              className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {todayAppointments.length > 0 ? (
              todayAppointments.slice(0, 5).map((appt) => {
                const client = clients.find(c => c.id === appt.clientId);
                const service = services.find(s => s.id === appt.serviceId);
                return (
                  <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {client?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{client?.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {service?.name} • {appt.startTime} 
                          {service && <span className="ml-2 text-slate-400">({formatDuration(service.duration)})</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatCurrency(appt.totalValue)}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        appt.status === 'Agendado' ? 'bg-accent/10 text-accent' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">Nenhum agendamento para hoje</div>
            )}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Alertas de Estoque</h3>
            <button 
              onClick={() => onNavigate('INVENTORY')}
              className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline"
            >
              Gerenciar
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 5).map((prod) => (
                <div key={prod.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{prod.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{prod.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-600">{prod.quantity} un.</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">Mín: {prod.minQuantity}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm italic">Tudo em ordem com o estoque</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, color, bg }: any) => (
  <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className={`p-1.5 sm:p-2 rounded-xl ${bg} ${color}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <span className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${bg} ${color}`}>
        {trend}
      </span>
    </div>
    <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] sm:tracking-[0.15em] mb-0.5 sm:mb-1">{label}</p>
    <p className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{value}</p>
  </div>
);
