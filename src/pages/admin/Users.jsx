import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Lock, Unlock, Shield, ShieldAlert, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth(); // Current logged-in user

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const fetched = [];
      snap.forEach(d => {
        fetched.push({ id: d.id, ...d.data() });
      });
      setUsers(fetched);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Chuyển người dùng này thành ${newRole}?`)) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật quyền');
    }
  };

  const handleToggleLock = async (user) => {
    const newStatus = user.status === 'locked' ? 'active' : 'locked';
    if (!window.confirm(`Bạn có chắc muốn ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản này?`)) return;
    try {
      await updateDoc(doc(db, 'users', user.id), { status: newStatus });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi khóa tài khoản');
    }
  };

  // Allow super_admin to do everything, admin can only manage members/editors
  const canManageUser = (targetRole) => {
    if (profile?.role === 'super_admin') return true;
    if (profile?.role === 'admin' && (targetRole === 'member' || targetRole === 'editor' || targetRole === 'guest')) return true;
    return false;
  };

  if (loading) return <div style={{ padding: '2rem' }}>Đang tải danh sách người dùng...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem' }}>Quản lý Người dùng</h1>
      
      <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Vai trò</th>
              <th style={{ padding: '1rem' }}>Trạng thái</th>
              <th style={{ padding: '1rem' }}>Ngày tạo</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={u.role} 
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={!canManageUser(u.role) || u.id === profile?.uid}
                    style={{
                      padding: '0.4rem', borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <option value="guest">Guest</option>
                    <option value="member">Member</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    {profile?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                  </select>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem',
                    backgroundColor: u.status === 'locked' ? '#fee2e2' : '#d1fae5',
                    color: u.status === 'locked' ? '#ef4444' : '#10b981'
                  }}>
                    {u.status === 'locked' ? 'Bị khóa' : 'Hoạt động'}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleToggleLock(u)}
                    disabled={!canManageUser(u.role) || u.id === profile?.uid}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem', color: u.status === 'locked' ? '#10b981' : '#f59e0b', marginRight: '0.5rem' }}
                    title={u.status === 'locked' ? "Mở khóa" : "Khóa tài khoản"}
                  >
                    {u.status === 'locked' ? <Unlock size={16} /> : <Lock size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
