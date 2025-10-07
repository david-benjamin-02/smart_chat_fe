import React, { useEffect, useRef, useState } from 'react';
import '../App.css';
import WaveSurfer from 'wavesurfer.js';

const WaveformPlayer = ({ audioUrl }) => {
  const containerRef = useRef(null);
  const waveSurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [isReady, setIsReady] = useState(false);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = ''; // Clear previous waveform

    const waveSurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#d9dcff',
      progressColor: '#007bff',
      height: 40,
      barWidth: 2,
      responsive: true,
      cursorColor: '#007bff',
      cursorWidth: 1,
    });

    waveSurferRef.current = waveSurfer;
    waveSurfer.load(audioUrl);

    const interval = setInterval(() => {
      if (waveSurferRef.current?.isPlaying()) {
        setCurrentTime(formatTime(waveSurferRef.current.getCurrentTime()));
      }
    }, 500);

    waveSurfer.on('ready', () => {
      setIsReady(true); // ✅ mark as safe to destroy
      setCurrentTime('00:00');
    });

    waveSurfer.on('seek', () => {
      setCurrentTime(formatTime(waveSurfer.getCurrentTime()));
    });

    waveSurfer.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(formatTime(waveSurfer.getDuration()));
    });

    return () => {
      clearInterval(interval);
      // ✅ Only destroy if audio is fully loaded
      try {
        if (isReady && waveSurfer && waveSurfer.destroy) {
          waveSurfer.destroy();
        } else {
          waveSurfer.unAll(); // safer alternative
        }
      } catch (err) {
        console.warn("Safe cleanup failed:", err);
      }
    };
  }, [audioUrl, isReady]);

  const togglePlay = () => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.playPause();
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="d-flex align-items-center justify-content-between" style={{ width: '100%', minWidth: '220px' }}>
      <button
        className="btn btn-sm btn-purple border me-2"
        onClick={togglePlay}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`} />
      </button>

      <div
        ref={containerRef}
        style={{
          flexGrow: 1,
          minWidth: '140px',
          height: '40px',
          overflow: 'hidden',
        }}
      />

      <div className="ms-2" style={{ fontSize: '0.75rem', color: '#212529BF', minWidth: '40px', textAlign: 'right' }}>
        {currentTime}
      </div>
    </div>
  );
};

export default WaveformPlayer;
