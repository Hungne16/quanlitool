import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Code, Globe, Heart } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';

export default function About() {
  const { user, isAdmin } = useAuth();
  
  const features = [
    { icon: <Zap size={24} />, title: 'Tốc độ & Hiệu quả', desc: 'Tìm kiếm hàng trăm công cụ nhanh chóng, chính xác.' },
    { icon: <Users size={24} />, title: 'Cộng đồng', desc: 'Được đóng góp và phát triển bởi hàng ngàn người dùng đam mê công nghệ.' },
    { icon: <Shield size={24} />, title: 'Kiểm duyệt chất lượng', desc: 'Mọi công cụ đều được đánh giá và chọn lọc kỹ lưỡng.' },
    { icon: <Globe size={24} />, title: 'Cập nhật liên tục', desc: 'Bắt kịp xu hướng công nghệ và AI mới nhất mỗi ngày.' }
  ];

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
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h1 style={{ 
              fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}>
              Về ToolHub
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '700px', margin: '0 auto' }}>
              ToolHub không chỉ là một danh bạ công cụ. Đây là không gian dành cho những người yêu thích sự tối ưu, nơi công nghệ phục vụ con người một cách trọn vẹn nhất.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel"
            style={{ padding: '3rem', borderRadius: '24px', marginBottom: '4rem', textAlign: 'center', border: '1px solid rgba(99, 102, 241, 0.2)' }}
          >
            <Heart size={48} style={{ color: '#ec4899', margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Sứ mệnh của chúng tôi</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              Chúng tôi tin rằng công cụ sinh ra là để tiết kiệm thời gian, không phải để làm mất thời gian tìm kiếm. ToolHub được xây dựng với mục tiêu gom mọi tiện ích hữu dụng nhất vào một nơi duy nhất, giúp bạn bứt phá hiệu suất công việc.
            </p>
          </motion.div>

          {/* Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                style={{
                  background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px',
                  border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center'
                }}
              >
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-color)', marginBottom: '1.5rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              padding: '4rem 2rem', borderRadius: '24px', textAlign: 'center', color: 'white'
            }}
          >
            <Code size={48} style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Tham gia cùng chúng tôi</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
              Trở thành một phần của cộng đồng, đóng góp những công cụ tâm đắc của bạn và giúp mọi người cùng làm việc hiệu quả hơn.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700,
                background: 'white', color: '#a855f7', border: 'none', borderRadius: '999px',
                cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              Khám phá ngay
            </button>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
