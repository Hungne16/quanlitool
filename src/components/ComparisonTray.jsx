import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRightLeft } from 'lucide-react';

export default function ComparisonTray({ compareList, onRemove, onCompareClick }) {
  if (compareList.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      exit={{ y: 100, opacity: 0, x: '-50%' }}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        background: 'var(--surface-active)',
        backdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid var(--border-highlight)',
        borderRadius: '100px',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        zIndex: 100
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          So sánh ({compareList.length}/3)
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <AnimatePresence>
          {compareList.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--card-bg)',
                padding: '0.4rem 0.75rem',
                borderRadius: '100px',
                border: '1px solid var(--border-color)'
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {tool.title || tool.name || 'Tool'}
              </span>
              <button
                onClick={() => onRemove(tool.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0, display: 'flex', alignItems: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={onCompareClick}
        disabled={compareList.length < 2}
        className="btn btn-primary"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1.25rem', borderRadius: '100px',
          opacity: compareList.length < 2 ? 0.5 : 1,
          cursor: compareList.length < 2 ? 'not-allowed' : 'pointer',
          background: 'linear-gradient(135deg, var(--accent-color), var(--color-3))',
          border: 'none',
          color: 'white',
          fontWeight: 600
        }}
      >
        <ArrowRightLeft size={16} />
        So sánh ngay
      </button>
    </motion.div>
  );
}
