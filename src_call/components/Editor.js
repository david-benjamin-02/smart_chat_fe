import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill'; // 👈 wrapper
import Quill from 'quill'; // 👈 actual Quill
import 'react-quill/dist/quill.snow.css';
import QuillCursors from 'quill-cursors'; // 👈 plugin
import io from 'socket.io-client';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

Quill.register('modules/cursors', QuillCursors); // ✅ correctly registering plugin


const Editor = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const timeoutRef = useRef(null);

  const [value, setValue] = useState('');

  // Load document content from server
  useEffect(() => {
    const fetchDoc = async () => {
      if (!docId) return;
      try {
        const res = await axios.get(`http://192.168.0.202:3001/documents/${docId}`);
        setValue(res.data.content);
      } catch (err) {
        console.error('❌ Error loading document:', err);
      }
    };
    fetchDoc();
  }, [docId]);

  // Handle socket connection and collaboration
  useEffect(() => {
    const socket = io('http://192.168.0.202:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      if (docId) socket.emit('join-doc', docId);
    });

    const editor = quillRef.current?.getEditor();
    const cursors = editor?.getModule('cursors');

    socket.on('receive-changes', ({ delta, selection, clientId, username }) => {
      if (!editor) return;

      // Apply delta
      editor.updateContents(delta, 'silent');

      // Show other user's cursor
      if (clientId !== socket.id && selection && cursors) {
        cursors.createCursor(clientId, username || 'User', getColorFromId(clientId));
        cursors.moveCursor(clientId, selection);
      }
    });

    socket.on('document-saved', (newContent) => {
      const editor = quillRef.current?.getEditor();
      if (!editor) return;

      const currentContent = editor.getContents();

      // Only update if there's a difference
      if (JSON.stringify(currentContent) !== JSON.stringify(newContent)) {
        const currentSelection = editor.getSelection(); // 🔒 Save cursor
        editor.setContents(newContent);
        if (currentSelection) {
          editor.setSelection(currentSelection); // ✅ Restore cursor
        }
        setValue(editor.root.innerHTML);
      }
    });


    return () => socket.disconnect();
  }, [docId]);

  // Handle content changes
  const handleChange = (content, delta, source) => {
    setValue(content); // keep for local state

    const editor = quillRef.current.getEditor();

    if (source === 'user' && socketRef.current) {
      const fullContent = editor.getContents();
      const selection = editor.getSelection();

      socketRef.current.emit('send-changes', {
        delta,
        selection,
        clientId: socketRef.current.id,
        username: 'User',
      });

      socketRef.current.emit('save-document', {
        docId,
        content: fullContent,
      });
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (docId) {
        const latest = editor.getContents(); // ✅ get fresh delta
        saveDoc(latest); // send it to backend
      }
    }, 2000);
  };


  // Save document to backend
  const saveDoc = async (contentToSave) => {
    try {
      await axios.put(`http://192.168.0.202:3001/documents/${docId}`, {
        content: contentToSave,
      });
      console.log('✅ Auto-saved');
    } catch (err) {
      console.error('❌ Auto-save failed:', err);
    }
  };

  // Create new document
  const createDoc = async () => {
    try {
      const res = await axios.post('http://192.168.0.202:3001/documents', {
        title: 'Untitled',
        content: '',
      });
      const newId = res.data._id;
      navigate(`/editor/${newId}`);
    } catch (err) {
      console.error('❌ Failed to create document:', err);
    }
  };

  // Assign user a consistent color
  function getColorFromId(id) {
    const colors = ['red', 'green', 'blue', 'purple', 'orange'];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

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
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ['clean'],
          ],
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
