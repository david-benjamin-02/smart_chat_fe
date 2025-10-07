import React from 'react';
import '../App.css'
const VoiceChat = ({ startRecording, stopRecording, isRecording }) => {
  return (
    <button
      className={`btn ${isRecording ? 'btn-danger' : 'btn-purple'} d-flex align-items-center justify-content-center`}
      style={{ width: "42px", height: "38px", position: "relative" }}
      onClick={isRecording ? stopRecording : startRecording}
      title={isRecording ? 'Stop Recording' : 'Start Voice Message'}
    >
      <i className={`bi ${isRecording ? 'bi-stop-fill' : 'bi-soundwave'}`} />
    </button>
  );
};

export default VoiceChat;
