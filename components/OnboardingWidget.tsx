import React, { useState, useEffect } from 'react';
import {
    UserCircle,
    Scissors,
    Package,
    Users,
    Calendar,
    DollarSign,
    CheckCircle2,
    Circle,
    LayoutDashboard,
    ChevronRight,
    ChevronDown,
    Sparkles
} from 'lucide-react';
import { ViewState, UserProfile, Service, Product, Client, Appointment, FinancialRecord } from '../types';

interface OnboardingWidgetProps {
    userProfile: UserProfile;
    services: Service[];
    products: Product[];
    clients: Client[];
    appointments: Appointment[];
    financialRecords: FinancialRecord[];
    onNavigate: (tab: ViewState) => void;
}

export const OnboardingWidget: React.FC<OnboardingWidgetProps> = ({
    userProfile,
    services,
    products,
    clients,
    appointments,
    financialRecords,
    onNavigate
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const steps = [
        {
            id: 1,
            title: 'Configure seu Perfil',
            description: 'Adicione seu nome para personalizar o sistema.',
            icon: UserCircle,
            isCompleted: userProfile.name !== 'Gestor Agenda Simples' && userProfile.name.trim() !== '',
            action: () => onNavigate(ViewState.PROFILE)
        },
        {
            id: 2,
            title: 'Cadastre seus Serviços',
            description: 'Adicione os serviços que você oferece.',
            icon: Scissors,
            isCompleted: services.length > 0,
            action: () => onNavigate(ViewState.SERVICES)
        },
        {
            id: 3,
            title: 'Adicione o seu Estoque',
            description: 'Registre os produtos que você usa ou vende.',
            icon: Package,
            isCompleted: products.length > 0,
            action: () => onNavigate(ViewState.INVENTORY)
        },
        {
            id: 4,
            title: 'Cadastre seus Clientes',
            description: 'Adicione sua base de clientes ativa.',
            icon: Users,
            isCompleted: clients.length > 0,
            action: () => onNavigate(ViewState.CLIENTS)
        },
        {
            id: 5,
            title: 'Faça um Agendamento',
            description: 'Registre o seu primeiro agendamento no sistema.',
            icon: Calendar,
            isCompleted: appointments.length > 0,
            action: () => onNavigate(ViewState.CALENDAR)
        },
        {
            id: 6,
            title: 'Registre o Financeiro',
            description: 'Adicione uma entrada ou despesa.',
            icon: DollarSign,
            isCompleted: financialRecords.length > 0,
            action: () => onNavigate(ViewState.FINANCE)
        }
    ];

    const completedCount = steps.filter(s => s.isCompleted).length;
    const totalSteps = steps.length;
    const progressPercentage = Math.round((completedCount / totalSteps) * 100);
    const isAllComplete = completedCount === totalSteps;

    // Auto-hide if all complete
    if (isAllComplete) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-8 overflow-hidden transition-all duration-300 relative">

            {/* Header / Progress Bar */}
            <div
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            {isAllComplete ? 'Tudo pronto! 🎉' : 'Passo a Passo Inicial'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {completedCount} de {totalSteps} passos
                            </span>
                            <div className="w-32 sm:w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={step.id}
                                    onClick={step.action}
                                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group hover:shadow-md ${step.isCompleted
                                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-accent/30 dark:hover:border-accent/30'
                                        }`}
                                >
                                    <div className={`mt-0.5 shrink-0 transition-colors ${step.isCompleted ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-accent'}`}>
                                        {step.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-bold mb-1 transition-colors ${step.isCompleted ? 'text-emerald-900 dark:text-emerald-100 strikethrough' : 'text-slate-800 dark:text-slate-100 group-hover:text-accent'
                                            }`}>
                                            {step.id}º Passo - {step.title}
                                        </h4>
                                        <p className={`text-xs ${step.isCompleted ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {step.description}
                                        </p>
                                    </div>
                                    {!step.isCompleted && (
                                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-accent self-center transition-transform group-hover:translate-x-1" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {isAllComplete && (
                        <div className="p-5 text-center border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl shadow-md hover:bg-opacity-90 transition-all text-sm uppercase tracking-wide"
                            >
                                Esconder Passo a Passo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
