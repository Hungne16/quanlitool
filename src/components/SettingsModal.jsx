import React, { useState, useEffect, useRef } from 'react';
import { X, Key, LayoutList, Database, Trash2, Plus, Upload, Download } from 'lucide-react';
import { saveCategories, exportData, importData } from '../utils/storage';

export default function SettingsModal({ categories, isOpen, onClose, onDataChanged }) {
  const [activeTab, setActiveTab] = useState('ai');
  const [apiKey, setApiKey] = useState('');
  
  // Category state
  const [localCategories, setLocalCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(savedKey);
      setLocalCategories([...categories]);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  // --- AI Tab Handlers ---
  const handleSaveAI = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey.trim());
    onClose();
  };

  // --- Category Handlers ---
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (localCategories.includes(newCatName.trim())) {
      alert('Danh mục này đã tồn tại!');
      return;
    }
    const updated = [...localCategories, newCatName.trim()];
    setLocalCategories(updated);
    saveCategories(updated);
    setNewCatName('');
    onDataChanged();
  };

  const handleDeleteCategory = (cat) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${cat}"? Các công cụ thuộc danh mục này vẫn sẽ được giữ lại.`)) {
      const updated = localCategories.filter(c => c !== cat);
      setLocalCategories(updated);
      saveCategories(updated);
      onDataChanged();
    }
  };

  // --- Data Handlers ---
  const handleExport = () => {
    exportData();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importData(event.target.result);
      if (success) {
        alert('Khôi phục dữ liệu thành công!');
        onDataChanged();
        onClose();
      } else {
        alert('File dữ liệu không hợp lệ hoặc bị lỗi.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content glass-panel" style={{ maxWidth: '600px', padding: 0, display: 'flex', overflow: 'hidden' }}>
        
        {/* Sidebar inside modal for Tabs */}
        <div style={{ width: '200px', background: 'rgba(0,0,0,0.2)', borderRight: '1px solid var(--border-color)', padding: '1.5rem 0' }}>
          <div style={{ padding: '0 1rem', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>CÀI ĐẶT</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <li>
              <button 
                onClick={() => setActiveTab('ai')}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem', background: activeTab === 'ai' ? 'var(--surface-active)' : 'transparent', border: 'none', color: activeTab === 'ai' ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderLeft: activeTab === 'ai' ? '3px solid var(--accent-color)' : '3px solid transparent'
                }}
              >
                <Key size={16} /> AI Assistant
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('categories')}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem', background: activeTab === 'categories' ? 'var(--surface-active)' : 'transparent', border: 'none', color: activeTab === 'categories' ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderLeft: activeTab === 'categories' ? '3px solid var(--accent-color)' : '3px solid transparent'
                }}
              >
                <LayoutList size={16} /> Danh mục
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('data')}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem', background: activeTab === 'data' ? 'var(--surface-active)' : 'transparent', border: 'none', color: activeTab === 'data' ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', borderLeft: activeTab === 'data' ? '3px solid var(--accent-color)' : '3px solid transparent'
                }}
              >
                <Database size={16} /> Dữ liệu
              </button>
            </li>
          </ul>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, padding: '2rem', position: 'relative' }}>
          <button className="modal-close" onClick={onClose} style={{ top: '1rem', right: '1rem' }}><X size={20} /></button>
          
          {/* TAB: AI */}
          {activeTab === 'ai' && (
            <div className="animate-fade-in">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={24} color="var(--accent-color)" /> Cài đặt AI Assistant
              </h2>
              <form onSubmit={handleSaveAI}>
                <div className="input-group">
                  <label>Gemini API Key</label>
                  <input 
                    type="password" 
                    className="input-control" 
                    value={apiKey} 
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      localStorage.setItem('gemini_api_key', e.target.value.trim());
                    }} 
                    placeholder="AIzaSy..." 
                  />
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Khóa API được lưu cục bộ an toàn và tự động lưu khi nhập. Lấy key miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color: 'var(--accent-color)'}}>Google AI Studio</a>.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={onClose}>Đóng</button>
                  <button type="submit" className="btn btn-primary">Xong</button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LayoutList size={24} color="var(--accent-color)" /> Quản lý danh mục
              </h2>
              
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input 
                  type="text" 
                  className="input-control" 
                  style={{ flex: 1 }}
                  placeholder="Tên danh mục mới..." 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary" style={{ padding: '0 1rem' }}>
                  <Plus size={18} />
                </button>
              </form>

              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {localCategories.map(cat => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 500 }}>{cat}</span>
                    <button 
                      className="btn-icon-delete"
                      onClick={() => handleDeleteCategory(cat)}
                      title="Xóa danh mục"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {localCategories.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>Chưa có danh mục nào.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB: DATA */}
          {activeTab === 'data' && (
            <div className="animate-fade-in">
              <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={24} color="var(--accent-color)" /> Sao lưu & Phục hồi
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Dữ liệu của bạn được lưu an toàn trên trình duyệt này (Local Storage). Hãy tải xuống (Export) để sao lưu đề phòng trường hợp bạn vô tình xóa bộ nhớ đệm hoặc muốn chuyển dữ liệu sang thiết bị khác.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1.5rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.25rem' }}>Tải xuống (Export)</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lưu toàn bộ danh mục và công cụ thành file .json</p>
                  </div>
                  <button className="btn btn-secondary" onClick={handleExport}>
                    <Download size={16} /> Xuất dữ liệu
                  </button>
                </div>

                <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.25rem' }}>Khôi phục (Import)</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tải lên file .json (Ghi đè dữ liệu hiện tại)</p>
                  </div>
                  <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                  />
                  <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={16} /> Tải lên
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
