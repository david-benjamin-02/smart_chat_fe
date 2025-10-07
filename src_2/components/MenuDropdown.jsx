import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const MenuDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const menuRef = useRef();

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={menuRef}>
      <button
        className="btn btn-light"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Menu"
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>

      {showDropdown && (
        <div className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', top: '100%', right: 0 }}>
          <button className="dropdown-item" onClick={() => alert('Contact Book clicked')}>
            📇 Contact Book
          </button>
          <button className="dropdown-item" onClick={() => alert('Settings clicked')}>
            ⚙️ Settings
          </button>
          <button className="dropdown-item text-danger" onClick={() => alert('Logged out')}>
            🔓 Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
