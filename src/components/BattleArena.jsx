import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Crown, Zap } from 'lucide-react';

const FloatingMech = ({ tool, isLeft, state, action }) => {
  const initialChar = (tool.title || tool.name || '?').charAt(0);
  const color = isLeft ? '#3b82f6' : '#ef4444'; // Blue vs Red
  
  // Terminal states
  const isVictory = state === 'victory';
  const isDefeat = state === 'defeat';
  const isFinishingWinner = state === 'finishing_winner';
  const isFinishingLoser = state === 'finishing_loser';

  // Combat actions
  const isClash = action === 'clash';
  const isLaserPhase = action === 'laser';
  const isSlashPhase = action === 'slash';

  // Determine animations based on role in the action
  let xAnim = 0;
  let yAnim = 0;
  let rotateAnim = 0;
  let scaleAnim = 1;
  let opacityAnim = 1;

  if (isFinishingWinner) {
    xAnim = isLeft ? [0, -40, 300] : [0, 40, -300];
    yAnim = [0, -20, 0];
    rotateAnim = isLeft ? [0, -15, 45] : [0, 15, -45];
    scaleAnim = 1.3;
  } else if (isFinishingLoser) {
    xAnim = isLeft ? [0, 20, -150] : [0, -20, 150];
    yAnim = [0, -20, 80];
    rotateAnim = isLeft ? [0, 45, -720] : [0, -45, 720];
    scaleAnim = [1, 1.5, 0];
    opacityAnim = [1, 1, 0];
  } else if (isVictory) {
    xAnim = isLeft ? 220 : -220; // Center position
    scaleAnim = 1.1;
  } else if (isDefeat) {
    xAnim = isLeft ? -100 : 100;
    yAnim = 50;
    rotateAnim = isLeft ? -90 : 90;
    scaleAnim = 0;
    opacityAnim = 0;
  } else if (isClash) {
    // Clash in the middle
    xAnim = isLeft ? [0, 150, 0] : [0, -150, 0];
    rotateAnim = isLeft ? [0, 15, 0] : [0, -15, 0];
  } else if (isLaserPhase) {
    if (isLeft) {
      // P1 (Left) shoots laser
      rotateAnim = [0, 15, 0]; // Recoil
      xAnim = [0, -20, 0];
    } else {
      // P2 (Right) gets hit/deflects
      xAnim = [0, 30, 0];
      rotateAnim = [0, -5, 0];
    }
  } else if (isSlashPhase) {
    if (!isLeft) {
      // P2 (Right) slashes
      rotateAnim = [0, -45, 45, 0];
      xAnim = [0, -30, 0];
    } else {
      // P1 (Left) takes damage
      rotateAnim = [0, -30, 30, 0];
      xAnim = [0, -20, 0];
    }
  } else {
    // Idle wobbling
    yAnim = [0, -5, 0, 5, 0];
    rotateAnim = [-2, 2, -2];
  }

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
      animate={{
        x: xAnim,
        y: yAnim,
        rotate: rotateAnim,
        scale: scaleAnim,
        opacity: opacityAnim
      }}
      transition={
        action === 'idle' && !isFinishingLoser && !isFinishingWinner && !isVictory && !isDefeat
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 1, ease: "easeInOut" }
      }
    >
      {/* The Body (Logo) */}
      <div
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
      >
        {tool.imageUrl ? (
          <img src={tool.imageUrl} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{initialChar}</span>
        )}
      </div>

      {/* Explosion Effect when losing */}
      {isFinishingLoser && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff 0%, #ef4444 40%, transparent 80%)',
            mixBlendMode: 'screen',
            zIndex: 20
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 2, 3], opacity: [1, 1, 0] }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      )}

      {/* Sparks when hit */}
      {((isLaserPhase && !isLeft) || (isSlashPhase && isLeft)) && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fff 0%, #fbbf24 30%, transparent 70%)',
            mixBlendMode: 'screen',
            zIndex: 15
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      )}

      {/* Victory Crown */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-45px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          color: '#fbbf24',
          filter: 'drop-shadow(0 0 15px #fbbf24)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        animate={{
          opacity: isVictory ? 1 : 0,
          y: isVictory ? [20, -5, 0] : 0,
          scale: isVictory ? [0, 1.5, 1.2] : 0
        }}
        transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
      >
        <Crown size={48} fill="#fbbf24" strokeWidth={1.5} />
      </motion.div>

      {/* Floating Sword / Gun */}
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
          isFinishingWinner ? {
            rotate: isLeft ? [0, -90, 90] : [0, 90, -90],
            x: isLeft ? [0, -20, 50] : [0, 20, -50],
            scale: [1, 1.5, 2],
            opacity: 1
          } : isFinishingLoser ? {
            y: 50,
            opacity: 0
          } : isVictory ? {
            rotate: isLeft ? -30 : 30,
            x: 0, y: 0, opacity: 1
          } : isDefeat ? {
            y: 100, opacity: 0
          } : isClash ? {
            rotate: isLeft ? [0, 60, 0] : [0, -60, 0]
          } : isSlashPhase && !isLeft ? {
            rotate: [0, 120, -30, 0], // Big swing
            scale: [1, 1.5, 1]
          } : isLaserPhase && isLeft ? {
            scale: [1, 1.3, 1] // Gun recoil
          } : {
            rotate: isLeft ? [0, -10, 0] : [0, 10, 0]
          }
        }
        transition={{ duration: 1 }}
      >
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

      {/* Floating Deflect Shield for P2 during Laser */}
      <AnimatePresence>
        {isLaserPhase && !isLeft && (
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '-20px',
              width: '6px',
              height: '80px',
              borderRadius: '3px',
              background: '#fff',
              border: `2px solid ${color}`,
              boxShadow: `0 0 20px ${color}, inset 0 0 10px ${color}`,
              zIndex: 7,
              transform: 'translateY(-50%)'
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      
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
          action !== 'idle' ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } 
          : isVictory ? { scale: 2, opacity: 1 }
          : isDefeat ? { opacity: 0 } : {}
        }
        transition={{ duration: 0.2, repeat: Infinity }}
      />
    </motion.div>
  );
};

export default function BattleArena({ tool1, tool2, isEvaluating, winnerId }) {
  const [phase, setPhase] = useState('fighting');
  const [combatAction, setCombatAction] = useState('idle');

  // Master Orchestration Loop
  useEffect(() => {
    let interval;
    if (isEvaluating) {
      setPhase('fighting');
      setCombatAction('clash'); // Start with a clash
      
      const actions = ['laser', 'slash', 'clash'];
      let idx = 0;
      
      interval = setInterval(() => {
        setCombatAction(actions[idx]);
        idx = (idx + 1) % actions.length;
      }, 1500); // Trigger a new action every 1.5s
    } else if (winnerId === 'draw') {
      clearInterval(interval);
      setPhase('draw');
      setCombatAction('idle');
    } else if (winnerId) {
      clearInterval(interval);
      setPhase('finishing');
      setCombatAction('idle');
      
      const timer = setTimeout(() => {
        setPhase('done');
      }, 1500);
      return () => clearTimeout(timer);
    }
    
    return () => clearInterval(interval);
  }, [isEvaluating, winnerId]);

  if (!tool1 || !tool2) return null;

  const getMechState = (mechId) => {
    if (phase === 'fighting' || phase === 'draw') return 'fighting';
    if (phase === 'finishing') return winnerId === mechId ? 'finishing_winner' : 'finishing_loser';
    if (phase === 'done') return winnerId === mechId ? 'victory' : 'defeat';
    return 'fighting';
  };

  const state1 = getMechState(tool1.id);
  const state2 = getMechState(tool2.id);

  // Health calculation
  const getHealth = (state) => {
    if (state === 'fighting' || state === 'victory' || state === 'finishing_winner') return '100%';
    return '0%';
  };

  return (
    <div 
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
    >
      {/* VS Neon Text */}
      <div style={{ 
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', 
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: isEvaluating ? 1 : 0.2,
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

      {/* Projectiles & Global Effects */}
      <AnimatePresence>
        {combatAction === 'clash' && isEvaluating && (
          <motion.div
            key="clash-explosion"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(251,191,36,0.8) 40%, rgba(251,191,36,0) 80%)',
              mixBlendMode: 'screen'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, times: [0, 0.5, 1], delay: 0.3 }} // Delay slightly for impact
          />
        )}

        {combatAction === 'laser' && isEvaluating && (
          <motion.div
            key="laser-beam"
            style={{
              position: 'absolute',
              top: '55%',
              left: '25%', // Start near Tool 1
              height: '10px',
              background: '#fff',
              boxShadow: '0 0 20px 10px #3b82f6',
              borderRadius: '5px',
              zIndex: 14,
              transformOrigin: 'left center'
            }}
            initial={{ width: 0, opacity: 1 }}
            animate={{ width: ['0%', '50%', '0%'], x: ['0%', '0%', '100%'] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        )}

        {combatAction === 'slash' && isEvaluating && (
          <motion.div
            key="crescent-slash"
            style={{
              position: 'absolute',
              top: '40%',
              right: '25%', // Start near Tool 2
              width: '60px',
              height: '120px',
              borderRight: '15px solid #fff',
              borderTopRightRadius: '100px',
              borderBottomRightRadius: '100px',
              filter: 'drop-shadow(0 0 15px #ef4444)',
              zIndex: 14,
            }}
            initial={{ x: 0, scale: 0.5, opacity: 0, rotate: 180 }}
            animate={{ x: -400, scale: 1.5, opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "linear" }}
          />
        )}
      </AnimatePresence>

      {/* Finishing Slash Effect (Global) */}
      {phase === 'finishing' && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '400px',
            height: '8px',
            background: '#fff',
            borderRadius: '10px',
            boxShadow: `0 0 30px 10px ${winnerId === tool1.id ? '#3b82f6' : '#ef4444'}`, 
            zIndex: 30,
          }}
          initial={{ scaleX: 0, opacity: 1, rotate: winnerId === tool1.id ? 30 : -30, x: '-50%', y: '-50%' }}
          animate={{ scaleX: [0, 1, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.5, delay: 0.4 }} 
        />
      )}

      {/* Player 1 */}
      <div style={{ paddingBottom: '60px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <FloatingMech tool={tool1} isLeft={true} state={state1} action={combatAction} />
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
        <FloatingMech tool={tool2} isLeft={false} state={state2} action={combatAction} />
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
    </div>
  );
}
