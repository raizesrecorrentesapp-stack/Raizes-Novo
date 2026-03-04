
import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  ChevronDown, 
  ChevronRight, 
  Wallet, 
  Receipt, 
  Target, 
  Settings, 
  UserCircle, 
  Briefcase
} from 'lucide-react';
import { ViewState } from '../types';

interface ProfileWidgetProps {
  activeTab: ViewState;
  onNavigate: (tab: ViewState) => void;
}

export const ProfileWidget: React.FC<ProfileWidgetProps> = ({ activeTab, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mgmtOpen, setMgmtOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setMgmtOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (tab: ViewState) => {
    onNavigate(tab);
    setIsOpen(false);
    setMgmtOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-600 group"
      >
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white shadow-md shadow-accent/20 dark:shadow-none transition-transform group-active:scale-95">
          <User className="w-5 h-5" />
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-[100] animate-slide-up">
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário Logado</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">Administrador</p>
          </div>

          <MenuItem 
            icon={UserCircle} 
            label="Meu Perfil" 
            active={activeTab === ViewState.PROFILE}
            onClick={() => handleNav(ViewState.PROFILE)} 
          />
          <MenuItem 
            icon={Settings} 
            label="Configurações" 
            active={activeTab === ViewState.SETTINGS}
            onClick={() => handleNav(ViewState.SETTINGS)} 
          />
          
          <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
            <button
              onClick={() => setMgmtOpen(!mgmtOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-colors group ${mgmtOpen ? 'text-accent bg-slate-50 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className={`w-4 h-4 ${mgmtOpen ? 'text-accent' : 'group-hover:text-accent'}`} />
                <span className="text-xs font-black uppercase tracking-tight">Minha Gestão</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${mgmtOpen ? 'rotate-90' : ''}`} />
            </button>

            {mgmtOpen && (
              <div className="bg-slate-50 dark:bg-slate-800/50 mx-2 rounded-2xl overflow-hidden animate-slide-up mt-1 shadow-inner">
                <SubMenuItem 
                  icon={Receipt} 
                  label="Financeiro" 
                  active={activeTab === ViewState.FINANCE} 
                  onClick={() => handleNav(ViewState.FINANCE)} 
                />
              </div>
            )}
          </div>

          <div className="mt-4 px-4">
            <button className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
              Sair do Sistema
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors group ${active ? 'bg-accent/10 text-accent border-l-2 border-accent' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-accent' : 'group-hover:text-accent'}`} />
    <span className="text-xs font-black uppercase tracking-tight">{label}</span>
  </button>
);

const SubMenuItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${active ? 'text-accent bg-accent/10 border-l-2 border-accent' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
