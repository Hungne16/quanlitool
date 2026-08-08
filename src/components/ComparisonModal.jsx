import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MinusCircle, Star, Sparkles } from 'lucide-react';
import BattleArena from './BattleArena';

export default function ComparisonModal({ isOpen, onClose, tools }) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [verdictData, setVerdictData] = useState(null);

  useEffect(() => {
    if (isOpen && tools.length === 2) {
      // Reset state
      setVerdictData(null);
      setIsEvaluating(true);

      const fetchComparison = async () => {
        try {
          const response = await fetch('/api/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tool1: tools[0], tool2: tools[1] })
          });
          if (response.ok) {
            const data = await response.json();
            setVerdictData(data);
          } else {
            console.error('Failed to fetch AI comparison');
            setVerdictData({ winnerId: 'draw', verdict: 'Lỗi khi gọi trọng tài AI.' });
          }
        } catch (error) {
          console.error(error);
          setVerdictData({ winnerId: 'draw', verdict: 'Không thể kết nối với trọng tài AI.' });
        } finally {
          setIsEvaluating(false);
        }
      };

      fetchComparison();
    }
  }, [isOpen, tools]);

  if (!isOpen || tools.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          style={{
            background: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              background: 'var(--surface-color)', border: 'none',
              width: '40px', height: '40px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-primary)'
            }}
          >
            <X size={20} />
          </button>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: tools.length === 2 ? '1rem' : '2rem', textAlign: 'center' }}>
            So sánh Công cụ
          </h2>

          {tools.length === 2 && (
            <>
              <BattleArena 
                tool1={tools[0]} 
                tool2={tools[1]} 
                isEvaluating={isEvaluating} 
                winnerId={verdictData?.winnerId} 
              />
              
              {/* Bảng báo cáo của Trọng tài AI */}
              {verdictData && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'var(--surface-color)',
                    borderRadius: '20px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#8b5cf6' }}>
                    <Sparkles size={24} />
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Phán quyết của Trọng tài AI</h3>
                  </div>

                  <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem', fontWeight: 500 }}>
                    {verdictData.verdict}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Tool A */}
                    <div>
                      <h4 style={{ color: '#3b82f6', marginBottom: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>
                        {tools[0].title || tools[0].name}
                      </h4>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Ưu điểm:</strong>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {(verdictData.prosA || []).map((pro, idx) => <li key={idx}>{pro}</li>)}
                        </ul>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Nhược điểm:</strong>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                          {(verdictData.consA || []).map((con, idx) => <li key={idx}>{con}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Tool B */}
                    <div>
                      <h4 style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 700, fontSize: '1.1rem' }}>
                        {tools[1].title || tools[1].name}
                      </h4>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Ưu điểm:</strong>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {(verdictData.prosB || []).map((pro, idx) => <li key={idx}>{pro}</li>)}
                        </ul>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Nhược điểm:</strong>
                        <ul style={{ paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                          {(verdictData.consB || []).map((con, idx) => <li key={idx}>{con}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: `minmax(150px, 200px) repeat(${tools.length}, 1fr)`,
            gap: '1rem'
          }}>
            {/* Headers */}
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              Tiêu chí
            </div>
            {tools.map(tool => (
              <div key={tool.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                {tool.imageUrl ? (
                  <img src={tool.imageUrl} alt={tool.title} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', margin: '0 auto 1rem auto' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--surface-active)', margin: '0 auto 1rem auto' }} />
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{tool.title || tool.name}</h3>
              </div>
            ))}

            {/* Ratings */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>Đánh giá</div>
            {tools.map(tool => (
              <div key={`rating-${tool.id}`} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                <Star size={16} color="#eab308" fill="#eab308" />
                <span style={{ fontWeight: 600 }}>{tool.rating ? tool.rating.toFixed(1) : '4.5'}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  ({tool.ratingCount || Math.floor(Math.random() * 100 + 10)})
                </span>
              </div>
            ))}

            {/* Category */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>Danh mục</div>
            {tools.map(tool => (
              <div key={`cat-${tool.id}`} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                <span style={{ background: 'var(--surface-color)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.85rem' }}>
                  {tool.category || 'Khác'}
                </span>
              </div>
            ))}

            {/* Price */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>Mô hình giá</div>
            {tools.map(tool => {
              const prices = ['Miễn phí', 'Freemium', 'Trả phí'];
              const randomPrice = prices[Math.floor(Math.random() * prices.length)];
              return (
                <div key={`price-${tool.id}`} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 600 }}>
                  {randomPrice}
                </div>
              );
            })}

            {/* Description */}
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 500 }}>Mô tả ngắn</div>
            {tools.map(tool => (
              <div key={`desc-${tool.id}`} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {tool.description}
              </div>
            ))}

             {/* Action */}
             <div style={{ padding: '1rem' }}></div>
            {tools.map(tool => (
              <div key={`action-${tool.id}`} style={{ padding: '1rem', textAlign: 'center' }}>
                <a 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '100px', textDecoration: 'none', fontSize: '0.9rem' }}
                >
                  Truy cập
                </a>
              </div>
            ))}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
