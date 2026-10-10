import React from 'react';
import { motion } from 'framer-motion';

export const AuroraBackground = ({ children, className = '' }) => {
  return (
    <div
      className={`aurora-bg-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100dvh',
        backgroundColor: '#050505',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden'
        }}
      >
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 20,
            ease: 'linear',
            repeat: Infinity,
          }}
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(-45deg, rgba(175, 80, 255, 0.05) 0%, rgba(0,0,0,0) 30%, rgba(175, 80, 255, 0.1) 60%, rgba(0,0,0,0) 100%)',
            backgroundSize: '400% 400%',
            filter: 'blur(80px)',
            opacity: 0.8,
          }}
        />
        <motion.div
          animate={{
            backgroundPosition: ['100% 50%', '0% 50%', '100% 50%'],
          }}
          transition={{
            duration: 25,
            ease: 'linear',
            repeat: Infinity,
          }}
          style={{
            position: 'absolute',
            top: '-30%',
            left: '-30%',
            width: '160%',
            height: '160%',
            background: 'linear-gradient(45deg, rgba(70, 0, 150, 0.05) 0%, rgba(0,0,0,0) 40%, rgba(70, 0, 150, 0.15) 70%, rgba(0,0,0,0) 100%)',
            backgroundSize: '300% 300%',
            filter: 'blur(100px)',
            opacity: 0.6,
          }}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};
