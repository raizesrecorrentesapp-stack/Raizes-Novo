
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Client, Service, Professional, Product } from '../types';
import { formatCurrency, formatDate, getStatusColor, formatDuration, getLocalISODate, parseLocalDate, getAvailableStock } from '../utils/calculations';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Search,
  AlertTriangle,
  Trash2,
  TrendingUp
} from 'lucide-react';

interface CalendarViewProps {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  professionals: Professional[];
  products: Product[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onAddClient: (client: Client) => void;
  onDeleteAppointment: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  clients,
  services,
  professionals,
  products,
  onAddAppointment,
  onUpdateAppointment,
  onAddClient,
  onDeleteAppointment
}) => {
  const [selectedDate, setSelectedDate] = useState(getLocalISODate());
  const [view, setView] = useState<'day' | 'month'>('day');
  const [projectionMode, setProjectionMode] = useState<'day' | 'week' | 'month'>('day');
  const [currentMonth, setCurrentMonth] = useState(() => parseLocalDate(getLocalISODate()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectionCollapsed, setIsProjectionCollapsed] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [newClientData, setNewClientData] = useState({ name: '', phone: '' });

  const [formData, setFormData] = useState<Partial<Appointment>>({
    date: selectedDate,
    startTime: '09:00',
    status: 'Agendado',
    usedProducts: []
  });
  const [stockAlerts, setStockAlerts] = useState<string[]>([]);

  const appointmentsForDate = appointments.filter(a => a.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handlePrevDay = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(getLocalISODate(d));
  };

  const handleNextDay = () => {
    const d = parseLocalDate(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(getLocalISODate(d));
  };

  const handleOpenModal = (app?: Appointment) => {
    if (app) {
      setEditingAppointment(app);
      setFormData(app);
      setClientType('existing');
      setStockAlerts([]);
    } else {
      setEditingAppointment(null);
      setStockAlerts([]);
      setFormData({
        id: crypto.randomUUID(),
        date: selectedDate,
        startTime: '09:00',
        status: 'Agendado',
        totalValue: 0,
        usedProducts: []
      });
      setClientType('existing');
      setNewClientData({ name: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === formData.serviceId);

    let clientId = formData.clientId;

    if (!editingAppointment && clientType === 'new') {
      const newClient: Client = {
        id: crypto.randomUUID(),
        name: newClientData.name,
        phone: newClientData.phone,
        status: 'active'
      };
      onAddClient(newClient);
      clientId = newClient.id;
    }

    const finalData = {
      ...formData,
      clientId,
      totalValue: service?.price || 0,
      endTime: formData.startTime, // Simplified for now
      professionalId: 'default' // Default ID since team management is removed
    } as Appointment;

    if (editingAppointment) {
      onUpdateAppointment(finalData);
    } else {
      onAddAppointment(finalData);
    }
    setIsModalOpen(false);
  };

  const handleStatusChange = (app: Appointment, newStatus: Appointment['status']) => {
    onUpdateAppointment({ ...app, status: newStatus });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    // Add padding for start of month
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getDayStatus = (date: Date) => {
    const dateStr = getLocalISODate(date);
    const dayApps = appointments.filter(a => a.date === dateStr);

    if (dayApps.length === 0) return 'free';

    const totalMinutes = dayApps.reduce((acc, app) => {
      const service = services.find(s => s.id === app.serviceId);
      return acc + (service?.duration || 30);
    }, 0);

    // Heuristic: > 7 hours of work is "full"
    if (totalMinutes >= 420) return 'full';
    return 'busy';
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 relative">
        <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1 sm:pb-0 w-full">
          {/* View Switcher & Date Navigator Combined */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
            <div className="flex">
              {['day', 'month'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as any)}
                  className={`relative px-3 sm:px-6 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors z-10 ${view === v ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {v === 'day' ? 'Dia' : 'Mês'}
                  {view === v && (
                    <motion.div
                      layoutId="view-bg"
                      className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

            <div className="flex items-center">
              <button
                onClick={() => {
                  if (view === 'day') handlePrevDay();
                  else {
                    const d = new Date(currentMonth);
                    d.setMonth(d.getMonth() - 1);
                    setCurrentMonth(d);
                  }
                }}
                className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 h-4" />
              </button>

              <div className="px-1 sm:px-4 flex items-center gap-2 min-w-[100px] sm:min-w-[180px] justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={view === 'day' ? selectedDate : getLocalISODate(currentMonth)}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[9px] sm:text-xs font-black uppercase tracking-tight text-slate-800 dark:text-slate-100 whitespace-nowrap"
                  >
                    {view === 'day'
                      ? parseLocalDate(selectedDate).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
                      : currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                    }
                  </motion.span>
                </AnimatePresence>
              </div>

              <button
                onClick={() => {
                  if (view === 'day') handleNextDay();
                  else {
                    const d = new Date(currentMonth);
                    d.setMonth(d.getMonth() + 1);
                    setCurrentMonth(d);
                  }
                }}
                className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full lg:w-auto lg:absolute lg:right-0 px-6 sm:px-8 py-4 sm:py-3.5 bg-accent text-white rounded-2xl font-black uppercase text-[10px] sm:text-[10px] tracking-[0.15em] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Plus className="w-4 h-4" />
          </div>
          Novo Agendamento
        </button>
      </div>

      {view === 'month' ? (
        <div className="bg-white dark:bg-slate-900 p-1 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-900/50 py-2 sm:py-4 text-center">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="hidden sm:inline">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i]}</span>
                  <span className="sm:hidden">{day}</span>
                </span>
              </div>
            ))}
            {getDaysInMonth(currentMonth).map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} className="bg-white dark:bg-slate-900 p-1 sm:p-4 min-h-[50px] sm:min-h-[120px]" />;

              const status = getDayStatus(date);
              const dateStr = getLocalISODate(date);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === getLocalISODate();
              const dayApps = appointments.filter(a => a.date === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setView('day');
                  }}
                  className={`
                    bg-white dark:bg-slate-900 p-1 sm:p-4 min-h-[50px] sm:min-h-[120px] cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 relative group
                    ${isSelected ? 'ring-2 ring-inset ring-accent z-10' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <span className={`
                      text-[10px] sm:text-sm font-black w-4 h-4 sm:w-7 sm:h-7 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-accent text-white' : 'text-slate-800 dark:text-slate-100'}
                    `}>
                      {date.getDate()}
                    </span>
                    {status === 'full' && (
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-0.5 sm:gap-1">
                    {dayApps.slice(0, 3).map(app => (
                      <div
                        key={app.id}
                        className={`w-0.5 h-0.5 sm:w-auto sm:h-1.5 sm:flex-1 rounded-full ${app.status === 'Concluído' ? 'bg-emerald-400' :
                            app.status === 'Confirmado' ? 'bg-accent' :
                              app.status === 'Cancelado' ? 'bg-red-400' : 'bg-accent/60'
                          }`}
                      />
                    ))}
                    {dayApps.length > 3 && (
                      <div className="w-0.5 h-0.5 sm:w-auto sm:h-1.5 sm:flex-1 rounded-full bg-slate-200" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-8 flex flex-wrap gap-3 sm:gap-6 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-accent/60"></div>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">Agendado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-accent"></div>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">Confirmado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-400"></div>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">Concluído</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400"></div>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">Cancelado</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Agenda do Dia</h3>
            <div className="space-y-3">
              {appointmentsForDate.map(app => {
                const client = clients.find(c => c.id === app.clientId);
                const service = services.find(s => s.id === app.serviceId);
                const professional = professionals.find(p => p.id === app.professionalId);

                return (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 sm:gap-6 group hover:border-slate-400 transition-all shadow-sm"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] py-1 sm:py-2 border-r border-slate-100 dark:border-slate-800">
                      <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">{app.startTime}</span>
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-300 mt-0.5 sm:mt-1" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h4 className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">{client?.name || 'Cliente Avulso'}</h4>
                        <span className={`w-fit px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-black uppercase border ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1 sm:gap-1.5"><Scissors className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {service?.name || 'Serviço'}</span>
                        {service && (
                          <span className="flex items-center gap-1 sm:gap-1.5"><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {formatDuration(service.duration)}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5 sm:gap-2">
                      <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">{formatCurrency(app.totalValue)}</p>
                      <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {app.status === 'Agendado' && (
                          <button
                            onClick={() => handleStatusChange(app, 'Confirmado')}
                            className="p-1.5 sm:p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20"
                            title="Confirmar"
                          >
                            <CheckCircle2 className="w-3 h-3 sm:w-4 h-4" />
                          </button>
                        )}
                        {(app.status === 'Agendado' || app.status === 'Confirmado') && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app, 'Concluído')}
                              className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                              title="Concluir"
                            >
                              <CheckCircle2 className="w-3 h-3 sm:w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(app, 'Cancelado')}
                              className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                              title="Cancelar"
                            >
                              <XCircle className="w-3 h-3 sm:w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if(window.confirm('Tem certeza que deseja excluir esse agendamento?')) {
                              onDeleteAppointment(app.id);
                            }
                          }}
                          className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(app)}
                          className="p-1.5 sm:p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100"
                          title="Opções"
                        >
                          <MoreVertical className="w-3.5 h-3.5 sm:w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {appointmentsForDate.length === 0 && (
                <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">Nenhum agendamento para este dia</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl overflow-hidden">
              <div 
                className="flex items-center justify-between mb-4 lg:mb-6 cursor-pointer lg:cursor-default"
                onClick={() => window.innerWidth < 1024 && setIsProjectionCollapsed(!isProjectionCollapsed)}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <h4 className="text-[10px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Projeção</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex bg-slate-800 rounded-lg p-1">
                    {(['day', 'week', 'month'] as const).map(m => (
                      <button
                        key={m}
                        onClick={(e) => { e.stopPropagation(); setProjectionMode(m); }}
                        className={`px-3 py-1.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-widest transition-colors ${
                          projectionMode === m ? 'bg-accent text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m === 'day' ? 'Dia' : m === 'week' ? 'Sem' : 'Mês'}
                      </button>
                    ))}
                  </div>
                  <button className="lg:hidden p-1 text-slate-500">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isProjectionCollapsed ? '' : 'rotate-180'}`} />
                  </button>
                </div>
              </div>

              <div className={`transition-all duration-300 ${isProjectionCollapsed ? 'max-h-0 lg:max-h-[500px] opacity-0 lg:opacity-100' : 'max-h-[500px] opacity-100'}`}>
                {/* Mobile specific toggle for projection mode inside expanded state */}
                <div className="lg:hidden flex bg-slate-800 rounded-lg p-1 mb-6">
                    {(['day', 'week', 'month'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setProjectionMode(m)}
                        className={`flex-1 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-colors ${
                          projectionMode === m ? 'bg-accent text-white shadow-lg' : 'text-slate-400'
                        }`}
                      >
                        {m === 'day' ? 'Dia' : m === 'week' ? 'Semana' : 'Mês'}
                      </button>
                    ))}
                  </div>

                {(() => {
                  let projectedApps = appointmentsForDate;
                  if (projectionMode === 'week') {
                    const curr = parseLocalDate(selectedDate);
                    const start = new Date(curr);
                    start.setDate(curr.getDate() - curr.getDay());
                    const end = new Date(start);
                    end.setDate(start.getDate() + 6);
                    
                    projectedApps = appointments.filter(a => {
                      const d = parseLocalDate(a.date);
                      return d >= start && d <= end;
                    });
                  } else if (projectionMode === 'month') {
                    const [y, m] = selectedDate.split('-');
                    projectedApps = appointments.filter(a => a.date.startsWith(`${y}-${m}`));
                  }

                  return (
                    <div className="space-y-4 sm:space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">Total Previsto</span>
                        <span className="text-xl sm:text-xl font-black">{formatCurrency(projectedApps.reduce((acc, a) => acc + a.totalValue, 0))}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400">Total Recebido</span>
                        <span className="text-xl sm:text-xl font-black text-emerald-400">
                          {formatCurrency(projectedApps.filter(a => a.status === 'Concluído').reduce((acc, a) => acc + a.totalValue, 0))}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] sm:text-[9px] font-bold uppercase text-slate-500">Agendados</p>
                          <p className="text-lg sm:text-lg font-black">{projectedApps.filter(a => a.status === 'Agendado' || a.status === 'Confirmado').length}</p>
                        </div>
                        <div>
                          <p className="text-[9px] sm:text-[9px] font-bold uppercase text-slate-500">Concluídos</p>
                          <p className="text-lg sm:text-lg font-black">{projectedApps.filter(a => a.status === 'Concluído').length}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 sm:mb-8 sticky top-0 bg-white dark:bg-slate-900 z-10 py-2">
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                  {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cliente</label>

                  {!editingAppointment && (
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setClientType('existing')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${clientType === 'existing' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
                          }`}
                      >
                        Existente
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientType('new')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${clientType === 'new' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'
                          }`}
                      >
                        Novo Cliente
                      </button>
                    </div>
                  )}

                  {clientType === 'existing' ? (
                    <select
                      required
                      value={formData.clientId}
                      onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Selecione um cliente...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <div className="space-y-3 animate-slide-up">
                      <input
                        required
                        type="text"
                        placeholder="Nome do Cliente"
                        value={newClientData.name}
                        onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="tel"
                        placeholder="Telefone (opcional)"
                        value={newClientData.phone}
                        onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data</label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Horário</label>
                    <input
                      required
                      type="time"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Serviço</label>
                  <select
                    required
                    value={formData.serviceId}
                    onChange={e => {
                      const selServiceId = e.target.value;
                      const service = services.find(s => s.id === selServiceId);
                      let newUsedProducts = editingAppointment ? [...(formData.usedProducts || [])] : [];
                      const newAlerts: string[] = [];

                      if (!editingAppointment && service && service.materials) {
                        // Consider appointments inside this scope to get available stock
                        // Since we just import it, we pass products and `appointments` state 
                        service.materials.forEach(mat => {
                          const validOptions = mat.options
                            .map(optId => products.find(p => p.id === optId))
                            .filter(p => p !== undefined) as Product[];

                          const optionWithEnoughStock = validOptions
                            .filter(p => getAvailableStock(p, appointments) >= mat.quantity)
                            .sort((a, b) => getAvailableStock(b, appointments) - getAvailableStock(a, appointments))[0];

                          if (optionWithEnoughStock) {
                            newUsedProducts.push({ productId: optionWithEnoughStock.id, quantity: mat.quantity });
                          } else {
                            const bestOption = validOptions.sort((a, b) => getAvailableStock(b, appointments) - getAvailableStock(a, appointments))[0];
                            if (bestOption) {
                              newUsedProducts.push({ productId: bestOption.id, quantity: mat.quantity });
                              newAlerts.push(`Estoque insuficiente de ${mat.name}. Sugerido ${bestOption.name} (tem ${getAvailableStock(bestOption, appointments)} disp, precisa de ${mat.quantity}). Reabasteça!`);
                            } else {
                              newAlerts.push(`Nenhum produto em estoque associado ao material: ${mat.name}.`);
                            }
                          }
                        });
                      }

                      setFormData({
                        ...formData,
                        serviceId: selServiceId,
                        usedProducts: newUsedProducts
                      });
                      setStockAlerts(newAlerts);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Selecione o serviço...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({formatDuration(s.duration)}{s.price ? ` • Ref: ${formatCurrency(s.price)}` : ''})</option>)}
                  </select>
                </div>

                {stockAlerts.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl space-y-2 animate-slide-up">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-[10px] uppercase tracking-widest">
                      <AlertTriangle className="w-4 h-4" /> Alertas de Estoque Automáticos
                    </div>
                    <ul className="list-disc pl-5 text-xs text-red-600 dark:text-red-400 font-medium space-y-1">
                      {stockAlerts.map((alert, i) => <li key={i}>{alert}</li>)}
                    </ul>
                  </div>
                )}

                {/* Valor e Pagamento */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Valor Total</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.totalValue ?? ''}
                      onChange={e => setFormData({ ...formData, totalValue: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Pagamento</label>
                    <select
                      value={formData.paymentStatus ?? 'pending'}
                      onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as any, depositAmount: e.target.value !== 'partial' ? undefined : formData.depositAmount })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                    >
                      <option value="pending">⏳ A Pagar na Hora</option>
                      <option value="partial">💰 Sinal Enviado</option>
                      <option value="paid">✅ Já Pago</option>
                    </select>
                  </div>
                </div>

                {formData.paymentStatus === 'partial' && (
                  <div className="space-y-1.5 animate-slide-up">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Valor do Sinal Recebido</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.totalValue}
                      placeholder="0,00"
                      value={formData.depositAmount ?? ''}
                      onChange={e => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
                    />
                    {formData.depositAmount != null && formData.totalValue != null && formData.depositAmount > 0 && (
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 ml-1">
                        Restante a receber: {formatCurrency(formData.totalValue - formData.depositAmount)}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Materiais Utilizados</label>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        usedProducts: [...(formData.usedProducts || []), { productId: '', quantity: 1 }]
                      })}
                      className="text-[9px] font-black text-accent uppercase tracking-widest hover:underline"
                    >
                      + Adicionar Material
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.usedProducts?.map((up, idx) => (
                      <div key={idx} className="flex gap-2 items-center animate-slide-up">
                        <select
                          required
                          value={up.productId}
                          onChange={e => {
                            const newUsed = [...(formData.usedProducts || [])];
                            newUsed[idx].productId = e.target.value;
                            setFormData({ ...formData, usedProducts: newUsed });
                          }}
                          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-xs text-slate-900 dark:text-slate-100"
                        >
                          <option value="">Produto...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Disp: {getAvailableStock(p, appointments)})</option>
                          ))}
                        </select>
                        <input
                          required
                          type="number"
                          min="1"
                          value={up.quantity}
                          onChange={e => {
                            const newUsed = [...(formData.usedProducts || [])];
                            newUsed[idx].quantity = parseInt(e.target.value);
                            setFormData({ ...formData, usedProducts: newUsed });
                          }}
                          className="w-16 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold text-xs text-slate-900 dark:text-slate-100 text-center"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newUsed = (formData.usedProducts || []).filter((_, i) => i !== idx);
                            setFormData({ ...formData, usedProducts: newUsed });
                          }}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!formData.usedProducts || formData.usedProducts.length === 0) && (
                      <p className="text-[10px] text-slate-400 italic text-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                        Nenhum material selecionado
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button type="submit" className="flex-1 py-4 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:brightness-110 transition-all">
                  {editingAppointment ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
