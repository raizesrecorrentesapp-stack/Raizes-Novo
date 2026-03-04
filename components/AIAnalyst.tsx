
import React, { useState, useRef, useEffect } from 'react';
import { Appointment, Client, Product, FinancialRecord } from '../types';
import { analyzeFinancials } from '../services/gemini';
import { Bot, Send, User, Loader2, BarChart3, CalendarRange, TrendingUp, Package, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalystProps {
  appointments: Appointment[];
  clients: Client[];
  products: Product[];
  financialRecords: FinancialRecord[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ appointments, clients, products, financialRecords }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Olá! Sou seu assistente de gestão. Posso analisar sua receita, estoque e agendamentos. Como posso ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    if (!textOverride) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setIsLoading(true);

    const response = await analyzeFinancials(appointments, clients, products, financialRecords, textToSend);

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      label: 'Raio-X do Negócio',
      icon: TrendingUp,
      prompt: 'Faça uma análise geral do meu negócio hoje.',
      color: 'bg-accent/10 text-accent hover:bg-accent/20'
    },
    {
      label: 'Alerta de Estoque',
      icon: Package,
      prompt: 'Quais produtos preciso repor com urgência?',
      color: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
    },
    {
      label: 'Ticket Médio',
      icon: BarChart3,
      prompt: 'Como está meu ticket médio e como posso aumentá-lo?',
      color: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
    }
  ];

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-accent p-4 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Analista de Gestão IA</h3>
          <p className="text-white/60 text-[10px] uppercase tracking-widest">Inteligência Operacional</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-800' : 'bg-accent text-white'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <Bot className="w-5 h-5 text-white dark:text-slate-900" />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm ${
              msg.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800'
            }`}>
              <div className="markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-14">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processando análise estratégica...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions & Input */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="px-6 pt-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
           {quickActions.map((action, idx) => (
             <button
              key={idx}
              onClick={() => handleSend(action.prompt)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${action.color} disabled:opacity-50 disabled:cursor-not-allowed`}
             >
               <action.icon className="w-3 h-3" />
               {action.label}
             </button>
           ))}
        </div>

        <div className="p-6 pt-2">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-slate-900 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Pergunte sobre seu studio..."
              className="flex-1 bg-transparent px-3 py-2 outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-accent text-white rounded-xl hover:brightness-110 disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
