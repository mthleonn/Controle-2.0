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
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] max-w-5xl mx-auto bg-white md:rounded-3xl border-x md:border-y border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mt-[-1rem] md:mt-0"> 
      {/* Top Bar - Indicador de Sincronismo */} 
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between shrink-0 sticky top-0 z-10"> 
        <div className="flex items-center gap-3"> 
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200"> 
            <ICONS.AI size={20} /> 
          </div> 
          <div> 
            <h3 className="font-bold text-slate-800 text-base leading-tight">Consultor IA</h3> 
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Online e conectado</p> 
            </div>
          </div> 
        </div> 
      </div> 

      {/* Janela de Chat */} 
      <div  
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 scroll-smooth" 
      > 
        {messages.map((msg, i) => ( 
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}> 
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm text-sm md:text-base ${ 
              msg.role === 'user'  
                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-100'  
                : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100 shadow-slate-100' 
            }`}> 
              <div className={`prose prose-sm max-w-none prose-p:leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' ? 'prose-invert' : 'prose-slate'
              }`}> 
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div> 
            </div> 
          </div> 
        ))} 
         
        {/* Loading Indicator */} 
        {isLoading && ( 
          <div className="flex justify-start animate-in fade-in duration-300"> 
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm"> 
              <div className="flex space-x-1.5"> 
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div> 
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.15s]"></div> 
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div> 
              </div> 
            </div> 
          </div> 
        )} 
      </div> 

      {/* Input de Mensagem */} 
      <div className="p-3 bg-white border-t border-slate-100 shrink-0 pb-safe md:pb-3"> 
        <div className="flex items-end gap-2 bg-slate-50 p-1.5 rounded-[1.5rem] border border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all"> 
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
            placeholder="Digite sua dúvida..." 
            className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 min-h-[48px] max-h-32 text-sm md:text-base" 
          /> 
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()} 
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white w-12 h-12 rounded-full transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center shrink-0" 
          > 
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> 
          </button> 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
export default AIConsultant;
