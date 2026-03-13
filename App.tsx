
import React, { useState, useEffect } from 'react';
import { ViewState, Appointment, Client, Professional, Service, Product, FinancialRecord, UserProfile, AppSettings, Lead } from './types';
import { getLocalISODate } from './utils/calculations';
import { Dashboard } from './components/Dashboard';
import { ClientManager } from './components/ClientManager';
import { FinancialManager } from './components/FinancialManager';
import { AIAnalyst } from './components/AIAnalyst';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { CalendarView } from './components/CalendarView';
import { InventoryManager } from './components/InventoryManager';
import { ServiceAnalytics } from './components/ServiceAnalytics';
import { ServiceManager } from './components/ServiceManager';
import { LeadsManager } from './components/LeadsManager';
import { LogoText } from './components/Logo';
import { ProfileWidget } from './components/ProfileWidget';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Scissors,
  UserCheck,
  Package,
  DollarSign,
  Bot,
  BarChart2,
  MessageSquare,
  Sun,
  Moon,
  Menu,
  X,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Auth } from './components/Auth';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Gestor Agenda Simples',
    email: 'contato@agendasimples.com',
    businessName: 'Agenda Simples',
    currency: 'BRL',
    timezone: 'GMT-3 (Brasília)',
    startDate: getLocalISODate(),
    notes: ''
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    businessHours: { start: '09:00', end: '20:00' },
    intervalMinutes: 30,
    dashboardVisibility: {
      receitaMensal: true,
      agendamentosHoje: true,
      ticketMedio: true,
      estoqueBaixo: true,
    },
    accentColor: '#db2777'
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', appSettings.accentColor);
  }, [appSettings.accentColor]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setIsDataLoading(false);
      return;
    }

    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('data')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error loading data", error);
        }

        if (data && data.data) {
          const parsed = data.data;
          setAppointments(parsed.appointments || []);
          setClients(parsed.clients || []);
          setProfessionals(parsed.professionals || []);
          setServices(parsed.services || []);
          setProducts(parsed.products || []);
          setLeads(parsed.leads || []);
          setFinancialRecords(parsed.financialRecords || []);
          if (parsed.userProfile) setUserProfile(parsed.userProfile);
          if (parsed.appSettings) setAppSettings(parsed.appSettings);
        } else {
          // New User - start completely fresh
          setAppointments([]);
          setClients([]);
          setProfessionals([
            { id: 'P1', name: 'Atendimento', specialty: 'Geral', status: 'active' }
          ]);
          setServices([]);
          setProducts([]);
          setLeads([]);
          setFinancialRecords([]);
          // Default profile keeps 'Gestor Agenda Simples' to trigger step 1 of onboarding
          setUserProfile({
            name: 'Gestor Agenda Simples',
            email: session.user.email || '',
            businessName: 'Meu Negócio',
            currency: 'BRL',
            timezone: 'America/Sao_Paulo',
            startDate: getLocalISODate(),
            notes: ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const saveToSupabase = async () => {
    if (!session?.user) return;
    try {
      const payload = {
        appointments, clients, professionals, services, products, leads, financialRecords, userProfile, appSettings
      };

      const { error: upsertError } = await supabase
        .from('user_data')
        .upsert({ user_id: session.user.id, data: payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Error saving data:', upsertError);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isDataLoading) return;

    // Save to local storage as backup cache
    localStorage.setItem('barber_data_v2', JSON.stringify({
      appointments, clients, professionals, services, products, leads, financialRecords, userProfile, appSettings
    }));

    const timeoutId = setTimeout(() => {
      saveToSupabase();
    }, 1000); // Debounce to avoid too many writes

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, clients, professionals, services, products, leads, financialRecords, userProfile, appSettings, isDataLoading]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleNavClick = (tab: ViewState) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const getPageTitle = (tab: ViewState) => {
    switch (tab) {
      case ViewState.DASHBOARD: return 'Dashboard';
      case ViewState.CALENDAR: return 'Agendamento';
      case ViewState.CLIENTS: return 'Clientes';
      case ViewState.SERVICES: return 'Serviços';
      case ViewState.INVENTORY: return 'Estoque';
      case ViewState.FINANCE: return 'Financeiro';
      case ViewState.AI_ANALYST: return 'Analista IA';
      case ViewState.PROFILE: return 'Perfil';
      case ViewState.SETTINGS: return 'Configurações';
      default: return tab;
    }
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <style>
        {`
          :root {
            --accent-color: ${appSettings.accentColor};
          }
          .bg-accent { background-color: var(--accent-color) !important; }
          .text-accent { color: var(--accent-color) !important; }
          .border-accent { border-color: var(--accent-color) !important; }
          .ring-accent { --tw-ring-color: var(--accent-color) !important; }
          
          /* Overriding some default simplefy colors with accent if needed */
          .text-simplefy-primary { color: var(--accent-color) !important; }
          .bg-simplefy-primary { background-color: var(--accent-color) !important; }
        `}
      </style>
      {isMobileMenuOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </AnimatePresence>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <LogoText />
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden ml-auto p-2 text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-6 space-y-1 px-4 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === ViewState.DASHBOARD} onClick={() => handleNavClick(ViewState.DASHBOARD)} />
          <NavItem icon={CalendarIcon} label="Agendamento" active={activeTab === ViewState.CALENDAR} onClick={() => handleNavClick(ViewState.CALENDAR)} />
          <NavItem icon={Users} label="Clientes" active={activeTab === ViewState.CLIENTS} onClick={() => handleNavClick(ViewState.CLIENTS)} />
          <NavItem icon={Scissors} label="Serviços" active={activeTab === ViewState.SERVICES} onClick={() => handleNavClick(ViewState.SERVICES)} />
          <NavItem icon={Package} label="Estoque" active={activeTab === ViewState.INVENTORY} onClick={() => handleNavClick(ViewState.INVENTORY)} />
          <NavItem icon={DollarSign} label="Financeiro" active={activeTab === ViewState.FINANCE} onClick={() => handleNavClick(ViewState.FINANCE)} />
          <div className="pt-8 pb-2 px-4 opacity-30 text-[10px] font-bold uppercase tracking-[0.2em]">Inteligência</div>
          <NavItem icon={Bot} label="Analista IA" active={activeTab === ViewState.AI_ANALYST} onClick={() => handleNavClick(ViewState.AI_ANALYST)} isSpecial={true} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Menu className="w-6 h-6" /></button>
            <h1 className="text-base lg:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {getPageTitle(activeTab)}
            </h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={toggleTheme} className="p-2 lg:p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              {isDarkMode ? <Sun className="w-4 h-4 lg:w-5 lg:h-5" /> : <Moon className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>
            <ProfileWidget activeTab={activeTab} onNavigate={handleNavClick} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8 pb-32 lg:pb-12">
            {activeTab === ViewState.DASHBOARD && (
              <Dashboard
                appointments={appointments}
                clients={clients}
                products={products}
                financialRecords={financialRecords}
                services={services}
                professionals={professionals}
                settings={appSettings}
                userName={userProfile.name}
                onNavigate={handleNavClick}
                leads={leads}
                onAddLead={l => setLeads([...leads, l])}
                onUpdateLead={u => setLeads(leads.map(l => l.id === u.id ? u : l))}
                onDeleteLead={id => setLeads(leads.filter(l => l.id !== id))}
                onConvertToAppointment={(lead) => {
                  const clientExists = clients.find(c => c.phone === lead.phone || c.name === lead.name);
                  let clientId = clientExists?.id;

                  if (!clientExists) {
                    const newClientId = window.crypto.randomUUID();
                    const newClient: Client = {
                      id: newClientId,
                      name: lead.name,
                      phone: lead.phone,
                      status: 'active',
                      notes: `Lead de ${lead.source}. Interesses: ${lead.serviceInterest}. Notas do lead: ${lead.notes}`
                    };
                    setClients([...clients, newClient]);
                    clientId = newClientId;
                  }

                  setLeads(leads.map(l => l.id === lead.id ? { ...l, status: 'confirmado', convertedToClientId: clientId } : l));
                  setActiveTab(ViewState.CALENDAR);
                }}
              />
            )}
            {activeTab === ViewState.CALENDAR && (
              <CalendarView
                appointments={appointments}
                clients={clients}
                services={services}
                professionals={professionals}
                products={products}
                onAddAppointment={(a: Appointment) => setAppointments([...appointments, a])}
                onAddClient={(c: Client) => setClients(prev => [...prev, c])}
                onDeleteAppointment={(id: string) => {
                  setAppointments(prev => prev.filter(a => a.id !== id));
                  setFinancialRecords(prev => prev.filter(r => r.appointmentId !== id));
                }}
                onUpdateAppointment={(u: Appointment) => {
                  setAppointments(appointments.map(a => a.id === u.id ? u : a));

                  // Automation: If appointment is completed
                  if (u.status === 'Concluído') {
                    // 1. Add to finance
                    const client = clients.find(c => c.id === u.clientId);
                    const service = services.find(s => s.id === u.serviceId);
                    const newRecord: FinancialRecord = {
                      id: crypto.randomUUID(),
                      date: u.date,
                      amount: u.totalValue,
                      category: 'Serviço',
                      description: `Serviço: ${service?.name || 'Geral'} - Cliente: ${client?.name || 'Avulso'}`,
                      type: 'income',
                      appointmentId: u.id
                    };

                    setFinancialRecords(prev => {
                      if (prev.some(r => r.appointmentId === u.id)) return prev;
                      return [...prev, newRecord];
                    });

                    // 2. Deduct from stock
                    if (u.usedProducts && u.usedProducts.length > 0) {
                      setProducts(prevProducts => {
                        return prevProducts.map(p => {
                          const used = u.usedProducts?.find(up => up.productId === p.id);
                          if (used) {
                            return { ...p, quantity: Math.max(0, p.quantity - used.quantity) };
                          }
                          return p;
                        });
                      });
                    }
                  }
                }}
              />
            )}
            {activeTab === ViewState.CLIENTS && (
              <ClientManager
                clients={clients}
                appointments={appointments}
                services={services}
                onAddClient={c => setClients([...clients, c])}
                onUpdateClient={u => setClients(clients.map(c => c.id === u.id ? u : c))}
                onDeleteClient={id => setClients(clients.filter(c => c.id !== id))}
              />
            )}
            {activeTab === ViewState.SERVICES && (
              <ServiceManager
                services={services}
                products={products}
                onAddService={s => setServices([...services, s])}
                onUpdateService={u => setServices(services.map(s => s.id === u.id ? u : s))}
                onDeleteService={id => setServices(services.filter(s => s.id !== id))}
              />
            )}
            {activeTab === ViewState.INVENTORY && (
              <InventoryManager
                products={products}
                appointments={appointments}
                onAddProduct={p => setProducts([...products, p])}
                onUpdateProduct={u => setProducts(products.map(p => p.id === u.id ? p : u))}
                onDeleteProduct={id => setProducts(products.filter(p => p.id !== id))}
              />
            )}
            {activeTab === ViewState.FINANCE && (
              <FinancialManager
                financialRecords={financialRecords}
                onAdd={(r: FinancialRecord) => setFinancialRecords([...financialRecords, r])}
                onUpdate={(u: FinancialRecord) => setFinancialRecords(financialRecords.map(r => r.id === u.id ? u : r))}
                onDelete={(id: string) => {
                  const record = financialRecords.find(r => r.id === id);
                  if (record?.appointmentId) {
                    setAppointments(prev => prev.filter(a => a.id !== record.appointmentId));
                  }
                  setFinancialRecords(financialRecords.filter(r => r.id !== id));
                }}
                appointments={appointments}
              />
            )}
            {activeTab === ViewState.AI_ANALYST && (
              <AIAnalyst
                appointments={appointments}
                clients={clients}
                products={products}
                financialRecords={financialRecords}
              />
            )}
            {activeTab === ViewState.PROFILE && <ProfileView profile={userProfile} onSave={setUserProfile} />}
            {activeTab === ViewState.SETTINGS && <SettingsView settings={appSettings} onSave={setAppSettings} />}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-slate-900/90 backdrop-blur-lg border border-white/10 px-2 py-2 flex items-center justify-around z-40 rounded-3xl shadow-2xl">
          <MobileNavItem icon={LayoutDashboard} active={activeTab === ViewState.DASHBOARD} onClick={() => handleNavClick(ViewState.DASHBOARD)} />
          <MobileNavItem icon={CalendarIcon} active={activeTab === ViewState.CALENDAR} onClick={() => handleNavClick(ViewState.CALENDAR)} />
          <MobileNavItem icon={Users} active={activeTab === ViewState.CLIENTS} onClick={() => handleNavClick(ViewState.CLIENTS)} />
          <MobileNavItem icon={DollarSign} active={activeTab === ViewState.FINANCE} onClick={() => handleNavClick(ViewState.FINANCE)} />
          <MobileNavItem icon={Bot} active={activeTab === ViewState.AI_ANALYST} onClick={() => handleNavClick(ViewState.AI_ANALYST)} isSpecial={true} />
        </nav>
      </main>
    </div>
  );
};

const MobileNavItem = ({ icon: Icon, active, onClick, isSpecial }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${active
      ? 'text-white'
      : 'text-white/40 hover:text-white/60'
      }`}
  >
    <div className={`p-2.5 rounded-xl transition-all ${active ? (isSpecial ? 'bg-accent text-white shadow-lg shadow-accent/50' : 'bg-white/10 text-white') : ''}`}>
      <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
    </div>
    {active && (
      <motion.div
        layoutId="mobile-nav-indicator"
        className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
      />
    )}
  </button>
);

const NavItem = ({ icon: Icon, label, active, onClick, isSpecial }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${active
      ? 'bg-accent text-white font-bold shadow-sm'
      : 'text-white/50 hover:text-white hover:bg-white/5'
      } ${isSpecial ? 'bg-accent/20 text-accent' : ''}`}
  >
    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-inherit opacity-70'}`} />
    <span className="ml-3 text-sm tracking-tight">{label}</span>
  </button>
);

export default App;
