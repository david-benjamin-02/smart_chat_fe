import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';
import LanguageSelector from './LanguageSelector';
import { v4 as uuidv4 } from 'uuid';
import FilePicker from './FilePicker';
import SearchBar from './SearchBar';
import AudioRecorder from './AudioRecorder';
import DropDownMenu from './DropDownMenu';
import ContactModal from './ContactModal';
import SettingsModal from './SettingsModal';
import { Socket } from 'socket.io-client';
import WaveformPlayer from './WaveformPlayer';
import axios from 'axios';
import VoiceChat from './VoiceChat';
import { getCachedMessages, cacheMessages, mergeAndCacheMessages } from '../utils/messageCache';
import Peer from 'simple-peer';


export default function ChatApp() {
  // const [contacts, setContacts] = useState([]);
  const [contacts, setContacts] = useState([
  ]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [socket, setSocket] = useState(null);
  const [typingUserId, setTypingUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const uid = localStorage.getItem('uid');
  const sentReadReceiptsRef = useRef(new Set());
  const readSocketRef = useRef(null);
  const micResetRef = useRef(null);
  const messageEndRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState({});
  const [selectedCon, setSelectedCon] = useState(null);
  const [prefillContact, setPrefillContact] = useState(null);
  const recordingSentRef = useRef(false);
  const [input, setInput] = useState('');
  const chunksRef = useRef([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const selectedContactRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingLangConfirm, setPendingLangConfirm] = useState(false);
  const [showTranslateIcons, setShowTranslateIcons] = useState(false);
  const [isLanguageActive, setIsLanguageActive] = useState(false);
  const [currentLangCode, setCurrentLangCode] = useState('en');
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
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isAudioRecorderActive, setIsAudioRecorderActive] = useState(false);
  const [isVoiceChatRecording, setIsVoiceChatRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const socketRef = useRef(null);
  window.socketRef = socketRef;
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const callSocketRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (!uid) return;

    callSocketRef.current = new WebSocket(`ws://${process.env.REACT_APP_API_BASE_URL}/ws/call/${uid}`);

    callSocketRef.current.onmessage = async (event) => {
      const { from, type, data } = JSON.parse(event.data);

      if (type === 'offer') {
        const incomingPeer = new Peer({
          initiator: false,
          trickle: false,
          stream: await navigator.mediaDevices.getUserMedia({ audio: true })
        });

        incomingPeer.signal(data);

        incomingPeer.on('signal', (answer) => {
          callSocketRef.current.send(JSON.stringify({
            target: from,
            type: 'answer',
            data: answer
          }));
        });

        incomingPeer.on('stream', (remoteStream) => {
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.play();
        });

        setPeer(incomingPeer);
      } else if (type === 'answer') {
        peer.signal(data);
      }
    };

    return () => callSocketRef.current?.close();
  }, [uid, peer]);


  useEffect(() => {
    if (!uid) return;

    readSocketRef.current = new WebSocket(`ws://${process.env.REACT_APP_API_BASE_URL}/ws/read/${uid}`);

    readSocketRef.current.onopen = () => {
      console.log(`✅ Read WebSocket connected for UID: ${uid}`);
    };

    readSocketRef.current.onclose = () => {
      console.log('❌ Read WebSocket disconnected');
    };

    return () => {
      readSocketRef.current?.close();
    };
  }, [uid]);


  useEffect(() => {
    if (!uid) return;

    const fetchInitialContacts = async () => {
      try {
        const res = await axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/get-user-contacts/${uid}`);
        setContacts(res.data.contacts);

        // ✅ Extract unread counts and update state
        const countMap = {};
        res.data.contacts.forEach(contact => {
          countMap[contact.uid] = contact.unread_count || 0;
        });
        setUnreadCounts(countMap);

        // Save contact messages to cache
        for (const contact of res.data.contacts) {
          const msgs = [...(contact.recent_messages || [])]
            .reverse()
            .map(msg => ({
              id: msg.id,
              text: msg.message_text,
              sender_id: msg.sender_id,
              time: msg.time,
              status: msg.status || 'sent',
              type: msg.message_type?.toLowerCase() === 'audio' ? 'audio' : 'text',
              audioUrl: msg.message_type?.toLowerCase() === 'audio' ? null : undefined,
              sender: msg.sender_id === uid ? 'me' : 'them',  // ✅ Add this
            }));
          await mergeAndCacheMessages(contact.uid, msgs);
        }
      } catch (error) {
        console.error("Failed to fetch contacts", error);
      }
    };


    fetchInitialContacts();
  }, []);

  useEffect(() => {
    if (!uid) return;

    socketRef.current = new WebSocket(`ws://${process.env.REACT_APP_API_BASE_URL}/ws/chat/${uid}`);

    socketRef.current.onopen = () => {
      console.log(`✅ WebSocket connected for UID: ${uid}`);
    };
    socketRef.current.onclose = (e) => {
      console.log("❌ Read WebSocket disconnected", e.code, e.reason);
    };
    socketRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Received:", data);
      if (data.type === "presence") {
        const { userId, status } = data;
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (status === "online") {
            newSet.add(userId);
          } else {
            newSet.delete(userId); // ❗ Remove offline users
          }
          console.log("newSet", newSet)
          return newSet;
        });

        return; // ✅ Don't process this as a normal message
      }
      if (data.type === "typing" && data.from) {
        console.log("✍️ Typing from:", data.from);
        setTypingUserId(data.from);
        setTimeout(() => {
          setTypingUserId(null); // auto-clear after a moment
        }, 2000);
        return;
      }
      // ✅ 1. Handle status-only updates (read/delivered)
      if (data.status && data.id) {
        const contactId = data.receiverId || data.senderId;
        if (!contactId) {
          console.warn("❌ No valid contact ID in WebSocket message:", data);
          return;
        }
        // ✅ Always update in-memory state
        setMessages(prev => {
          const updated = { ...prev };
          const msgs = [...(updated[contactId] || [])];
          const msgIdx = msgs.findIndex(m => m.id === data.id);
          if (msgIdx !== -1) {
            msgs[msgIdx] = { ...msgs[msgIdx], status: data.status };
          }
          updated[contactId] = msgs;
          return updated;
        });

        // ✅ Update cached messages (IndexedDB)
        const cached = await getCachedMessages(contactId);
        const index = cached.findIndex(m => m.id === data.id);
        if (index !== -1) {
          cached[index].status = data.status;
          await cacheMessages(contactId, cached);
        }

        return;
      }


      // ✅ 2. Handle full message (send/receive)
      const senderId = data.senderId;
      const isMe = senderId === uid;
      const contactId = isMe ? data.receiverId : senderId;
      if (!contactId) {
        console.warn("❌ No valid contact ID in WebSocket message:", data);
        return;
      }
      const newMsg = {
        id: data.id || `${contactId}-${data.time}`,
        text: data.msg_text,
        sender: isMe ? 'me' : 'them',
        sender_id: senderId,
        messageType: data.msg_type,
        time: data.time,
        type: data.msg_type?.toLowerCase() === 'audio' ? 'audio' : 'text',
        audioUrl: data.msg_type?.toLowerCase() === 'audio' ? null : undefined,
        status: 'sent'
      };
      // ⬇️ After creating `newMsg` and before updating contacts
      if (!isMe) {
        const exists = contacts.find(c => c.uid === senderId);
        if (!exists) {
          // Add new unknown contact
          const newContact = {
            uid: senderId,
            name: data.name || senderId, // senderEmail// fallback if no email in data
            is_unknown: true,
            recent_messages: [{
              message_text: data.msg_text,
              sender_id: senderId,
              time: data.time,
              message_type: data.msg_type,
            }],
            unread_count: 1
          };

          setContacts(prev => [newContact, ...prev]);
        }
      }

      const cached = await getCachedMessages(contactId);
      const existingIndex = cached.findIndex(m => m.id === newMsg.id);

      if (existingIndex !== -1) {
        cached[existingIndex] = { ...cached[existingIndex], ...newMsg };
      } else {
        cached.push(newMsg);
      }

      await cacheMessages(contactId, cached);
      setMessages(prev => ({ ...prev, [contactId]: cached }));

      if (!isMe && (!selectedContactRef.current || selectedContactRef.current.uid !== senderId)) {
        setUnreadCounts(prev => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1
        }));
      }

      setContacts(prev => {
        const updatedContacts = prev.map(c =>
          c.uid === contactId
            ? {
              ...c,
              recent_messages: [
                {
                  message_text: data.msg_text,
                  sender_id: senderId,
                  time: data.time,
                  message_type: data.msg_type,
                }
              ]
            }
            : c
        );

        // Move the updated contact to the top
        const movedContact = updatedContacts.find(c => c.uid === contactId);
        const others = updatedContacts.filter(c => c.uid !== contactId);

        return [movedContact, ...others];
      });

    };



    socketRef.current.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    return () => socketRef.current?.close();
  }, [uid]);

  useEffect(() => {
    if (!input.trim() || !selectedContact) return;

    const timeout = setTimeout(() => {
      socketRef.current?.send(JSON.stringify({
        type: "typing",
        to: selectedContact.uid
      }));
    }, 300); // send after short delay

    return () => clearTimeout(timeout);
  }, [input, selectedContact]);


  // useEffect(() => {

  //   const socket = new WebSocket(`ws://${process.env.REACT_APP_API_BASE_URL}/ws/chat/${uid}`);

  //   socket.onopen = () => {
  //     console.log('✅ WebSocket connected');
  //   };

  //   socket.onmessage = (event) => {
  //     console.log('📩 Received from WebSocket:', event.data); // ✅ MUST see this in console

  //     const message = JSON.parse(event.data);
  //     const senderId = message.sender_id;
  //     const msg_text = message.msg_text;
  //     const msg_type = message.msg_type;
  //     const time = message.time;

  //     const newMessage = {
  //       text: msg_text,
  //       sender: 'them',
  //       messageType: msg_type,
  //       time,
  //     };

  //     setMessages(prev => ({
  //       ...prev,
  //       [senderId]: [...(prev[senderId] || []), newMessage],
  //     }));
  //   };

  //   socket.onclose = () => {
  //     console.log('❌ WebSocket disconnected');
  //   };

  //   return () => {
  //     socket.close();
  //   };
  // }, [uid]); // Make sure `uid` is in your state or props


  const startVoiceRecording = async () => {
    if (isVoiceChatRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      recordingSentRef.current = false;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // console.log('in')
        if (recordingSentRef.current) {
          // console.log("Already sent, skipping...");
          return;
        }

        recordingSentRef.current = true;

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        handleSendVoiceMessage(blob);
        cleanupRecording();
      };

      mediaRecorder.start();

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      setIsVoiceChatRecording(true);
      timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
      // drawWaveform();
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  };
  useEffect(() => {
    if (isVoiceChatRecording) {
      // console.log("Starting waveform animation");
      drawWaveform();
    }
  }, [isVoiceChatRecording]);


  const stopVoiceRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop(); // triggers onstop
    }
  };



  const cleanupRecording = () => {
    // console.log("oj")
    clearInterval(timerRef.current);
    setElapsed(0);
    cancelAnimationFrame(animationRef.current);
    audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());

    setIsVoiceChatRecording(false);
    recordingSentRef.current = false;
  };



  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const analyser = analyserRef.current;

    if (!canvas || !ctx || !analyser) {
      console.warn("Canvas or analyser not ready");
      return;
    }

    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw); // 🟢 Recursive animation call
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0d6efd';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw(); // 🔁 Start loop
  };



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
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`http://${process.env.REACT_APP_API_BASE_URL}/get-user-contacts/${uid}`);
        setContacts(res.data.contacts);
      } catch (error) {
        console.error("Failed to fetch contacts", error);
      }
    };

    fetchContacts();
  }, []);
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);
  useEffect(() => {
    if (!selectedContact) return;

    const contactId = selectedContact.uid;
    const currentMessages = messages[contactId] || [];

    const unread = currentMessages.filter(m =>
      m.sender !== 'me' &&
      m.status !== 'read' &&
      !sentReadReceiptsRef.current.has(m.id)
    );

    unread.forEach(msg => {
      readSocketRef.current?.send(JSON.stringify({
        id: msg.id,
        senderId: msg.sender_id
      }));
      sentReadReceiptsRef.current.add(msg.id); // ✅ Mark as sent
    });
  }, [messages, selectedContact]);

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
    // console.log('Updated Settings:', updatedSettings);
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
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let messageType = 'Text';
    let messageText = input;
    let fileURL = null;

    if (selectedAttachment) {
      const { type, name } = selectedAttachment;
      fileURL = URL.createObjectURL(selectedAttachment);

      if (type.startsWith('image/')) {
        messageType = 'Photo';
        messageText = name;
      } else if (type.startsWith('audio/')) {
        messageType = 'Audio';
        messageText = name;
      } else {
        messageType = 'Document';
        messageText = name;
      }
    }

    // Prepare WebSocket message to match backend expectations
    const messageId = uuidv4(); // ✅ Unique message ID
    const messageToSend = {
      id: messageId, // Include ID
      senderId: uid,
      receiverId: selectedContact.uid,
      msg_type: messageType,
      msg_text: messageText,
      date,
      time,
    };

    console.log("msgdata", messageToSend)
    socketRef.current?.send(JSON.stringify(messageToSend));

    // Update local state for UI
    let newMessageDisplay;
    if (selectedAttachment) {
      if (messageType === 'Photo') {
        newMessageDisplay = <img src={fileURL} alt="img" className="img-fluid rounded" />;
      } else if (messageType === 'Audio') {
        newMessageDisplay = <audio controls src={fileURL} />;
      } else {
        newMessageDisplay = (
          <div>
            <i className="bi bi-file-earmark-text me-2" />
            <a href={fileURL} download={messageText}>{messageText}</a>
          </div>
        );
      }
    } else {
      newMessageDisplay = messageText;
    }

    const newMessage = {
      id: messageId,
      text: newMessageDisplay,
      sender: 'me',
      sender_id: uid,
      messageType,
      time,
      type: messageType.toLowerCase() === 'audio' ? 'audio' : 'text',
      audioUrl: messageType.toLowerCase() === 'audio' ? fileURL : undefined,
      status: 'pending'
    };

    setMessages(prev => ({
      ...prev,
      [selectedContact.uid]: [...(prev[selectedContact.uid] || []), newMessage],
    }));

    // ✅ Store in IndexedDB
    getCachedMessages(selectedContact.uid).then(cached => {
      cacheMessages(selectedContact.uid, [...cached, newMessage]);
    });

    setContacts(prev => {
      const updatedContacts = prev.map(c =>
        c.uid === selectedContact.uid
          ? {
            ...c,
            recent_messages: [
              {
                message_text: messageText,
                sender_id: uid,
                time,
                message_type: messageType,
              }
            ]
          }
          : c
      );

      const movedContact = updatedContacts.find(c => c.uid === selectedContact.uid);
      const others = updatedContacts.filter(c => c.uid !== selectedContact.uid);

      return [movedContact, ...others];
    });


    // Clear input and attachment
    setInput('');
    setSelectedAttachment(null);
    setShowTranslateIcons(false);
    if (clearLangHighlightRef.current) clearLangHighlightRef.current();
  };

  const startCall = async () => {
    setIsCalling(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const newPeer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    newPeer.on('signal', (offer) => {
      const sendOffer = () => {
        if (
          callSocketRef.current &&
          callSocketRef.current.readyState === WebSocket.OPEN
        ) {
          callSocketRef.current.send(JSON.stringify({
            target: selectedContact.uid,
            type: 'offer',
            data: offer
          }));
        } else {
          // 🟡 Try again shortly until it's ready
          setTimeout(sendOffer, 100);
        }
      };
      sendOffer();
    });

    newPeer.on('stream', (remoteStream) => {
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.play();
    });

    setPeer(newPeer);
  };


  const endCall = () => {
    peer?.destroy();
    setPeer(null);
    setIsCalling(false);
  };

  const handleContactClick = async (contact) => {
    setSelectedContact(contact);
    setUnreadCounts(prev => ({ ...prev, [contact.uid]: 0 }));

    const cached = await getCachedMessages(contact.uid);
    const live = messages[contact.uid] || [];

    const seen = new Set();
    const combined = [];

    [...cached, ...live].forEach(msg => {
      if (msg?.id && !seen.has(msg.id)) {
        seen.add(msg.id);
        combined.push(msg);
      }
    });


    setMessages(prev => ({ ...prev, [contact.uid]: combined }));
    const unread = cached.filter(m => m.sender !== 'me' && m.status !== 'read');

    unread.forEach(msg => {
      readSocketRef.current?.send(JSON.stringify({
        id: msg.id,
        senderId: msg.sender_id
      }));
    });

    setInput('');
    setShowTranslateIcons(false);
    setCurrentLangCode('en');
    if (clearLangHighlightRef.current) clearLangHighlightRef.current();
    if (micResetRef.current) micResetRef.current();
  };



  const handleSendVoiceMessage = (blob) => {
    // console.log("heloo")
    const audioUrl = URL.createObjectURL(blob);
    const newMessage = {
      // text: <audio controls src={audioUrl} />,
      text: "",
      sender: 'me',
      type: 'audio',
      audioUrl,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => (
      {
        ...prev,
        [selectedContact?.uid]: [...(prev[selectedContact?.uid] || []), newMessage],
      }));
    setContacts(prev =>
      prev.map(c =>
        c.uid === selectedContact?.uid
          ? {
            ...c,
            recent_messages: [
              {
                message_text: newMessage.text || "[Voice Message]",
                sender_id: uid,
                time: newMessage.time,
                message_type: newMessage.messageType || 'Text',
              }
            ]
          }
          : c
      )
    );
    // setContacts(prev => {
    //   const updatedContacts = prev.map(c =>
    //     c.uid === selectedContact.uid
    //       ? {
    //         ...c,
    //         recent_messages: [
    //           {
    //             message_text: messageText,
    //             sender_id: uid,
    //             time,
    //             message_type: messageType,
    //           }
    //         ]
    //       }
    //       : c
    //   );

    //   const movedContact = updatedContacts.find(c => c.uid === selectedContact.uid);
    //   const others = updatedContacts.filter(c => c.uid !== selectedContact.uid);

    //   return [movedContact, ...others];
    // });

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
              prefillContact={prefillContact}
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

          <div className="flex-grow-1 overflow-auto custom-scrollbar">
            {contacts
              .filter((contact) =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((contact) => (
                <div
                  key={contact.uid}
                  className={`p-3 cursor-pointer ${selectedContact?.uid === contact.uid ? 'bg-lavender-contactlist' : 'bg-light'}`}
                  // onClick={() => {
                  //   handleContactClick(contact);

                  //   setSelectedContact(contact);

                  //   // ✅ Reset unread count
                  //   setUnreadCounts(prev => ({
                  //     ...prev,
                  //     [contact.uid]: 0
                  //   }));

                  //   // ✅ Optional: load recent_messages if not already loaded
                  //   if (!messages[contact.uid] && contact.recent_messages) {
                  //     setMessages(prev => ({
                  //       ...prev,
                  //       [contact.uid]: [...contact.recent_messages].reverse().map(msg => ({
                  //         text: msg.message_text,
                  //         sender_id: msg.sender_id,
                  //         time: msg.time,
                  //         type: msg.message_type?.toLowerCase() === 'audio' ? 'audio' : 'text',
                  //         audioUrl: msg.message_type?.toLowerCase() === 'audio' ? null : undefined,
                  //       }))
                  //     }));
                  //   }

                  //   setInput('');
                  //   setShowTranslateIcons(false);
                  //   setCurrentLangCode('en');
                  //   if (clearLangHighlightRef.current) clearLangHighlightRef.current();
                  //   if (micResetRef.current) micResetRef.current();
                  // }}
                  onClick={() => handleContactClick(contact)}


                >
                  <strong>{contact.name}</strong>
                  <div className="d-flex justify-content-between text-muted small">
                    <span>
                      {contact.recent_messages?.length > 0 ? (
                        contact.recent_messages[0].sender_id === uid
                          ? `You: ${contact.recent_messages[0].message_text}`
                          : `${contact.is_unknown ? 'US' : contact.name}: ${contact.recent_messages[0].message_text}`
                      ) : (
                        <i>No messages yet</i>
                      )}
                    </span>
                    <span>
                      {(unreadCounts[contact.uid] > 0 && selectedContact?.uid !== contact.uid) && (
                        // <span className="badge bg-danger ms-2">
                        <span className="badge rounded-pill bg-danger text-white ms-2">

                          {unreadCounts[contact.uid]}
                        </span>
                      )}
                    </span>
                  </div>


                </div>
              ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="col-8 d-flex flex-column" style={{ height: '100vh' }}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-bottom bg-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div style={{ position: 'relative' }}>
                    <div className="chat-avatar me-2">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    {onlineUsers.has(selectedContact.uid) && (
                      <span className="chat-online-badge" />
                    )}
                  </div>

                  <div>
                    <h5 className="mb-0">{selectedContact.name}</h5>
                    {typingUserId === selectedContact.uid && (
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        typing...
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  {/* ✅ Call Button */}
                  <button onClick={startCall} className="btn btn-sm btn-success ms-2">
                    <i className="bi bi-telephone"></i> Call
                  </button>

                  {/* ✅ End Call Button (only visible during call) */}
                  {isCalling && (
                    <button onClick={endCall} className="btn btn-sm btn-danger ms-2">
                      <i className="bi bi-telephone-x"></i> End Call
                    </button>
                  )}
                </div>
              </div>



              {/* Scrollable Messages */}
              <div className="flex-grow-1 overflow-auto p-3 bg-light">
                <div className="no-scrollbar">
                  {selectedContact && messages[selectedContact?.uid]?.map((msg, idx) => {
                    const isCurrentUser = msg.sender_id === uid || msg.sender === 'me';
                    // console.log("msgh", msg)
                    // console.log("isCurrentUser", isCurrentUser)
                    // console.log("selectedContact", selectedContact)
                    return (
                      <div key={idx} className={`d-flex mb-2 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div
                          className={`p-2 rounded ${isCurrentUser ? 'bg-success text-white' : 'bg-white border'}`}
                          style={{ maxWidth: '70%' }}
                        >
                          {msg.type === 'audio' ? (
                            msg.audioUrl ? <WaveformPlayer audioUrl={msg.audioUrl} /> : <i>[Audio message]</i>
                          ) : (
                            <span>{msg.text}</span>
                          )}
                          {/* <div className="text-white-50 text-end" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                            {msg.time}
                          </div> */}
                          <div className="d-flex justify-content-end align-items-center mt-1" style={{ fontSize: '0.7rem' }}>
                            <span className="me-1">{msg.time}</span>
                            {/* {msg.sender === 'me' && (
                              <span
                                className="dot-status"
                                style={{
                                  display: 'inline-block',
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor:
                                    msg.status === 'read'
                                      ? 'green'
                                      : msg.status === 'delivered'
                                        ? 'purple'
                                        : msg.status === 'sent'
                                          ? 'blue'
                                          : 'gray',
                                }}
                              ></span>
                            )} */}
                            {msg.sender === 'me' && (
                              <div
                                style={{
                                  backgroundColor: 'white',
                                  // padding: '2px',
                                  borderRadius: '20px',
                                  display: 'inline-block',
                                  marginLeft: '4px',
                                }}
                              >
                                <img
                                  src={`/status-icons/${msg.status || 'pending'}.png`}
                                  alt={msg.status}
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    display: 'block',
                                  }}
                                />
                              </div>

                            )}

                          </div>

                        </div>
                      </div>
                    );
                  })}

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
                    disabled={!!selectedAttachment || isLanguageActive || isVoiceChatRecording || isMicActive || input.trim()}
                    onFileSelect={(file) => {
                      setSelectedAttachment(file);
                      setInput('');
                      if (file.type.startsWith('image/')) setMessageType('Photo');
                      else if (file.type.startsWith('audio/')) setMessageType('Audio');
                      else setMessageType('Document');
                    }}
                  />

                  {isVoiceChatRecording ? (
                    <div className="form-control me-2 d-flex align-items-center bg-light" style={{ height: '40px' }}>
                      {/* <canvas ref={canvasRef} width="150" height="30" style={{ backgroundColor: '#f0f0f0', borderRadius: '4px' }} /> */}
                      <canvas
                        ref={canvasRef}
                        width="300"
                        height="30"
                        style={{
                          backgroundColor: '#f0f0f0',
                          borderRadius: '8px',
                          display: 'block'
                        }}
                      />



                      <span className="ms-3">{formatTime(elapsed)}</span>
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
                      disabled={!!selectedAttachment || isTranslating || isVoiceChatActive || isMicActive}
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
                    disabled={isMicActive || !!selectedAttachment || isVoiceChatRecording}
                  />

                  <AudioRecorder
                    onSendAudio={(audioURL) => {
                      const newMessage = {
                        text: <audio controls src={audioURL} />,
                        sender: 'me',
                      };
                      const updated = [...(selectedContact ? messages[selectedContact?.uid] : [] || []), newMessage];
                      setMessages(prev => ({ ...prev, [selectedContact?.id]: updated }));
                      setMessageType('Audio'); // ✅ set audio message type
                    }}
                    onTranscription={(text) => {
                      setInput(text);
                    }}
                    setResetRef={(fn) => (micResetRef.current = fn)}
                    onRecordingStatusChange={setIsMicActive}
                    setIsTranscribing={setIsTranslating}
                    disabled={isVoiceChatRecording || isTranslating || pendingLangConfirm || !!selectedAttachment || input.trim()}
                  />

                  {isTranslating || isTranscribing ? (
                    <button className="btn btn-lavender" disabled>
                      <span className="spinner-border spinner-border-sm"></span>
                    </button>
                  ) : input.trim() || isMicActive || selectedAttachment ? (
                    <button
                      className="btn btn-purple"
                      onClick={sendMessage}
                      // disabled={isTranslating || isMicActive || pendingLangConfirm}
                      disabled={isTranslating || isMicActive}
                    >
                      <i className="bi bi-send"></i>
                    </button>
                  ) : (
                    <VoiceChat
                      isRecording={isVoiceChatRecording}
                      startRecording={startVoiceRecording}
                      stopRecording={stopVoiceRecording}
                    />


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