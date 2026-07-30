import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../../config/firebase';
import { Lock, Unlock, Shield, ShieldAlert, Trash2, Mail, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [addLoading, setAddLoading] = useState(false);

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
      // Sort by creation date descending
      fetched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      alert('Lỗi khi cập nhật quyền. Có thể bạn không có quyền thực hiện việc này.');
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
      alert('Lỗi khi khóa tài khoản.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`CẢNH BÁO: Hành động này sẽ xóa toàn bộ hồ sơ (profile) của người dùng này khỏi Database. \n\nLưu ý: Tài khoản gốc trong Authentication vẫn tồn tại nhưng họ sẽ không thể đăng nhập thành công vào hệ thống. Khuyến khích dùng tính năng "Khóa" thay vì Xóa.\n\nBạn vẫn muốn Xóa Profile?`)) return;
    try {
      await deleteDoc(doc(db, 'users', user.id));
      alert('Đã xóa hồ sơ người dùng thành công.');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa tài khoản. Có thể do thiếu quyền Admin.');
    }
  };

  const handleSendResetEmail = async (email) => {
    if (!window.confirm(`Gửi email đặt lại mật khẩu đến ${email}?`)) return;
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Đã gửi email đặt lại mật khẩu thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi gửi email: ' + err.message);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return alert("Vui lòng điền đủ email và mật khẩu");
    
    setAddLoading(true);
    try {
      // Create a secondary app to bypass automatic login
      const secondaryApp = initializeApp(auth.app.options, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const newUserId = userCredential.user.uid;
      
      // Create their profile document via the primary app (which has the admin's auth token)
      await setDoc(doc(db, 'users', newUserId), {
        email: newEmail,
        role: newRole,
        status: 'active',
        createdAt: new Date().toISOString(),
        favorites: []
      });

      alert("Tạo người dùng thành công!");
      setShowAddModal(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('member');
      fetchUsers();
      
      // Clean up secondary auth
      await secondaryAuth.signOut();
    } catch (err) {
      console.error("Add user error:", err);
      alert("Lỗi tạo người dùng: " + err.message);
    }
    setAddLoading(false);
  };

  const [selectedRole, setSelectedRole] = useState('');

  // Allow super_admin to do everything, admin can only manage members/editors/guests
  const canManageUser = (targetRole) => {
    if (profile?.role === 'super_admin') return true;
    if (profile?.role === 'admin' && (targetRole === 'member' || targetRole === 'editor' || targetRole === 'guest')) return true;
    return false;
  };

  const filteredUsers = selectedRole ? users.filter(u => u.role === selectedRole) : users;

  if (loading && users.length === 0) return <div style={{ padding: '2rem' }}>Đang tải danh sách người dùng...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quản lý Người dùng</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Hệ thống hiện đang có <strong>{users.length}</strong> người dùng</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
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
            <option value="">Tất cả vai trò</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="member">Member</option>
            <option value="guest">Guest</option>
          </select>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
          >
            <Plus size={18} /> Thêm Người Dùng Mới
          </button>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'x-auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Vai trò</th>
              <th style={{ padding: '1rem' }}>Trạng thái</th>
              <th style={{ padding: '1rem' }}>Ngày tạo</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {u.role === 'super_admin' ? <ShieldAlert size={16} color="#ef4444" /> : 
                     u.role === 'admin' ? <Shield size={16} color="#3b82f6" /> : null}
                    {u.email}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    value={u.role || 'member'} 
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={!canManageUser(u.role) || u.id === profile?.uid}
                    style={{
                      padding: '0.4rem', borderRadius: '4px',
                      backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)', outline: 'none'
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
                    padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                    backgroundColor: u.status === 'locked' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: u.status === 'locked' ? '#ef4444' : '#10b981',
                    border: `1px solid ${u.status === 'locked' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                  }}>
                    {u.status === 'locked' ? 'Bị khóa' : 'Hoạt động'}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                  {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleSendResetEmail(u.email)}
                      className="btn-icon"
                      title="Gửi email đặt lại mật khẩu"
                    >
                      <Mail size={18} />
                    </button>
                    <button 
                      onClick={() => handleToggleLock(u)}
                      disabled={!canManageUser(u.role) || u.id === profile?.uid}
                      className="btn-icon"
                      style={{ color: u.status === 'locked' ? '#10b981' : '#f59e0b', opacity: (!canManageUser(u.role) || u.id === profile?.uid) ? 0.3 : 1 }}
                      title={u.status === 'locked' ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                    >
                      {u.status === 'locked' ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(u)}
                      disabled={!canManageUser(u.role) || u.id === profile?.uid}
                      className="btn-icon"
                      style={{ color: '#ef4444', opacity: (!canManageUser(u.role) || u.id === profile?.uid) ? 0.3 : 1 }}
                      title="Xóa hồ sơ người dùng"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Thêm Người Dùng Mới
            </h2>
            <form onSubmit={handleAddUser}>
              <div className="input-group">
                <label>Email</label>
                <input 
                  type="email" 
                  className="input-control" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="vidu@gmail.com"
                  required 
                />
              </div>
              <div className="input-group">
                <label>Mật khẩu (tối thiểu 6 ký tự)</label>
                <input 
                  type="password" 
                  className="input-control" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required 
                  minLength={6}
                />
              </div>
              <div className="input-group">
                <label>Vai trò ban đầu</label>
                <select 
                  className="input-control"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="guest">Guest</option>
                  <option value="member">Member</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '0.75rem' }}
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '0.75rem', display: 'flex', justifyContent: 'center' }}
                  disabled={addLoading}
                >
                  {addLoading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
