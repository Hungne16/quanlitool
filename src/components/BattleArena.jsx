import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Flame } from 'lucide-react';

const FloatingMech = ({ tool, isLeft }) => {
  const initialChar = (tool.title || tool.name || '?').charAt(0);
  const color = isLeft ? '#3b82f6' : '#ef4444'; // Blue vs Red
  
  return (
    <motion.div 
      style={{
        position: 'relative',
        width: '140px',
        height: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        filter: `drop-shadow(0 0 15px ${color}66)`
      }}
      animate={{
        x: isLeft ? [0, 100, -30, 0] : [0, -100, 30, 0], // The Dash & Recoil
        y: [0, -20, 10, 0], // The Jump
        rotate: isLeft ? [0, 15, -5, 0] : [0, -15, 5, 0] // Tilt forward when attacking
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.4, 0.6, 1] // Attack happens at 0.4s
      }}
    >
      {/* The Body (Logo) */}
      <motion.div 
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'var(--surface-color)',
          border: `3px solid ${color}`,
          boxShadow: `inset 0 0 20px rgba(255,255,255,0.5), 0 0 20px ${color}88`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
          position: 'relative'
        }}
        animate={{ y: [0, -5, 0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {tool.imageUrl ? (
          <img src={tool.imageUrl} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{initialChar}</span>
        )}
      </motion.div>

      {/* Floating Hand & Sword */}
      <motion.div 
        style={{
          position: 'absolute',
          top: '50%',
          [isLeft ? 'left' : 'right']: '70px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 15px ${color}, inset 0 0 10px white`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 6,
          transformOrigin: isLeft ? 'left center' : 'right center'
        }}
        animate={{
          rotate: isLeft ? [0, -90, 60, 0] : [0, 90, -60, 0],
          x: isLeft ? [0, 20, -10, 0] : [0, -20, 10, 0] // Hand thrusts forward
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.3, 0.5, 1]
        }}
      >
        {/* Energy Sword */}
        <div style={{ 
          position: 'absolute',
          top: '50%',
          [isLeft ? 'left' : 'right']: '50%',
          width: '80px',
          height: '6px',
          background: '#fff',
          borderRadius: '10px',
          boxShadow: `0 0 15px 5px ${color}`,
          transformOrigin: isLeft ? 'left center' : 'right center',
          transform: isLeft ? 'translateY(-50%)' : 'translateY(-50%) rotate(180deg)',
          zIndex: -1
        }} />
      </motion.div>
      
      {/* Jetpack thruster effect */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20px',
          [isLeft ? 'left' : 'right']: '10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: color,
          filter: 'blur(8px)',
          opacity: 0.8,
          zIndex: 2
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 0.2, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default function BattleArena({ tool1, tool2 }) {
  if (!tool1 || !tool2) return null;

  return (
    <motion.div 
      style={{
        width: '100%',
        height: '280px',
        background: 'radial-gradient(circle at center, #1e1e2e 0%, #0f0f16 100%)',
        borderRadius: '24px',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid #2a2a3e',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '0 15%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 0 60px rgba(0,0,0,0.5)'
      }}
      animate={{
        // Screen shake effect on impact (0.4s mark of a 2s loop)
        x: [0, 0, -5, 5, -2, 2, 0, 0],
        y: [0, 0, 3, -3, 2, -2, 0, 0]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        times: [0, 0.38, 0.4, 0.42, 0.45, 0.48, 0.5, 1]
      }}
    >
      {/* Cyberpunk Grid Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
        opacity: 0.5,
        zIndex: 1
      }} />

      {/* VS Neon Text */}
      <div style={{ 
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', 
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <h1 style={{ 
          fontSize: '6rem', margin: 0, fontWeight: 900, fontStyle: 'italic', 
          color: 'transparent',
          WebkitTextStroke: '2px rgba(255,255,255,0.1)',
          textShadow: '0 0 30px rgba(255,255,255,0.1)'
        }}>VS</h1>
      </div>
      
      {/* Fake Health Bars */}
      <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ width: '40%', height: '8px', background: '#3b82f644', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
        </div>
        <div style={{ width: '40%', height: '8px', background: '#ef444444', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', height: '100%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
        </div>
      </div>

      {/* Clash Explosion & Shockwave */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 15,
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(251,191,36,0.8) 40%, rgba(251,191,36,0) 80%)',
          mixBlendMode: 'screen'
        }}
        animate={{
          scale: [0, 0, 1.5, 0],
          opacity: [0, 0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          times: [0, 0.38, 0.4, 0.6] // Explosion exactly at impact (0.4s)
        }}
      />
      
      {/* Shockwave Ring */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 14,
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '4px solid #fff',
          boxShadow: '0 0 20px #fbbf24, inset 0 0 20px #fbbf24'
        }}
        animate={{
          scale: [0, 0, 1, 2],
          opacity: [0, 0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          times: [0, 0.38, 0.4, 0.7]
        }}
      />

      {/* Player 1 */}
      <div style={{ paddingBottom: '60px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FloatingMech tool={tool1} isLeft={true} />
        <div style={{ 
          marginTop: '1.5rem', fontWeight: 900, fontSize: '1.2rem', 
          color: '#fff', textShadow: '0 0 10px #3b82f6', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          {tool1.title || tool1.name}
        </div>
      </div>

      {/* Player 2 */}
      <div style={{ paddingBottom: '60px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FloatingMech tool={tool2} isLeft={false} />
        <div style={{ 
          marginTop: '1.5rem', fontWeight: 900, fontSize: '1.2rem', 
          color: '#fff', textShadow: '0 0 10px #ef4444', textTransform: 'uppercase', letterSpacing: '1px'
        }}>
          {tool2.title || tool2.name}
        </div>
      </div>
    </motion.div>
  );
}
