
import './ContactModal.css'
import './SettingsModal.css'
import React, { useState, useRef, useEffect } from 'react';

const DropDownMenu = ({ onOpenContact, onOpenSettings }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-light"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>

      {showDropdown && (
        <div
          className="dropdown-menu show"
          style={{ right: 0, left: 'auto', top: '100%', position: 'absolute' }}
        >
          <button
            className="dropdown-item"
            onClick={() => {
              onOpenContact?.();
              setShowDropdown(false);
            }}
          >
            📇 Contact Book
          </button>
          <button
            className="dropdown-item"
            onClick={() => {
              onOpenSettings?.();
              setShowDropdown(false);
            }}
          >
            ⚙️ Settings
          </button>
          <button
            className="dropdown-item text-danger"
            onClick={() => {
              const socket = window.socketRef?.current;

              // ✅ Remove session data
              localStorage.removeItem("uid");

              // ✅ Alert user (you can do this before or after disconnect)
              alert("🔓 Logged out successfully!");

              // ✅ Close WebSocket and wait for it to disconnect before redirecting
              if (socket?.readyState === WebSocket.OPEN) {
                socket.onclose = () => {
                  console.log("🛑 WebSocket closed cleanly on logout");
                  window.location.href = "/";
                };
                socket.close();
              } else {
                console.log("Socket already closed");
                window.location.href = "/";
              }
            }}
          >
            🔓 Logout
          </button>


        </div>
      )}
    </div>
  );
};

export default DropDownMenu;
