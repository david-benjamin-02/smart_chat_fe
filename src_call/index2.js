import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// import './App.css';
import LanguageSelector from './components/LanguageSelector';
import FilePicker from './components/FilePicker';
import SearchBar from './components/SearchBar';
import AudioRecorder from './components/AudioRecorder';
import DropDownMenu from './components/DropDownMenu';
import ContactModal from './components/ContactModal';
import SettingsModal from './components/SettingsModal';
const initialMessages = {
    1: [{ text: 'Hello Alice!', sender: 'me' }, { text: 'Hey there!', sender: 'them' }],
    2: [{ text: 'Yo Bob', sender: 'me' }, { text: 'What’s up?', sender: 'them' }],
    3: [{ text: 'Meeting at 5?', sender: 'me' }, { text: 'See you soon.', sender: 'them' }],
};
export default function App() {
    const [contacts, setContacts] = useState([
        { id: 1, name: 'Alice', email: 'alice@example.com', lastMessage: 'Hey there!' },
        { id: 2, name: 'Bob', email: 'bob@example.com', lastMessage: 'What’s up?' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', lastMessage: 'See you soon.' },
    ]);
    const micResetRef = useRef(null);
    const messageEndRef = useRef(null);
    const [selectedAttachment, setSelectedAttachment] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [selectedContact, setSelectedContact] = useState(contacts[0]);
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showContactModal, setShowContactModal] = useState(false);
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
    const [isMicActive, setIsMicActive] = useState(false); // mic state passed from AudioRecorder
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
            const formData = new FormData();
            formData.append("text", input);
            formData.append("language", currentLangCode);

            const response = await fetch("http://localhost:8000/translate", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setInput(data.translated_text || '');
        } catch (error) {
            console.error("Translation failed:", error);
        } finally {
            setIsTranslating(false);
            setShowTranslateIcons(false);
            setPendingLangConfirm(false); // ✅ RESET confirmation blocker
        }
    };

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages[selectedContact.id]]);

    const handleCancelTranslate = () => {
        setShowTranslateIcons(false);
        setPendingLangConfirm(false); // ✅ clear the block
        if (clearLangHighlightRef.current) clearLangHighlightRef.current(); // unhighlight the icon
    };

    // const handleCancelTranslate = () => {
    //   setShowTranslateIcons(false);
    //   if (clearLangHighlight) clearLangHighlight(); // unhighlight the logo
    // };
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
    const handleSendMessage = () => {
        if (!input.trim()) return;

        const newMessage = { text: input, sender: 'me' };

        // setMessages((prev) => [...prev, newMessage]);
        const updated = [...(messages[selectedContact.id] || []), newMessage];
        setMessages({ ...messages, [selectedContact.id]: updated });
        setInput('');
        // scrollToBottom(); // Optional: scroll chat to bottom
    };

    const sendMessage = () => {
        if (!input.trim()) return;
        const newMessage = { text: input, sender: 'me' };
        const updated = [...(messages[selectedContact.id] || []), newMessage];
        setMessages({ ...messages, [selectedContact.id]: updated });
        setInput('');
        setShowTranslateIcons(false);

        if (clearLangHighlightRef.current) {
            clearLangHighlightRef.current();
        }
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
                                    className={`p-3 cursor-pointer ${selectedContact.id === contact.id ? 'bg-secondary text-white' : 'bg-light'
                                        }`}
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
                    {/* Chat Header */}
                    <div className="p-3 border-bottom bg-white">
                        <h5 className="mb-0">{selectedContact.name}</h5>
                    </div>

                    {/* Scrollable Messages */}
                    <div
                        className="flex-grow-1 overflow-auto p-3 bg-light"
                        style={{
                            minHeight: 0,
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE 10+
                        }}
                    >
                        <div
                            style={{
                                overflowY: 'scroll',
                                height: '100%',
                                scrollbarWidth: 'none', // Firefox
                            }}
                            className="no-scrollbar"
                        >
                            {(messages[selectedContact.id] || []).map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`d-flex mb-2 ${msg.sender === 'me' ? 'justify-content-end' : 'justify-content-start'}`}
                                >
                                    <div
                                        className={`p-2 rounded ${msg.sender === 'me' ? 'bg-success text-white' : 'bg-white border'}`}
                                        style={{
                                            maxWidth: '70%',
                                            whiteSpace: 'pre-wrap',
                                            wordWrap: 'break-word',
                                        }}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messageEndRef} />
                        </div>
                    </div>

                    <div className="p-3 border-top bg-white d-flex align-items-end">

                        <FilePicker onFileSelect={(file) => {
                            const newMessage = { text: `:paperclip: File: ${file.name}`, sender: 'me' };
                            const updated = [...(messages[selectedContact.id] || []), newMessage];
                            setMessages({ ...messages, [selectedContact.id]: updated });
                            
                        }} />

                        <textarea
                            className="form-control me-2"
                            rows="1"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type a message..."
                            style={{
                                resize: 'none', // Disable resizing
                                overflow: 'hidden', // Hide scrollbars
                                whiteSpace: 'pre-wrap', // Ensure text wraps correctly and preserves line breaks
                            }}
                        ></textarea>




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
                                    }}
                                ></i>
                                <i
                                    className="bi bi-x-circle text-danger"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        setShowTranslateIcons(false);
                                        if (clearLangHighlightRef.current) clearLangHighlightRef.current();
                                    }}
                                ></i>
                            </div>
                        )}

                        <LanguageSelector
                            currentLang={currentLangCode}
                            onLangChange={setCurrentLangCode}
                            clearHighlight={(fn) => (clearLangHighlightRef.current = fn)}
                            onHighlightChange={(highlighted) => setShowTranslateIcons(highlighted)}
                            onPendingConfirmChange={setPendingLangConfirm} // ✅ pass this
                            disabled={isMicActive}
                        />
                        <AudioRecorder
                            onSendAudio={(audioURL) => {
                                const newMessage = {
                                    text: <audio controls src={audioURL} />,
                                    sender: 'me',
                                };
                                const updated = [...(messages[selectedContact.id] || []), newMessage];
                                setMessages({ ...messages, [selectedContact.id]: updated });
                            }}
                            onTranscription={(text) => {
                                setInput(text);
                            }}
                            setResetRef={(fn) => (micResetRef.current = fn)}
                            onRecordingStatusChange={setIsMicActive}
                            setIsTranscribing={setIsTranslating}
                            disabled={isLanguageActive || isTranslating || pendingLangConfirm}
                        />

                        {isTranslating || isTranscribing ? (
                            <button className="btn btn-secondary" disabled>
                                <span className="spinner-border spinner-border-sm"></span>
                            </button>
                        ) : (
                            <button className="btn btn-success" onClick={sendMessage} disabled={!input.trim() || isTranslating || isMicActive || pendingLangConfirm}>
                                <i className="bi bi-send"></i>
                            </button>

                        )}

                        {/* <button className="btn btn-success" onClick={sendMessage}>
              <i className="bi bi-send"></i>
            </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}