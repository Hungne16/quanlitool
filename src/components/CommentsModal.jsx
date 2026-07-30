import React, { useState } from 'react';
import { X, Send, UserCircle2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addComment, deleteComment } from '../utils/storage';

export default function CommentsModal({ isOpen, onClose, tool, onCommentAdded, onCommentDeleted }) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, profile, isAdmin } = useAuth();

  if (!isOpen || !tool) return null;

  const comments = tool.comments || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    setSubmitting(true);
    try {
      const commentData = {
        userId: user.uid,
        userEmail: user.email,
        nickname: profile?.nickname || null,
        text: comment.trim()
      };
      await addComment(tool.id, commentData);
      setComment('');
      if (onCommentAdded) {
        onCommentAdded({ ...commentData, createdAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentToDelete) => {
    if (!window.confirm("Xóa bình luận này?")) return;
    try {
      await deleteComment(tool.id, commentToDelete);
      if (onCommentDeleted) {
        onCommentDeleted(commentToDelete);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa bình luận');
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div 
        className="modal-content glass-panel"
        style={{
          width: '100%', maxWidth: '500px',
          borderRadius: '16px',
          padding: '1.5rem',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Bình luận ({comments.length})
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                  <UserCircle2 size={32} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1rem', borderRadius: '12px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {c.nickname || c.userEmail.split('@')[0]}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        {isAdmin && (
                          <button onClick={() => handleDelete(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0', display: 'flex' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {c.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Viết bình luận..."
              style={{
                flex: 1, padding: '0.75rem 1rem', borderRadius: '999px',
                border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                color: 'var(--text-primary)', outline: 'none'
              }}
            />
            <button 
              type="submit"
              disabled={!comment.trim() || submitting}
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                border: 'none', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: comment.trim() && !submitting ? 'pointer' : 'not-allowed',
                opacity: comment.trim() && !submitting ? 1 : 0.5
              }}
            >
              <Send size={18} />
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Vui lòng đăng nhập để bình luận.
          </div>
        )}
      </div>
    </div>
  );
}
