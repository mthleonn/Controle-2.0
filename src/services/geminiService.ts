import { GoogleGenAI } from "@google/genai"; 
import { CoinGeckoMarketData, Transaction, Investment } from "../types"; 


/** 
 * Função principal para obter aconselhamento financeiro da IA. 
 * Integra dados de mercado em tempo real com o histórico do usuário. 
 */ 
export const getFinancialAdvice = async ( 
  prompt: string, 
  marketData: CoinGeckoMarketData[], 
  transactions: Transaction[], 
  investments: Investment[] 
): Promise<string> => { 
  // Inicializa o SDK da Google GenAI 
  // Use import.meta.env for Vite or process.env if configured
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || "";
  if (!apiKey) {
      console.warn("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
      return "Erro: Chave de API do Gemini não configurada.";
  }
  
  const ai = new GoogleGenAI({ apiKey }); 
  
  // Cálculos de resumo para dar contexto à IA 
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0); 
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0); 
  const balance = totalIncome - totalExpenses; 
  
  const categorySummary = transactions.reduce((acc: any, t) => { 
    acc[t.category] = (acc[t.category] || 0) + (t.type === 'expense' ? t.amount : 0); 
    return acc; 
  }, {}); 


  const marketContext = marketData.map(coin => 
    `${coin.name}: $${coin.current_price} (${coin.price_change_percentage_24h.toFixed(2)}%)` 
  ).join(', '); 


  // Instrução do sistema que define a "personalidade" e o acesso aos dados da IA 
  const systemInstruction = ` 
    Você é o Controle+ AI, um assistente financeiro pessoal ultra-inteligente. 
    Sua missão é ajudar o usuário a gerir dinheiro, economizar e investir melhor. 


    DADOS ATUAIS DO USUÁRIO (Contexto Real): 
    - SALDO EM CONTA: R$ ${balance.toFixed(2)} 
    - FLUXO: Entradas R$ ${totalIncome.toFixed(2)} | Saídas R$ ${totalExpenses.toFixed(2)} 
    - GASTOS POR CATEGORIA: ${JSON.stringify(categorySummary)} 
    - CARTEIRA DE INVESTIMENTOS: ${investments.map(i => `${i.name} (${i.ticker || i.type}) - Qtd: ${i.quantity || 0}`).join('; ')} 
    - MERCADO CRIPTO (CoinGecko): ${marketContext} 


    SUAS DIRETRIZES: 
    1. Responda dúvidas sobre os gastos específicos do dashboard (ex: "onde gastei mais?"). 
    2. Sugira rebalanceamento de investimentos baseado no mercado atual. 
    3. Use um tom profissional, porém amigável e encorajador. 
    4. Explique conceitos financeiros complexos de forma simples. 
    5. OBRIGATÓRIO: Sempre termine recomendações de ativos com um aviso de que não é recomendação oficial de compra. 
    
    Responda sempre em Português (Brasil) usando formatação Markdown rica. 
  `; 


  try { 
    const response = await ai.models.generateContent({ 
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ], 
      config: { 
        systemInstruction: systemInstruction, 
        temperature: 0.7, // Equilíbrio entre criatividade e precisão técnica 
      }, 
    }); 


    // Acessa a propriedade .text diretamente conforme as diretrizes do SDK 
    return response.text || "Desculpe, tive um problema ao processar sua análise financeira."; 
  } catch (error: any) { 
    console.error("Erro na integração com Gemini:", error);
    
    // Tratamento de erros específicos
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
       return "⚠️ Atingimos o limite gratuito de consultas por hoje. Por favor, tente novamente mais tarde.";
    }
    
    if (error.message?.includes('404') || error.message?.includes('not found')) {
       return "⚠️ O modelo de IA está temporariamente indisponível. Tente novamente em alguns minutos.";
    }

    return `Ocorreu um erro ao consultar a IA. Tente novamente.`; 
  } 
}; 
