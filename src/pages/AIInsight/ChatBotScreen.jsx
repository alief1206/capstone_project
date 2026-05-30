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
    const initialPrompt = location.state?.initialPrompt || '';
    const initialContext = location.state?.initialContext || null;
    
    const [messages, setMessages] = useState([
        { id: 1, text: `Halo ${userName}! Saya EatSistent AI. Kamu butuh rekomendasi nutrisi spesifik apa hari ini?`, sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const hasSentInitialPrompt = useRef(false);

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

    const handleSend = async (text, context = null) => {
        const messageText = text || inputText;
        if (!messageText.trim() || isSending) return;

        const newUserMsg = { id: Date.now(), text: messageText, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setInputText("");
        setIsSending(true);

        try {
            const botReply = await askNutritionAssistant(messageText, context);
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

    useEffect(() => {
        if (!initialPrompt || hasSentInitialPrompt.current) return;
        hasSentInitialPrompt.current = true;
        handleSend(initialPrompt, initialContext);
    }, [initialPrompt, initialContext]);

    return (
        <div className='flex flex-col w-full h-screen bg-[#F8FAFC] font-sans'>
            {/* Header / Navbar ChatBot */}
            <div className="h-[75px] md:h-[84px] bg-white border-b border-gray-100 flex items-center px-6 md:px-12 z-10 shadow-sm flex-shrink-0">
                <button onClick={() => navigate(-1)} className="text-2xl text-gray-800 hover:scale-110 transition-transform mr-4">
                    <Icon icon="mdi:arrow-left" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F0FDF4] rounded-full flex justify-center items-center border border-[#DCFCE7] shadow-sm">
                        <img src={robotImg} alt="AI" className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-[15px] md:text-[16px] font-extrabold text-gray-800">Asisten EatSistent</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-2 h-2 bg-[#14AE5C] rounded-full animate-pulse"></div>
                            <span className="text-[11px] md:text-[12px] font-bold text-[#14AE5C] tracking-wide">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-5 hide-scrollbar bg-white">
                <div className="max-w-3xl mx-auto space-y-5">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && (
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#F0FDF4] rounded-full flex justify-center items-center border border-[#DCFCE7] shadow-sm mr-3 flex-shrink-0 mt-auto">
                                    <img src={robotImg} alt="AI" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                                </div>
                            )}
                            <div className={`max-w-[75%] md:max-w-[65%] p-4 md:p-5 rounded-[24px] text-[14px] md:text-[15px] font-medium leading-relaxed shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-[#14AE5C] text-white rounded-br-sm' 
                                : 'bg-gray-50 text-gray-700 rounded-bl-sm border border-gray-100'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isSending && (
                        <div className="flex justify-start">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#F0FDF4] rounded-full flex justify-center items-center border border-[#DCFCE7] shadow-sm mr-3 flex-shrink-0 mt-auto">
                                <img src={robotImg} alt="AI" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                            </div>
                            <div className="bg-gray-50 text-gray-500 rounded-[24px] rounded-bl-sm border border-gray-100 px-5 py-4 text-[14px] font-medium shadow-sm flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 md:p-6 border-t border-gray-100 flex-shrink-0">
                <div className="max-w-3xl mx-auto">
                    <div className="flex gap-2.5 md:gap-3 overflow-x-auto hide-scrollbar pb-4 md:pb-5">
                        {quickPrompts.map((p, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleSend(p.label)}
                                className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 ${p.bg} rounded-[100px] whitespace-nowrap border border-transparent hover:border-gray-200 transition-all active:scale-95`}
                            >
                                <Icon icon={p.icon} className={`${p.color} text-xl md:text-2xl`} />
                                <span className={`text-[12px] md:text-[13px] font-bold ${p.color}`}>{p.label}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-[54px] md:h-[60px] bg-gray-50 rounded-[20px] md:rounded-[24px] px-5 flex items-center border-[1.5px] border-gray-100 focus-within:border-[#14AE5C] focus-within:bg-[#F0FDF4] transition-all">
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Tanya tentang kalori, protein, dll..." 
                                className="w-full bg-transparent outline-none text-[14px] md:text-[15px] font-medium text-gray-800"
                            />
                        </div>
                        <button 
                            onClick={() => handleSend()}
                            className={`w-[54px] h-[54px] md:w-[60px] md:h-[60px] bg-[#14AE5C] hover:bg-[#108e4b] rounded-[20px] md:rounded-[24px] flex justify-center items-center text-white text-2xl md:text-3xl shadow-md active:scale-95 transition-all ${isSending || !inputText.trim() ? 'opacity-50 cursor-not-allowed bg-gray-300' : ''}`}
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
