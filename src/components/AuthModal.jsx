import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Loader2, User } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIsLogin(true);
      setError('');
      setEmail('');
      setPassword('');
      setNickname('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e, mode) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (nickname.trim()) {
          await updateProfile(userCred.user, { displayName: nickname.trim() });
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được đăng ký.');
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu, tối thiểu 6 ký tự.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Định dạng email không hợp lệ.');
      } else {
        setError('Đã có lỗi xảy ra: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="auth-container shadow-2xl relative overflow-hidden bg-white dark:bg-[#1a1f2e]">
        {/* Close Button */}
        <button 
          className="modal-close" 
          onClick={onClose}
          style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 100 }}
        >
          <X size={20} />
        </button>

        {/* Mobile top image (Hidden on desktop) */}
        <div className="auth-mobile-bg"></div>

        {/* =======================
            SIGN IN FORM (LEFT)
        ======================= */}
        <div className={`auth-form-container auth-form-left ${isLogin ? 'active' : ''}`} style={{ opacity: isLogin ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: isLogin ? 20 : 1 }}>
          <h2 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '2rem', fontWeight: 800 }}>
            Sign in
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Chào mừng bạn quay lại hệ thống
          </p>

          {error && isLogin && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, 'login')} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required 
                  className="input-control w-full" 
                  style={{ paddingLeft: '35px', background: 'rgba(0,0,0,0.03)' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  tabIndex={isLogin ? 0 : -1}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required 
                  className="input-control w-full" 
                  style={{ paddingLeft: '35px', background: 'rgba(0,0,0,0.03)' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  tabIndex={isLogin ? 0 : -1}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', fontSize: '1rem', display: 'flex', justifyContent: 'center' }} disabled={loading} tabIndex={isLogin ? 0 : -1}>
              {loading ? <Loader2 size={18} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Đăng nhập'}
            </button>
          </form>

          {/* Mobile toggle link */}
          <div className="md:hidden mt-6 text-center text-sm text-[var(--text-secondary)] block">
            Chưa có tài khoản? <span onClick={() => { setIsLogin(false); setError(''); }} className="text-[var(--accent-color)] cursor-pointer font-medium">Đăng ký ngay</span>
          </div>
        </div>

        {/* =======================
            SIGN UP FORM (RIGHT)
        ======================= */}
        <div className={`auth-form-container auth-form-right ${!isLogin ? 'active' : ''}`} style={{ opacity: !isLogin ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: !isLogin ? 20 : 1 }}>
          <h2 style={{ marginBottom: '0.25rem', textAlign: 'center', fontSize: '1.6rem', fontWeight: 800 }}>
            Tạo tài khoản
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            Điền thông tin bên dưới để bắt đầu
          </p>

          {error && !isLogin && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', fontSize: '0.85rem', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, 'register')} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {/* Nickname */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }}>
                <User size={15} />
              </div>
              <input 
                type="text"
                className="input-control w-full"
                style={{ paddingLeft: '32px', paddingTop: '0.55rem', paddingBottom: '0.55rem', fontSize: '0.875rem', background: 'rgba(0,0,0,0.03)' }}
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Biệt danh (tùy chọn)"
                tabIndex={!isLogin ? 0 : -1}
              />
            </div>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }}>
                <Mail size={15} />
              </div>
              <input 
                type="email"
                required
                className="input-control w-full"
                style={{ paddingLeft: '32px', paddingTop: '0.55rem', paddingBottom: '0.55rem', fontSize: '0.875rem', background: 'rgba(0,0,0,0.03)' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                tabIndex={!isLogin ? 0 : -1}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }}>
                <Lock size={15} />
              </div>
              <input 
                type="password"
                required
                minLength={6}
                className="input-control w-full"
                style={{ paddingLeft: '32px', paddingTop: '0.55rem', paddingBottom: '0.55rem', fontSize: '0.875rem', background: 'rgba(0,0,0,0.03)' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                tabIndex={!isLogin ? 0 : -1}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.7rem', fontSize: '0.95rem', display: 'flex', justifyContent: 'center' }} disabled={loading} tabIndex={!isLogin ? 0 : -1}>
              {loading ? <Loader2 size={18} className="lucide-spin" style={{ animation: 'spin 1s linear infinite' }} /> : 'Tạo tài khoản'}
            </button>
          </form>

          {/* Mobile toggle link */}
          <div className="md:hidden mt-4 text-center text-sm text-[var(--text-secondary)] block">
            Đã có tài khoản? <span onClick={() => { setIsLogin(true); setError(''); }} className="text-[var(--accent-color)] cursor-pointer font-medium">Đăng nhập</span>
          </div>
        </div>

        {/* =======================
            SLIDING OVERLAY (DESKTOP)
        ======================= */}
        {/*
          When isLogin === true:
            - Form on Left is visible.
            - Overlay is on Right (x: 100%).
            - Background Image inside Overlay is shifted Left (x: -50%) to show the Right side of the image.
          When isLogin === false:
            - Form on Right is visible.
            - Overlay is on Left (x: 0%).
            - Background Image inside Overlay is shifted Right (x: 0%) to show the Left side of the image.
        */}
        <motion.div 
          className="auth-overlay-container"
          initial={false}
          animate={{ x: isLogin ? "100%" : "0%" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <motion.div 
             className="auth-overlay-bg"
             animate={{ x: isLogin ? "-50%" : "0%" }}
             transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {/* The text inside the overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.3)' }} />
            
            {/* Right side text (visible when overlay is on the Right) */}
            <motion.div 
              style={{ position: 'absolute', top: 0, left: '50%', width: '50%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', color: 'white', textAlign: 'center' }}
              animate={{ opacity: isLogin ? 1 : 0 }}
              transition={{ duration: 0.3, delay: isLogin ? 0.3 : 0 }}
            >
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Xin chào!</h2>
              <p style={{ marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5' }}>
                Đăng ký ngay để trải nghiệm tất cả tính năng tuyệt vời của chúng tôi.
              </p>
              <button 
                className="btn" 
                style={{ background: 'transparent', border: '2px solid white', color: 'white', padding: '0.6rem 2.5rem', borderRadius: '30px', fontWeight: 600, transition: 'all 0.3s' }}
                onClick={() => { setIsLogin(false); setError(''); }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#333'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; }}
                tabIndex={isLogin ? 0 : -1}
              >
                Đăng ký
              </button>
            </motion.div>

            {/* Left side text (visible when overlay is on the Left) */}
            <motion.div 
              style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', color: 'white', textAlign: 'center' }}
              animate={{ opacity: !isLogin ? 1 : 0 }}
              transition={{ duration: 0.3, delay: !isLogin ? 0.3 : 0 }}
            >
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Mừng trở lại!</h2>
              <p style={{ marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5' }}>
                Đăng nhập để tiếp tục làm việc với những công cụ hữu ích.
              </p>
              <button 
                className="btn" 
                style={{ background: 'transparent', border: '2px solid white', color: 'white', padding: '0.6rem 2.5rem', borderRadius: '30px', fontWeight: 600, transition: 'all 0.3s' }}
                onClick={() => { setIsLogin(true); setError(''); }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#333'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; }}
                tabIndex={!isLogin ? 0 : -1}
              >
                Đăng nhập
              </button>
            </motion.div>

          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
