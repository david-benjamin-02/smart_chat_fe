import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AudioRecorder = ({ onSendAudio, onTranscription, setResetRef, onRecordingStatusChange, setIsTranscribing, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Expose a reset method to parent
  useEffect(() => {
    if (setResetRef) {
      setResetRef(() => stopRecordingAndReset);
    }
  }, [setResetRef]);

  const stopRecordingAndReset = () => {
    if (onRecordingStatusChange) onRecordingStatusChange(false); // ✅ ensure reset updates parent
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };



  const handleMicClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsRecording(false);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // const audioUrl = URL.createObjectURL(audioBlob);

          // if (onSendAudio) onSendAudio(audioUrl);

          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          try {
            setIsTranscribing(true); // ✅ START
            const response = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/utils/speech-to-text`, {
              method: 'POST',
              body: formData,
            });

            const result = await response.json();
            if (onTranscription) {
              onTranscription(result.corrected_text || result.original_text || '');
            }
          } catch (error) {
            console.error('Transcription API error:', error);
          } finally {
            setIsTranscribing(false); // ✅ END
          }
        };



        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        if (onRecordingStatusChange) onRecordingStatusChange(true);
      } catch (error) {
        console.error('Microphone access error:', error);
      }
    } else {
      stopRecordingAndReset();
    }
  };

  return (
    <button
      onClick={handleMicClick}
      disabled={disabled}
      style={{ fontSize: '1.5rem', border: 'none', background: 'transparent', marginRight: '0.5rem', opacity: disabled ? 0.5 : 1 }}
      title={isRecording ? 'Stop Recording' : 'Start Recording'}
    >
      <i className={`bi ${isRecording ? 'bi-mic-fill' : 'bi-mic'}`} style={{ color: isRecording ? 'red' : 'black' }}></i>
    </button>
  );
};

export default AudioRecorder;
