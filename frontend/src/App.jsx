import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from 'pixelarticons/react/Analytics';
import { Users } from 'pixelarticons/react/Users';
import { Grid3x3 } from 'pixelarticons/react/Grid3x3';
import { Cpu } from 'pixelarticons/react/Cpu';
import { SinglePredictor } from './components/SinglePredictor';
import { BatchPredictor } from './components/BatchPredictor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AuroraBackground } from './components/reactbits/AuroraBackground';
import { SplitText } from './components/reactbits/SplitText';
import './index.css';
import { Agentation } from 'agentation';

function NavBar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'single', label: 'Single Profile', icon: <Users size={16} /> },
    { id: 'batch', label: 'Batch Analysis', icon: <Grid3x3 size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <Analytics size={16} /> }
  ];

  return (
    <nav className="nav-frosted">
      <div style={{
        fontWeight: 600,
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'var(--color-almost-white)',
        letterSpacing: '-0.02em'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--color-signal-violet)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(175, 80, 255, 0.3)'
        }}>
          <Cpu size={18} color="white" />
        </div>
        Kognex
      </div>
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: 'var(--radius-pills)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-link ${activeTab === tab.id ? 'active-tab' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-pills)',
              transition: 'all 0.2s ease',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              color: activeTab === tab.id ? 'var(--color-almost-white)' : 'var(--color-steel)',
              boxShadow: activeTab === tab.id ? '0px 2px 8px rgba(0,0,0,0.2)' : 'none',
              fontSize: '13px'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{
          padding: '6px 12px',
          borderRadius: 'var(--radius-pills)',
          background: 'rgba(175, 80, 255, 0.1)',
          border: '1px solid rgba(175, 80, 255, 0.3)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--color-signal-violet)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          AI Powered
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <AuroraBackground>
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="page-container">
        {/* Compact Header */}
        <header style={{ marginBottom: '40px', marginTop: '20px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-signal-violet)'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-signal-violet)', boxShadow: '0 0 10px var(--color-signal-violet)' }}></span>
            Predictive Retention Engine
          </motion.div>
          <SplitText 
            text="Flight-Risk AI" 
            style={{
              fontSize: '42px',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              margin: 0,
              background: 'linear-gradient(to right, #fff, #a0a0a0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          />
        </header>

        {/* Main Content */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {activeTab === 'single' && <SinglePredictor />}
              {activeTab === 'batch' && <BatchPredictor />}
              {activeTab === 'analytics' && <AnalyticsDashboard />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {process.env.NODE_ENV === "development" && <Agentation />}
    </AuroraBackground>
  );
}

export default App;