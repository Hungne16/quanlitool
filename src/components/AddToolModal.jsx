import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddToolModal({ categories, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (categories && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;
    
    // Ensure URL has http/https
    let finalUrl = formData.url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    await onSave({ ...formData, url: finalUrl });
    setFormData({ title: '', url: '', description: '', category: categories[0] || '', imageUrl: '' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-content glass-panel">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2 style={{ marginBottom: '1.5rem' }}>Thêm công cụ mới</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Tên công cụ *</label>
            <input required type="text" name="title" className="input-control" value={formData.title} onChange={handleChange} placeholder="VD: ChatGPT" />
          </div>

          <div className="input-group">
            <label>Đường dẫn (URL) *</label>
            <input required type="text" name="url" className="input-control" value={formData.url} onChange={handleChange} placeholder="VD: https://chat.openai.com" />
          </div>

          <div className="input-group">
            <label>Danh mục</label>
            <select name="category" className="input-control" value={formData.category} onChange={handleChange}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Mô tả ngắn gọn</label>
            <textarea name="description" className="input-control" value={formData.description} onChange={handleChange} placeholder="Công cụ này dùng để làm gì?" rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div className="input-group">
            <label>Link Ảnh/Icon (Tuỳ chọn)</label>
            <input type="text" name="imageUrl" className="input-control" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu công cụ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
