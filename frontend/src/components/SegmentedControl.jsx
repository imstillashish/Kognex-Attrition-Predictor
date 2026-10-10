import React from 'react';

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="segmented-control">
      {options.map(opt => (
        <button 
          key={opt.value}
          type="button" 
          className={`segment-btn ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
