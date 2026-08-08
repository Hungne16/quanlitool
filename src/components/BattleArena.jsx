import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Zap, Shield, Crown } from 'lucide-react';

const FloatingMech = ({ tool, isLeft, state }) => {
  const initialChar = (tool.title || tool.name || '?').charAt(0);
  const color = isLeft ? '#3b82f6' : '#ef4444'; // Blue vs Red
  
  // Animation states
  const isFighting = state === 'fighting';
  const isVictory = state === 'victory';
  const isDefeat = state === 'defeat';

  return (
    <motion.div 
      style={{
        position: 'relative',
        width: '140px',
        height: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: isVictory ? 20 : 10,
        filter: isDefeat ? 'grayscale(100%)' : `drop-shadow(0 0 15px ${color}66)`
      }}
      animate={
        isFighting ? {
          x: isLeft ? [0, 100, -30, 0] : [0, -100, 30, 0],
          y: [0, -20, 10, 0],
          rotate: isLeft ? [0, 15, -5, 0] : [0, -15, 5, 0],
          opacity: 1,
          scale: 1
        } : isVictory ? {
          x: isLeft ? 100 : -100, // Move to center
          y: -20, // Lowered from -50 to avoid clipping
          rotate: 0,
          scale: 1.2, // Slightly smaller to fit sword
          opacity: 1
        } : { // defeat
          x: isLeft ? -50 : 50,
          y: 100, // Fall down
          rotate: isLeft ? -90 : 90, // Fall over
          opacity: 0,
          scale: 0.5
        }
      }
      transition={
        isFighting ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.4, 0.6, 1]
        } : {
          duration: 1,
          ease: "easeInOut"
        }
      }
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
        animate={isFighting ? { y: [0, -5, 0, 5, 0] } : { y: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {tool.imageUrl ? (
          <img src={tool.imageUrl} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{initialChar}</span>
        )}
      </motion.div>

      {/* Victory Crown */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-35px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          color: '#fbbf24',
          filter: 'drop-shadow(0 0 10px #fbbf24)'
        }}
        animate={{
          opacity: isVictory ? 1 : 0,
          y: isVictory ? [10, 0] : 0,
          scale: isVictory ? [0.5, 1.2, 1] : 0.5
        }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Crown size={40} fill="#fbbf24" strokeWidth={1.5} />
      </motion.div>

      {/* Floating Hand & Sword (Only if not defeated) */}
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
        animate={
          isFighting ? {
            rotate: isLeft ? [0, -90, 60, 0] : [0, 90, -60, 0],
            x: isLeft ? [0, 20, -10, 0] : [0, -20, 10, 0],
            opacity: 1
          } : isVictory ? {
            rotate: isLeft ? -30 : 30, // Victory pose (flatter angle)
            x: 0,
            y: 0, // Lowered
            opacity: 1
          } : { // defeat
            y: 100, // Drop sword
            opacity: 0
          }
        }
        transition={isFighting ? { duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.5, 1] } : { duration: 0.5 }}
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

      {/* Floating Shield (New) */}
      <motion.div
        style={{
          position: 'absolute',
          top: '30%',
          [isLeft ? 'right' : 'left']: '50px',
          width: '30px',
          height: '40px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.2)',
          border: `2px solid ${color}`,
          boxShadow: `0 0 15px ${color}, inset 0 0 10px ${color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 7,
          backdropFilter: 'blur(4px)'
        }}
        animate={
          isFighting ? {
            x: isLeft ? [0, -10, 5, 0] : [0, 10, -5, 0],
            opacity: 0.8
          } : isVictory ? {
            opacity: 0 // Winner hides shield for pose
          } : { // defeat
            y: 100, // Drop shield
            opacity: 0
          }
        }
        transition={isFighting ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
      >
        <Shield size={20} color="#fff" strokeWidth={2} />
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
        animate={
          isFighting ? {
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          } : isVictory ? {
            scale: 2, opacity: 1 // Huge blast
          } : { // defeat
            opacity: 0 // Thruster dies
          }
        }
        transition={isFighting ? { duration: 0.2, repeat: Infinity } : { duration: 0.5 }}
      />
    </motion.div>
  );
};

export default function BattleArena({ tool1, tool2, isEvaluating, winnerId }) {
  if (!tool1 || !tool2) return null;

  const getMechState = (mechId) => {
    if (isEvaluating || winnerId === null || winnerId === undefined) return 'fighting';
    if (winnerId === 'draw') return 'fighting'; // Keeps fighting forever
    if (winnerId === mechId) return 'victory';
    return 'defeat';
  };

  const state1 = getMechState(tool1.id);
  const state2 = getMechState(tool2.id);

  // Health calculation
  const getHealth = (state) => {
    if (state === 'fighting' || state === 'victory') return '100%';
    return '0%';
  };

  const isCombatActive = state1 === 'fighting' && state2 === 'fighting';

  return (
    <motion.div 
      style={{
        width: '100%',
        height: '320px',
        backgroundImage: 'url(/arena-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
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
      animate={
        isCombatActive ? {
          x: [0, 0, -5, 5, -2, 2, 0, 0],
          y: [0, 0, 3, -3, 2, -2, 0, 0]
        } : { x: 0, y: 0 }
      }
      transition={isCombatActive ? {
        duration: 2,
        repeat: Infinity,
        times: [0, 0.38, 0.4, 0.42, 0.45, 0.48, 0.5, 1]
      } : {}}
    >
      {/* VS Neon Text */}
      <div style={{ 
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', 
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: isCombatActive ? 1 : 0.2, // Fade out VS text when match ends
        transition: 'opacity 1s ease'
      }}>
        <h1 style={{ 
          fontSize: '6rem', margin: 0, fontWeight: 900, fontStyle: 'italic', 
          color: 'transparent',
          WebkitTextStroke: '2px rgba(255,255,255,0.1)',
          textShadow: '0 0 30px rgba(255,255,255,0.1)'
        }}>VS</h1>
      </div>
      
      {/* Fake Health Bars */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ width: '45%', height: '12px', background: '#3b82f644', borderRadius: '6px', overflow: 'hidden' }}>
          <motion.div 
            style={{ height: '100%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} 
            animate={{ width: getHealth(state1) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div style={{ width: '45%', height: '12px', background: '#ef444444', borderRadius: '6px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
          <motion.div 
            style={{ height: '100%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} 
            animate={{ width: getHealth(state2) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
      
      {/* Match Status Text */}
      <div style={{ position: 'absolute', top: '45px', width: '100%', textAlign: 'center', zIndex: 10 }}>
        {isEvaluating ? (
          <span style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 10px #fbbf24' }}>
            Trọng tài AI đang phân tích...
          </span>
        ) : winnerId === 'draw' ? (
          <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
            Bất phân thắng bại!
          </span>
        ) : winnerId ? (
          <span style={{ color: '#10b981', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 10px #10b981' }}>
            K.O!
          </span>
        ) : null}
      </div>

      {/* Clash Explosion & Shockwave (Only when fighting) */}
      {isCombatActive && (
        <>
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
        </>
      )}

      {/* Player 1 */}
      <div style={{ paddingBottom: '60px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FloatingMech tool={tool1} isLeft={true} state={state1} />
        <motion.div 
          style={{ 
            marginTop: '1.5rem', fontWeight: 900, fontSize: '1.2rem', 
            color: '#fff', textShadow: '0 0 10px #3b82f6', textTransform: 'uppercase', letterSpacing: '1px'
          }}
          animate={{ opacity: state1 === 'defeat' ? 0.3 : 1 }}
        >
          {tool1.title || tool1.name}
        </motion.div>
      </div>

      {/* Player 2 */}
      <div style={{ paddingBottom: '60px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FloatingMech tool={tool2} isLeft={false} state={state2} />
        <motion.div 
          style={{ 
            marginTop: '1.5rem', fontWeight: 900, fontSize: '1.2rem', 
            color: '#fff', textShadow: '0 0 10px #ef4444', textTransform: 'uppercase', letterSpacing: '1px'
          }}
          animate={{ opacity: state2 === 'defeat' ? 0.3 : 1 }}
        >
          {tool2.title || tool2.name}
        </motion.div>
      </div>
    </motion.div>
  );
}
