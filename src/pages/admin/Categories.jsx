import React, { useEffect, useState } from 'react';
import { getCategories, saveCategories } from '../../utils/storage';
import { Trash2, Plus, GripVertical, FolderOpen, AlertCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [toolCounts, setToolCounts] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cats, snap] = await Promise.all([
        getCategories(),
        getDocs(collection(db, 'tools'))
      ]);
      setCategories(cats);
      
      const counts = {};
      snap.forEach(d => {
        const tool = d.data();
        if (tool.category) {
          counts[tool.category] = (counts[tool.category] || 0) + 1;
        }
      });
      setToolCounts(counts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert('Danh mục này đã tồn tại!');
      return;
    }
    const updated = [...categories, newCategory.trim()];
    await saveCategories(updated);
    setCategories(updated);
    setNewCategory('');
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Xóa danh mục "${cat}"? Các công cụ thuộc danh mục này sẽ hiển thị là không có danh mục.`)) return;
    const updated = categories.filter(c => c !== cat);
    await saveCategories(updated);
    setCategories(updated);
  };

  if (loading) return (
    <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Danh mục hệ thống</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Quản lý và sắp xếp các thẻ phân loại công cụ.</p>
        </div>
        <div style={{ background: 'rgba(100, 84, 168, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', color: '#6454a8', fontWeight: 600 }}>
          {categories.length} Danh mục
        </div>
      </div>
      
      {/* Thêm danh mục */}
      <div style={{ 
        display: 'flex', gap: '1rem', marginBottom: '2.5rem', 
        background: '#ffffff', padding: '1.5rem', borderRadius: '24px',
        boxShadow: '10px 10px 30px rgba(112, 128, 175, 0.1), -10px -10px 30px rgba(255, 255, 255, 0.8)',
        border: 'none'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <FolderOpen size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            placeholder="Nhập tên danh mục mới..."
            style={{
              width: '100%', padding: '0.85rem 1rem 0.85rem 3rem',
              borderRadius: '12px', border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#6454a8'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <button 
          onClick={handleAdd} 
          style={{ 
            display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#6454a8', color: 'white',
            border: 'none', padding: '0 1.5rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem',
            cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(100, 84, 168, 0.2)'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(100, 84, 168, 0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(100, 84, 168, 0.2)' }}
        >
          <Plus size={18} /> Thêm mới
        </button>
      </div>

      {/* Danh sách danh mục */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {categories.map((cat) => (
          <div key={cat} style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1.5rem', borderRadius: '24px', background: '#ffffff',
            border: 'none', 
            boxShadow: '10px 10px 30px rgba(112, 128, 175, 0.1), -10px -10px 30px rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer', position: 'relative'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '15px 15px 40px rgba(112, 128, 175, 0.15), -15px -15px 40px rgba(255, 255, 255, 0.9)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '10px 10px 30px rgba(112, 128, 175, 0.1), -10px -10px 30px rgba(255, 255, 255, 0.8)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ 
                width: '50px', height: '50px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, #f6f8fb 0%, #e5ebf4 100%)', 
                boxShadow: 'inset 2px 2px 4px rgba(255,255,255,1), inset -2px -2px 4px rgba(112, 128, 175, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' 
              }}>
                <FolderOpen size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{cat}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {toolCounts[cat] || 0} công cụ
                </span>
              </div>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(cat); }} 
              style={{ 
                background: 'transparent', border: '1px solid #fee2e2', padding: '0.5rem', 
                color: '#ef4444', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444' }}
              title="Xóa danh mục"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div style={{ 
          padding: '4rem 2rem', textAlign: 'center', background: '#ffffff', 
          borderRadius: '24px', border: 'none', marginTop: '1rem',
          boxShadow: '10px 10px 30px rgba(112, 128, 175, 0.1), -10px -10px 30px rgba(255, 255, 255, 0.8)'
        }}>
          <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Chưa có danh mục nào</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hãy tạo danh mục đầu tiên để phân loại các công cụ.</p>
        </div>
      )}
    </div>
  );
}
