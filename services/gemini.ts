
import { GoogleGenAI } from "@google/genai";
import { Appointment, Client, Product, FinancialRecord } from "../types";

/**
 * Analyzes barbershop/studio financials and operations using Google Gemini API.
 */
export const analyzeFinancials = async (
  appointments: Appointment[],
  clients: Client[],
  products: Product[],
  financialRecords: FinancialRecord[],
  userQuery: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Erro de configuração: Chave de API não encontrada (process.env.API_KEY).";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare context data
  const today = new Date().toISOString().split('T')[0];
  const completedAppointments = appointments.filter(a => a.status === 'Concluído');
  const revenue = financialRecords.filter(r => r.type === 'income').reduce((acc, r) => acc + r.amount, 0);
  const totalExpenses = financialRecords.filter(r => r.type === 'expense').reduce((acc, r) => acc + r.amount, 0);
  
  const contextData = {
    metrics: {
      total_revenue: revenue,
      total_expenses: totalExpenses,
      net_profit: revenue - totalExpenses,
      total_appointments: appointments.length,
      completed_appointments: completedAppointments.length,
      average_ticket: completedAppointments.length > 0 ? revenue / completedAppointments.length : 0
    },
    inventory_alerts: products.filter(p => p.quantity <= p.minQuantity),
    recent_appointments: appointments.slice(-20).map(a => ({
      ...a,
      client_name: clients.find(c => c.id === a.clientId)?.name || 'Desconhecido'
    })),
    financial_history: financialRecords.slice(-20)
  };

  const systemPrompt = `
    Você é um SISTEMA ESPECIALISTA EM GESTÃO DE BARBEARIAS E STUDIOS DE BELEZA.
    
    Sua função é analisar os dados operacionais e financeiros para fornecer insights estratégicos.
    
    DIRETRIZES DE ANÁLISE:
    1. Rentabilidade: Avalie se a receita está cobrindo as despesas e sugira melhorias no ticket médio.
    2. Estoque: Identifique produtos críticos que precisam de reposição imediata.
    3. Fidelização: Analise a frequência de agendamentos (se houver dados suficientes).
    4. Ocupação: Sugira estratégias para horários de baixa procura.

    FORMATOS DE RESPOSTA:
    - Use Markdown para tabelas e listas.
    - Seja direto e profissional.
    - Se o usuário pedir uma análise geral, forneça um "Raio-X" do negócio.

    DADOS DO SISTEMA (JSON):
    ${JSON.stringify(contextData, null, 2)}

    Responda sempre em Português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao conectar com o analista IA. Verifique sua chave de API ou tente novamente.";
  }
};
