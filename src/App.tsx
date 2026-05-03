import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Loader2, Anchor, Compass } from 'lucide-react';

type Message = { role: 'user' | 'model'; content: string };

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: '¡Hola, valientes grumetes! Soy Juan de la Cosa, el Capitán de esta nao. ¡Bienvenidos al puerto de Santander! ⛵ He atracado mi barco y necesito una tripulación lista para aprender matemáticas, lengua y ciencias mientras exploráis la costa cántabra. ¿Estáis listos para zarpar y completar el Gran Mapa de la Costa? 🗺️' }
  ]);
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const newUserMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput('');
    setThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: '¡Rayos y centellas, grumete! 🌧️ Hay una densa niebla en el mar y no he podido recibir tu mensaje. ¿Podrías volver a gritarlo desde la proa?' }]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#fdf8f1] font-sans">
      <aside className="w-72 bg-[#0c4a6e] text-white flex-col border-r-4 border-[#075985] hidden md:flex">
        <div className="p-6 border-b border-sky-800">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 rounded-full">
              <Compass className="size-8 text-slate-900" />
            </div>
            <h1 className="text-xl font-bold uppercase tracking-wider">La Nao Capitana</h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-4">
          <div className="bg-sky-800/50 p-4 rounded-2xl border-2 border-sky-400">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs uppercase font-semibold text-sky-200">Mapa de Cantabria</span>
              <span className="text-xs font-bold">40%</span>
            </div>
            <div className="w-full bg-sky-900 rounded-full h-3">
              <div className="bg-amber-400 h-3 rounded-full w-[40%]"></div>
            </div>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className="h-20 bg-white border-b-2 border-slate-100 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-2xl">
              🧔🏻♂️
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-tight">Capitán Juan de la Cosa</h2>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Navegando la Costa
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-6 max-w-[80%] rounded-3xl shadow-sm ${m.role === 'user' 
                ? 'bg-sky-500 text-white rounded-tr-none border-b-4 border-sky-700' 
                : 'bg-[#fffaf0] text-slate-800 rounded-tl-none border-b-4 border-r-4 border-amber-200'}`}>
                <p className={`whitespace-pre-wrap ${m.role === 'model' ? 'italic text-lg' : 'text-lg font-medium'}`}>{m.content}</p>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start items-center opacity-70">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                🧭
              </div>
              <div className="bg-white px-6 py-3 ml-4 rounded-full border-2 border-dashed border-slate-300 text-sm font-medium text-slate-400 italic">
                El Capitán está consultando su carta náutica...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="h-28 bg-white border-t-2 border-slate-100 p-6">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Escribe tu respuesta aquí, grumete..."
              className="flex-1 h-14 pl-6 pr-6 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:outline-none text-lg font-medium shadow-inner"
            />
            <button 
              onClick={sendMessage}
              disabled={thinking}
              className="h-14 px-8 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-2xl border-b-4 border-amber-600 transition-all active:border-b-0 active:translate-y-1 uppercase tracking-wider"
            >
              ¡A Toda Vela!
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
