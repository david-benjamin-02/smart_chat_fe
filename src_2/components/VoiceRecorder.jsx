// import React, { useState, useRef } from 'react';
// import './VoiceRecorder.css';

// export default function VoiceRecorder({ onSendAudio }) {
//   const [recording, setRecording] = useState(false);
//   const [locked, setLocked] = useState(false);
//   const [startY, setStartY] = useState(null);
//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);

//       mediaRecorderRef.current.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           chunksRef.current.push(e.data);
//         }
//       };

//       mediaRecorderRef.current.onstop = () => {
//         const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
//         const audioURL = URL.createObjectURL(blob);
//         onSendAudio(audioURL); // Send blob URL to parent
//         chunksRef.current = [];
//       };

//       mediaRecorderRef.current.start();
//       console.log('🎙️ Started recording');
//     } catch (err) {
//       console.error('Microphone access denied or error:', err);
//     }
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current?.stop();
//     mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
//     setRecording(false);
//     setLocked(false);
//     setStartY(null);
//   };

//   const handleMouseDown = (e) => {
//     setStartY(e.clientY || e.touches?.[0]?.clientY);
//     setRecording(true);
//     startRecording();
//   };

//   const handleMouseMove = (e) => {
//     if (!recording || locked) return;
//     const currentY = e.clientY || e.touches?.[0]?.clientY;
//     if (startY && startY - currentY > 50) {
//       setLocked(true);
//       console.log('🔒 Mic locked');
//     }
//   };

//   const handleMouseUp = () => {
//     if (!recording) return;
//     if (!locked) {
//       stopRecording(); // auto-send
//     } else {
//       console.log('🔒 Locked: will stop manually');
//     }
//   };

//   return (
//     <div
//       className="voice-recorder"
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onTouchStart={handleMouseDown}
//       onTouchMove={handleMouseMove}
//       onTouchEnd={handleMouseUp}
//     >
//       <i className={`bi bi-mic-fill ${recording ? 'text-danger' : ''}`}></i>
//       {recording && !locked && <div className="swipe-hint">⬆ Swipe to lock</div>}
//       {locked && <div className="locked-hint">🔒 Locked</div>}
//     </div>
//   );
// }
// import React, { useState, useEffect, useRef } from 'react';
// import './VoiceRecorder.css';

// export default function VoiceRecorder({ onSendVoiceMessage, isMicActive, setIsMicActive }) {
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [startTime, setStartTime] = useState(null);
//   const [elapsed, setElapsed] = useState(0);
//   const timerRef = useRef(null);
//   const chunksRef = useRef([]);
//   const streamRef = useRef(null);

//   useEffect(() => {
//     if (isMicActive) {
//       timerRef.current = setInterval(() => {
//         setElapsed(Math.floor((Date.now() - startTime) / 1000));
//       }, 1000);
//     } else {
//       clearInterval(timerRef.current);
//       setElapsed(0);
//     }
//   }, [isMicActive, startTime]);

//   const formatTime = (sec) => {
//     const m = String(Math.floor(sec / 60)).padStart(2, '0');
//     const s = String(sec % 60).padStart(2, '0');
//     return `${m}:${s}`;
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       streamRef.current = stream;
//       const recorder = new MediaRecorder(stream);
//       chunksRef.current = [];

//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) chunksRef.current.push(e.data);
//       };

//       recorder.onstop = () => {
//         const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
//         onSendVoiceMessage(blob);
//         chunksRef.current = [];
//       };

//       recorder.start();
//       setStartTime(Date.now());
//       setMediaRecorder(recorder);
//       setIsMicActive(true);
//     } catch (err) {
//       console.error('Microphone access denied:', err);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder && mediaRecorder.state === 'recording') {
//       mediaRecorder.stop();
//     }
//     streamRef.current?.getTracks().forEach((track) => track.stop());
//     setIsMicActive(false);
//   };

//   return (
//     <div className="d-flex align-items-center">
//       {!isMicActive ? (
//         <button className="btn btn-danger" onClick={startRecording}>
//           <i className="bi bi-mic-fill fs-5" />
//         </button>
//       ) : (
//         <div className="d-flex align-items-center bg-light px-3 py-2 rounded border">
//           <div className="dot-animation me-2"></div>
//           <span className="me-3 fw-bold">{formatTime(elapsed)}</span>
//           <button className="btn btn-success" onClick={stopRecording}>
//             <i className="bi bi-send-fill" />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
