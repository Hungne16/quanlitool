import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Code, Globe, Heart, Search, Bot, Rocket, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';

export default function About() {
  const { user, isAdmin } = useAuth();
  
  const features = [
    { icon: <Search size={28} />, title: 'Tìm kiếm siêu tốc', desc: 'Hệ thống lọc và phân loại thông minh giúp bạn tìm đúng công cụ trong vài giây.', color: '#3b82f6' },
    { icon: <Bot size={28} />, title: 'AI Tự Động Hóa', desc: 'Tích hợp Gemini AI giúp tự động phân tích và trích xuất dữ liệu website chỉ với 1 đường link URL.', color: '#8b5cf6' },
    { icon: <Users size={28} />, title: 'Cộng đồng vững mạnh', desc: 'Nơi hàng ngàn người dùng chia sẻ, đánh giá và tương tác để tìm ra công cụ tốt nhất.', color: '#10b981' },
    { icon: <Shield size={28} />, title: 'Kiểm duyệt chất lượng', desc: 'Mọi công cụ đều trải qua quá trình kiểm duyệt khắt khe, đảm bảo trải nghiệm an toàn.', color: '#f59e0b' }
  ];

  const aiSteps = [
    { title: 'Nhập URL', desc: 'Bạn chỉ cần dán đường dẫn website của công cụ.', icon: <Globe size={24} /> },
    { title: 'Crawl Dữ Liệu', desc: 'Hệ thống tự động quét toàn bộ nội dung trang chủ và các trang phụ.', icon: <Cpu size={24} /> },
    { title: 'Gemini Phân Tích', desc: 'AI phân tích siêu tốc, trích xuất Title, Mô tả, Pricing và Logo.', icon: <Sparkles size={24} /> },
    { title: 'Hoàn Tất', desc: 'Form tự động điền 100%, sẵn sàng để bạn duyệt và lưu.', icon: <CheckCircle2 size={24} /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="app-container">
      <Sidebar 
        categories={[]}
        currentCategory=""
        setCurrentCategory={() => {}}
        isAdmin={isAdmin}
        isLoggedIn={!!user}
      />
      <main className="main-content" style={{ overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1.5rem', position: 'relative' }}>
          
          {/* Background Decorative Blobs */}
          <div style={{ position: 'absolute', top: '5%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '40%', right: '-15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            
            {/* Hero Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ textAlign: 'center', marginBottom: '6rem' }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '999px', color: '#a855f7', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <Sparkles size={16} /> Phiên bản ToolHub 2.0
              </div>
              <h1 style={{ 
                fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 900, marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1.1, letterSpacing: '-0.02em'
              }}>
                Trung Tâm Không Gian<br/>Của Mọi Tiện Ích
              </h1>
              <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '750px', margin: '0 auto' }}>
                Khám phá không gian hội tụ hàng ngàn công cụ công nghệ thông minh, nơi Trí tuệ nhân tạo (AI) giúp bạn tự động hóa việc tìm kiếm, phân tích và tối ưu hóa luồng công việc.
              </p>
            </motion.div>

            {/* AI Auto Fill Section - THE STAR FEATURE */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="glass-panel"
              style={{ 
                padding: '3rem', borderRadius: '32px', marginBottom: '6rem', 
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.15)',
                overflow: 'hidden', position: 'relative'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                  <Bot size={40} style={{ color: '#a855f7' }} /> AI Magic Auto-Fill
                </h2>
                <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto' }}>
                  Bạn muốn thêm một công cụ mới? Đừng hì hục gõ từng dòng. Hãy để hệ thống Trí Tuệ Nhân Tạo của chúng tôi làm thay bạn trong chớp mắt.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', position: 'relative' }}>
                {/* Connecting Line */}
                <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)', zIndex: 0 }} className="hide-on-mobile" />
                
                {aiSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.2 }}
                    style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
                  >
                    <div style={{ 
                      width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1.25rem auto',
                      background: '#1e293b', border: '2px solid #8b5cf6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
                    }}>
                      {step.icon}
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{step.title}</h4>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Core Features Grid */}
            <div style={{ marginBottom: '6rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Trải Nghiệm Đỉnh Cao</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Mọi thứ được thiết kế tối ưu nhất dành cho bạn.</p>
              </div>
              
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}
              >
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)',
                      padding: '2.5rem 2rem', borderRadius: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s ease', cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.borderColor = `rgba(${parseInt(feature.color.slice(1,3),16)},${parseInt(feature.color.slice(3,5),16)},${parseInt(feature.color.slice(5,7),16)},0.4)`;
                      e.currentTarget.style.boxShadow = `0 20px 40px -10px rgba(${parseInt(feature.color.slice(1,3),16)},${parseInt(feature.color.slice(3,5),16)},${parseInt(feature.color.slice(5,7),16)},0.15)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '16px',
                      background: `rgba(${parseInt(feature.color.slice(1,3),16)},${parseInt(feature.color.slice(3,5),16)},${parseInt(feature.color.slice(5,7),16)},0.1)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: feature.color, marginBottom: '1.5rem'
                    }}>
                      {feature.icon}
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>{feature.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Call to Action */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)',
                padding: '5rem 2rem', borderRadius: '32px', textAlign: 'center', color: 'white',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
            >
              <Rocket size={56} style={{ margin: '0 auto 1.5rem auto', color: '#c084fc' }} />
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: '1.5rem' }}>Sẵn Sàng Khám Phá?</h2>
              <p style={{ fontSize: '1.15rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '650px', margin: '0 auto 3rem auto', lineHeight: 1.7 }}>
                Gia nhập ngay hệ sinh thái ToolHub. Cùng nhau xây dựng thư viện công cụ mạnh mẽ nhất và nâng tầm hiệu suất làm việc của bạn.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '1.2rem 3rem', fontSize: '1.15rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', 
                  border: 'none', borderRadius: '999px',
                  cursor: 'pointer', boxShadow: '0 10px 25px rgba(236, 72, 153, 0.4)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Trải Nghiệm Ngay
              </button>
            </motion.div>

          </div>
        </div>
      </main>
      
      {/* Basic media query for the connecting line */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
        }
      `}} />
    </div>
  );
}
