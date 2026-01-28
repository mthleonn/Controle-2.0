import React, { useState, useEffect, useRef } from 'react'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getFinancialAdvice } from '../services/geminiService'; 
import { fetchTopCoins } from '../services/coinGeckoService'; 
import { CoinGeckoMarketData, ChatMessage, Transaction, Investment } from '../types'; 
import { ArrowLeft, Send, Sparkles, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIConsultantProps { 
  transactions: Transaction[]; 
  investments: Investment[]; 
} 

const AIConsultant: React.FC<AIConsultantProps> = ({ transactions, investments }) => { 
  const navigate = useNavigate();
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
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-140px)] w-full max-w-5xl mx-auto bg-slate-50 md:bg-white md:rounded-[2.5rem] md:border md:border-slate-100 md:shadow-2xl md:shadow-slate-200/50 overflow-hidden relative"> 
      
      {/* Header Premium */} 
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 p-4 flex items-center justify-between shrink-0 sticky top-0 z-20"> 
        <div className="flex items-center gap-3"> 
          <button 
            onClick={() => navigate(-1)} 
            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 active:bg-slate-50 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-2 ring-white">
              <Sparkles size={18} fill="currentColor" className="text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-800 text-base leading-tight flex items-center gap-2">
              Consultor IA
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold tracking-wide uppercase border border-indigo-100">Beta</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Online e pronto para ajudar
            </p> 
          </div> 
        </div> 
        
        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50">
           <MoreVertical size={20} />
        </button>
      </div> 

      {/* Janela de Chat */} 
      <div  
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 scroll-smooth pb-4" 
      > 
        {messages.map((msg, i) => ( 
          <div 
            key={i} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
          > 
            <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar for AI */}
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-50 flex items-center justify-center shrink-0 mt-auto mb-1 shadow-sm">
                  <Sparkles size={14} className="text-indigo-600" />
                </div>
              )}

              <div className={`
                relative px-5 py-3.5 shadow-sm text-sm md:text-[15px] leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-200/50' 
                  : 'bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-slate-100 shadow-slate-200/50'
                }
              `}> 
                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : 'prose-slate'} prose-p:my-1 prose-ul:my-1`}> 
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div> 
                
                {/* Timestamp or Status */}
                <div className={`text-[10px] mt-1 opacity-70 flex items-center gap-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' ? 'IA' : 'Você'} • Agora
                </div>
              </div> 
            </div> 
          </div> 
        ))} 
         
        {/* Loading Indicator */} 
        {isLoading && ( 
           <div className="flex justify-start w-full animate-in fade-in duration-300 pl-11">
             <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm inline-flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
               <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
             </div>
           </div>
        )} 
      </div> 

      {/* Input de Mensagem */} 
      <div className="p-3 bg-white border-t border-slate-100 shrink-0 pb-safe md:pb-4 z-20"> 
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-100/50 p-1.5 rounded-[1.8rem] border border-slate-200 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300 shadow-sm"> 
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
            placeholder="Pergunte sobre suas finanças..." 
            className="flex-1 px-4 py-3.5 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 min-h-[52px] max-h-32 text-base resize-none" 
          /> 
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()} 
            className={`
              w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
              ${input.trim() 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-100 hover:bg-indigo-700 active:scale-95' 
                : 'bg-slate-200 text-slate-400 scale-95 cursor-not-allowed'
              }
            `}
          > 
             <Send size={20} className={input.trim() ? "ml-0.5" : ""} />
          </button> 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
export default AIConsultant;
