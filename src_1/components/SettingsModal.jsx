import React, { useState } from 'react';
import './SettingsModal.css';

export default function SettingsModal({ show, onClose, settings, onSave }) {
  const [activeTab, setActiveTab] = useState('language');
  const [sendingLang, setSendingLang] = useState(settings.sendingLang || 'English');
  const [receivingLang, setReceivingLang] = useState(settings.receivingLang || 'English');
  const [chatFormat, setChatFormat] = useState(settings.chatFormat || 'Text');

  const handleSave = async () => {
    const uid = localStorage.getItem("uid");

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

      onSave({ sendingLang, receivingLang, chatFormat }); // optional callback
      // onClose(); // close the modal

    } catch (err) {
      console.error("Error updating settings:", err);
      alert(err.message);
    }
  };


  if (!show) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-left">
          <button className={`tab-btn ${activeTab === 'language' ? 'active' : ''}`} onClick={() => setActiveTab('language')}>
            Default Language
          </button>
          <button className={`tab-btn ${activeTab === 'format' ? 'active' : ''}`} onClick={() => setActiveTab('format')}>
            Chat Format
          </button>
        </div>

        <div className="settings-right">
          {activeTab === 'language' && (
            <div>
              <h5>Sending Language</h5>
              <select value={sendingLang} onChange={(e) => setSendingLang(e.target.value)}>
                <option value="None">None</option>
                <option value="ta">Tamil</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>

              <h5 className="mt-3">Receiving Language</h5>
              <select value={receivingLang} onChange={(e) => setReceivingLang(e.target.value)}>
                <option value="None">None</option>
                <option value="ta">Tamil</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          )}

          {activeTab === 'format' && (
            <div>
              <h5>Receiving Chat Format Mode</h5>
              <select value={chatFormat} onChange={(e) => setChatFormat(e.target.value)}>
                <option value="None">None</option>
                <option value="Text">Text</option>
                <option value="Audio">Audio</option>
              </select>
            </div>
          )}

          <button className="btn-save" onClick={handleSave}>Save</button>
        </div>

        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}
