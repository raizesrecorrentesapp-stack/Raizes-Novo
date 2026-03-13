
import React, { useState } from 'react';
import { Appointment, Service } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  TrendingUp,
  TrendingDown,
  Award,
  BarChart2,
  DollarSign,
  Scissors,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface ServiceAnalyticsProps {
  appointments: Appointment[];
  services: Service[];
}

interface ServiceStat {
  service: Service;
  count: number;
  revenue: number;
  avgTicket: number;
  revenueShare: number;
  abcClass: 'A' | 'B' | 'C';
}

export const ServiceAnalytics: React.FC<ServiceAnalyticsProps> = ({ appointments, services }) => {
  const [abcSortDir, setAbcSortDir] = useState<'desc' | 'asc'>('desc');

  const completed = appointments.filter(a => a.status === 'Concluído');

  // Build stats per service
  const stats: ServiceStat[] = services.map(service => {
    const appts = completed.filter(a => a.serviceId === service.id);
    const revenue = appts.reduce((s, a) => s + a.totalValue, 0);
    const count = appts.length;
    const avgTicket = count > 0 ? revenue / count : 0;
    return { service, count, revenue, avgTicket, revenueShare: 0, abcClass: 'C' };
  });

  const totalRevenue = stats.reduce((s, r) => s + r.revenue, 0);

  // Sort by revenue desc for ABC
  const sorted = [...stats].sort((a, b) => b.revenue - a.revenue);
  let cumulative = 0;
  sorted.forEach(s => {
    s.revenueShare = totalRevenue > 0 ? (s.revenue / totalRevenue) * 100 : 0;
    cumulative += s.revenueShare;
    if (cumulative - s.revenueShare < 70) s.abcClass = 'A';
    else if (cumulative - s.revenueShare < 90) s.abcClass = 'B';
    else s.abcClass = 'C';
  });

  const avgTicket = completed.length > 0 ? totalRevenue / completed.length : 0;

  const top3 = [...sorted].slice(0, 3);
  const bottom3 = [...sorted].filter(s => s.count > 0).slice(-3).reverse();
  const withReturns = sorted.filter(s => s.revenue > 0);
  const topReturn = withReturns.slice(0, 3);
  const lowReturn = withReturns.slice(-3).reverse();

  // BCG: x = revenue share, y = count share
  const maxCount = Math.max(...stats.map(s => s.count), 1);
  const maxRevShare = Math.max(...stats.map(s => s.revenueShare), 1);

  const bcgColor = (x: number, y: number) => {
    const highShare = x > 15;
    const highGrowth = y > maxCount * 0.4;
    if (highShare && highGrowth) return 'bg-emerald-500'; // Star
    if (highShare && !highGrowth) return 'bg-amber-500';  // Cash cow
    if (!highShare && highGrowth) return 'bg-blue-500';   // Question
    return 'bg-red-400'; // Dog
  };

  const bcgLabel = (x: number, y: number) => {
    const highShare = x > 15;
    const highGrowth = y > maxCount * 0.4;
    if (highShare && highGrowth) return '⭐ Estrela';
    if (highShare && !highGrowth) return '🐄 Vaca Leiteira';
    if (!highShare && highGrowth) return '❓ Interrogação';
    return '🐕 Abacaxis';
  };

  const abcBadge = (c: 'A' | 'B' | 'C') => {
    const cls = c === 'A'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : c === 'B'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
    return <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${cls}`}>{c}</span>;
  };

  if (services.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">
          Cadastre serviços para ver análises
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-accent rounded-2xl p-5 text-white shadow-xl">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Ticket Médio</p>
          <p className="text-2xl font-black">{formatCurrency(avgTicket)}</p>
          <p className="text-[9px] text-white/50 mt-1">{completed.length} serviços concluídos</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Receita Total</p>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(totalRevenue)}</p>
          <p className="text-[9px] text-slate-400 mt-1">{services.length} serviços ativos</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-1">Serviço Principal (A)</p>
          <p className="text-sm font-black text-emerald-700 dark:text-emerald-300 truncate">{top3[0]?.service.name || '—'}</p>
          <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 mt-1">{top3[0] ? formatCurrency(top3[0].revenue) : '—'}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5 border border-red-100 dark:border-red-900/50 shadow-sm">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400 mb-1">Menos Realizado</p>
          <p className="text-sm font-black text-red-700 dark:text-red-300 truncate">{bottom3[0]?.service.name || '—'}</p>
          <p className="text-[9px] text-red-600/70 dark:text-red-400/70 mt-1">{bottom3[0] ? `${bottom3[0].count} vez(es)` : '—'}</p>
        </div>
      </div>

      {/* Top/Bottom Serviços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mais Realizados</h3>
          </div>
          <div className="space-y-3">
            {top3.length === 0 && <p className="text-slate-400 text-xs italic text-center py-4">Nenhum serviço concluído ainda</p>}
            {top3.map((s, i) => (
              <div key={s.service.id} className="flex items-center gap-3">
                <span className="text-xl font-black text-slate-200 dark:text-slate-700 w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">{s.service.name}</p>
                    {abcBadge(s.abcClass)}
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (s.count / maxCount) * 100)}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100">{s.count}x</p>
                  <p className="text-[9px] text-slate-400">{formatCurrency(s.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Menos Realizados</h3>
          </div>
          <div className="space-y-3">
            {bottom3.length === 0 && <p className="text-slate-400 text-xs italic text-center py-4">Nenhum dado disponível</p>}
            {bottom3.map((s, i) => (
              <div key={s.service.id} className="flex items-center gap-3">
                <span className="text-xl font-black text-slate-200 dark:text-slate-700 w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">{s.service.name}</p>
                    {abcBadge(s.abcClass)}
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${Math.min(100, (s.count / maxCount) * 100)}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100">{s.count}x</p>
                  <p className="text-[9px] text-slate-400">{formatCurrency(s.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-4 h-4 text-accent" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Maior Retorno (Receita)</h3>
          </div>
          <div className="space-y-3">
            {topReturn.length === 0 && <p className="text-slate-400 text-xs italic text-center py-4">Nenhum dado disponível</p>}
            {topReturn.map((s, i) => (
              <div key={s.service.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-[9px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{s.service.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-accent">{formatCurrency(s.revenue)}</p>
                  <p className="text-[9px] text-slate-400">avg {formatCurrency(s.avgTicket)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Menor Retorno (Receita)</h3>
          </div>
          <div className="space-y-3">
            {lowReturn.length === 0 && <p className="text-slate-400 text-xs italic text-center py-4">Nenhum dado disponível</p>}
            {lowReturn.map((s, i) => (
              <div key={s.service.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{s.service.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-slate-600 dark:text-slate-300">{formatCurrency(s.revenue)}</p>
                  <p className="text-[9px] text-slate-400">avg {formatCurrency(s.avgTicket)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curva ABC */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Curva ABC — Participação na Receita</h3>
          </div>
          <button
            onClick={() => setAbcSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 text-[9px] font-bold uppercase text-slate-400 hover:text-accent transition-colors"
          >
            {abcSortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            Receita
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Serviço</th>
                <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Realizados</th>
                <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Receita</th>
                <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">% Receita</th>
                <th className="text-right px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Classe</th>
              </tr>
            </thead>
            <tbody>
              {(abcSortDir === 'desc' ? sorted : [...sorted].reverse()).map(s => (
                <tr key={s.service.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-3.5 h-3.5 text-slate-300" />
                      <span className="font-bold text-slate-800 dark:text-slate-100">{s.service.name}</span>
                    </div>
                  </td>
                  <td className="text-right px-4 py-4 font-bold text-slate-600 dark:text-slate-300">{s.count}</td>
                  <td className="text-right px-4 py-4 font-black text-slate-800 dark:text-slate-100">{formatCurrency(s.revenue)}</td>
                  <td className="text-right px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-accent h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, s.revenueShare)}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-600 dark:text-slate-300 text-xs w-10 text-right">{s.revenueShare.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="text-right px-6 py-4">{abcBadge(s.abcClass)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">Nenhum serviço concluído para analisar</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">
          <span><span className="text-emerald-500">● A</span> — Top 70% da receita</span>
          <span><span className="text-amber-500">● B</span> — 70–90% da receita</span>
          <span><span className="text-slate-400">● C</span> — Últimos 10%</span>
        </div>
      </div>

      {/* Matriz BCG */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-4 h-4 text-accent" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Matriz BCG — Posicionamento dos Serviços</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '⭐ Estrela', desc: 'Alto volume + Alta receita', color: 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10', items: sorted.filter(s => s.revenueShare > 15 && s.count > maxCount * 0.4) },
            { label: '❓ Interrogação', desc: 'Alto volume + Baixa receita', color: 'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10', items: sorted.filter(s => s.revenueShare <= 15 && s.count > maxCount * 0.4) },
            { label: '🐄 Vaca Leiteira', desc: 'Baixo volume + Alta receita', color: 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10', items: sorted.filter(s => s.revenueShare > 15 && s.count <= maxCount * 0.4) },
            { label: '🐕 Abacaxis', desc: 'Baixo volume + Baixa receita', color: 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10', items: sorted.filter(s => s.revenueShare <= 15 && s.count <= maxCount * 0.4) },
          ].map(quad => (
            <div key={quad.label} className={`rounded-2xl border-2 p-4 ${quad.color}`}>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200">{quad.label}</p>
              <p className="text-[9px] text-slate-400 mb-3 mt-0.5">{quad.desc}</p>
              <div className="space-y-1.5">
                {quad.items.length === 0 ? (
                  <p className="text-[9px] italic text-slate-400">Nenhum serviço</p>
                ) : quad.items.map(s => (
                  <div key={s.service.id} className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{s.service.name}</span>
                    <span className="text-[9px] text-slate-400 ml-2 shrink-0">{s.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-1">
          <p className="text-[9px] text-slate-400 leading-relaxed">
            <strong className="text-slate-500">Eixo X</strong>: % participação na receita.&nbsp;
            <strong className="text-slate-500">Eixo Y</strong>: volume de agendamentos concluídos.&nbsp;
            Serviços com &gt;15% de receita = alto share. Volume &gt;40% do pico = alto crescimento.
          </p>
        </div>
      </div>

    </div>
  );
};
