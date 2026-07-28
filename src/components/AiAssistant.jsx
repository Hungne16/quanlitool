import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { getTools } from '../utils/storage';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Xin chào! Tôi là quản gia AI của bạn. Hãy nói cho tôi biết bạn đang muốn làm gì, tôi sẽ gợi ý công cụ phù hợp từ kho lưu trữ nhé!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      setMessages(prev => [...prev, 
        { role: 'user', content: input },
        { role: 'bot', content: 'Vui lòng nhập Gemini API Key trong phần **Cài đặt (⚙️)** ở menu bên trái để tôi có thể hoạt động nhé!' }
      ]);
      setInput('');
      return;
    }

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const client = new GoogleGenAI({ apiKey });
      
      // Gather tools context
      const tools = getTools();
      const toolsContext = tools.map(t => `- **${t.title}** (${t.category}): ${t.description} [${t.url}]`).join('\n');

      const prompt = `Bạn là trợ lý AI quản lý công cụ. Dưới đây là danh sách các công cụ hiện có trong kho của người dùng:\n\n${toolsContext}\n\nNgười dùng đang hỏi: "${userMsg}".\n\nHãy gợi ý các công cụ phù hợp NHẤT từ danh sách trên để giúp họ giải quyết công việc. Khuyến khích giải thích ngắn gọn tại sao công cụ đó lại phù hợp. Nếu trong danh sách không có công cụ nào đáp ứng được, hãy cứ gợi ý một công cụ nổi tiếng bên ngoài nhưng nói rõ là nó chưa có trong kho. Hãy trả lời bằng tiếng Việt, định dạng markdown gọn gàng dễ đọc.`;

      // Using the new Interactions API and gemini-3.6-flash model
      const interaction = await client.interactions.create({
          model: "gemini-3.6-flash",
          input: prompt
      });

      const responseText = interaction.output_text;

      setMessages(prev => [...prev, { role: 'bot', content: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: `Đã có lỗi xảy ra: **${error.message || error}**. \n\nBạn hãy kiểm tra lại API Key hoặc xem console (F12) để biết thêm chi tiết nhé!` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      <div className={`chat-panel ${isOpen ? '' : 'hidden'}`}>
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            <Bot size={20} color="var(--accent-color)" /> Quản gia AI
          </div>
          <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`} style={{ display: 'flex', gap: '0.75rem', maxWidth: '95%' }}>
              <div style={{ flexShrink: 0, marginTop: '0.2rem' }}>
                {msg.role === 'bot' ? <Bot size={18} color="var(--accent-color)" /> : <User size={18} />}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Bot size={18} color="var(--accent-color)" />
              <Loader2 size={16} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.85rem' }}>Đang suy nghĩ...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Bạn muốn làm gì hôm nay?" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="chat-send-btn" disabled={isLoading || !input.trim()}>
            <Send size={18} style={{ marginLeft: '-2px' }} />
          </button>
        </form>
      </div>

      <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
