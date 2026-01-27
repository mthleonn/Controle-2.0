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
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] flex flex-col bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden"> 
      {/* Top Bar - Indicador de Sincronismo */} 
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 md:p-5 flex items-center justify-between shrink-0"> 
        <div className="flex items-center space-x-4"> 
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/20"> 
            <ICONS.AI size={24} className="md:w-6 md:h-6" /> 
          </div> 
          <div> 
            <h3 className="font-bold text-white text-lg leading-tight">Consultor IA</h3> 
            <p className="text-[10px] md:text-xs text-indigo-100 font-medium flex items-center mt-0.5 opacity-90"> 
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span> 
              Conectado aos seus dados
            </p> 
          </div> 
        </div> 
      </div> 

      {/* Janela de Chat */} 
      <div  
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 scroll-smooth" 
      > 
        {messages.map((msg, i) => ( 
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}> 
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${ 
              msg.role === 'user'  
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-indigo-200'  
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
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm"> 
              <div className="flex space-x-2"> 
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div> 
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.15s]"></div> 
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]"></div> 
              </div> 
            </div> 
          </div> 
        )} 
      </div> 

      {/* Input de Mensagem */} 
      <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0 pb-safe"> 
        <div className="flex items-end space-x-2 md:space-x-3 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all"> 
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
            placeholder="Digite sua dúvida financeira..." 
            className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 min-h-[44px] max-h-32" 
          /> 
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()} 
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-95 flex-shrink-0 mb-0.5 mr-0.5" 
          > 
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> 
          </button> 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
export default AIConsultant;
