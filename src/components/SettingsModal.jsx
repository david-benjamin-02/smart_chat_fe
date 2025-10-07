import './SettingsModal.css';
import React, { useState, useEffect } from 'react';

export default function SettingsModal({ show, onClose, settings, onSave }) {
  console.log("setting", settings)
  const [activeTab, setActiveTab] = useState('language');
  const [sendingLang, setSendingLang] = useState(settings.sendingLang || 'English');
  const [receivingLang, setReceivingLang] = useState(settings.receivingLang || 'English');
  const [chatFormat, setChatFormat] = useState(settings.chatFormat || 'Text');

  useEffect(() => {
    if (show && settings) {
      setSendingLang(settings.sendingLang || 'None');
      setReceivingLang(settings.receivingLang || 'None');
      setChatFormat(settings.chatFormat || 'None');
    }
  }, [show, settings]);

  // useEffect(() => {
  //   const uid = localStorage.getItem("uid");

  //   if (show && uid) {
  //     const fetchSettings = async () => {
  //       try {
  //         const res = await fetch(`http://127.0.0.1:8000/get-settings/${uid}`);
  //         const data = await res.json();
  //         const settings = data.settings;

  //         setSendingLang(settings.sender_lang || 'None');
  //         setReceivingLang(settings.receiver_lang || 'None');
  //         setChatFormat(settings.message_format || 'None');
  //       } catch (err) {
  //         console.error("Failed to load settings:", err);
  //       }
  //     };

  //     fetchSettings();
  //   }
  // }, [show]); // depends on "show"

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
