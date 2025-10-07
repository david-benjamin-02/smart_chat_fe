import React, { useRef, useState, useEffect } from 'react';
import './FilePicker.css';
export default function FilePicker({ onFileSelect, disabled =false}) {
  const inputRef = useRef();
  const wrapperRef = useRef();
  const [fileType, setFileType] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    setShowDropdown(false);
  };
  const handleClick = (type) => {
    setFileType(type);
    setShowDropdown(false);
    inputRef.current.value = null;
    setTimeout(() => inputRef.current.click(), 100);
  };
  // :key: Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="filepicker-wrapper me-2 position-relative" ref={wrapperRef}>
      <button
        className="btn p-0 border-0 bg-transparent"
        onClick={() => !disabled && setShowDropdown(prev => !prev)}
        type="button"
        disabled={disabled}
      >
        <span className="filepicker-icon">
          <i className="bi bi-paperclip"></i>
        </span>
      </button>
      {showDropdown && (
        <div className="filepicker-dropdown upward">
          <div onClick={() => handleClick('image/*')}>
            <i className="bi bi-image me-2"></i>Photo
          </div>
          <div onClick={() => handleClick('video/*')}>
            <i className="bi bi-camera-video me-2"></i>Video
          </div>
          <div onClick={() => handleClick('audio/*')}>
            <i className="bi bi-file-earmark-music me-2"></i>Audio
          </div>
          <div onClick={() => handleClick('.pdf,.doc,.docx,.txt')}>
            <i className="bi bi-file-earmark me-2"></i>Document
          </div>
        </div>
      )}
      <input
        type="file"
        accept={fileType}
        ref={inputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}