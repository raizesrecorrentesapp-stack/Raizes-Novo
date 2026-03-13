
export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  birthday?: string; // YYYY-MM-DD
  address?: string;
  instagram?: string;
  notes?: string;
  lastVisit?: string;
  status: 'active' | 'inactive';
}

export type LeadStatus = 'novo' | 'em_contato' | 'negociando' | 'confirmado' | 'perdido';
export type LeadSource = 'Instagram' | 'Indicação' | 'WhatsApp' | 'Google' | 'TikTok' | 'Presencial' | 'Outro';

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  serviceInterest?: string;
  notes?: string;
  createdAt: string;
  lastContactAt?: string;
  convertedToAppointmentId?: string;
  convertedToClientId?: string;
}

export interface ServiceMaterial {
  id: string; // Identificador único da dependência
  name: string; // Nome lógico (ex: "Trança")
  options: string[]; // Lista de IDs de Produtos do estoque que servem para este material
  quantity: number; // Quantidade necessária do produto
}

export interface Service {
  id: string;
  name: string;
  duration: number; // em minutos
  price?: number; // Valor de referência/sugestão (não obrigatório)
  category?: string;
  materials?: ServiceMaterial[];
}

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
}

export type AppointmentStatus = 'Agendado' | 'Confirmado' | 'Concluído' | 'Cancelado' | 'Faltou';

export interface UsedProduct {
  productId: string;
  quantity: number;
}

export type PaymentStatus = 'paid' | 'partial' | 'pending';

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  totalValue: number;
  paymentStatus?: PaymentStatus; // 'paid' | 'partial' | 'pending'
  depositAmount?: number; // valor do sinal (se paymentStatus === 'partial')
  usedProducts?: UsedProduct[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  lastRestock?: string;
}

export type FinancialCategory = 'Aluguel' | 'Produtos' | 'Marketing' | 'Utilidades' | 'Serviço' | 'Venda' | 'Outros';

export interface FinancialRecord {
  id: string;
  date: string;
  amount: number;
  category: FinancialCategory;
  description: string;
  type: 'income' | 'expense';
  appointmentId?: string; // Link to appointment if it's an automated record
}

export interface UserProfile {
  name: string;
  email: string;
  businessName: string;
  currency: 'BRL' | 'USD';
  timezone: string;
  startDate: string;
  notes: string;
}

export interface AppSettings {
  businessHours: {
    start: string;
    end: string;
  };
  intervalMinutes: number;
  dashboardVisibility: {
    receitaMensal: boolean;
    agendamentosHoje: boolean;
    ticketMedio: boolean;
    estoqueBaixo: boolean;
  };
  accentColor: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  APPOINTMENTS = 'APPOINTMENTS',
  CLIENTS = 'CLIENTS',
  SERVICES = 'SERVICES',
  INVENTORY = 'INVENTORY',
  FINANCE = 'FINANCE',
  AI_ANALYST = 'AI_ANALYST',
  ANALYTICS = 'ANALYTICS',
  LEADS = 'LEADS',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS'
}
