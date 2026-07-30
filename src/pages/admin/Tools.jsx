import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Check, X, Trash2, Edit, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import AddToolModal from '../../components/AddToolModal';
import { getCategories } from '../../utils/storage';

const TruncatedLink = ({ url }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = url.length > 50;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem', maxWidth: '300px' }}>
      <a href={url} target="_blank" rel="noreferrer" style={{ 
        color: 'var(--accent-color)', 
        display: 'inline-block',
        whiteSpace: expanded ? 'normal' : 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
        wordBreak: 'break-all',
        textDecoration: 'none'
      }}>
        {url}
      </a>
      {isLong && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          style={{ 
            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', 
            fontSize: '0.75rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' 
          }}
        >
          {expanded ? <><ChevronUp size={12}/> Ẩn bớt</> : <><ChevronDown size={12}/> Xem thêm</>}
        </button>
      )}
    </div>
  );
};

export default function Tools() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  const [editingTool, setEditingTool] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTools();
    fetchCategories();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'tools'));
      const fetched = [];
      snap.forEach(d => {
        fetched.push({ id: d.id, ...d.data() });
      });
      // Sort: pending first, then by date
      fetched.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setTools(fetched);
    } catch (err) {
      console.error(err);
      if (err.code === 'permission-denied') {
        alert('Không có quyền lấy danh sách công cụ. Vui lòng kiểm tra Firebase Rules.');
      }
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const cats = await getCategories();
    setCategories(cats);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'tools', id), { status });
      fetchTools();
    } catch (err) {
      console.error(err);
      alert('Lỗi cập nhật trạng thái. Có thể do Firebase Rules chặn quyền ghi.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa công cụ này vĩnh viễn?')) return;
    try {
      await deleteDoc(doc(db, 'tools', id));
      fetchTools();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa tool: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSaveEdit = async (updatedTool) => {
    try {
      const { id, ...data } = updatedTool;
      await updateDoc(doc(db, 'tools', id), data);
      setEditingTool(null);
      fetchTools();
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu thay đổi. Có thể do Firebase Rules chặn quyền ghi.');
    }
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const handleSaveNew = async (newTool) => {
    try {
      // Add directly as approved
      const dataToSave = {
        ...newTool,
        status: 'approved',
        createdAt: new Date().toISOString(),
        submittedBy: 'admin'
      };
      await addDoc(collection(db, 'tools'), dataToSave);
      setIsAddModalOpen(false);
      fetchTools();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi thêm công cụ.');
    }
  };

  const calculateRating = (ratings) => {
    if (!ratings) return { avg: 0, count: 0 };
    const scores = Object.values(ratings);
    if (scores.length === 0) return { avg: 0, count: 0 };
    const sum = scores.reduce((a, b) => a + b, 0);
    return { avg: (sum / scores.length).toFixed(1), count: scores.length };
  };

  const filteredTools = tools.filter(t => {
    const matchesCategory = selectedCategory ? t.category === selectedCategory : true;
    const matchesSearch = (t.title || t.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                          (t.description || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div style={{ padding: '2rem' }}>Đang tải...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quản lý Công cụ</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Hệ thống hiện đang có <strong>{tools.length}</strong> công cụ</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm công cụ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.5rem 1rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '200px'
              }}
            />
          </div>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600 }}
          >
            + Thêm công cụ
          </button>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Tên công cụ</th>
              <th style={{ padding: '1rem' }}>Danh mục</th>
              <th style={{ padding: '1rem' }}>Người gửi</th>
              <th style={{ padding: '1rem' }}>Đánh giá</th>
              <th style={{ padding: '1rem' }}>Trạng thái</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTools.map(t => {
              const rating = calculateRating(t.ratings);
              return (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <TruncatedLink url={t.url} />
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{t.category}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{t.submittedBy === 'guest' || !t.submittedBy ? 'Hệ thống/Guest' : 'Member'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>★ {rating.avg}</span> 
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.2rem' }}>({rating.count})</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem',
                      backgroundColor: t.status === 'pending' ? '#fef3c7' : '#d1fae5',
                      color: t.status === 'pending' ? '#d97706' : '#10b981'
                    }}>
                      {t.status === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {t.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(t.id, 'approved')} className="btn btn-primary" style={{ padding: '0.4rem', borderRadius: '6px' }} title="Duyệt">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleUpdateStatus(t.id, 'rejected')} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '6px', color: '#ef4444' }} title="Từ chối">
                          <X size={16} />
                        </button>
                      </>
                    )}
                    <button onClick={() => setEditingTool(t)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '6px' }} title="Sửa">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="btn btn-secondary" style={{ padding: '0.4rem', borderRadius: '6px', color: '#ef4444' }} title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingTool && (
        <AddToolModal 
          isOpen={true}
          onClose={() => setEditingTool(null)}
          onSave={handleSaveEdit}
          categories={categories}
          initialData={editingTool}
        />
      )}

      {isAddModalOpen && (
        <AddToolModal 
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveNew}
          categories={categories}
        />
      )}
    </div>
  );
}
