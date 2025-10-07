import React from 'react';
import './VoiceVisualizer.css';

export default function VoiceVisualizer({ volume }) {
  const bars = Array.from({ length: 5 });

  return (
    <div className="voice-visualizer ms-2 d-flex align-items-end">
      {bars.map((_, i) => {
        const scale = Math.max(0.2, volume / 100 + (i * 0.1));
        return (
          <div
            key={i}
            className="bar"
            style={{
              transform: `scaleY(${scale})`,
              transition: 'transform 0.1s ease',
              height: '20px',
              width: '4px',
              margin: '0 2px',
            }}
          />
        );
      })}
    </div>
  );
}
