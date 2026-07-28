import React, { useEffect, useState } from 'react';
import { getCategories, saveCategories } from '../../utils/storage';
import { Trash2, Plus, GripVertical } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCats();
  }, []);

  const fetchCats = async () => {
    setLoading(true);
    const cats = await getCategories();
    setCategories(cats);
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

  if (loading) return <div style={{ padding: '2rem' }}>Đang tải...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem' }}>Quản lý Danh mục</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="Tên danh mục mới..."
          className="form-input"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={18} /> Thêm
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {categories.map((cat, index) => (
            <li key={cat} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem', borderBottom: index < categories.length - 1 ? '1px solid var(--border-color)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <GripVertical size={16} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                <span style={{ fontWeight: 500 }}>{cat}</span>
              </div>
              <button onClick={() => handleDelete(cat)} className="btn btn-secondary" style={{ padding: '0.4rem', color: '#ef4444' }}>
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          {categories.length === 0 && (
            <li style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có danh mục nào.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
