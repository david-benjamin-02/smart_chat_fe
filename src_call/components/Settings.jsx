// src/components/Settings.js

import React, { useState } from 'react';
import './Settings.css';
import { useNavigate, useLocation } from 'react-router-dom';

const Settings = () => {
  const [sendingLang, setSendingLanguage] = useState('None');
  const [receivingLang, setReceivingLanguage] = useState('None');
  const [chatFormat, setChatFormat] = useState('None');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSave = async () => {
    console.log("Save button clicked");  // <-- Add this

    const uid = location.state?.uid || localStorage.getItem("uid");
    if (!uid) {
      alert("User UID not found.");
      return;
    }

    const payload = {
      uid: uid,
      sender_lang: sendingLang,
      receiver_lang: receivingLang,
      message_format: chatFormat,
    };

    console.log("Payload to be sent:", payload);  // <-- Add this too

    try {
      const res = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/update-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update settings");
      }

      const data = await res.json();
      console.log("Settings updated:", data.message);
      alert("Settings saved successfully!");

      // Optional: Navigate or do something after save
      // navigate('/some-path');
      navigate('/');

    } catch (err) {
      console.error("Error updating settings:", err);
      alert(err.message);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h2 className="settings-header">Default Settings</h2>

        <label className="settings-label">Sending Language</label>
        <select
          value={sendingLang}
          onChange={(e) => setSendingLanguage(e.target.value)}
          className="settings-select"
        >
          <option value="None">None</option>
          <option value="ta">Tamil</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>

        <label className="settings-label">Receiving Language</label>
        <select
          value={receivingLang}
          onChange={(e) => setReceivingLanguage(e.target.value)}
          className="settings-select"
        >
          <option value="None">None</option>
          <option value="ta">Tamil</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>

        <h3 className="settings-subheader">Chat Format</h3>

        <label className="settings-label">Receiving Format</label>
        <select
          value={chatFormat}
          onChange={(e) => setChatFormat(e.target.value)}
          className="settings-select"
        >
          <option value="None">None</option>
          <option value="Text">Text</option>
          <option value="Audio">Audio</option>
        </select>

        <button onClick={handleSave} className="settings-button">
          Save
        </button>
      </div>
    </div>
  );
};

export default Settings;
