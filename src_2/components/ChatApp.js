import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// import './App.css';
import LanguageSelector from './LanguageSelector';
import FilePicker from './FilePicker';
import SearchBar from './SearchBar';
import AudioRecorder from './AudioRecorder';
import DropDownMenu from './DropDownMenu';
import ContactModal from './ContactModal';
import SettingsModal from './SettingsModal';
const initialMessages = {
  1: [{ text: 'Hello Alice!', sender: 'me' }, { text: 'Hey there!', sender: 'them' }],
  2: [{ text: 'Yo Bob', sender: 'me' }, { text: 'What’s up?', sender: 'them' }],
  3: [{ text: 'Meeting at 5?', sender: 'me' }, { text: 'See you soon.', sender: 'them' }],
};
export default function ChatApp() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Alice', email: 'alice@example.com', lastMessage: 'Hey there!' },
    { id: 2, name: 'Bob', email: 'bob@example.com', lastMessage: 'What’s up?' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
    { id: 4, name: 'Danial', email: 'charlie@example.com', lastMessage: 'See you soon.' },
    { id: 5, name: 'Erwin', email: 'charlie@example.com', lastMessage: 'See you soon.' },
    { id: 6, name: 'Fahad', email: 'charlie@example.com', lastMessage: 'See you soon.' },
    { id: 7, name: 'Indhiran', email: 'charlie@example.com', lastMessage: 'See you soon.' },
    { id: 8, name: 'Gowtham', email: 'charlie@example.com', lastMessage: 'See you soon.' },
  ]);
  const micResetRef = useRef(null);
  const messageEndRef = useRef(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingLangConfirm, setPendingLangConfirm] = useState(false);
  const [showTranslateIcons, setShowTranslateIcons] = useState(false);
  const [isLanguageActive, setIsLanguageActive] = useState(false);
  const [currentLangCode, setCurrentLangCode] = useState('en');
  const [clearLangHighlight, setClearLangHighlight] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const clearLangHighlightRef = useRef(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [shouldTranslate, setShouldTranslate] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false); 
  // default false
  const [settings, setSettings] = useState({
    sendingLang: 'English',
    receivingLang: 'English',
    chatFormat: 'Text Mode',
  });
  const handleTranslate = async () => {
    if (!input.trim()) return;
    setIsTranslating(true);

    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/translate`, {
        method: "POST",
        body: new FormData(Object.entries({
          text: input,
          language: currentLangCode
        }).reduce((form, [k, v]) => {
          form.append(k, v);
          return form;
        }, new FormData())),
      });

      const data = await response.json();
      setInput(data.translated_text || '');
      setPendingLangConfirm(false);
      setShowTranslateIcons(false);
      if (clearLangHighlightRef.current) clearLangHighlightRef.current();
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };


  // useEffect(() => {
  //   if (messageEndRef.current) {
  //     messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [selectedContact ? messages[selectedContact?.id] : []]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedContact(null);
        setInput('');
        setShowTranslateIcons(false);
        setSelectedAttachment(null);
        if (clearLangHighlightRef.current) clearLangHighlightRef.current();
        if (micResetRef.current) micResetRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (selectedContact && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedContact, messages]);


  const handleCancelTranslate = () => {
    setShowTranslateIcons(false);
    setPendingLangConfirm(false); // ✅ clear the block
    // if (clearLangHighlightRef.current) clearLangHighlightRef.current(); // unhighlight the icon
  };

  const handleSettingsSave = (updatedSettings) => {
    setSettings(updatedSettings);
    console.log('Updated Settings:', updatedSettings);
  };
  const handleAddContact = (newContact) => {
    const newId = Math.max(...contacts.map(c => c.id)) + 1;
    const updated = [...contacts, { ...newContact, id: newId, lastMessage: '' }];
    setContacts(updated);
  };
  const handleEditContact = (id, updatedName) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, name: updatedName } : contact
    ));
  };
  const handleDeleteContact = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
    if (selectedContact?.id === id && contacts.length > 1) {
      setSelectedContact(contacts.find(c => c.id !== id));
    }
  };

  const sendMessage = () => {
    if ((!input.trim() && !selectedAttachment) || !selectedContact) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let newMessage;
    if (selectedAttachment) {
      const fileURL = URL.createObjectURL(selectedAttachment);
      const type = selectedAttachment.type;
      const name = selectedAttachment.name;

      if (type.startsWith('image/')) {
        newMessage = {
          text: <img src={fileURL} alt="img" className="img-fluid rounded" />,
          sender: 'me',
          messageType: 'Photo',
          time
        };
      } else if (type.startsWith('audio/')) {
        newMessage = {
          text: <audio controls src={fileURL} />,
          sender: 'me',
          messageType: 'Audio',
          time
        };
      } else {
        newMessage = {
          text: (
            <div>
              <i className="bi bi-file-earmark-text me-2" />
              <a href={fileURL} download={name}>{name}</a>
            </div>
          ),
          sender: 'me',
          messageType: 'Document',
          time
        };
      }
    } else {
      newMessage = {
        text: input,
        sender: 'me',
        messageType: 'Text',
        time
      };
    }

    setMessages(prev => ({
      ...prev,
      [selectedContact?.id]: [...(prev[selectedContact?.id] || []), newMessage],
    }));

    setInput('');
    setSelectedAttachment(null);
    setMessageType(null);
    setShowTranslateIcons(false);
    if (clearLangHighlightRef.current) clearLangHighlightRef.current();
  };



  return (

    <div className="container-fluid vh-100 d-flex flex-column">
      <div className="row flex-grow-1">
        {/* Sidebar */}
        <div className="col-4 border-end bg-light d-flex flex-column p-0" style={{ height: '100vh' }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h4 className="mb-0">Chats</h4>
            <DropDownMenu
              onOpenContact={() => setShowContactModal(true)}
              onOpenSettings={() => setShowSettings(true)}
            />
            <ContactModal
              show={showContactModal}
              onClose={() => setShowContactModal(false)}
              onAddContact={handleAddContact}
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
              contacts={contacts}
            />
            <SettingsModal
              show={showSettings}
              onClose={() => setShowSettings(false)}
              settings={settings}
              onSave={handleSettingsSave}
            />
          </div>

          <div className="px-3">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>

          <div className="flex-grow-1 overflow-auto custom-scrollbar"
          // style={{
          //   scrollbarWidth: 'none',            // Firefox
          //   msOverflowStyle: 'none',           // Internet Explorer and Edge
          // }}
          >
            {/* <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
  `}</style> */}
            {contacts
              .filter((contact) =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((contact) => (
                <div
                  key={contact.id}
                  className={`p-3 cursor-pointer ${selectedContact?.id === contact.id ? 'bg-secondary text-white' : 'bg-light'}`
                  }
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedContact(contact);
                    setInput('');
                    setShowTranslateIcons(false);
                    setCurrentLangCode('en');
                    if (clearLangHighlightRef.current) clearLangHighlightRef.current();
                    if (micResetRef.current) micResetRef.current();
                  }}
                >
                  <strong>{contact.name}</strong>
                  <div className="text-muted small">{contact.lastMessage}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-8 d-flex flex-column" style={{ height: '100vh' }}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-bottom bg-white">
                <h5 className="mb-0">{selectedContact.name}</h5>
              </div>

              {/* Scrollable Messages */}
              <div className="flex-grow-1 overflow-auto p-3 bg-light">
                <div className="no-scrollbar">
                  {selectedContact && messages[selectedContact?.id]?.map((msg, idx) => (
                    <div key={idx} className={`d-flex mb-2 ${msg.sender === 'me' ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div
                        className={`p-2 rounded ${msg.sender === 'me' ? 'bg-success text-white' : 'bg-white border'}`}
                        style={{ maxWidth: '70%' }}
                      >
                        {msg.text}
                        <div className="text-white-50 text-end" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 border-top bg-white d-flex flex-column">




                {selectedAttachment && (
                  <div className="attachment-preview d-flex align-items-center justify-content-between p-2 mb-2 rounded border bg-light w-100">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-earmark-text me-2 text-primary" style={{ fontSize: '1.5rem' }}></i>
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        <strong>{selectedAttachment.name}</strong>
                        <div className="text-muted small">{messageType}</div>
                      </div>
                    </div>
                    <i
                      className="bi bi-x-circle text-danger"
                      style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                      onClick={() => {
                        setSelectedAttachment(null);
                        setMessageType(null);
                      }}
                    ></i>
                  </div>
                )}

                {/* Message input row */}
                <div className="d-flex align-items-end w-100">
                  <FilePicker
                    disabled={!!selectedAttachment}
                    onFileSelect={(file) => {
                      setSelectedAttachment(file);
                      setInput('');
                      if (file.type.startsWith('image/')) setMessageType('Photo');
                      else if (file.type.startsWith('audio/')) setMessageType('Audio');
                      else setMessageType('Document');
                    }}
                  />

                  {isMicActive ? (
                    <div className="form-control me-2 d-flex align-items-center bg-light" style={{ height: '38px' }}>
                      <div className="dot-animation me-2"></div>
                      <span className="text-muted">Recording...</span>
                    </div>
                  ) : (
                    <textarea
                      className="form-control me-2"
                      rows="1"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      disabled={!!selectedAttachment || isTranslating || isMicActive}
                      style={{
                        resize: 'none',
                        overflow: 'hidden',
                        whiteSpace: 'pre-wrap',
                      }}
                    ></textarea>
                  )}




                  {showTranslateIcons && !isTranslating && (
                    <div className="d-flex align-items-center me-2">
                      <i
                        className={`bi bi-check-circle me-1 ${input.trim() ? 'text-success' : 'text-secondary'}`}
                        style={{
                          cursor: input.trim() ? 'pointer' : 'not-allowed',
                          opacity: input.trim() ? 1 : 0.5
                        }}
                        onClick={() => {
                          if (input.trim()) handleTranslate(); // Prevent clicking when input is empty
                          (setPendingLangConfirm)(false); // ✅ Confirm language
                        }}
                      ></i>
                      <i
                        className="bi bi-x-circle text-danger"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setShowTranslateIcons(false);
                          setPendingLangConfirm(false); // ✅ Confirm language
                          if (clearLangHighlightRef.current) clearLangHighlightRef.current();
                        }}
                      ></i>
                    </div>
                  )}

                  {/* <LanguageSelector onHighlightChange={(highlighted) => setShowTranslateIcons(highlighted)} /> */}


                  <LanguageSelector
                    currentLang={currentLangCode}
                    onLangChange={setCurrentLangCode}
                    clearHighlight={(fn) => (clearLangHighlightRef.current = fn)}
                    onHighlightChange={(highlighted) => setShowTranslateIcons(highlighted)}
                    onPendingConfirmChange={setPendingLangConfirm} // ✅ pass this
                    disabled={isMicActive || !!selectedAttachment}
                  />

                  <AudioRecorder
                    onSendAudio={(audioURL) => {
                      const newMessage = {
                        text: <audio controls src={audioURL} />,
                        sender: 'me',
                      };
                      const updated = [...(selectedContact ? messages[selectedContact?.id] : [] || []), newMessage];
                      setMessages({ ...messages, [selectedContact?.id]: updated });
                      setMessageType('Audio'); // ✅ set audio message type
                    }}
                    onTranscription={(text) => {
                      setInput(text);
                    }}
                    setResetRef={(fn) => (micResetRef.current = fn)}
                    onRecordingStatusChange={setIsMicActive}
                    setIsTranscribing={setIsTranslating}
                    disabled={isLanguageActive || isTranslating || pendingLangConfirm || !!selectedAttachment}
                  />

                  {isTranslating || isTranscribing ? (
                    <button className="btn btn-secondary" disabled>
                      <span className="spinner-border spinner-border-sm"></span>
                    </button>
                  ) : (
                    <button className="btn btn-success" onClick={sendMessage} disabled={(!input.trim() && !selectedAttachment) || isTranslating || isMicActive || pendingLangConfirm}>
                      <i className="bi bi-send"></i>
                    </button>

                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center p-5 bg-light">
              <img src="/logo1.png" alt="Welcome" className="mb-4" style={{ maxWidth: '300px' }} />
              <h4>Welcome to ChatApp</h4>
              <p className="text-muted">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}