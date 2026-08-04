import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, MinusCircle, Star } from 'lucide-react';

export default function ComparisonModal({ isOpen, onClose, tools }) {
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
            background: 'var(--bg-panel)',
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

          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>
            So sánh Công cụ
          </h2>

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
