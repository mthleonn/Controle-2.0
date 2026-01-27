import React, { useState, useEffect, useRef } from 'react'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getFinancialAdvice } from '../services/geminiService'; 
import { fetchTopCoins } from '../services/coinGeckoService'; 
import { CoinGeckoMarketData, ChatMessage, Transaction, Investment } from '../types'; 
import { ICONS } from '../constants'; 
 
interface AIConsultantProps { 
  transactions: Transaction[]; 
  investments: Investment[]; 
} 
 
const AIConsultant: React.FC<AIConsultantProps> = ({ transactions, investments }) => { 
  const [marketData, setMarketData] = useState<CoinGeckoMarketData[]>([]); 
  const [messages, setMessages] = useState<ChatMessage[]>([]); 
  const [input, setInput] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const scrollRef = useRef<HTMLDivElement>(null); 
 
  // Carrega dados iniciais de mercado e saudação da IA 
  useEffect(() => { 
    const initAI = async () => { 
      const data = await fetchTopCoins(); 
      setMarketData(data); 
      setMessages([ 
        {  
          role: 'model',  
          text: 'Olá! Sou seu assistente Controle+ AI. Já analisei seu dashboard e estou pronto para conversar sobre seus gastos, investimentos ou tirar qualquer dúvida financeira. Como posso ajudar?'  
        } 
      ]); 
    }; 
    initAI(); 
  }, []); 
 
  // Scroll automático para a última mensagem 
  useEffect(() => { 
    if (scrollRef.current) { 
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight; 
    } 
  }, [messages, isLoading]); 
 
  const handleSendMessage = async () => { 
    if (!input.trim() || isLoading) return; 
 
    const userQuery = input.trim(); 
    setInput(''); 
    setMessages(prev => [...prev, { role: 'user', text: userQuery }]); 
    setIsLoading(true); 
 
    // Chama o serviço passando todo o contexto do dashboard 
    const response = await getFinancialAdvice(userQuery, marketData, transactions, investments); 
     
    setMessages(prev => [...prev, { role: 'model', text: response }]); 
    setIsLoading(false); 
  }; 
 
  return ( 
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"> 
      {/* Top Bar - Indicador de Sincronismo */} 
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between"> 
        <div className="flex items-center space-x-3"> 
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"> 
            <ICONS.AI size={24} /> 
          </div> 
          <div> 
            <h3 className="font-bold text-slate-800">Controle+ Consultant</h3> 
            <p className="text-[10px] text-indigo-600 font-bold flex items-center"> 
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-1 animate-pulse"></span> 
              MODO: ANÁLISE DE DASHBOARD ATIVO 
            </p> 
          </div> 
        </div> 
      </div> 
 
      {/* Janela de Chat */} 
      <div  
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scroll-smooth" 
      > 
        {messages.map((msg, i) => ( 
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${ 
              msg.role === 'user'  
                ? 'bg-indigo-600 text-white rounded-tr-none'  
                : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100' 
            }`}> 
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed whitespace-pre-wrap"> 
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div> 
            </div> 
          </div> 
        ))} 
         
        {/* Loading Indicator */} 
        {isLoading && ( 
          <div className="flex justify-start"> 
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none px-5 py-3"> 
              <div className="flex space-x-2"> 
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div> 
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div> 
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]"></div> 
              </div> 
            </div> 
          </div> 
        )} 
      </div> 
 
      {/* Input de Mensagem */} 
      <div className="p-4 bg-slate-50 border-t border-slate-200"> 
        <div className="flex items-center space-x-3"> 
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
            placeholder="Pergunte sobre seus gastos ou peça dicas de investimento..." 
            className="flex-1 px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-inner" 
          /> 
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()} 
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3.5 rounded-xl transition-all shadow-md active:scale-95" 
          > 
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> 
          </button> 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
export default AIConsultant;
