import React, { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(savedKey);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content glass-panel">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={24} color="var(--accent-color)" /> Cài đặt AI Assistant
        </h2>
        
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label>Gemini API Key</label>
            <input 
              type="password" 
              className="input-control" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="AIzaSy..." 
            />
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Khóa API của bạn được lưu an toàn trên trình duyệt (Local Storage) và chỉ dùng để giao tiếp trực tiếp với máy chủ Google. 
              Lấy key miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color: 'var(--accent-color)'}}>Google AI Studio</a>.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Đóng</button>
            <button type="submit" className="btn btn-primary">Lưu cài đặt</button>
          </div>
        </form>
      </div>
    </div>
  );
}
