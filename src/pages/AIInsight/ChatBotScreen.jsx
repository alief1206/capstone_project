import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import robotImg from '../../assets/images/robot.png';
import { askNutritionAssistant } from '../../services/ai';

const ChatBotScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentGoal = location.state?.goal || 'turunkan';
    const userEmail = location.state?.email || localStorage.getItem('userEmail') || '';
    const userName = userEmail ? userEmail.split('@')[0] : 'Sobat Sehat';
    
    const [messages, setMessages] = useState([
        { id: 1, text: `Halo ${userName}! Saya EatSistent AI. Kamu butuh rekomendasi nutrisi spesifik apa hari ini?`, sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickPrompts = [
        { label: "Tinggi Protein", icon: "mdi:arm-flex", color: "text-orange-500", bg: "bg-orange-50" },
        { label: "Kaya Serat", icon: "mdi:leaf", color: "text-green-500", bg: "bg-green-50" },
        { label: "Rendah Kalori", icon: "mdi:fire-off", color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Menu Murah", icon: "mdi:wallet-outline", color: "text-purple-500", bg: "bg-purple-50" }
    ];

    const handleSend = async (text) => {
        const messageText = text || inputText;
        if (!messageText.trim() || isSending) return;

        const newUserMsg = { id: Date.now(), text: messageText, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setInputText("");
        setIsSending(true);

        try {
            const botReply = await askNutritionAssistant(messageText);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botReply, sender: 'bot' }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: error.message || "Maaf, basis data nutrisi belum bisa diakses. Pastikan backend berjalan lalu coba lagi.",
                sender: 'bot'
            }]);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className='flex justify-center min-h-screen bg-gray-100'>
            <div className='w-[390px] h-[100dvh] sm:h-[844px] bg-white shadow-xl flex flex-col relative overflow-hidden'>
                
                <div className="pt-12 px-6 pb-4 flex items-center gap-4 bg-white border-b border-gray-50 z-10">
                    <button onClick={() => navigate(-1)} className="text-2xl text-black">
                        <Icon icon="mdi:arrow-left" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E8F5EE] rounded-full flex justify-center items-center border border-[#DCFCE7]">
                            <img src={robotImg} alt="AI" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-black">Asisten EatSistent</h2>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-[#14AE5C] rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-[#14AE5C]">Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar bg-[#F8FAFC]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-[20px] text-[13px] font-medium leading-relaxed shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-[#14AE5C] text-white rounded-tr-none' 
                                : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isSending && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-500 rounded-[20px] rounded-tl-none border border-gray-100 px-4 py-3 text-[13px] font-medium shadow-sm">
                                Mengetik...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="bg-white p-4 border-t border-gray-100">
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4">
                        {quickPrompts.map((p, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleSend(p.label)}
                                className={`flex items-center gap-2 px-4 py-2 ${p.bg} rounded-full whitespace-nowrap border border-transparent hover:border-gray-200 transition-all`}
                            >
                                <Icon icon={p.icon} className={`${p.color} text-lg`} />
                                <span className={`text-[11px] font-bold ${p.color}`}>{p.label}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-12 bg-gray-50 rounded-2xl px-4 flex items-center border border-gray-100 focus-within:border-[#14AE5C] transition-all">
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Tanya tentang protein..." 
                                className="w-full bg-transparent outline-none text-[13px] font-medium"
                            />
                        </div>
                        <button 
                            onClick={() => handleSend()}
                            className={`w-12 h-12 bg-[#14AE5C] rounded-2xl flex justify-center items-center text-white text-xl shadow-md active:scale-95 transition-all ${isSending ? 'opacity-60 cursor-wait' : ''}`}
                        >
                            <Icon icon="mdi:send" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBotScreen;
