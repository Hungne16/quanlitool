import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Type, Image as ImageIcon, FileText, LayoutList, Tag, Loader2 } from 'lucide-react';
import ToolCard from './ToolCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddToolModal({ categories, isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    detailedDescription: '',
    category: '',
    imageUrl: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, tags: initialData.tags || [] });
    } else if (categories && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [categories, initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
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
    setFormData({ title: '', url: '', description: '', detailedDescription: '', category: categories[0] || '', imageUrl: '', tags: [] });
    setTagInput('');
    onClose();
  };

  const handleAnalyzeUrl = async () => {
    if (!formData.url) {
      setAnalyzeError('Vui lòng nhập URL trước khi phân tích');
      return;
    }
    
    let targetUrl = formData.url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
      setFormData(prev => ({...prev, url: targetUrl}));
    }

    setIsAnalyzing(true);
    setAnalyzeError('');
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi phân tích website');
      }
      
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.shortDescription || prev.description,
        detailedDescription: data.fullDescription || prev.detailedDescription,
        category: data.category || prev.category,
        tags: data.tags && data.tags.length > 0 ? data.tags : prev.tags,
        imageUrl: data.logo || prev.imageUrl
      }));
      
    } catch (err) {
      setAnalyzeError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Create a dummy tool for the live preview
  const previewTool = {
    id: 'preview',
    title: formData.title || 'Tên công cụ...',
    url: formData.url || 'https://example.com',
    description: formData.description || 'Mô tả ngắn gọn về công cụ của bạn sẽ hiển thị ở đây...',
    detailedDescription: formData.detailedDescription,
    category: formData.category || 'Category',
    imageUrl: formData.imageUrl,
    tags: formData.tags
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="modal-content glass-panel"
          style={{ 
            maxWidth: '900px', 
            width: '95%',
            maxHeight: '95vh',
            display: 'flex', 
            padding: 0, 
            overflow: 'hidden',
            borderRadius: '24px'
          }}
        >
          {/* Left Side - Live Preview */}
          <div style={{ 
            flex: '1', 
            background: 'var(--bg-secondary)', 
            padding: '2.5rem', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRight: '1px solid var(--border-color)',
            position: 'relative',
            overflow: 'hidden'
          }} className="hidden md:flex">
            
            <div style={{ width: '100%', maxWidth: '320px', pointerEvents: 'none', maxHeight: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '1.5rem', textAlign: 'center', flexShrink: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>✨ Live Preview</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Thẻ sẽ hiển thị như thế này</p>
              </div>
              
              <div style={{ flex: 1, minHeight: 0 }}>
                <ToolCard tool={previewTool} isAdmin={false} />
              </div>
            </div>

            {/* Decorative background element */}
            <div style={{ 
              position: 'absolute', width: '200px', height: '200px', 
              background: 'linear-gradient(135deg, #7463c6, #ff7eb3)', 
              borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15,
              top: '-50px', left: '-50px', zIndex: 0
            }}></div>
          </div>

          {/* Right Side - Form */}
          <div style={{ flex: '1', padding: '2rem 2.5rem', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '95vh' }}>
            <button 
              className="modal-close" 
              onClick={onClose}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-hover)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
              {initialData ? 'Sửa công cụ' : 'Thêm công cụ mới'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="custom-scrollbar">
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <Type size={16} color="var(--accent-color)" /> Tên công cụ *
                </label>
                <input required type="text" name="title" className="input-control" value={formData.title} onChange={handleChange} placeholder="VD: ChatGPT" style={{ padding: '0.75rem 1rem', borderRadius: '12px' }} />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LinkIcon size={16} color="var(--accent-color)" /> Đường dẫn (URL) *
                  </span>
                  <button 
                    type="button" 
                    onClick={handleAnalyzeUrl}
                    disabled={isAnalyzing || !formData.url}
                    style={{
                      background: 'var(--accent-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 12px',
                      fontSize: '0.8rem',
                      cursor: isAnalyzing || !formData.url ? 'not-allowed' : 'pointer',
                      opacity: isAnalyzing || !formData.url ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        Đang phân tích...
                      </>
                    ) : (
                      <>✨ Analyze by AI</>
                    )}
                  </button>
                </label>
                <input required type="text" name="url" className="input-control" value={formData.url} onChange={handleChange} placeholder="VD: https://chat.openai.com" style={{ padding: '0.75rem 1rem', borderRadius: '12px' }} />
                {analyzeError && <div style={{ color: '#ff4d4f', fontSize: '0.85rem', marginTop: '8px' }}>{analyzeError}</div>}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <LayoutList size={16} color="var(--accent-color)" /> Danh mục
                  </label>
                  <select name="category" className="input-control" value={formData.category} onChange={handleChange} style={{ padding: '0.75rem 1rem', borderRadius: '12px' }}>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <ImageIcon size={16} color="var(--accent-color)" /> Logo URL
                  </label>
                  <input type="text" name="imageUrl" className="input-control" value={formData.imageUrl} onChange={handleChange} placeholder="Tuỳ chọn..." style={{ padding: '0.75rem 1rem', borderRadius: '12px' }} />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <Tag size={16} color="var(--accent-color)" /> Tags (Thẻ phân loại)
                </label>
                <div style={{ 
                  display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', 
                  border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-primary)' 
                }}>
                  {formData.tags.map(tag => (
                    <span key={tag} style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.25rem',
                      background: 'var(--accent-color)', color: 'white', 
                      padding: '0.25rem 0.5rem', borderRadius: '16px', fontSize: '0.8rem' 
                    }}>
                      {tag}
                      <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                  <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput.trim() && addTag()}
                    placeholder={formData.tags.length === 0 ? "Nhập tag và nhấn Enter..." : ""}
                    style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: '120px', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <FileText size={16} color="var(--accent-color)" /> Mô tả ngắn gọn
                </label>
                <textarea name="description" className="input-control" value={formData.description} onChange={handleChange} placeholder="Công cụ này dùng để làm gì? (Tối đa 3 dòng)" rows={2} style={{ resize: 'vertical', padding: '0.75rem 1rem', borderRadius: '12px' }} />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                  <FileText size={16} color="var(--accent-color)" /> Mô tả chi tiết (Nội dung thẻ lật 180 độ)
                </label>
                <textarea name="detailedDescription" className="input-control" value={formData.detailedDescription || ''} onChange={handleChange} placeholder="Mô tả chi tiết hơn về các tính năng, cách dùng, giá cả..." rows={4} style={{ resize: 'vertical', padding: '0.75rem 1rem', borderRadius: '12px' }} />
              </div>

              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
                <button type="button" className="btn btn-ghost" onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg, #7463c6, #ff7eb3)', border: 'none', boxShadow: '0 10px 20px rgba(116, 99, 198, 0.3)' }}>
                  {initialData ? 'Cập nhật' : 'Lưu công cụ'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
