import React, { useState, useEffect } from 'react';
import './ContactModal.css';

export default function ContactModal({ show, onClose, onAddContact, prefillContact }) {
  const [activeTab, setActiveTab] = useState('add');
  const [newContact, setNewContact] = useState({ name: '', email: '' });
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const uid = localStorage.getItem('uid');
  // const uid = localStorage.setItem('uid', '99cd72f6-2448-4b3c-b87d-dc1013772c12');

  // Fetch all contacts when modal opens
  useEffect(() => {
    if (show && uid) {
      fetch(`http://${process.env.REACT_APP_API_BASE_URL}/contacts/${uid}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch contacts');
          return res.json();
        })
        .then(data => setContacts(data.contacts))
        .catch(err => alert(err.message));
    }
  }, [show, uid]);


  useEffect(() => {
    if (show && prefillContact) {
      setNewContact({ name: '', email: prefillContact.email });
      setActiveTab('add'); // make sure we're on "Add" tab
    }
  }, [show, prefillContact]);

  // Add new contact
  const handleSave = async () => {
    if (newContact.name && newContact.email) {
      try {
        const response = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/contacts/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_user_uid: uid,
            contact_name: newContact.name,
            contact_email: newContact.email,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(`Error: ${error.detail}`);
          return;
        }

        const data = await response.json();
        alert(data.message);

        // Refresh contacts
        const refreshed = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/contacts/${uid}`);
        const refreshedData = await refreshed.json();
        setContacts(refreshedData.contacts);

        setNewContact({ name: '', email: '' });
        // onClose();
      } catch (error) {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  // Fetch specific contact to edit
  const handleEditClick = async (contact) => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/contacts/detail/${uid}/${contact.contact_id}`);
      if (!response.ok) throw new Error('Failed to fetch contact');
      const data = await response.json();
      setEditingContact({ ...data, contact_id: contact.contact_id });
    } catch (err) {
      alert(err.message);
    }
  };

  // Save edited contact name
  const handleEditSave = async () => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/contacts/edit/${uid}/${editingContact.contact_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingContact.name }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.detail);
        return;
      }

      const refreshed = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/contacts/${uid}`);
      const data = await refreshed.json();
      setContacts(data.contacts);
      setEditingContact(null);
    } catch (err) {
      alert('Failed to update contact');
    }
  };

  // Delete contact
  const handleDeleteContact = async (contactId) => {
    try {
      const response = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/contacts/delete/${uid}/${contactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.detail);
        return;
      }

      const refreshed = await fetch(`http://${process.env.REACT_APP_API_BASE_URL}/contacts/${uid}`);
      const data = await refreshed.json();
      setContacts(data.contacts);
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="contact-modal">
        <div className="modal-left">
          <button className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
            Add New Contact
          </button>
          <button className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`} onClick={() => setActiveTab('edit')}>
            Manage Book
          </button>
        </div>

        <div className="modal-right">
          {activeTab === 'add' && (
            <div>
              <h5>Add New Contact</h5>
              <input
                type="text"
                placeholder="Name"
                className="form-control mb-2"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="form-control mb-2"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              />
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          )}

          {activeTab === 'edit' && (
            <div>
              <h5>Manage Book</h5>
              {contacts.length === 0 ? (
                <p>No contacts in the Contact Book.</p>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.contact_id} className="mb-2 d-flex align-items-center justify-content-between">
                    <input
                      type="text"
                      className="form-control me-2"
                      value={contact.name}
                      disabled
                    />
                    <i
                      className="bi bi-pencil-square text-primary me-2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleEditClick(contact)}
                    ></i>
                    <i
                      className="bi bi-trash text-danger"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDeleteContact(contact.contact_id)}
                    ></i>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        <button className="close-btn" onClick={onClose}>&times;</button>

        {editingContact && (
          <div className="edit-modal-overlay">
            <div className="edit-contact-modal">
              <h5>Edit Contact</h5>
              <input
                type="text"
                className="form-control mb-2"
                value={editingContact.name}
                onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
              />
              <input
                type="email"
                className="form-control mb-3"
                value={editingContact.email}
                disabled
              />
              <div className="d-flex justify-content-end">
                <button className="btn btn-secondary me-2" onClick={() => setEditingContact(null)}>Cancel</button>
                <button className="btn btn-success" onClick={handleEditSave}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
