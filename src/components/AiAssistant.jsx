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
  const [allTools, setAllTools] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getTools().then(tools => setAllTools(tools));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Gather tools context with IDs
      const toolsContext = allTools.map(t => `- ID: ${t.id} | **${t.title}** (${t.category}): ${t.description}`).join('\n');

      let replyText = null;

      // 1. Try hitting the Secure Serverless Backend first
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg, toolsContext })
        });

        if (response.ok) {
          const data = await response.json();
          replyText = data.reply;
        } else if (response.status !== 401 && response.status !== 404) {
          // It's a server error other than missing API key or not found endpoint
          const errData = await response.json();
          throw new Error(errData.error || `Server Error ${response.status}`);
        }
      } catch (backendError) {
        console.warn('Backend call failed or not available, falling back to Local Storage key.', backendError);
      }

      // 2. Fallback to Local Client-side SDK (if backend didn't return a reply)
      if (!replyText) {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
          setMessages(prev => [...prev, 
            { role: 'bot', content: 'Vui lòng cung cấp **Gemini API Key** trong phần **Cài đặt hệ thống (⚙️)** (hoặc định cấu hình biến môi trường trên Server) để tôi có thể hoạt động nhé!' }
          ]);
          setIsLoading(false);
          return;
        }

        const client = new GoogleGenAI({ apiKey });
        const prompt = `Bạn là trợ lý AI quản lý công cụ. Dưới đây là danh sách các công cụ hiện có trong kho của người dùng:\n\n${toolsContext || 'Kho công cụ hiện trống.'}\n\nNgười dùng đang hỏi: "${userMsg}".\n\nHãy gợi ý các công cụ phù hợp NHẤT từ danh sách trên để giúp họ giải quyết công việc. Khuyến khích giải thích ngắn gọn tại sao công cụ đó lại phù hợp. Nếu trong danh sách không có công cụ nào đáp ứng được, hãy gợi ý một công cụ nổi tiếng bên ngoài (để ID là rỗng).

BẮT BUỘC trả về ĐÚNG VÀ CHỈ định dạng JSON sau (không kèm markdown \`\`\`json):
{
  "message": "Câu trả lời của bạn, giải thích vì sao chọn các công cụ này.",
  "recommendations": [
    {
      "id": "ID_CỦA_CÔNG_CỤ_TRONG_KHO_NẾU_CÓ",
      "score": 95,
      "reason": "Lý do ngắn gọn khuyên dùng (1 câu)"
    }
  ]
}`;

        const interaction = await client.interactions.create({
            model: "gemini-3.6-flash",
            input: prompt
        });

        replyText = interaction.output_text;
      }

      let parsedReply = { message: replyText, recommendations: [] };
      try {
        const cleanJson = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedReply = JSON.parse(cleanJson);
      } catch (e) {
        console.warn("Could not parse AI response as JSON, falling back to raw text.", e);
        parsedReply.message = replyText;
      }

      // Append final reply
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: parsedReply.message, 
        recommendations: parsedReply.recommendations 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: `Đã có lỗi xảy ra: **${error.message || error}**. \n\nBạn hãy kiểm tra lại API Key hoặc Log hệ thống để biết thêm chi tiết nhé!` }]);
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
              <div style={{ overflow: 'hidden', width: '100%' }}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="recommendations-container" style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.75rem', opacity: 0.8 }}>Top Recommendations</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {msg.recommendations.map((rec, idx) => {
                        const tool = allTools.find(t => t.id === rec.id);
                        if (!tool) return null;
                        return (
                          <div key={rec.id || idx} className="rec-card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            background: 'rgba(30, 41, 59, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '1rem',
                            backdropFilter: 'blur(12px)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                              <img src={tool.logo || 'https://placehold.co/100x100/1e293b/FFF?text=' + tool.title.charAt(0)} alt="logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  {tool.title}
                                  {rec.score && (
                                    <div style={{ 
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                      width: '28px', height: '28px', borderRadius: '50%', 
                                      background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-color)', 
                                      fontSize: '0.75rem', fontWeight: 'bold',
                                      border: '2px solid var(--accent-color)',
                                      boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
                                    }}>
                                      {rec.score}
                                    </div>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.25rem', lineHeight: '1.4' }}>
                                  {rec.reason || tool.description}
                                </div>
                              </div>
                            </div>
                            <a href={tool.url} target="_blank" rel="noopener noreferrer" style={{
                              display: 'block',
                              textAlign: 'center',
                              background: 'var(--accent-color)',
                              color: '#fff',
                              textDecoration: 'none',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              transition: 'opacity 0.2s',
                              cursor: 'pointer'
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = 0.8}
                            onMouseOut={e => e.currentTarget.style.opacity = 1}
                            >
                              Visit Tool ↗
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
