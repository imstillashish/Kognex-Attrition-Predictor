import React, { useState, useEffect } from 'react';

const ANIMATIONS = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  braille: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
  blocks: ['▖', '▘', '▝', '▗'],
  pulse: ['█', '▓', '▒', '░', '▒', '▓']
};

export function UnicodeAnimation({ type = 'braille', text = '', interval = 80 }) {
  const [frame, setFrame] = useState(0);
  const frames = ANIMATIONS[type] || ANIMATIONS.braille;

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % frames.length);
    }, interval);
    return () => clearInterval(timer);
  }, [frames.length, interval]);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontFamily: 'monospace', fontSize: '1.2em' }}>{frames[frame]}</span>
      {text && <span>{text}</span>}
    </span>
  );
}
