
export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const formatDate = (dateStr: string) => {
  return dateStr.split('-').reverse().join('/');
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Agendado': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Confirmado': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'Concluído': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Cancelado': return 'bg-red-100 text-red-700 border-red-200';
    case 'Faltou': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
};
