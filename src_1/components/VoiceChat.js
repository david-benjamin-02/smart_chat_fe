import React from 'react';

const VoiceChat = ({ startRecording, stopRecording, isRecording }) => {
  return (
    <button
      className={`btn ${isRecording ? 'btn-danger' : 'btn-success'} d-flex align-items-center justify-content-center`}
      style={{ width: "40px", height: "40px", position: "relative" }}
      onClick={isRecording ? stopRecording : startRecording}
      title={isRecording ? 'Stop Recording' : 'Start Voice Message'}
    >
      <i className={`bi ${isRecording ? 'bi-stop-fill' : 'bi-soundwave'}`} />
    </button>
  );
};

export default VoiceChat;
