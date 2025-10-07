import React, { useEffect, useState } from 'react';
import './VRLoader.css';

const VRLoader = () => {
  const [showV, setShowV] = useState(false);
  const [showR, setShowR] = useState(false);
  const [startRotation, setStartRotation] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowV(true), 1000);
    setTimeout(() => setShowR(true), 2000);
    setTimeout(() => setStartRotation(true), 3000);
  }, []);

  return (
    <div className="vr-loader">
      <div className="circle-wrapper">
        <div className={`rotating-border ${startRotation ? 'rotate' : ''}`}></div>
        <div className="circle-content">
          {showV && <span className="letter draw-v">V</span>}
          {showR && <span className="letter draw-r">R</span>}
        </div>
      </div>
    </div>
  );
};

export default VRLoader;
