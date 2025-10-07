import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import Quill from 'quill';
import 'react-quill/dist/quill.snow.css';
import QuillCursors from 'quill-cursors';
import io from 'socket.io-client';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

Quill.register('modules/cursors', QuillCursors);

const Editor = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const timeoutRef = useRef(null);
  const [value, setValue] = useState('');

  // Assign user a consistent color
  function getColorFromId(id) {
    const colors = ['red', 'green', 'blue', 'purple', 'orange'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  // Load document content from server
  useEffect(() => {
    const fetchDoc = async () => {
      if (!docId) return;
      try {
        const res = await axios.get(`http://192.168.0.165:3222/documents/${docId}`);
        setValue(res.data.content);
      } catch (err) {
        console.error('❌ Error loading document:', err);
      }
    };
    fetchDoc();
  }, [docId]);

  // Setup socket connection and handlers
  useEffect(() => {
    const socket = io('http://192.168.0.165:3222');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      if (docId) socket.emit('join-doc', docId);
    });

    const editor = quillRef.current?.getEditor();

    if (editor) {
      const cursors = editor.getModule('cursors');

      // Handle incoming changes and cursors
      socket.on('receive-changes', ({ delta, selection, clientId, username }) => {
        if (!editor || !cursors) return;

        // Update content (only from others)
        if (clientId !== socket.id) {
          editor.updateContents(delta, 'silent');

          // Update cursor
          cursors.createCursor(clientId, username || 'User', getColorFromId(clientId));
          cursors.moveCursor(clientId, selection);
        }
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [docId]);

  // Handle user content changes
  const handleChange = (content, delta, source) => {
    setValue(content);

    if (source === 'user' && socketRef.current) {
      const editor = quillRef.current.getEditor();
      const fullContent = editor.getContents();
      const selection = editor.getSelection();

      // Emit changes to server
      socketRef.current.emit('send-changes', {
        delta,
        selection,
        clientId: socketRef.current.id,
        username: 'User', // Optional: dynamic username
      });

      // Optionally trigger auto-save
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (docId) saveDoc();
      }, 2000);
    }
  };

  // Save to backend
  const saveDoc = async () => {
    try {
      await axios.put(`http://192.168.0.165:3222/documents/${docId}`, {
        content: value,
      });
      console.log('✅ Auto-saved');
    } catch (err) {
      console.error('❌ Auto-save failed:', err);
    }
  };

  // Create new document
  const createDoc = async () => {
    try {
      const res = await axios.post('http://192.168.0.165:3222/documents', {
        title: 'Untitled',
        content: '',
      });
      navigate(`/editor/${res.data._id}`);
    } catch (err) {
      console.error('❌ Failed to create document:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={createDoc}>🆕 Create</button>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        theme="snow"
        modules={{
          cursors: true,
          toolbar: false,
          history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true,
          },
        }}
        style={{ height: '400px', marginTop: '20px' }}
      />
    </div>
  );
};

export default Editor;
