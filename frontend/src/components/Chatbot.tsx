import React, { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { chatWithAI } from '../api/client';
import clsx from 'clsx';

type ChatMessage = {
    role: 'ai' | 'user';
    text: string;
};

export const Chatbot = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'ai', text: "Hello! I am your AI assistant trained on GridPulse's historical metadata. Ask me about past projects!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: ChatMessage = { role: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const data = await chatWithAI(userMsg.text);
            setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I am offline." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel overflow-hidden rounded-2xl flex flex-col h-96 relative group transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="p-4 bg-white/80 border-b border-gray-200/50 flex items-center shadow-lg backdrop-blur-md z-10">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg mr-3 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Bot size={20} />
                </div>
                <h3 className="text-md font-bold text-gray-900 tracking-wide font-['Outfit']">GridPulse Intelligence</h3>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-transparent z-10 custom-scrollbar">
                {messages.map((m, i) => (
                    <div key={i} className={clsx("flex", m.role === 'user' ? "justify-end" : "justify-start animate-[fadeIn_0.3s_ease-out]")}>
                        <div className={clsx("max-w-[85%] p-3.5 rounded-xl text-sm leading-relaxed shadow-md backdrop-blur-md", 
                            m.role === 'user' 
                                ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-gray-900 rounded-br-sm border border-blue-400/30" 
                                : "bg-white/80 border border-gray-200/50 text-gray-800 rounded-bl-sm"
                        )}>
                            <div className="font-semibold text-[11px] uppercase tracking-wider opacity-70 mb-1.5 flex items-center">
                                {m.role === 'user' ? <User size={12} className="mr-1.5"/> : <Bot size={12} className="mr-1.5 text-blue-400"/>}
                                {m.role === 'user' ? 'You' : 'GridPulse Engine'}
                            </div>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white/80 border border-gray-200/50 text-gray-600 rounded-xl rounded-bl-sm p-4 shadow-md flex items-center space-x-2 backdrop-blur-md">
                            <span className="animate-bounce inline-block w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span>
                            <span className="animate-bounce delay-75 inline-block w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_5px_rgba(59,130,246,0.5)]"></span>
                            <span className="animate-bounce delay-150 inline-block w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.5)]"></span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white/80 border-t border-gray-200/50 flex space-x-2 rounded-b-2xl z-10 backdrop-blur-md">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about historical delays in 400kV projects..."
                    className="flex-1 bg-black/20 border border-gray-200/50 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                <button type="submit" disabled={loading} aria-label="Send message" className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};
