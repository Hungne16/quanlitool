import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Zap } from 'lucide-react';

const StickFigure = ({ tool, isLeft }) => {
  // Determine fallbacks if logo is missing
  const initialChar = (tool.title || tool.name || '?').charAt(0);
  
  return (
    <motion.div 
      style={{
        position: 'relative',
        width: '120px',
        height: '160px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 10
      }}
      animate={{
        x: isLeft ? [0, 80, -20, 0] : [0, -80, 20, 0],
        y: [0, -40, 0, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 0.5
      }}
    >
      {/* The Body (Logo) */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'white',
        border: '3px solid var(--border-color)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        position: 'relative'
      }}>
        {tool.imageUrl ? (
          <img src={tool.imageUrl} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '2rem', fontWeight: 900, color: '#6454a8' }}>{initialChar}</span>
        )}
      </div>

      {/* Arm & Sword */}
      <motion.div 
        style={{
          position: 'absolute',
          top: '32px', // Middle of the body
          [isLeft ? 'left' : 'right']: '60px', // Extend out
          width: '50px',
          height: '4px',
          background: 'var(--text-primary)', // The arm line
          transformOrigin: isLeft ? 'left center' : 'right center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isLeft ? 'flex-end' : 'flex-start',
          zIndex: 4
        }}
        animate={{
          rotate: isLeft ? [0, -45, 45, 0] : [0, 45, -45, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5
        }}
      >
        {/* The Sword */}
        <div style={{ 
          transform: isLeft ? 'translate(50%, -50%) rotate(45deg)' : 'translate(-50%, -50%) rotate(-45deg) scaleX(-1)', 
          color: isLeft ? '#3b82f6' : '#ef4444' // Blue sword vs Red sword
        }}>
          <Sword size={40} strokeWidth={2.5} />
        </div>
      </motion.div>

      {/* Left Leg */}
      <motion.div 
        style={{
          position: 'absolute',
          top: '64px', // Bottom of the body
          left: '45px',
          width: '4px',
          height: '40px',
          background: 'var(--text-primary)',
          transformOrigin: 'top center',
          zIndex: 4
        }}
        animate={{
          rotate: isLeft ? [0, 30, -20, 0] : [0, -30, 20, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5
        }}
      />

      {/* Right Leg */}
      <motion.div 
        style={{
          position: 'absolute',
          top: '64px', // Bottom of the body
          right: '45px',
          width: '4px',
          height: '40px',
          background: 'var(--text-primary)',
          transformOrigin: 'top center',
          zIndex: 4
        }}
        animate={{
          rotate: isLeft ? [0, -30, 20, 0] : [0, 30, -20, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5
        }}
      />
    </motion.div>
  );
};

export default function BattleArena({ tool1, tool2 }) {
  if (!tool1 || !tool2) return null;

  return (
    <div style={{
      width: '100%',
      height: '250px',
      background: 'linear-gradient(to bottom, var(--bg-secondary) 0%, var(--bg-panel) 100%)',
      borderRadius: '20px',
      marginBottom: '2rem',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: '0 10%',
      boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.1)'
    }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.1, zIndex: 1 }}>
        <h1 style={{ fontSize: '10rem', margin: 0, fontWeight: 900, fontStyle: 'italic', color: 'var(--text-primary)' }}>VS</h1>
      </div>
      
      {/* Floor line */}
      <div style={{ position: 'absolute', bottom: '40px', left: 0, width: '100%', height: '2px', background: 'var(--border-highlight)', opacity: 0.5, zIndex: 2 }} />

      {/* Clash Sparkles */}
      <motion.div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 15,
          color: '#fbbf24'
        }}
        animate={{
          scale: [0, 2, 0, 0],
          opacity: [0, 1, 0, 0],
          rotate: [0, 180, 360, 360]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5,
          times: [0, 0.5, 0.6, 1] // Synced with the clash
        }}
      >
        <Zap size={64} fill="#fbbf24" />
      </motion.div>

      {/* Player 1 */}
      <div style={{ paddingBottom: '40px', zIndex: 10 }}>
        <StickFigure tool={tool1} isLeft={true} />
        <div style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 800, fontSize: '1.2rem', color: '#3b82f6', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          {tool1.title || tool1.name}
        </div>
      </div>

      {/* Player 2 */}
      <div style={{ paddingBottom: '40px', zIndex: 10 }}>
        <StickFigure tool={tool2} isLeft={false} />
        <div style={{ textAlign: 'center', marginTop: '1rem', fontWeight: 800, fontSize: '1.2rem', color: '#ef4444', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          {tool2.title || tool2.name}
        </div>
      </div>
    </div>
  );
}
