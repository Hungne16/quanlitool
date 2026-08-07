import React, { useEffect, useState } from 'react';
import { getTags, saveTags } from '../../utils/storage';
import { Trash2, Plus, Tag as TagIcon, AlertCircle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [toolCounts, setToolCounts] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedTags, snap] = await Promise.all([
        getTags(),
        getDocs(collection(db, 'tools'))
      ]);
      setTags(fetchedTags);
      
      const counts = {};
      snap.forEach(d => {
        const tool = d.data();
        if (tool.tags && Array.isArray(tool.tags)) {
          tool.tags.forEach(tag => {
            counts[tag] = (counts[tag] || 0) + 1;
          });
        }
      });
      setToolCounts(counts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newTag.trim()) return;
    if (tags.includes(newTag.trim())) {
      alert('Tag này đã tồn tại!');
      return;
    }
    const updated = [...tags, newTag.trim()];
    await saveTags(updated);
    setTags(updated);
    setNewTag('');
  };

  const handleDelete = async (tagToDelete) => {
    if (!window.confirm(`Xóa tag "${tagToDelete}"? Các công cụ đang dùng tag này sẽ không còn hiển thị tag này nữa.`)) return;
    const updated = tags.filter(t => t !== tagToDelete);
    await saveTags(updated);
    setTags(updated);
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Quản lý Tags</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Quản lý và chuẩn hóa các Tag được phép sử dụng trên hệ thống.</p>
        </div>
        <div style={{ background: 'rgba(100, 84, 168, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', color: '#6454a8', fontWeight: 600 }}>
          {tags.length} Tags
        </div>
      </div>
      
      {/* Thêm Tag */}
      <div style={{ 
        display: 'flex', gap: '1rem', marginBottom: '2.5rem', 
        background: '#ffffff', padding: '1.5rem', borderRadius: '24px',
        boxShadow: '10px 10px 30px rgba(112, 128, 175, 0.1), -10px -10px 30px rgba(255, 255, 255, 0.8)',
        border: 'none'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <TagIcon size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="Nhập tên tag mới..."
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

      {/* Danh sách Tag */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {tags.map((tag) => (
          <div key={tag} style={{ 
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
                <TagIcon size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{tag}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {toolCounts[tag] || 0} công cụ
                </span>
              </div>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(tag); }} 
              style={{ 
                background: 'transparent', border: '1px solid #fee2e2', padding: '0.5rem', 
                color: '#ef4444', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444' }}
              title="Xóa tag"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {tags.length === 0 && (
        <div style={{ 
          padding: '4rem 2rem', textAlign: 'center', background: '#ffffff', 
          borderRadius: '24px', border: 'none', marginTop: '1rem',
          boxShadow: '10px 10px 30px rgba(112, 128, 175, 0.1), -10px -10px 30px rgba(255, 255, 255, 0.8)'
        }}>
          <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Chưa có Tag nào</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hãy tạo các Tag chuẩn để bắt đầu quản lý.</p>
        </div>
      )}
    </div>
  );
}
